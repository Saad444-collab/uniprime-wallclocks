require('dotenv').config();
const dbManager = require('./config/databaseManager');
const { Category } = require('./models').cluster1;
const slugify = require('./utils/slugify');

const categories = [
  { name: 'Modern Wall Clocks', description: 'Sleek, minimalist timepieces with clean lines and contemporary designs to elevate any space.' },
  { name: 'Classic & Antique', description: 'Timeless vintage-inspired clocks with ornate detailing and old-world charm.' },
  { name: 'Wooden Wall Clocks', description: 'Warm, handcrafted wooden clocks that bring natural elegance to your walls.' },
  { name: 'Digital Wall Clocks', description: 'High-precision digital clocks with clear LED/LCD displays and smart features.' },
  { name: 'Designer & Luxury', description: 'Premium luxury clocks crafted with premium materials for a statement look.' },
  { name: 'Roman Numerals', description: 'Elegant clocks featuring traditional Roman numeral dials.' },
  { name: 'Silent & Non-Ticking', description: 'Ultra-quiet sweep movement clocks, perfect for bedrooms and offices.' },
  { name: 'Oversized & Statement', description: 'Large format wall clocks that make a bold statement in living rooms and halls.' },
  { name: 'Mirror Wall Clocks', description: 'Stylish mirror-face clocks that combine function with décor.' },
  { name: 'Round Wall Clocks', description: 'Classic round-shaped clocks for versatile everyday styling.' },
  { name: 'Square Wall Clocks', description: 'Contemporary square clocks with crisp, geometric design.' },
  { name: 'LED & Glow Clocks', description: 'Backlit and glowing clocks that are easy to read in the dark.' },
  { name: 'Sports & Office Clocks', description: 'Durable, functional clocks built for offices, gyms and workspaces.' },
  { name: 'Kids Room Clocks', description: 'Playful and colorful clocks designed for children\'s rooms.' },
  { name: 'Wall Clock Sets', description: 'Multi-piece clock sets to decorate entire walls with a coordinated theme.' },
  { name: 'Chime Clocks', description: 'Clocks with pleasant melodic chimes on the hour and half-hour.' },
  { name: 'Cuckoo Clocks', description: 'Traditional handcrafted cuckoo clocks with animated bird and pendulums.' },
  { name: 'Marble Wall Clocks', description: 'Luxurious clocks with elegant marble finish for a premium aesthetic.' },
  { name: 'Metal Wall Clocks', description: 'Sturdy metal clocks in a variety of finishes from matte black to gold.' },
  { name: 'Acrylic Wall Clocks', description: 'Lightweight, transparent acrylic clocks with a modern floating look.' },
  { name: 'Gold & Brass Clocks', description: 'Opulent gold and brass finished clocks that add sophistication.' },
  { name: 'Retro Vintage Clocks', description: 'Nostalgic retro designs inspired by mid-century and 70s styles.' },
  { name: 'Minimalist Clocks', description: 'Clean, fuss-free designs with simple dials for a tidy look.' },
  { name: 'Industrial Clocks', description: 'Raw, bold designs with exposed gears, metal frames and urban styling.' },
  { name: 'Farmhouse Clocks', description: 'Rustic farmhouse style clocks with distressed wood and shabby-chic charm.' },
  { name: 'Geometric Clocks', description: 'Modern clocks featuring bold geometric shapes and artistic arrangements.' },
  { name: 'World Time Clocks', description: 'Clocks showing multiple time zones for travellers and global teams.' },
  { name: 'Astronomy & Nautical Clocks', description: 'Star chart and nautical themed clocks for a sophisticated maritime look.' },
  { name: 'Frameless Clocks', description: 'Sleek frameless designs that blend seamlessly into any wall.' },
  { name: 'Sunburst Wall Clocks', description: 'Striking sunburst designs with radiating rays and artistic detail.' },
  { name: 'Battery Operated Clocks', description: 'Convenient battery-powered clocks with silent sweep movements.' },
  { name: 'Wall & Mantel Clocks', description: 'Versatile clocks suitable for both wall mounting and mantel display.' }
];

(async () => {
  try {
    await dbManager.initAll();
    let created = 0;
    let skipped = 0;
    for (const cat of categories) {
      const slug = slugify(cat.name);
      const existing = await Category.findOne({ $or: [{ slug }, { name: cat.name }] });
      if (existing) {
        console.log('SKIP (exists):', cat.name);
        skipped++;
        continue;
      }
      await Category.create({ ...cat, slug, isActive: true });
      console.log('CREATED:', cat.name);
      created++;
    }
    console.log(`\nDone. Created ${created}, skipped ${skipped}.`);
    await dbManager.closeAll();
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  }
})();
