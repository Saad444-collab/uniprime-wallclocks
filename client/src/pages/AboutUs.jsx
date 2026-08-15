import { useTheme } from '../context/ThemeContext';
import Seo from '../components/Seo';

export default function AboutUs() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <Seo title="About Us" description="Learn about UniPrime Wall Clocks - a premium wall clock brand from Karachi, Pakistan crafting luxury timepieces for homes and offices." path="/about" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={`font-serif text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-8`}>About UniPrime</h1>

        <div className={`space-y-8 text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>

          <section>
            <p className="text-base leading-relaxed">
              UniPrime Wall Clocks is a premium wall clock brand based in Karachi, Pakistan, dedicated to crafting timepieces that blend precision engineering with timeless design. Since our inception, we have been on a mission to transform walls into statements of elegance.
            </p>
          </section>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>Our Story</h2>
            <p className="mb-3">
              What began as a small workshop in Karachi has grown into one of Pakistan's most trusted names in luxury wall clocks. Every clock we create reflects our passion for craftsmanship and our commitment to quality.
            </p>
            <p>
              Our team of skilled artisans and designers work together to bring you collections that suit every aesthetic — from modern minimalist to classic vintage. We believe a wall clock is more than just a functional item; it is a centerpiece that defines a space.
            </p>
          </section>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>Our Mission</h2>
            <p>To provide beautifully crafted, reliable wall clocks that bring warmth, style, and precision to homes and offices across Pakistan and beyond.</p>
          </section>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>Why Choose UniPrime</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Premium Materials</strong> — We use high-quality wood, metal, and glass in every clock.</li>
              <li><strong>Precision Movement</strong> — Silent, accurate mechanisms for hassle-free timekeeping.</li>
              <li><strong>2-Year Warranty</strong> — Every clock comes with our comprehensive manufacturer warranty.</li>
              <li><strong>Free Shipping</strong> — On all orders above Rs. 10,000 across Pakistan.</li>
              <li><strong>500+ Designs</strong> — A curated collection to suit every taste and interior.</li>
            </ul>
          </section>

          <section>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>Our Values</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Quality First</strong> — Every clock passes strict quality checks before it reaches you.</li>
              <li><strong>Customer Focus</strong> — Your satisfaction drives everything we do.</li>
              <li><strong>Innovation</strong> — We constantly explore new designs and materials.</li>
              <li><strong>Integrity</strong> — Transparent pricing, honest descriptions, and reliable service.</li>
            </ul>
          </section>

          <section className={`glass-card p-6 mt-8`}>
            <h2 className={`font-serif text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>Get in Touch</h2>
            <p className="mb-2">We'd love to hear from you. Whether you have a question, feedback, or need support:</p>
            <ul className="list-none space-y-1">
              <li>Email: support@uniprimeclocks.com</li>
              <li>Phone: 03198308858</li>
              <li>Address: Karachi, Pakistan</li>
              <li className="text-gold mt-2">Mon-Sat: 10 AM - 8 PM</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}
