require('dotenv').config();
const dbManager = require('./config/databaseManager');
const { Product, Category } = require('./models').cluster1;
const slugify = require('./utils/slugify');

const RATE = { USD: 278, GBP: 352, EUR: 300, CAD: 202, AUD: 181, AED: 76, SAR: 74 };

const convert = (pkr) => {
  const mcp = {};
  for (const [code, rate] of Object.entries(RATE)) {
    mcp[code] = Math.round((pkr / rate) * 100) / 100;
  }
  return mcp;
};

const products = [
  { name: 'Aurora Minimalist Silent Clock', categorySlug: 'modern-wall-clocks', price: 4500, brand: 'UniPrime', material: 'ABS Plastic', color: 'Matte White', dimensions: '30 cm diameter', weight: '0.8 kg', warranty: '1 year', stock: 40, featured: true, bestSeller: true, shortDescription: 'Ultra-quiet sweep movement in a clean minimalist design.', description: 'The Aurora is a beautifully simple wall clock with a silent sweep movement, crisp matte white dial and bold black numerals. Perfect for modern living rooms, bedrooms and offices.' },
  { name: 'Heritage Classic Wall Clock', categorySlug: 'classic-antique', price: 8500, brand: 'UniPrime', material: 'Wood & Brass', color: 'Antique Brown', dimensions: '35 cm diameter', weight: '1.5 kg', warranty: '1 year', stock: 25, featured: true, newArrival: true, shortDescription: 'Timeless antique-styled clock with brass accents.', description: 'Hand-finished antique design featuring a distressed wooden body, elegant brass numerals and a rich patina finish. A statement piece for classic interiors.' },
  { name: 'Natural Oak Wooden Clock', categorySlug: 'wooden-wall-clocks', price: 6900, brand: 'TimberCraft', material: 'Natural Oak', color: 'Oak Brown', dimensions: '32 cm diameter', weight: '1.2 kg', warranty: '2 years', stock: 30, shortDescription: 'Handcrafted oak wood clock with a natural grain finish.', description: 'Crafted from responsibly sourced oak with a smooth matte finish. Each clock has a unique wood grain, giving your wall a warm, organic touch.' },
  { name: 'Chronos Digital LED Clock', categorySlug: 'digital-wall-clocks', price: 5200, brand: 'UniPrime', material: 'ABS Plastic', color: 'Black', dimensions: '38 x 12 cm', weight: '0.6 kg', warranty: '1 year', stock: 50, newArrival: true, shortDescription: 'Smart digital clock with adjustable LED brightness.', description: 'A high-precision digital wall clock with a bright LED display, auto-dimming, date and temperature display. Set it and forget it with the memory backup.' },
  { name: 'Prestige Luxury Gold Clock', categorySlug: 'designer-luxury', price: 15900, brand: 'LuxeTime', material: 'Metal, Gold Finish', color: 'Gold', dimensions: '40 cm diameter', weight: '2.4 kg', warranty: '2 years', stock: 12, featured: true, bestSeller: true, shortDescription: 'Premium gold-finished luxury clock for statement walls.', description: 'A luxurious designer clock finished in brushed gold with a precision quartz movement. The sculpted metallic dial catches the light beautifully.' },
  { name: 'Roman Elegance Clock', categorySlug: 'roman-numerals', price: 7400, brand: 'UniPrime', material: 'MDF & Iron', color: 'Ivory', dimensions: '34 cm diameter', weight: '1.1 kg', warranty: '1 year', stock: 28, bestSeller: true, shortDescription: 'Elegant ivory dial with classic Roman numerals.', description: 'Timeless elegance with embossed Roman numerals on a smooth ivory dial, framed by a slender metal bezel. Complements both classic and transitional interiors.' },
  { name: 'Serene Silent Sweep Clock', categorySlug: 'silent-non-ticking', price: 3900, brand: 'UniPrime', material: 'ABS Plastic', color: 'Black', dimensions: '28 cm diameter', weight: '0.5 kg', warranty: '1 year', stock: 60, shortDescription: '100% silent sweep movement for noise-free rooms.', description: 'Enjoy total silence with our precision sweep movement. Ideal for bedrooms, study rooms and offices where ticking would be distracting.' },
  { name: 'Grande Oversized Clock', categorySlug: 'oversized-statement', price: 12900, brand: 'UniPrime', material: 'MDF & Metal', color: 'Black & Gold', dimensions: '80 cm diameter', weight: '3.5 kg', warranty: '1 year', stock: 10, featured: true, shortDescription: 'Bold 80cm statement clock for large walls.', description: 'A commanding presence for living rooms and hallways. The oversized silhouette with gold hour markers creates a dramatic focal point.' },
  { name: 'Eclipse Mirror Clock', categorySlug: 'mirror-wall-clocks', price: 9800, brand: 'UniPrime', material: 'Glass & Metal', color: 'Silver', dimensions: '36 cm diameter', weight: '1.8 kg', warranty: '1 year', stock: 18, newArrival: true, shortDescription: 'Stylish mirror-face clock that doubles as décor.', description: 'A sleek mirror-faced clock with minimalist markers. Reflects light beautifully and adds depth to any room.' },
  { name: 'Classic Round Dial Clock', categorySlug: 'round-wall-clocks', price: 3400, brand: 'UniPrime', material: 'Plastic', color: 'White', dimensions: '26 cm diameter', weight: '0.4 kg', warranty: '1 year', stock: 70, bestSeller: true, shortDescription: 'The everyday classic round clock for any room.', description: 'Simple, reliable and affordable. A clean white round dial with bold numerals that works anywhere.' },
  { name: 'Modern Square Clock', categorySlug: 'square-wall-clocks', price: 4600, brand: 'UniPrime', material: 'MDF', color: 'Graphite', dimensions: '30 x 30 cm', weight: '0.9 kg', warranty: '1 year', stock: 22, shortDescription: 'Crisp square design with geometric numerals.', description: 'A contemporary square clock with a crisp graphite face and geometric markers. A modern favourite for apartments and offices.' },
  { name: 'Glowline LED Clock', categorySlug: 'led-glow-clocks', price: 6100, brand: 'GlowTech', material: 'Acrylic & LED', color: 'Clear', dimensions: '30 x 12 cm', weight: '0.7 kg', warranty: '1 year', stock: 35, newArrival: true, shortDescription: 'Backlit clock with glowing numerals for dark rooms.', description: 'A glowing LED wall clock with adjustable colours and brightness. Easy to read from across the room even in total darkness.' },
  { name: 'Pro Office Clock', categorySlug: 'sports-office-clocks', price: 4200, brand: 'UniPrime', material: 'ABS Plastic', color: 'Black', dimensions: '32 cm diameter', weight: '0.6 kg', warranty: '1 year', stock: 45, shortDescription: 'Durable, high-visibility clock built for workspaces.', description: 'Built for busy environments with a durable casing, high-contrast dial and strong hanger mechanism. Trusted for offices, gyms and workshops.' },
  { name: 'Playful Kids Clock', categorySlug: 'kids-room-clocks', price: 2800, brand: 'FunTime', material: 'Plastic', color: 'Multicolor', dimensions: '25 cm diameter', weight: '0.4 kg', warranty: '1 year', stock: 55, shortDescription: 'Colorful, fun clock designed for kids rooms.', description: 'Bright, playful colours and friendly numerals help kids learn to tell time. Safe rounded edges and lightweight design.' },
  { name: 'Gallery Wall Clock Set', categorySlug: 'wall-clock-sets', price: 14900, brand: 'UniPrime', material: 'MDF', color: 'Assorted', dimensions: 'Set of 5 (12-30 cm)', weight: '3.0 kg', warranty: '1 year', stock: 8, featured: true, shortDescription: 'Five-piece coordinated set to decorate entire walls.', description: 'Create a stunning gallery wall with this coordinated 5-clock set in assorted sizes and finishes. All clocks feature precise quartz movements.' },
  { name: 'Harmony Chime Clock', categorySlug: 'chime-clocks', price: 11200, brand: 'Heritage Sound', material: 'Wood', color: 'Walnut', dimensions: '38 cm diameter', weight: '2.2 kg', warranty: '2 years', stock: 14, bestSeller: true, shortDescription: 'Melodic chime clock with rich walnut finish.', description: 'A warm walnut chime clock that plays a pleasant melody on the hour with an automatic night-silence option. Combines old-world charm with modern reliability.' },
  { name: 'Black Forest Cuckoo Clock', categorySlug: 'cuckoo-clocks', price: 26500, brand: 'Alpenzeit', material: 'Handcrafted Wood', color: 'Brown', dimensions: '42 x 25 cm', weight: '3.8 kg', warranty: '2 years', stock: 6, shortDescription: 'Traditional handcrafted cuckoo clock with pendulum.', description: 'Authentic handcrafted cuckoo clock with animated bird and swinging pendulum. Carved from quality wood in the Black Forest tradition.' },
  { name: 'Marble Luxe Clock', categorySlug: 'marble-wall-clocks', price: 13800, brand: 'LuxeTime', material: 'Marble Finish MDF', color: 'White Marble', dimensions: '33 cm diameter', weight: '1.6 kg', warranty: '2 years', stock: 16, newArrival: true, shortDescription: 'Elegant marble-finish clock for premium interiors.', description: 'Sleek marble-finish clock with gold accents that brings luxury hotel style to your home. Available in white and black marble tones.' },
  { name: 'Matte Black Metal Clock', categorySlug: 'metal-wall-clocks', price: 5800, brand: 'UniPrime', material: 'Powder-coated Metal', color: 'Matte Black', dimensions: '35 cm diameter', weight: '1.3 kg', warranty: '1 year', stock: 33, shortDescription: 'Sturdy powder-coated metal clock.', description: 'A robust metal clock with a durable matte black finish that resists scratches and tarnish. Great for industrial and minimalist spaces.' },
  { name: 'Clear Acrylic Clock', categorySlug: 'acrylic-wall-clocks', price: 3600, brand: 'UniPrime', material: 'Acrylic', color: 'Clear', dimensions: '30 cm diameter', weight: '0.4 kg', warranty: '1 year', stock: 40, shortDescription: 'Transparent floating-look acrylic clock.', description: 'Lightweight transparent acrylic creates a modern floating effect. Numerals appear to hover on the wall — a minimal, contemporary choice.' },
  { name: 'Royal Gold Clock', categorySlug: 'gold-brass-clocks', price: 18700, brand: 'LuxeTime', material: 'Brass', color: 'Antique Gold', dimensions: '38 cm diameter', weight: '2.8 kg', warranty: '2 years', stock: 9, featured: true, bestSeller: true, shortDescription: 'Opulent antique gold and brass finished clock.', description: 'An opulent clock finished in antique gold and polished brass. Hand-detailed and weighted for a premium feel.' },
  { name: 'Retro 70s Clock', categorySlug: 'retro-vintage-clocks', price: 5400, brand: 'UniPrime', material: 'MDF & Metal', color: 'Mustard', dimensions: '31 cm diameter', weight: '1.0 kg', warranty: '1 year', stock: 21, shortDescription: 'Nostalgic mid-century inspired retro design.', description: 'Groovy retro styling with a mustard dial and chrome accents, inspired by 1970s design. Adds a fun vintage punch to any room.' },
  { name: 'Tiny Minimalist Clock', categorySlug: 'minimalist-clocks', price: 2600, brand: 'UniPrime', material: 'ABS Plastic', color: 'White', dimensions: '22 cm diameter', weight: '0.3 kg', warranty: '1 year', stock: 65, shortDescription: 'Clean fuss-free design with a simple dial.', description: 'The essence of minimalism — a simple dial, two clean hands, no clutter. Perfect for those who love tidy, breathable spaces.' },
  { name: 'Gear Industrial Clock', categorySlug: 'industrial-clocks', price: 7900, brand: 'UrbanForge', material: 'Iron', color: 'Rustic Black', dimensions: '36 cm diameter', weight: '1.9 kg', warranty: '1 year', stock: 17, newArrival: true, shortDescription: 'Exposed-gear industrial style clock.', description: 'Exposed gear details and a heavy iron frame give this clock a bold, urban industrial look. Each piece shows natural casting variations.' },
  { name: 'Farmhouse Distressed Clock', categorySlug: 'farmhouse-clocks', price: 6700, brand: 'UniPrime', material: 'Reclaimed Wood', color: 'Distressed White', dimensions: '33 cm diameter', weight: '1.4 kg', warranty: '1 year', stock: 19, bestSeller: true, shortDescription: 'Rustic distressed wood farmhouse style.', description: 'Rustic farmhouse charm with a hand-distressed wood finish and shabby-chic detailing. Warmed up with weathered character.' },
  { name: 'Hex Geometric Clock', categorySlug: 'geometric-clocks', price: 7200, brand: 'UniPrime', material: 'MDF & Metal', color: 'Black & Copper', dimensions: '40 x 40 cm', weight: '1.5 kg', warranty: '1 year', stock: 15, newArrival: true, shortDescription: 'Artistic geometric arrangement wall clock.', description: 'Bold geometric forms arranged into a striking clock sculpture. Copper accents over matte black for a modern gallery look.' },
  { name: 'World Timer Clock', categorySlug: 'world-time-clocks', price: 12400, brand: 'GlobalTime', material: 'Metal', color: 'Silver', dimensions: '36 cm diameter', weight: '2.0 kg', warranty: '2 years', stock: 11, shortDescription: 'Multiple time-zone display for global teams.', description: 'Displays major world time zones simultaneously — perfect for global teams, travellers and offices with international clients.' },
  { name: 'Mariner Nautical Clock', categorySlug: 'astronomy-nautical-clocks', price: 9800, brand: 'UniPrime', material: 'Brass & Steel', color: 'Navy & Brass', dimensions: '34 cm diameter', weight: '2.3 kg', warranty: '2 years', stock: 13, shortDescription: 'Nautical themed clock with maritime styling.', description: 'Maritime inspired design with a compass-style dial, navy face and polished brass ring. A sophisticated nod to the sea.' },
  { name: 'Frameless Clock', categorySlug: 'frameless-clocks', price: 3200, brand: 'UniPrime', material: 'Glass', color: 'Clear', dimensions: '28 cm diameter', weight: '0.6 kg', warranty: '1 year', stock: 38, shortDescription: 'Sleek frameless design blends into walls.', description: 'A frameless glass clock that blends seamlessly into any wall, leaving only the numerals and hands visible. Minimalist perfection.' },
  { name: 'Sunburst Clock', categorySlug: 'sunburst-wall-clocks', price: 13900, brand: 'LuxeTime', material: 'Metal, Brass Finish', color: 'Gold', dimensions: '55 cm diameter', weight: '2.6 kg', warranty: '2 years', stock: 7, featured: true, shortDescription: 'Striking sunburst design with radiating rays.', description: 'Radiating rays in a hand-polished brass finish make this sunburst clock a dazzling centrepiece for living rooms and hotel lobbies.' },
  { name: 'Eco Battery Clock', categorySlug: 'battery-operated-clocks', price: 2900, brand: 'UniPrime', material: 'Plastic', color: 'White', dimensions: '24 cm diameter', weight: '0.3 kg', warranty: '1 year', stock: 80, shortDescription: 'Convenient battery-powered silent clock.', description: 'Energy-efficient battery-powered movement with a silent sweep second hand. Runs for up to 12 months on a single AA battery.' },
  { name: 'Versa Wall & Mantel Clock', categorySlug: 'wall-mantel-clocks', price: 6600, brand: 'UniPrime', material: 'MDF', color: 'Walnut', dimensions: '29 cm', weight: '1.0 kg', warranty: '1 year', stock: 24, shortDescription: 'Versatile clock for wall or mantel display.', description: 'Designed for both wall mounting and mantel display. A warm walnut finish and a flat base make it endlessly versatile.' }
];

