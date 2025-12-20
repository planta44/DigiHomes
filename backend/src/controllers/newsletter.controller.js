const db = require('../config/database');
const crypto = require('crypto');

// Brevo (Sendinblue) email sending
const sendVerificationEmail = async (email, name, token) => {
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) {
    console.log('BREVO_API_KEY not set, skipping email verification');
    return false;
  }

  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { 
          name: process.env.EMAIL_FROM_NAME || 'DIGI Homes',
          email: process.env.EMAIL_FROM || 'noreply@digihomes.co.ke'
        },
        to: [{ email, name }],
        subject: 'Verify your DIGI Homes Newsletter Subscription',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Welcome to DIGI Homes Newsletter!</h2>
            <p>Hi ${name},</p>
            <p>Thank you for subscribing to our newsletter. Please click the button below to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Verify Email</a>
            </div>
            <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="color: #2563eb; font-size: 14px; word-break: break-all;">${verifyUrl}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #999; font-size: 12px;">DIGI Homes Agencies - Nakuru & Nyahururu, Kenya</p>
          </div>
        `
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Brevo email error:', error);
    return false;
  }
};

// Check if email already exists
const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const existing = await db.query(
      'SELECT id, verified FROM newsletter_subscribers WHERE email = $1',
      [email.toLowerCase()]
    );
    res.json({ exists: existing.rows.length > 0, verified: existing.rows[0]?.verified });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Subscribe to newsletter
const subscribe = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if already subscribed
    const existing = await db.query(
      'SELECT id, verified FROM newsletter_subscribers WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existing.rows.length > 0) {
      if (existing.rows[0].verified) {
        return res.status(400).json({ error: 'Email already subscribed' });
      }
      // Delete unverified subscription to allow re-subscribe
      await db.query('DELETE FROM newsletter_subscribers WHERE id = $1', [existing.rows[0].id]);
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Add subscriber
    const result = await db.query(
      'INSERT INTO newsletter_subscribers (email, name, verification_token, verified) VALUES ($1, $2, $3, $4) RETURNING *',
      [email.toLowerCase(), name, verificationToken, false]
    );

    // Send verification email via Brevo
    const emailSent = await sendVerificationEmail(email.toLowerCase(), name, verificationToken);

    // If Brevo not configured, auto-verify
    if (!emailSent && !process.env.BREVO_API_KEY) {
      await db.query('UPDATE newsletter_subscribers SET verified = true WHERE id = $1', [result.rows[0].id]);
      return res.status(201).json({ 
        message: 'Successfully subscribed to newsletter',
        subscriber: { ...result.rows[0], verified: true }
      });
    }

    res.status(201).json({ 
      message: 'Please check your email to verify your subscription',
      subscriber: result.rows[0]
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all subscribers (admin only)
const getAllSubscribers = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM newsletter_subscribers ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete subscriber (admin only)
const deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM newsletter_subscribers WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }

    res.json({ message: 'Subscriber removed successfully' });
  } catch (error) {
    console.error('Delete subscriber error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Verify email subscription
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const result = await db.query(
      'UPDATE newsletter_subscribers SET verified = true, verification_token = NULL WHERE verification_token = $1 RETURNING *',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    res.json({ message: 'Email verified successfully!', subscriber: result.rows[0] });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Broadcast email to subscribers (admin only)
const broadcastEmail = async (req, res) => {
  try {
    const { subject, htmlContent, subscriberIds } = req.body;

    if (!subject || !htmlContent) {
      return res.status(400).json({ error: 'Subject and content are required' });
    }

    const brevoApiKey = process.env.BREVO_API_KEY;
    if (!brevoApiKey) {
      return res.status(400).json({ error: 'Email service not configured. Please set BREVO_API_KEY in environment variables.' });
    }

    // Get subscribers - either specific ones or all verified
    let subscribers;
    if (subscriberIds && subscriberIds.length > 0) {
      const placeholders = subscriberIds.map((_, i) => `$${i + 1}`).join(',');
      const result = await db.query(
        `SELECT * FROM newsletter_subscribers WHERE id IN (${placeholders}) AND verified = true`,
        subscriberIds
      );
      subscribers = result.rows;
    } else {
      const result = await db.query(
        'SELECT * FROM newsletter_subscribers WHERE verified = true'
      );
      subscribers = result.rows;
    }

    if (subscribers.length === 0) {
      return res.status(400).json({ error: 'No verified subscribers to send to' });
    }

    // Send emails via Brevo
    let successCount = 0;
    let failCount = 0;

    for (const subscriber of subscribers) {
      try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': brevoApiKey,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sender: { 
              name: process.env.EMAIL_FROM_NAME || 'DIGI Homes',
              email: process.env.EMAIL_FROM || 'noreply@digihomes.co.ke'
            },
            to: [{ email: subscriber.email, name: subscriber.name || 'Subscriber' }],
            subject: subject,
            htmlContent: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                ${htmlContent}
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                <p style="color: #999; font-size: 12px;">You received this email because you subscribed to DIGI Homes Newsletter.</p>
                <p style="color: #999; font-size: 12px;">DIGI Homes Agencies - Nakuru & Nyahururu, Kenya</p>
              </div>
            `
          })
        });
        
        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
      }
    }

    res.json({ 
      message: `Broadcast sent: ${successCount} successful, ${failCount} failed`,
      successCount,
      failCount,
      total: subscribers.length
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  subscribe,
  checkEmail,
  getAllSubscribers,
  deleteSubscriber,
  verifyEmail,
  broadcastEmail
};
