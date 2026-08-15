import { useTheme } from '../context/ThemeContext';
import Seo from '../components/Seo';

export default function PrivacyPolicy() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <Seo title="Privacy Policy" description="Read UniPrime Wall Clocks' privacy policy to understand how we collect, use, and protect your personal information." path="/privacy-policy" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={`font-serif text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Privacy Policy</h1>
        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'} mb-8`}>Last updated: July 2025</p>

        <div className={`space-y-8 text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>1. Information We Collect</h2>
            <p className="mb-3">When you use our website or place an order, we may collect the following information:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Full name, email address, and phone number</li>
              <li>Shipping and billing address</li>
              <li>Payment information (processed securely; we do not store card details)</li>
              <li>Order history and preferences</li>
              <li>Device and browser information (IP address, browser type, operating system)</li>
            </ul>
          </section>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>To process and fulfill your orders</li>
              <li>To send order updates, shipping notifications, and support messages</li>
              <li>To improve our website, products, and customer experience</li>
              <li>To send marketing communications (only with your consent; you can opt out at any time)</li>
              <li>To detect and prevent fraud or unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>3. Sharing Your Information</h2>
            <p className="mb-3">We do not sell your personal information. We may share your data with:</p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Courier and delivery partners to fulfill your orders</li>
              <li>Payment processors to handle transactions securely</li>
              <li>Analytics providers to help us improve our services</li>
              <li>Law enforcement if required by law</li>
            </ul>
          </section>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>4. Cookies</h2>
            <p>We use cookies to maintain your session, remember your preferences, and analyze website traffic. You can control cookie settings through your browser preferences. Disabling cookies may affect certain functionalities of the website.</p>
          </section>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>5. Data Security</h2>
            <p>We implement industry-standard security measures to protect your personal information, including SSL encryption, secure server infrastructure, and restricted access to personal data. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>6. Data Retention</h2>
            <p>We retain your personal information for as long as your account is active or as needed to provide you services. Order records are retained for legal and accounting purposes. You may request deletion of your account data by contacting us.</p>
          </section>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>7. Your Rights</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Access and review your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your personal data</li>
              <li>Opt out of marketing communications at any time</li>
            </ul>
          </section>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>8. Third-Party Links</h2>
            <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review their privacy policies.</p>
          </section>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>9. Children's Privacy</h2>
            <p>Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal data, we will take steps to delete it.</p>
          </section>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. Your continued use of the website after changes are posted constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>11. Contact Us</h2>
            <p>For questions about this Privacy Policy or your personal data:</p>
            <ul className="list-none space-y-1 ml-2 mt-2">
              <li>Email: support@uniprimeclocks.com</li>
              <li>Phone: 03198308858</li>
              <li>Address: Karachi, Pakistan</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}
