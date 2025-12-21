import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';
import api from '../config/api';

const ContactPage = () => {
  const [settings, setSettings] = useState({
    contact_page: {
      title: 'Get in Touch',
      subtitle: "Have questions? We'd love to hear from you.",
      offices: [],
      faqs: []
    },
    company_info: {
      phone: '+254 700 000 000',
      phone2: '+254 711 111 111',
      email: 'info@digihomes.co.ke',
      whatsapp: '254700000000'
    }
  });
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        setSettings(prev => ({
          ...prev,
          contact_page: { ...prev.contact_page, ...response.data.contact_page },
          company_info: { ...prev.company_info, ...response.data.company_info }
        }));
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const { contact_page, company_info } = settings;

  return (
    <PublicLayout>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{contact_page.title}</h1>
          <p className="text-primary-100 max-w-2xl mx-auto">
            {contact_page.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Phone className="w-7 h-7 text-primary-600" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Phone</h3>
            <p className="text-gray-600">
              <a href={`tel:${company_info.phone?.replace(/\s/g, '')}`} className="hover:text-primary-600 transition-colors block">
                {company_info.phone}
              </a>
              {company_info.phone2 && (
                <a href={`tel:${company_info.phone2?.replace(/\s/g, '')}`} className="hover:text-primary-600 transition-colors block">
                  {company_info.phone2}
                </a>
              )}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7 text-primary-600" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600">
              <a href={`mailto:${company_info.email}`} className="hover:text-primary-600 transition-colors">
                {company_info.email}
              </a>
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-7 h-7 text-primary-600" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">Working Hours</h3>
            {(contact_page.workingHours && contact_page.workingHours.length > 0) ? (
              contact_page.workingHours.map((hour, index) => (
                <p key={index} className="text-gray-600">{hour}</p>
              ))
            ) : (
              <>
                <p className="text-gray-600">Monday - Friday: 8AM - 6PM</p>
                <p className="text-gray-600">Saturday: 9AM - 4PM</p>
              </>
            )}
          </div>
        </div>

        {/* WhatsApp CTA */}
        <div className="bg-green-50 rounded-2xl p-8 mb-12 text-center">
          <MessageCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Response via WhatsApp</h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Get instant responses to your inquiries. Send us a message on WhatsApp and we'll get back to you right away.
          </p>
          <a
            href={`https://wa.me/${company_info.whatsapp}?text=Hello, I'm interested in your rental properties`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Chat on WhatsApp
          </a>
        </div>

        {/* Offices */}
        {(contact_page.offices || []).length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Offices</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {contact_page.offices.map((office, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                  {office.mapEmbed && (
                    <div className="h-48 bg-gray-200">
                      <iframe
                        src={office.mapEmbed}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={office.name}
                      ></iframe>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{office.name}</h3>
                        <p className="text-gray-600">{office.address}</p>
                        {office.phone && (
                          <p className="text-gray-600">
                            <a href={`tel:${office.phone.replace(/\s/g, '')}`} className="hover:text-primary-600">
                              {office.phone}
                            </a>
                          </p>
                        )}
                        {office.email && (
                          <p className="text-gray-500 text-sm">
                            <a href={`mailto:${office.email}`} className="hover:text-primary-600">
                              {office.email}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        {(contact_page.faqs || []).length > 0 && (
          <div className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {contact_page.faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-4 pb-4">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default ContactPage;
