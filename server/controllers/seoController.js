const { Product, Category } = require('../models').cluster1;

const SITE_URL = (process.env.SEO_SITE_URL || 'https://uniprimewallclocks.com').replace(/\/+$/, '');

const STATIC_PAGES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/products', changefreq: 'daily', priority: '0.9' },
  { path: '/about', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact', changefreq: 'monthly', priority: '0.6' },
  { path: '/faq', changefreq: 'monthly', priority: '0.6' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms-and-conditions', changefreq: 'yearly', priority: '0.3' }
];

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const generateSitemap = async () => {
  const urls = [];

  for (const page of STATIC_PAGES) {
    urls.push(
      `  <url>\n    <loc>${SITE_URL}${page.path === '/' ? '/' : page.path}</loc>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>`
    );
  }

  const categories = await Category.find({ isActive: true }).select('slug updatedAt').lean();
  for (const cat of categories) {
    const lastmod = cat.updatedAt ? new Date(cat.updatedAt).toISOString() : new Date().toISOString();
    urls.push(
      `  <url>\n    <loc>${SITE_URL}/products?category=${escapeXml(cat.slug)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
    );
  }

  const products = await Product.find({ isActive: true }).select('slug updatedAt').lean();
  for (const p of products) {
    const lastmod = p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString();
    urls.push(
      `  <url>\n    <loc>${SITE_URL}/products/${escapeXml(p.slug)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>`
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
};

const getSitemap = async (req, res) => {
  try {
    const xml = await generateSitemap();
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const ROBOTS_TXT = `User-agent: *
Allow: /
Disallow: /cart
Disallow: /checkout
Disallow: /profile
Disallow: /login
Disallow: /register
Disallow: /wishlist
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /verify-email
Disallow: /easypaisa-payment
Disallow: /admin
Disallow: /api

Sitemap: ${SITE_URL}/sitemap.xml
`;

const getRobots = (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(ROBOTS_TXT);
};

const PAGE_META = {
  '/': {
    title: 'UniPrime Wall Clocks | Luxury Timepieces',
    description: 'Premium luxury wall clocks for your home and office. Shop handcrafted wall clocks with nationwide delivery across Pakistan.',
    type: 'website'
  },
  '/products': {
    title: 'Our Collections | UniPrime Wall Clocks',
    description: 'Explore our premium wall clock collections. Luxury handcrafted wall clocks for home and office, with nationwide delivery across Pakistan.',
    type: 'website'
  },
  '/about': {
    title: 'About Us | UniPrime Wall Clocks',
    description: 'Learn about UniPrime Wall Clocks - a premium wall clock brand from Karachi, Pakistan crafting luxury timepieces for homes and offices.',
    type: 'website'
  },
  '/contact': {
    title: 'Contact Us | UniPrime Wall Clocks',
    description: 'Contact UniPrime Wall Clocks. Reach us by phone, email, or our contact form. We\'re here to help with orders, support, and inquiries.',
    type: 'website'
  },
  '/faq': {
    title: 'Frequently Asked Questions | UniPrime Wall Clocks',
    description: 'Answers to common questions about UniPrime Wall Clocks - payment methods, delivery times, shipping, warranty, returns and more.',
    type: 'website'
  },
  '/privacy-policy': {
    title: 'Privacy Policy | UniPrime Wall Clocks',
    description: 'Read UniPrime Wall Clocks\' privacy policy to understand how we collect, use, and protect your personal information.',
    type: 'website'
  },
  '/terms-and-conditions': {
    title: 'Terms & Conditions | UniPrime Wall Clocks',
    description: 'Read UniPrime Wall Clocks\' terms and conditions for purchasing, shipping, returns, and using our website.',
    type: 'website'
  }
};

const SHELL_TAGS = {
  preconnect: '<link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
  fonts: '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />'
};

function buildHtml({ title, description, url, image, type, jsonLd, body = '<div id="root"></div>' }) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="${SITE_URL}/clock-icon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escapeXml(description)}" />
    <meta name="theme-color" content="#1a1a1a" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${url}" />

    <meta property="og:type" content="${type}" />
    <meta property="og:site_name" content="UniPrime Wall Clocks" />
    <meta property="og:title" content="${escapeXml(title)}" />
    <meta property="og:description" content="${escapeXml(description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${image}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeXml(title)}" />
    <meta name="twitter:description" content="${escapeXml(description)}" />
    <meta name="twitter:image" content="${image}" />

    ${SHELL_TAGS.preconnect}
    ${SHELL_TAGS.fonts}
    <title>${escapeXml(title)}</title>
    ${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
  </head>
  <body>
    ${body}
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`;
}

const CRAWLER_RE = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandex|facebookexternalhit|facebot|twitterbot|linkedinbot|pinterest|whatsapp|telegrambot|ia_archiver|semrushbot|ahrefsbot|mj12bot|petalbot|applebot/i;

const isCrawler = (userAgent) => !!userAgent && CRAWLER_RE.test(userAgent);

const renderCrawlerSnapshot = async (req, res) => {
  const pathname = req.path;
  const siteUrl = SITE_URL;
  const meta = PAGE_META[pathname];

  if (meta) {
    const url = siteUrl + (pathname === '/' ? '/' : pathname);
    const html = buildHtml({
      ...meta,
      url,
      image: `${siteUrl}/clock-icon.svg`,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Store',
        name: 'UniPrime Wall Clocks',
        url: siteUrl + '/',
        email: 'support@uniprimeclocks.com',
        telephone: '+92 319 8308858',
        address: { '@type': 'PostalAddress', addressLocality: 'Karachi', addressCountry: 'PK' }
      }
    });
    return res.send(html);
  }

  const productMatch = pathname.match(/^\/products\/([\w-]+)$/);
  if (productMatch) {
    const product = await Product.findOne({ slug: productMatch[1], isActive: true })
      .populate('category', 'name slug')
      .lean();
    if (product) {
      const url = `${siteUrl}/products/${product.slug}`;
      const image = (product.images && product.images[0]) || `${siteUrl}/clock-icon.svg`;
      const description = (product.description || `${product.name} - premium wall clock by UniPrime Wall Clocks`).slice(0, 200);
      const price = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image,
        description,
        sku: product.sku,
        brand: { '@type': 'Brand', name: 'UniPrime Wall Clocks' },
        offers: {
          '@type': 'Offer',
          url,
          priceCurrency: 'PKR',
          price: String(price),
          availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
        }
      };
      const html = buildHtml({
        title: `${product.name} | UniPrime Wall Clocks`,
        description,
        url,
        image,
        type: 'product',
        jsonLd
      });
      return res.send(html);
    }
  }

  const categoryMatch = pathname === '/products' && req.query.category;
  if (categoryMatch) {
    const category = await Category.findOne({ slug: req.query.category, isActive: true }).lean();
    if (category) {
      const url = `${siteUrl}/products?category=${category.slug}`;
      const html = buildHtml({
        title: `${category.name} Wall Clocks | UniPrime Wall Clocks`,
        description: (category.description || `Shop ${category.name} wall clocks online in Pakistan.`).slice(0, 200),
        url,
        image: category.image || `${siteUrl}/clock-icon.svg`,
        type: 'website',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${category.name} Wall Clocks`,
          url,
          description: category.description || undefined
        }
      });
      return res.send(html);
    }
  }

  res.status(404).json({ success: false, message: 'Resource not found' });
};

module.exports = { getSitemap, getRobots, renderCrawlerSnapshot, isCrawler, SITE_URL, generateSitemap };
