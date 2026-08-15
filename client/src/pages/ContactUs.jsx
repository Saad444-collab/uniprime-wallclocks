import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../utils/api';
import Seo from '../components/Seo';

export default function ContactUs() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSending(true);
    try {
      await API.post('/contact', form);
      toast.success('Message sent! We\'ll get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again or email us directly.');
    }
    setSending(false);
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <Seo title="Contact Us" description="Contact UniPrime Wall Clocks. Reach us by phone, email, or our contact form. We're here to help with orders, support, and inquiries." path="/contact" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={`font-serif text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-8`}>Contact Us</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            {[
              { icon: FiMail, label: 'Email', value: 'support@uniprimeclocks.com', sub: 'We reply within 24 hours' },
              { icon: FiPhone, label: 'Phone', value: '03198308858', sub: 'Mon-Sat: 10 AM - 8 PM' },
              { icon: FiMapPin, label: 'Address', value: 'Karachi, Pakistan', sub: 'Visit us anytime' },
              { icon: FiClock, label: 'Working Hours', value: 'Mon - Sat', sub: '10:00 AM - 8:00 PM' },
            ].map((item, i) => (
              <div key={i} className="glass-card flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="text-gold" size={18} />
                </div>
                <div>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{item.label}</p>
                  <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.value}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="glass-card space-y-5">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Send us a Message</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} block mb-2`}>Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`w-full ${isDark ? 'bg-dark-300 text-white' : 'bg-white text-gray-900'} border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold`} required />
                </div>
                <div>
                  <label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} block mb-2`}>Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`w-full ${isDark ? 'bg-dark-300 text-white' : 'bg-white text-gray-900'} border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold`} required />
                </div>
              </div>
              <div>
                <label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} block mb-2`}>Subject</label>
                <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="How can we help?"
                  className={`w-full ${isDark ? 'bg-dark-300 text-white' : 'bg-white text-gray-900'} border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold`} />
              </div>
              <div>
                <label className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} block mb-2`}>Message *</label>
                <textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us more..."
                  className={`w-full ${isDark ? 'bg-dark-300 text-white' : 'bg-white text-gray-900'} border border-gold/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gold resize-none`} required />
              </div>
              <button type="submit" disabled={sending} className="btn-gold text-sm flex items-center gap-2">
                <FiSend size={14} /> {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