(async () => {
  try {
    await dbManager.initAll();

    const catBySlug = {};
    const cats = await Category.find({ isActive: true }).lean();
    for (const c of cats) catBySlug[c.slug] = c._id;

    let created = 0;
    let skipped = 0;
    const missingCats = new Set();

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const catId = catBySlug[p.categorySlug];
      if (!catId) {
        missingCats.add(p.categorySlug);
        console.log('SKIP (no category):', p.name, `-> ${p.categorySlug}`);
        skipped++;
        continue;
      }
      const slug = slugify(p.name);
      const sku = `WC-${String(i + 1).padStart(4, '0')}`;
      const existing = await Product.findOne({ $or: [{ slug }, { sku }] });
      if (existing) {
        console.log('SKIP (exists):', p.name);
        skipped++;
        continue;
      }
      const { categorySlug, ...rest } = p;
      await Product.create({
        ...rest,
        slug,
        sku,
        category: catId,
        images: [
          `https://picsum.photos/seed/${slug}-1/800/800`,
          `https://picsum.photos/seed/${slug}-2/800/800`
        ],
        multiCurrencyPrices: convert(p.price)
      });
      console.log('CREATED:', p.name);
      created++;
    }

    console.log(`\nDone. Created ${created}, skipped ${skipped}.`);
    if (missingCats.size > 0) {
      console.log('Missing categories:', [...missingCats].join(', '));
    }
    await dbManager.closeAll();
  } catch (e) {
    console.error('ERROR:', e);
    process.exit(1);
  }
})();
