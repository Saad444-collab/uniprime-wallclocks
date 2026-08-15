import { useTheme } from '../context/ThemeContext';
import Seo from '../components/Seo';

export default function TermsAndConditions() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <Seo title="Terms & Conditions" description="Read UniPrime Wall Clocks' terms and conditions for purchasing, shipping, returns, and using our website." path="/terms-and-conditions" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={`font-serif text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Terms & Conditions</h1>
        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'} mb-8`}>Last updated: July 2025</p>

        <div className={`space-y-8 text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>1. General</h2>
            <p className="mb-3">These Terms & Conditions govern your use of the UniPrime Wall Clocks website and the purchase of products from us. By accessing our website or placing an order, you agree to be bound by these terms.</p>
            <p>UniPrime Wall Clocks is a registered business operating from Karachi, Pakistan. All references to "we", "us", or "our" refer to UniPrime Wall Clocks.</p>
          </section>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>2. Products & Pricing</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>All product images are for illustration purposes. Actual products may vary slightly in colour or finish due to screen settings and handcrafted nature.</li>
              <li>Prices are displayed in your local currency based on your detected location. We reserve the right to change prices at any time without prior notice.</li>
              <li>In the event of a pricing error on a listed product, we reserve the right to cancel the order and issue a full refund.</li>
              <li>Product availability is subject to stock. We may discontinue or modify products without notice.</li>
            </ul>
          </section>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>3. Orders</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Placing an order does not guarantee acceptance. We reserve the right to refuse or cancel any order for any reason.</li>
              <li>Orders are confirmed only after successful payment verification (for online payments) or admin confirmation (for Cash on Delivery).</li>
              <li>You are responsible for providing accurate shipping information. We are not liable for orders shipped to incorrect addresses provided by the customer.</li>
            </ul>
          </section>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>4. Payment</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>We accept Cash on Delivery, Card, Bank Transfer, and Easypaisa.</li>
              <li>For online payments, your payment is verified by our team before order processing begins.</li>
              <li>All payment information is processed securely. We do not store your card or banking details.</li>
            </ul>
          </section>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>5. Shipping & Delivery</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>We offer free shipping on orders above Rs. 10,000 (PKR). A flat shipping fee of Rs. 49 applies to orders below this threshold within Pakistan.</li>
              <li>Delivery times are estimates and may vary based on location and logistics. We are not responsible for delays caused by courier services.</li>
              <li>Risk of loss and title for products pass to you upon delivery to the shipping address.</li>
            </ul>
          </section>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>6. Warranty</h2>
            <p>All UniPrime Wall Clocks come with a 2-year manufacturer warranty covering defects in materials and workmanship under normal use. The warranty does not cover:</p>
            <ul className="list-disc list-inside space-y-2 ml-2 mt-2">
              <li>Damage caused by misuse, neglect, or accidents.</li>
              <li>Battery leakage or water damage.</li>
              <li>Normal wear and tear including fading or minor cosmetic changes.</li>
              <li>Damage during unauthorized repair or modification.</li>
            </ul>
          </section>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>7. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, UniPrime Wall Clocks shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with the use of our products or website. Our total liability for any claim shall not exceed the amount paid by you for the specific product in question.</p>
          </section>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>8. Intellectual Property</h2>
            <p>All content on this website, including text, images, logos, graphics, and designs, is the property of UniPrime Wall Clocks and is protected by applicable intellectual property laws. You may not reproduce, distribute, or use any content without our written consent.</p>
          </section>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>9. Privacy</h2>
            <p>Your use of our website is also governed by our Privacy Policy, which describes how we collect, use, and protect your personal information. By using our services, you consent to the practices described therein.</p>
          </section>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>10. Governing Law</h2>
            <p>These Terms & Conditions are governed by and construed in accordance with the laws of Pakistan. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Karachi, Pakistan.</p>
          </section>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>11. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms & Conditions at any time. Changes will be effective upon posting on this page. Your continued use of the website after any changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>11. Contact</h2>
            <p>For any questions regarding these Terms & Conditions, please contact us at:</p>
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
