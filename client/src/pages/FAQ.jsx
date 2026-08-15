import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Seo from '../components/Seo';

const FAQ_DATA = [
  {
    q: 'What payment methods do you accept?',
    a: 'We accept Cash on Delivery (COD), Card payments, Bank Transfer, and Easypaisa. All online payments are verified before order processing.'
  },
  {
    q: 'How long does delivery take?',
    a: 'Standard delivery within Karachi takes 2-3 business days. For other cities in Pakistan, delivery typically takes 3-7 business days depending on your location.'
  },
  {
    q: 'Do you offer free shipping?',
    a: 'Yes! We offer free shipping on all orders above Rs. 10,000 within Pakistan. A flat shipping fee of Rs. 49 applies to orders below this threshold.'
  },
  {
    q: 'What is your warranty policy?',
    a: 'All UniPrime Wall Clocks come with a 2-year manufacturer warranty covering defects in materials and workmanship. The warranty does not cover damage from misuse, accidents, or unauthorized modifications.'
  },
  {
    q: 'Can I return a product?',
    a: 'If you receive a damaged or defective product, please contact us within 7 days of delivery with photos of the issue. We will arrange a replacement or refund as appropriate.'
  },
  {
    q: 'How do I track my order?',
    a: 'Once your order is shipped, you will receive an SMS and email with tracking details. You can also check your order status in the My Orders section of your profile.'
  },
  {
    q: 'Are the product colors accurate on the website?',
    a: 'We make every effort to display colors accurately. However, slight variations may occur due to screen settings and the handcrafted nature of our products.'
  },
  {
    q: 'Do you ship across Pakistan?',
    a: 'Yes, we deliver to all major cities and towns across Pakistan through our trusted courier partners.'
  },
  {
    q: 'How do I contact customer support?',
    a: 'You can reach us by phone at 03198308858, email at support@uniprimeclocks.com, or use the Contact Us page on our website. Our team is available Monday to Saturday, 10 AM to 8 PM.'
  },
  {
    q: 'Can I cancel my order?',
    a: 'You can cancel your order before it is shipped. Once shipped, cancellation is not possible, but you may refuse delivery for COD orders. Contact us immediately if you need to cancel.'
  }
];

export default function FAQ() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [openIndex, setOpenIndex] = useState(null);

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_DATA.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <Seo title="Frequently Asked Questions" description="Answers to common questions about UniPrime Wall Clocks - payment methods, delivery times, shipping, warranty, returns and more." path="/faq" jsonLd={faqJsonLd} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={`font-serif text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Frequently Asked Questions</h1>
        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'} mb-8`}>Find answers to common questions about our products and services.</p>

        <div className="space-y-3">
          {FAQ_DATA.map((item, i) => (
            <div key={i} className="glass-card">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className={`font-medium text-sm pr-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.q}</span>
                {openIndex === i
                  ? <FiChevronUp className="text-gold flex-shrink-0" size={18} />
                  : <FiChevronDown className={`flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
                }
              </button>
              {openIndex === i && (
                <p className={`text-sm mt-3 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.a}</p>
              )}
            </div>
          ))}
        </div>

        <div className={`glass-card mt-10 text-center`}>
          <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Can't find what you're looking for?</p>
          <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Contact us at <span className="text-gold">support@uniprimeclocks.com</span> or call <span className="text-gold">03198308858</span></p>
        </div>
      </div>
    </div>
  );
}
