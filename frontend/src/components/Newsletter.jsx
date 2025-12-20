import { useState } from 'react';
import { Send, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import AdminLoginModal from './AdminLoginModal';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: name, 3: success
  const [loading, setLoading] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const { checkAdminEmail } = useAuth();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);

    try {
      // Check if this is an admin email
      const isAdmin = await checkAdminEmail(email);
      
      if (isAdmin) {
        setShowAdminModal(true);
        setLoading(false);
        return;
      }

      // Check if email already exists
      const checkRes = await api.post('/newsletter/check-email', { email });
      if (checkRes.data.exists) {
        toast.error('This email is already subscribed');
        setLoading(false);
        return;
      }

      // Move to name step
      setStep(2);
    } catch (error) {
      // If check-email doesn't exist, continue to name step anyway
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);

    try {
      await api.post('/newsletter/subscribe', { email, name: name.trim() });
      toast.success('Please check your email to verify your subscription!');
      setStep(3);
    } catch (error) {
      const message = error.response?.data?.error || 'Something went wrong';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setName('');
    setStep(1);
  };

  return (
    <>
      {step === 1 && (
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full whitespace-nowrap disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                Continue
              </>
            )}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleNameSubmit} className="flex flex-col gap-2">
          <p className="text-gray-400 text-sm mb-1">Email: {email}</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full whitespace-nowrap disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Subscribe
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-gray-400 text-sm hover:text-white"
          >
            ← Change email
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="text-center py-2">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-white text-sm mb-2">Check your email!</p>
          <p className="text-gray-400 text-xs mb-3">We've sent a verification link to {email}</p>
          <button
            onClick={resetForm}
            className="text-primary-400 text-sm hover:text-primary-300"
          >
            Subscribe another email
          </button>
        </div>
      )}

      <AdminLoginModal 
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        email={email}
      />
    </>
  );
};

export default Newsletter;
