/**
 * Faber Product Catalog & Fuzzy Alias Resolver (Pure JavaScript)
 *
 * WHAT THIS FILE DOES:
 * 1. Defines the 4 authorized Faber demo appliances with high-resolution CDN images,
 *    technical specifications, dimensions, suction power, and wash programs.
 * 2. Implements a resilient fuzzy-matching algorithm (`resolveProductsByEnums`) that
 *    normalizes whatever text or array the LLM/Voice Agent outputs into the exact 4 demo products.
 * 3. Provides `getAllProducts()` to return the entire catalog in sorted sequence.
 */

/**
 * THE 4 AUTHORIZED DEMO APPLIANCES
 * Strict Demo Scope: Chimney 1, Chimney 2, Dishwasher 1, Dishwasher 2
 */
export const FABER_PRODUCT_CATALOG = {
  // 1. Chimney 1 (Wall-mounted Curved Glass Hood)
  CHIMNEY_1: {
    enumKey: 'CHIMNEY_1',
    sequenceOrder: 1,
    name: 'Faber Curved Glass Auto-Clean Chimney',
    category: 'Auto-Clean Wall Mounted Chimney',
    imageUrl: 'https://faberindia.com/cdn/shop/products/IMG_4526-2.jpg?v=1652172625&width=1100',
    productPageUrl: 'https://faberindia.com/collections/chimneys',
    dimensions: '60 cm / 90 cm',
    suctionPower: '1200 m³/hr Airflow',
    finish: 'Black Curved Tempered Glass & Steel',
    controls: 'Motion Gesture & Touch Control',
    highlight: 'Thermal Auto-Clean with Metal Oil Collector',
    description: 'High-performance curved glass canopy hood featuring touch-free gesture sensor control and heat auto-clean technology.',
    keyFeatures: ['Thermal Auto-Clean', 'Motion Sensor Control', '1200 m³/hr Suction', 'Curved Glass Canopy']
  },

  // 2. Chimney 2 (Vertical Inclined / Angular Hood)
  CHIMNEY_2: {
    enumKey: 'CHIMNEY_2',
    sequenceOrder: 2,
    name: 'Faber Angular Filterless Luxury Chimney',
    category: 'Filterless Inclined Chimney',
    imageUrl: 'https://faberindia.com/cdn/shop/files/0P5A2322.jpg?v=1718706990&width=1500',
    productPageUrl: 'https://faberindia.com/collections/chimneys',
    dimensions: '60 cm / 90 cm',
    suctionPower: '1350 m³/hr Direct Suction',
    finish: 'Signature Obsidian Black Angular Glass',
    controls: 'Feather Touch + Wave Gesture Sensor',
    highlight: 'Next-Gen Filterless Direct Smoke Capture',
    description: 'Ergonomic inclined vertical chimney providing zero head collision risk and rapid fume capture right at the cooktop source.',
    keyFeatures: ['Filterless Technology', 'Direct Suction Chamber', 'Wave Gesture Sensor', 'High-Flux LED Lights']
  },

  // 3. Dishwasher 1: Faber FBID 8PR 14S (Built-in Integrated)
  DISHWASHER_FBID_8PR_14S: {
    enumKey: 'DISHWASHER_FBID_8PR_14S',
    sequenceOrder: 3,
    name: 'Faber FBID 8PR 14S Dishwasher',
    category: 'Built-in Integrated Dishwasher',
    imageUrl: 'https://faberindia.com/cdn/shop/files/0P5A9911.jpg?v=1744617554&width=2000',
    productPageUrl: 'https://faberindia.com/collections/dishwashers',
    dimensions: '60 cm Standard Built-in',
    suctionPower: '14 Place Settings • 8 Wash Programs',
    finish: 'Fully Integrated Seamless Cabinet Panel',
    controls: 'Electronic Soft Touch with Digital Display',
    highlight: '14 Place Capacity with Dual Zone Wash & 3D Spray',
    description: 'Faber FBID 8PR 14S built-in dishwasher engineered for Indian cookware, featuring dual-zone spray arms and 8 smart washing cycles.',
    keyFeatures: ['14 Place Settings', '8 Wash Programs', 'Dual Zone Wash', 'A+++ Energy Efficiency', 'Delayed Start']
  },

  // 4. Dishwasher 2: Faber FSID 8PR 14S (Freestanding Stainless Steel)
  DISHWASHER_FSID_8PR_14S: {
    enumKey: 'DISHWASHER_FSID_8PR_14S',
    sequenceOrder: 4,
    name: 'Faber FSID 8PR 14S Dishwasher',
    category: 'Freestanding Stainless Steel Dishwasher',
    imageUrl: 'https://faberindia.com/cdn/shop/files/WhatsApp_Image_2024-11-28_at_12.44.59_56b1d62d.jpg?v=1732799100&width=1500',
    productPageUrl: 'https://faberindia.com/collections/dishwashers',
    dimensions: '60 cm Freestanding',
    suctionPower: '14 Place Settings • 8 Wash Programs',
    finish: 'Fingerprint-Resistant Grade 304 Stainless Steel',
    controls: 'Digital LED Front Touch Panel',
    highlight: 'Freestanding Luxury Design with Intensive 70°C Wash',
    description: 'Faber FSID 8PR 14S freestanding dishwasher with 14 place capacity, hygienic 70°C sanitization for oily masala utensils, and foldable tines.',
    keyFeatures: ['14 Place Settings', 'Intensive 70°C Wash (99.9% Bacteria Elimination)', 'Freestanding Plug & Play', 'Flexible Cutlery Tray']
  },

  // Aliases for seamless voice agent detection & backwards compatibility
  CHIMNEY_HOOD_ZENITH_60: {
    enumKey: 'CHIMNEY_1',
    sequenceOrder: 1,
    name: 'Faber Curved Glass Auto-Clean Chimney',
    category: 'Auto-Clean Wall Mounted Chimney',
    imageUrl: 'https://faberindia.com/cdn/shop/products/IMG_4526-2.jpg?v=1652172625&width=1100',
    productPageUrl: 'https://faberindia.com/collections/chimneys',
    dimensions: '60 cm',
    suctionPower: '1200 m³/hr Airflow',
    finish: 'Black Curved Tempered Glass',
    controls: 'Motion Gesture & Touch Control',
    highlight: 'Thermal Auto-Clean with Metal Oil Collector',
    description: 'High-performance curved glass canopy hood featuring touch-free gesture sensor control and heat auto-clean technology.',
    keyFeatures: ['Thermal Auto-Clean', 'Motion Sensor Control', '1200 m³/hr Suction', 'Curved Glass Canopy']
  },

  CHIMNEY_HOOD_CREST_PLUS_60: {
    enumKey: 'CHIMNEY_2',
    sequenceOrder: 2,
    name: 'Faber Angular Filterless Luxury Chimney',
    category: 'Filterless Inclined Chimney',
    imageUrl: 'https://faberindia.com/cdn/shop/files/0P5A2322.jpg?v=1718706990&width=1500',
    productPageUrl: 'https://faberindia.com/collections/chimneys',
    dimensions: '60 cm',
    suctionPower: '1350 m³/hr Direct Suction',
    finish: 'Signature Obsidian Black Angular Glass',
    controls: 'Feather Touch + Wave Gesture Sensor',
    highlight: 'Next-Gen Filterless Direct Smoke Capture',
    description: 'Ergonomic inclined vertical chimney providing zero head collision risk and rapid fume capture right at the cooktop source.',
    keyFeatures: ['Filterless Technology', 'Direct Suction Chamber', 'Wave Gesture Sensor', 'High-Flux LED Lights']
  },

  DISHWASHER_1: {
    enumKey: 'DISHWASHER_FBID_8PR_14S',
    sequenceOrder: 3,
    name: 'Faber FBID 8PR 14S Dishwasher',
    category: 'Built-in Integrated Dishwasher',
    imageUrl: 'https://faberindia.com/cdn/shop/files/0P5A9911.jpg?v=1744617554&width=2000',
    productPageUrl: 'https://faberindia.com/collections/dishwashers',
    dimensions: '60 cm Standard Built-in',
    suctionPower: '14 Place Settings • 8 Wash Programs',
    finish: 'Fully Integrated Seamless Cabinet Panel',
    controls: 'Electronic Soft Touch with Digital Display',
    highlight: '14 Place Capacity with Dual Zone Wash & 3D Spray',
    description: 'Faber FBID 8PR 14S built-in dishwasher engineered for Indian cookware, featuring dual-zone spray arms and 8 smart washing cycles.',
    keyFeatures: ['14 Place Settings', '8 Wash Programs', 'Dual Zone Wash', 'A+++ Energy Efficiency']
  },

  DISHWASHER_2: {
    enumKey: 'DISHWASHER_FSID_8PR_14S',
    sequenceOrder: 4,
    name: 'Faber FSID 8PR 14S Dishwasher',
    category: 'Freestanding Stainless Steel Dishwasher',
    imageUrl: 'https://faberindia.com/cdn/shop/files/WhatsApp_Image_2024-11-28_at_12.44.59_56b1d62d.jpg?v=1732799100&width=1500',
    productPageUrl: 'https://faberindia.com/collections/dishwashers',
    dimensions: '60 cm Freestanding',
    suctionPower: '14 Place Settings • 8 Wash Programs',
    finish: 'Fingerprint-Resistant Grade 304 Stainless Steel',
    controls: 'Digital LED Front Touch Panel',
    highlight: 'Freestanding Luxury Design with Intensive 70°C Wash',
    description: 'Faber FSID 8PR 14S freestanding dishwasher with 14 place capacity, hygienic 70°C sanitization for oily masala utensils, and foldable tines.',
    keyFeatures: ['14 Place Settings', 'Intensive 70°C Wash', 'Freestanding Flexibility']
  }
};

/**
 * Fuzzy Input Resolver:
 * Takes any raw input from the LLM tool call and normalizes it to the 4 demo products.
 *
 * What it handles:
 * - Native arrays: `["chimney 1", "dishwasher 2"]`
 * - Stringified JSON arrays: `"[\"chimney 1\", \"chimney 2\"]"`
 * - Comma-delimited strings: `"dishwasher 1, chimney 2"`
 * - Colloquial voice aliases: `"FBID"`, `"FSID"`, `"curved"`, `"angular"`
 * - Empty / null inputs: Safely returns all 4 demo appliances
 *
 * @param {unknown} rawInput - Raw input from req.body or req.query
 * @returns {Array<Object>} Sorted array of matched Faber products
 */
export function resolveProductsByEnums(rawInput) {
  if (!rawInput) {
    return getAllProducts();
  }

  let candidates = [];

  // 1. Process array input
  if (Array.isArray(rawInput)) {
    candidates = rawInput.map((item) => String(item).trim());
  } else if (typeof rawInput === 'string') {
    const trimmed = rawInput.trim();

    // 2. Process stringified JSON arrays like '["chimney 1", "chimney 2"]'
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          candidates = parsed.map((item) => String(item).trim());
        }
      } catch {
        candidates = trimmed
          .replace(/[\[\]"]/g, '')
          .split(',')
          .map((s) => s.trim());
      }
    } else if (trimmed.includes(',')) {
      // 3. Process comma-delimited strings like 'chimney 1, dishwasher 2'
      candidates = trimmed.split(',').map((s) => s.trim());
    } else {
      candidates = [trimmed];
    }
  }

  const matchedMap = new Map();

  // 4. Match candidates using lowercase alphanumeric normalization
  for (const raw of candidates) {
    if (!raw) continue;
    const clean = raw.toLowerCase().replace(/[^a-z0-9]/g, '');

    let found;

    if (clean.includes('chimney1') || clean.includes('curved') || clean.includes('zenith')) {
      found = FABER_PRODUCT_CATALOG.CHIMNEY_1;
    } else if (clean.includes('chimney2') || clean.includes('angular') || clean.includes('crest')) {
      found = FABER_PRODUCT_CATALOG.CHIMNEY_2;
    } else if (clean.includes('dishwasher1') || clean.includes('fbid')) {
      found = FABER_PRODUCT_CATALOG.DISHWASHER_FBID_8PR_14S;
    } else if (clean.includes('dishwasher2') || clean.includes('fsid')) {
      found = FABER_PRODUCT_CATALOG.DISHWASHER_FSID_8PR_14S;
    } else {
      // Direct uppercase catalog key lookup
      const upper = raw.toUpperCase().replace(/\s+/g, '_');
      found = FABER_PRODUCT_CATALOG[upper];
    }

    if (found && !matchedMap.has(found.name)) {
      matchedMap.set(found.name, found);
    }
  }

  const matchedProducts = Array.from(matchedMap.values());

  // If no known product was matched, fallback safely to all 4 demo products
  if (matchedProducts.length === 0) {
    return getAllProducts();
  }

  // Sort strictly by sequenceOrder ascending (#1 Chimney 1, #2 Chimney 2, #3 Dishwasher 1, #4 Dishwasher 2)
  matchedProducts.sort((a, b) => a.sequenceOrder - b.sequenceOrder);

  return matchedProducts;
}

/**
 * Returns all 4 demo products in ascending sequence order.
 *
 * @returns {Array<Object>} The 4 Faber appliances
 */
export function getAllProducts() {
  return [
    FABER_PRODUCT_CATALOG.CHIMNEY_1,
    FABER_PRODUCT_CATALOG.CHIMNEY_2,
    FABER_PRODUCT_CATALOG.DISHWASHER_FBID_8PR_14S,
    FABER_PRODUCT_CATALOG.DISHWASHER_FSID_8PR_14S
  ];
}
