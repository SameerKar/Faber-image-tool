/**
 * Faber Product Catalog & Rich Component Engine (Pure JavaScript)
 *
 * Fully supports all 13 official Faber appliances from agent-promt-faber.md:
 * - 3 Libra BLDC Chimneys (60 cm, 75 cm, 90 cm)
 * - 10 Dishwashers (Built-in, Semi-integrated, Freestanding, Tabletop)
 *
 * Rich Components supported:
 * 1. "products"          : Luxury product cards with specs, pricing, MRP strikethrough, discount pill
 * 2. "comparison"        : Side-by-side spec comparison matrix (2-4 appliances)
 * 3. "offers"            : Filtered / sorted best discount deals showcase
 * 4. "dishwasher-loading": Step-by-step utensil loading infographic & rules
 * 5. "manual"            : Heat Auto-Clean procedure (9m heat + 1m fan) & Maintenance guide
 */

// ============================================================================
// 1. FULL 13-PRODUCT CATALOG FROM AGENT TRAINING KNOWLEDGE BASE
// ============================================================================
export const FABER_PRODUCT_CATALOG = {
  // --------------------------------------------------------------------------
  // CHIMNEYS / HOODS - LIBRA BLDC SERIES (3 Models)
  // --------------------------------------------------------------------------
  LIBRA_60: {
    id: 'libra-60',
    enumKey: 'LIBRA_60',
    sequenceOrder: 1,
    name: 'Faber Libra BLDC 60 cm',
    modelName: 'HOOD LIBRA BLDC HC SC FL BK IN 60 - C',
    sku: '325.0741.435',
    category: 'chimney',
    categoryLabel: 'Auto-Clean BLDC Chimney',
    type: 'Wall-Mounted Curved Glass Chimney',
    shape: 'Curved Glass',
    colour: 'Black',
    width: '60 cm (600 mm)',
    dimensions: '600 × 418 × 485 mm',
    cooktopMatch: 'Suited for 60 cm Cooktops (2–4 Burners)',
    price: 21330,
    mrp: 32490,
    discountPercent: 34,
    savings: 11160,
    isOffer: true,
    suctionPower: '1500 m³/hr Airflow',
    motor: '150 W BLDC Inverter Motor',
    motorWattage: '150 W',
    noiseLevel: '44–46 dB (Ultra-Quiet)',
    speedLevels: '9 Speed Settings (BLDC Inverter Control)',
    filterDesign: 'Filterless Technology (Easy Maintenance)',
    cleaningFunction: 'Heat Auto Clean (9 min heat + 1 min fan)',
    controls: 'Touch with Wave Gesture Control (9 Speeds)',
    ledLight: '1 × 1.5 W Energy-saving LED',
    finish: 'Black Curved Tempered Glass',
    installation: 'Ducted & Ductless (Recirculating)',
    ventilation: 'Ducted & Ductless (Recirculating)',
    warranty: '2 Years Comprehensive • 12 Years on Motor',
    imageUrl: 'https://faberindia.com/cdn/shop/products/IMG_4526-2.jpg?v=1652172625&width=1100',
    productPageUrl: 'https://faberindia.com/collections/chimneys',
    description: 'Compact 60 cm curved glass chimney with 1500 m³/hr suction, 150W BLDC motor, 44–46 dB ultra-quiet sound, 9 speeds, and touch & wave gesture control.',
    highlight: 'Heat Auto Clean • 44–46 dB Quiet • 12-Yr Motor Warranty',
    keyFeatures: ['1500 m³/hr Suction', '150W BLDC Motor', '44–46 dB Ultra-Quiet', '9 Speed Levels', 'Touch & Wave Gesture', '12-Year Motor Warranty']
  },

  LIBRA_75: {
    id: 'libra-75',
    enumKey: 'LIBRA_75',
    sequenceOrder: 2,
    name: 'Faber Libra BLDC 75 cm',
    modelName: 'HOOD LIBRA BLDC HC SC FL BK IN 75 - C',
    sku: '325.0741.438',
    category: 'chimney',
    categoryLabel: 'Auto-Clean BLDC Chimney',
    type: 'Wall-Mounted Curved Glass Chimney',
    shape: 'Curved Glass',
    colour: 'Black',
    width: '75 cm (750 mm)',
    dimensions: '750 × 418 × 490 mm',
    cooktopMatch: 'Suited for 75 cm Cooktops (3–4 Burners)',
    price: 23118,
    mrp: 33990,
    discountPercent: 32,
    savings: 10872,
    isOffer: true,
    suctionPower: '1500 m³/hr Airflow',
    motor: '150 W BLDC Inverter Motor',
    motorWattage: '150 W',
    noiseLevel: '44–46 dB (Ultra-Quiet)',
    speedLevels: '9 Speed Settings (BLDC Inverter Control)',
    filterDesign: 'Filterless Technology (Easy Maintenance)',
    cleaningFunction: 'Heat Auto Clean (9 min heat + 1 min fan)',
    controls: 'Touch with Wave Gesture Control (9 Speeds)',
    ledLight: '1 × 1.5 W Energy-saving LED',
    finish: 'Black Curved Tempered Glass',
    installation: 'Ducted & Ductless (Recirculating)',
    ventilation: 'Ducted & Ductless (Recirculating)',
    warranty: '2 Years Comprehensive • 12 Years on Motor',
    imageUrl: 'https://faberindia.com/cdn/shop/files/0P5A2322.jpg?v=1718706990&width=1500',
    productPageUrl: 'https://faberindia.com/collections/chimneys',
    description: 'Mid-size 75 cm curved glass hood ideal for 3-4 burner gas cooktops with 1500 m³/hr airflow, 150W BLDC motor, 44–46 dB quiet sound, and heat auto-clean.',
    highlight: '75 cm Mid-Width • 44–46 dB Quiet • 12-Yr Motor Warranty',
    keyFeatures: ['75 cm Medium Width', '1500 m³/hr Suction', '150W BLDC Motor', '44–46 dB Ultra-Quiet', '9 Speed Levels', '12-Year Motor Warranty']
  },

  LIBRA_90: {
    id: 'libra-90',
    enumKey: 'LIBRA_90',
    sequenceOrder: 3,
    name: 'Faber Libra BLDC 90 cm',
    modelName: 'HOOD LIBRA BLDC HC SC FL BK IN 90 - C',
    sku: '325.0741.440',
    category: 'chimney',
    categoryLabel: 'Auto-Clean BLDC Chimney',
    type: 'Wall-Mounted Curved Glass Chimney',
    shape: 'Curved Glass',
    colour: 'Black',
    width: '90 cm (900 mm)',
    dimensions: '900 × 418 × 490 mm',
    cooktopMatch: 'Suited for 90 cm Cooktops (3–5 Burners)',
    price: 24987,
    mrp: 35490,
    discountPercent: 30,
    savings: 10503,
    isOffer: true,
    suctionPower: '1500 m³/hr Airflow',
    motor: '150 W BLDC Inverter Motor',
    motorWattage: '150 W',
    noiseLevel: '44–46 dB (Ultra-Quiet)',
    speedLevels: '9 Speed Settings (BLDC Inverter Control)',
    filterDesign: 'Filterless Technology (Easy Maintenance)',
    cleaningFunction: 'Heat Auto Clean (9 min heat + 1 min fan)',
    controls: 'Touch with Wave Gesture Control (9 Speeds)',
    ledLight: '1 × 1.5 W Energy-saving LED',
    finish: 'Black Curved Tempered Glass',
    installation: 'Ducted & Ductless (Recirculating)',
    ventilation: 'Ducted & Ductless (Recirculating)',
    warranty: '2 Years Comprehensive • 12 Years on Motor',
    imageUrl: 'https://faberindia.com/cdn/shop/products/IMG_4526-2.jpg?v=1652172625&width=1100',
    productPageUrl: 'https://faberindia.com/collections/chimneys',
    description: 'Wide 90 cm canopy hood covering 3-5 burner cooktops with maximum smoke capture, 150W BLDC motor, 44–46 dB sound level, and 12-year motor warranty.',
    highlight: '90 cm Wide Canopy • 44–46 dB Quiet • 12-Yr Motor Warranty',
    keyFeatures: ['90 cm Wide Coverage', '1500 m³/hr Airflow', '150W BLDC Motor', '44–46 dB Ultra-Quiet', '9 Speed Levels', '12-Year Motor Warranty']
  },

  // --------------------------------------------------------------------------
  // DISHWASHERS - 14, 12, 8 PLACE SETTINGS (10 Models)
  // --------------------------------------------------------------------------
  FBID_8PR_14S: {
    id: 'fbid-8pr-14s',
    enumKey: 'FBID_8PR_14S',
    sequenceOrder: 4,
    name: 'Faber FBID 8PR 14S',
    modelName: 'FBID 8PR 14S',
    sku: '117.0534.675',
    category: 'dishwasher',
    categoryLabel: 'Built-in Integrated Dishwasher',
    type: 'Built-in Integrated',
    capacity: '14 Place Settings',
    washProgrammesCount: 8,
    programmes: '8 Programmes: Auto, Intensive, Normal, ECO, Glass, 90 Min, Rapid, Soak',
    price: 63901,
    mrp: 70990,
    discountPercent: 10,
    savings: 7089,
    isOffer: false,
    finish: 'Stainless Steel (Concealed Controls inside Door)',
    controls: 'Concealed Soft Touch & LED Display',
    washZones: 'Dual Zone Wash (Upper & Lower Zone Selection)',
    drying: 'Natural Drying + Extra Drying',
    dimensions: '815 × 598 × 600 mm',
    energyClass: 'A++ (266 kWh/yr)',
    noiseLevel: '44 dB(A)',
    warranty: '2 Years Comprehensive • 10 Years on Cavity',
    imageUrl: 'https://faberindia.com/cdn/shop/files/0P5A9911.jpg?v=1744617554&width=2000',
    productPageUrl: 'https://faberindia.com/collections/dishwashers',
    description: 'Luxury fully built-in dishwasher concealed in cabinetry with concealed door controls, 14 place settings, and Dual Zone Wash.',
    highlight: 'Fully Built-in • Dual Zone Wash • 14 Place Settings • A++',
    keyFeatures: ['Fully Built-in Seamless', '14 Place Settings', '8 Wash Programs', 'Dual Zone Wash', 'A++ Energy Efficiency']
  },

  FSID_8PR_14S: {
    id: 'fsid-8pr-14s',
    enumKey: 'FSID_8PR_14S',
    sequenceOrder: 5,
    name: 'Faber FSID 8PR 14S',
    modelName: 'FSID 8PR 14S',
    sku: '117.0534.676',
    category: 'dishwasher',
    categoryLabel: 'Semi-integrated Dishwasher',
    type: 'Semi-integrated',
    capacity: '14 Place Settings',
    washProgrammesCount: 8,
    programmes: '8 Washing Programmes',
    price: 58617,
    mrp: 65490,
    discountPercent: 10,
    savings: 6873,
    isOffer: false,
    finish: 'Stainless Steel (Visible Front Control Panel)',
    controls: 'Front-facing LED Digital Display',
    drying: 'Natural Drying',
    dimensions: '815 × 598 × 600 mm',
    powerMemory: true,
    warranty: '2 Years Comprehensive • 10 Years on Cavity',
    imageUrl: 'https://faberindia.com/cdn/shop/files/WhatsApp_Image_2024-11-28_at_12.44.59_56b1d62d.jpg?v=1732799100&width=1500',
    productPageUrl: 'https://faberindia.com/collections/dishwashers',
    description: 'Semi-integrated dishwasher fitted inside cabinetry with convenient front-facing digital control panel and 14 place capacity.',
    highlight: 'Semi-Integrated Front Display • 14 Place Settings • 8 Programs',
    keyFeatures: ['Semi-Integrated Panel', 'Front Visible Controls', '14 Place Capacity', '8 Wash Programs', 'Power Memory']
  },

  FFSD_8PR_14S: {
    id: 'ffsd-8pr-14s',
    enumKey: 'FFSD_8PR_14S',
    sequenceOrder: 6,
    name: 'Faber FFSD 8PR 14S Inox',
    modelName: 'FFSD 8PR 14S',
    sku: '117.0534.678',
    category: 'dishwasher',
    categoryLabel: 'Freestanding Dishwasher',
    type: 'Freestanding',
    capacity: '14 Place Settings',
    washProgrammesCount: 8,
    programmes: '8 Washing Programmes',
    price: 52170,
    mrp: 60490,
    discountPercent: 14,
    savings: 8320,
    isOffer: false,
    finish: 'Stainless Steel / Inox',
    controls: 'LED Display with Push Button',
    drying: 'Natural Drying',
    dimensions: '845 × 598 × 600 mm',
    warranty: '2 Years Comprehensive • 10 Years on Cavity',
    imageUrl: 'https://faberindia.com/cdn/shop/files/WhatsApp_Image_2024-11-28_at_12.44.59_56b1d62d.jpg?v=1732799100&width=1500',
    productPageUrl: 'https://faberindia.com/collections/dishwashers',
    description: 'Freestanding stainless steel dishwasher with 14 place capacity, flexible racks, and 8 programs for heavy Indian pots and pans.',
    highlight: 'Freestanding Inox • 14 Place Settings • Plug & Play',
    keyFeatures: ['Freestanding Inox Body', '14 Place Settings', '8 Wash Programs', 'Natural Drying', '10-Yr Cavity Warranty']
  },

  FFSD_8PR_14S_BK: {
    id: 'ffsd-8pr-14s-bk',
    enumKey: 'FFSD_8PR_14S_BK',
    sequenceOrder: 7,
    name: 'Faber FFSD 8PR 14S Black',
    modelName: 'FFSD 8PR 14S BK',
    sku: '117.0737.651',
    category: 'dishwasher',
    categoryLabel: 'Freestanding Dishwasher',
    type: 'Freestanding',
    capacity: '14 Place Settings',
    washProgrammesCount: 8,
    programmes: '8 Washing Programmes',
    price: 51964,
    mrp: 57990,
    discountPercent: 10,
    savings: 6026,
    isOffer: false,
    finish: 'Obsidian Black',
    controls: 'Push Button with LED Display',
    washZones: 'Dual Zone Wash',
    drying: 'Natural Drying',
    childLock: true,
    powerMemory: true,
    dimensions: '598 × 600 × 845 mm',
    warranty: '2 Years Comprehensive • 10 Years on Cavity',
    imageUrl: 'https://faberindia.com/cdn/shop/files/0P5A9911.jpg?v=1744617554&width=2000',
    productPageUrl: 'https://faberindia.com/collections/dishwashers',
    description: 'Sleek black freestanding dishwasher with 14 place capacity, Dual Zone Wash, and child lock protection for family kitchens.',
    highlight: 'Sleek Black • Dual Zone Wash • Child Lock • 14 Place Settings',
    keyFeatures: ['Obsidian Black Finish', 'Dual Zone Wash', 'Child Lock Protection', '14 Place Settings', '8 Programs']
  },

  FFSD_7PR_14S_BK: {
    id: 'ffsd-7pr-14s-bk',
    enumKey: 'FFSD_7PR_14S_BK',
    sequenceOrder: 8,
    name: 'Faber FFSD 7PR 14S Black',
    modelName: 'FFSD 7PR 14S BK',
    sku: '117.0737.644',
    category: 'dishwasher',
    categoryLabel: 'Freestanding Dishwasher',
    type: 'Freestanding',
    capacity: '14 Place Settings',
    washProgrammesCount: 7,
    programmes: '7 Washing Programmes',
    price: 30200,
    mrp: 45990,
    discountPercent: 34,
    savings: 15790,
    isOffer: true,
    finish: 'Black',
    controls: 'Push Button',
    loadFunction: 'Half Load Option',
    childLock: true,
    drying: 'Natural Drying',
    dimensions: '598 × 600 × 845 mm',
    warranty: '2 Years Comprehensive • 10 Years on Cavity',
    imageUrl: 'https://faberindia.com/cdn/shop/files/0P5A9911.jpg?v=1744617554&width=2000',
    productPageUrl: 'https://faberindia.com/collections/dishwashers',
    description: 'Best value 14-place setting black dishwasher with 7 programmes, convenient Half Load function, and ₹15,790 (34%) discount savings.',
    highlight: '★ Best Value (34% Off) • Half Load • 14 Place Settings',
    keyFeatures: ['Best Value (Save ₹15,790)', '14 Place Settings', '7 Wash Programs', 'Half Load Option', 'Child Lock']
  },

  FFSD_6PR_14S_BK_DIGITAL: {
    id: 'ffsd-6pr-14s-bk-digital',
    enumKey: 'FFSD_6PR_14S_BK_DIGITAL',
    sequenceOrder: 9,
    name: 'Faber FFSD 6PR 14S Black Digital',
    modelName: 'FFSD 6PR 14S BK Digital',
    sku: '117.0737.650',
    category: 'dishwasher',
    categoryLabel: 'Freestanding Digital Dishwasher',
    type: 'Freestanding',
    capacity: '14 Place Settings',
    washProgrammesCount: 6,
    programmes: '6 Washing Programmes',
    price: 35010,
    mrp: 48990,
    discountPercent: 29,
    savings: 13980,
    isOffer: true,
    finish: 'Black',
    controls: 'Electronic Push Button with Digital Display',
    loadFunction: 'Half Load Option',
    drying: 'Natural Drying',
    dimensions: '598 × 600 × 845 mm',
    warranty: '2 Years Comprehensive • 10 Years on Cavity',
    imageUrl: 'https://faberindia.com/cdn/shop/files/0P5A9911.jpg?v=1744617554&width=2000',
    productPageUrl: 'https://faberindia.com/collections/dishwashers',
    description: 'Black digital freestanding dishwasher with intuitive screen, 14 place capacity, and convenient Half Load mode.',
    highlight: 'Digital Screen • 29% Off • Half Load • 14 Place Settings',
    keyFeatures: ['Digital Interface Display', '14 Place Settings', 'Half Load Function', '29% Discount', '10-Yr Cavity Warranty']
  },

  FFSD_6PR_12S_NEO_INOX: {
    id: 'ffsd-6pr-12s-neo-inox',
    enumKey: 'FFSD_6PR_12S_NEO_INOX',
    sequenceOrder: 10,
    name: 'Faber FFSD 6PR 12S Neo Inox',
    modelName: 'FFSD 6PR 12S NEO INOX',
    sku: '117.0606.169',
    category: 'dishwasher',
    categoryLabel: 'Freestanding Dishwasher',
    type: 'Freestanding',
    capacity: '12 Place Settings',
    washProgrammesCount: 6,
    programmes: '6 Washing Programmes',
    price: 34250,
    mrp: 40990,
    discountPercent: 16,
    savings: 6740,
    isOffer: false,
    finish: 'Stainless Steel / Inox',
    controls: 'Electronic Push Button, LED Display',
    loadFunction: 'Half Load Option',
    powerMemory: true,
    drying: 'Natural Drying',
    dimensions: '845 × 598 × 600 mm',
    warranty: '2 Years Comprehensive • 5 Years on Cavity',
    imageUrl: 'https://faberindia.com/cdn/shop/files/WhatsApp_Image_2024-11-28_at_12.44.59_56b1d62d.jpg?v=1732799100&width=1500',
    productPageUrl: 'https://faberindia.com/collections/dishwashers',
    description: 'Medium 12-place setting dishwasher in brushed Inox, suited for nuclear families with Half Load flexibility.',
    highlight: '12 Place Medium Capacity • Stainless Steel • Half Load',
    keyFeatures: ['12 Place Settings', 'Inox Stainless Steel', 'Half Load Mode', 'Power Memory', '6 Programs']
  },

  FFSD_6PR_12S_NEO_BK: {
    id: 'ffsd-6pr-12s-neo-bk',
    enumKey: 'FFSD_6PR_12S_NEO_BK',
    sequenceOrder: 11,
    name: 'Faber FFSD 6PR 12S Neo Black',
    modelName: 'FFSD 6PR 12S NEO BK',
    sku: '117.0626.341',
    category: 'dishwasher',
    categoryLabel: 'Freestanding Dishwasher',
    type: 'Freestanding',
    capacity: '12 Place Settings',
    washProgrammesCount: 6,
    programmes: '6 Washing Programmes',
    price: 29999,
    mrp: 37490,
    discountPercent: 20,
    savings: 7491,
    isOffer: true,
    finish: 'Neo Black',
    controls: 'Electronic Push Button, LED Display',
    loadFunction: 'Half Load Option',
    powerMemory: true,
    drying: 'Natural Drying',
    dimensions: '845 × 598 × 600 mm',
    warranty: '2 Years Comprehensive • 5 Years on Cavity',
    imageUrl: 'https://faberindia.com/cdn/shop/files/0P5A9911.jpg?v=1744617554&width=2000',
    productPageUrl: 'https://faberindia.com/collections/dishwashers',
    description: 'Great value 12 place dishwasher in Neo Black under ₹30,000 (₹29,999) with 6 wash programs and half load mode.',
    highlight: 'Under ₹30,000 (₹29,999) • 12 Place Settings • Neo Black',
    keyFeatures: ['Under ₹30k (₹29,999)', '12 Place Settings', 'Neo Black Finish', 'Half Load Option', '5-Yr Cavity Warranty']
  },

  FFSD_6PR_8S_ACE_INOX: {
    id: 'ffsd-6pr-8s-ace-inox',
    enumKey: 'FFSD_6PR_8S_ACE_INOX',
    sequenceOrder: 12,
    name: 'Faber FFSD 6PR 8S Ace Inox',
    modelName: 'FFSD 6PR 8S ACE INOX',
    sku: '117.0631.594',
    category: 'dishwasher',
    categoryLabel: 'Tabletop Compact Dishwasher',
    type: 'Tabletop / Compact',
    capacity: '8 Place Settings',
    washProgrammesCount: 6,
    programmes: '6 Washing Programmes',
    price: 28150,
    mrp: 31990,
    discountPercent: 12,
    savings: 3840,
    isOffer: false,
    finish: 'Inox Finish',
    controls: 'Electronic Push Button, LED Display',
    loadFunction: 'Half Load Option',
    powerMemory: true,
    drying: 'Natural Drying',
    dimensions: '595 × 550 × 500 mm',
    cutoutDimensions: '662 × 605 × 555 mm',
    warranty: '2 Years Comprehensive • 5 Years on Cavity',
    imageUrl: 'https://faberindia.com/cdn/shop/files/WhatsApp_Image_2024-11-28_at_12.44.59_56b1d62d.jpg?v=1732799100&width=1500',
    productPageUrl: 'https://faberindia.com/collections/dishwashers',
    description: 'Compact 8-place tabletop dishwasher in Inox, designed for small kitchens and countertops with 6 wash programs.',
    highlight: 'Tabletop Compact • 8 Place Settings • Fits on Countertop',
    keyFeatures: ['Tabletop Compact Size', '8 Place Settings', 'Inox Finish', 'Half Load Option', 'Power Memory']
  },

  FFSD_6PR_8S_ACE_BLACK: {
    id: 'ffsd-6pr-8s-ace-black',
    enumKey: 'FFSD_6PR_8S_ACE_BLACK',
    sequenceOrder: 13,
    name: 'Faber FFSD 6PR 8S Ace Black',
    modelName: 'FFSD 6PR 8S ACE BLACK',
    sku: '117.0631.600',
    category: 'dishwasher',
    categoryLabel: 'Tabletop Compact Dishwasher',
    type: 'Tabletop / Compact',
    capacity: '8 Place Settings',
    washProgrammesCount: 6,
    programmes: '6 Washing Programmes',
    price: 26750,
    mrp: 30490,
    discountPercent: 12,
    savings: 3740,
    isOffer: false,
    finish: 'Black Finish',
    controls: 'Electronic Push Button, LED Display',
    loadFunction: 'Half Load Option',
    powerMemory: true,
    drying: 'Natural Drying',
    dimensions: '595 × 550 × 500 mm',
    warranty: '2 Years Comprehensive • 5 Years on Cavity',
    imageUrl: 'https://faberindia.com/cdn/shop/files/0P5A9911.jpg?v=1744617554&width=2000',
    productPageUrl: 'https://faberindia.com/collections/dishwashers',
    description: 'Most affordable Faber compact dishwasher (₹26,750) with 8 place capacity, modern black finish, and countertop placement.',
    highlight: 'Lowest Price (₹26,750) • 8 Place Compact • Black Tabletop',
    keyFeatures: ['Lowest Price Faber Dishwasher (₹26,750)', '8 Place Compact Size', 'Black Modern Finish', 'Tabletop Friendly']
  }
};

// Aliases for backwards compatibility with earlier demo prompt
FABER_PRODUCT_CATALOG.CHIMNEY_1 = FABER_PRODUCT_CATALOG.LIBRA_60;
FABER_PRODUCT_CATALOG.CHIMNEY_2 = FABER_PRODUCT_CATALOG.LIBRA_75;
FABER_PRODUCT_CATALOG.DISHWASHER_1 = FABER_PRODUCT_CATALOG.FBID_8PR_14S;
FABER_PRODUCT_CATALOG.DISHWASHER_2 = FABER_PRODUCT_CATALOG.FSID_8PR_14S;
FABER_PRODUCT_CATALOG.DISHWASHER_FBID_8PR_14S = FABER_PRODUCT_CATALOG.FBID_8PR_14S;
FABER_PRODUCT_CATALOG.DISHWASHER_FSID_8PR_14S = FABER_PRODUCT_CATALOG.FSID_8PR_14S;

// ============================================================================
// 2. PREDEFINED COMPONENT PAYLOADS
// ============================================================================

export const DISHWASHER_LOADING_GUIDE = {
  title: 'How to Load a Faber Dishwasher for Indian Cookware',
  subtitle: 'Official loading techniques for maximum cleaning performance and safety',
  imageUrl: 'https://faberindia.com/cdn/shop/files/0P5A9911.jpg?v=1744617554&width=2000',
  sections: [
    {
      rackName: 'Lower Basket (Heaviest Cookware)',
      icon: '🍳',
      items: 'Pressure cookers, Kadai, Patila, Frying pans, Large dinner plates',
      rules: [
        'Place heavy pots and kadai facing downwards at a 45° angle so water sprays inside and drains freely.',
        'Never nest/stack utensils inside one another; each vessel needs direct spray access.',
        'Position large thalis and dinner plates vertically between the foldable rack tines.'
      ]
    },
    {
      rackName: 'Upper Basket (Glasses, Cups & Katoris)',
      icon: '☕',
      items: 'Chai cups, glassware, serving bowls, steel katoris, small plates',
      rules: [
        'Tilt glasses and chai mugs upside-down at an angle to prevent water pooling on curved bottoms.',
        'Secure light plastic or steel bowls firmly between tines so water pressure does not flip them.',
        'Adjust the upper basket height if tall pots are loaded in the bottom basket.'
      ]
    },
    {
      rackName: 'Cutlery Tray / Basket',
      icon: '🍴',
      items: 'Spoons, forks, butter knives, small whisks, and peelers',
      rules: [
        'Alternate spoon handles up and down so spoons do not nest/stick together during the wash.',
        'Place knife blades pointing downwards for safe unloading.',
        'Long ladles and tongs should be laid flat on the upper basket shelf.'
      ]
    },
    {
      rackName: 'Critical Checks Before Pressing Start',
      icon: '⚠️',
      items: 'Spray arms, detergent flap, food scraping',
      rules: [
        'Spin spray arms by hand: Ensure tall spatulas or deep pots do not block either arm from rotating freely.',
        'Clear the detergent dispenser: Ensure plates do not block the tablet door from springing open.',
        'Scrape, do not pre-wash: Scrape off large bones, lemon rinds, and solid food into the dustbin.'
      ]
    }
  ]
};

export const USER_MANUAL_GUIDE = {
  title: 'Faber User Manual & Official Maintenance Guide',
  subtitle: 'Official operating procedures, gesture controls, heat auto-clean, care guidelines & troubleshooting FAQ',

  // 1. Chimney Heat Auto-Clean Protocol
  chimneyAutoClean: {
    title: 'Chimney Heat Auto-Clean Step-by-Step Procedure',
    cycleDuration: '10 Minutes Total (9 min Heating + 1 min Fan)',
    reminderHours: 'Every 30 Operating Hours / Post-Heavy Frying',
    steps: [
      { step: 1, name: 'Press Auto-Clean Button', desc: 'Touch the Auto-Clean symbol on the front glass panel or trigger the motion gesture sensor.' },
      { step: 2, name: 'Heating Phase (9 Minutes)', desc: 'Internal heating coils warm up the motor chamber to liquefy thick accumulated oil and grease deposits.' },
      { step: 3, name: 'Fan Drain Phase (1 Minute)', desc: 'The high-speed blower fan rotates to channel the liquefied grease directly into the stainless steel collector tray.' },
      { step: 4, name: 'Oil Collector Maintenance', desc: 'Slide out the bottom metal oil collector tray, empty accumulated grease, wash with warm soapy water, and replace.' }
    ],
    precautions: [
      'Clean oil collector periodically to prevent grease overflow.',
      'Always disconnect power before surface wiping or servicing.',
      'Auto-clean is an assistance feature—filterless design does not mean maintenance-free.'
    ]
  },

  // 2. Touch & Wave Gesture Control Operation (FAQ Q19-Q21)
  gestureControl: {
    title: 'Touch & Wave Gesture Control Operation',
    technology: 'Dual Optical Motion Sensors with 9 Speed Control',
    operatingDistance: '5 to 10 cm (2 to 4 inches) from front glass panel',
    instructions: [
      {
        gesture: 'Wave Left-to-Right (👋 ➡️)',
        action: 'Power ON / Step Up Speed (1 → 9)',
        desc: 'Wave your hand smoothly from left to right across the sensor to turn on at Speed 1. Repeated waves increment speed up to Speed 9 for heavy frying.'
      },
      {
        gesture: 'Wave Right-to-Left (⬅️ 👋)',
        action: 'Step Down Speed / Power OFF',
        desc: 'Wave your hand smoothly from right to left to step down the speed level. A final wave at Speed 1 powers the chimney off completely.'
      },
      {
        gesture: 'Touch Controls Backup',
        action: 'Direct Capacitive Touch',
        desc: 'Touch icons on the front panel provide instant direct access to all 9 speeds, LED lighting, and Auto-Clean mode if hands are wet or greasy.'
      }
    ],
    tips: [
      'Maintain 5–10 cm distance with steady, moderate hand movements.',
      'Keep the black glass front clean and smudge-free for optimal optical sensing.',
      'If gesture does not respond, verify sensor cleanliness and use touch buttons.'
    ]
  },

  // 3. Filterless Technology & Real-World Maintenance (FAQ Q13-Q18)
  filterlessMaintenance: {
    title: 'Filterless Technology & Real-World Maintenance',
    concept: 'Filterless Design ≠ Maintenance-Free',
    summary: 'The Libra BLDC uses a filterless design so there are no mesh or baffle filters to scrub or replace. However, periodic exterior care and oil tray cleaning are essential for peak airflow.',
    maintenanceRules: [
      {
        title: 'Exterior Glass & Body Care',
        frequency: 'Weekly or After Deep Cooking',
        action: 'Disconnect power, spray mild neutral kitchen detergent onto a soft microfiber cloth, and wipe down the curved tempered glass and body. Never use abrasive scrubbers.'
      },
      {
        title: 'Oil Collector Tray',
        frequency: 'Every 2 to 3 Weeks',
        action: 'Slide out the bottom metal collector tray, drain liquefied grease into a disposal container, rinse in warm water with dish soap, dry and reinstall.'
      },
      {
        title: 'Heat Auto-Clean Trigger',
        frequency: 'Every 30 Cooking Hours or Monthly',
        action: 'Run the dedicated 10-minute thermal heating cycle to prevent grease solidification inside the blower chamber.'
      }
    ]
  },

  // 4. Installation & Cooktop Matching Guide (FAQ Q22-Q31)
  installationGuide: {
    title: 'Installation, Ventilation & Cooktop Sizing Guide',
    ventilationModes: 'Ducted & Ductless (Recirculating) Supported',
    mountingHeight: '650 mm to 750 mm (25.5 to 29.5 inches) above gas cooktop',
    models: [
      { width: '60 cm (600 mm)', dimensions: '600 × 418 × 485 mm', cooktopMatch: '2 to 4 burner gas hobs (up to 60 cm wide cooktop)' },
      { width: '75 cm (750 mm)', dimensions: '750 × 418 × 490 mm', cooktopMatch: '3 to 4 burner gas hobs (up to 75 cm wide cooktop)' },
      { width: '90 cm (900 mm)', dimensions: '900 × 418 × 490 mm', cooktopMatch: '3 to 5 burner wide gas hobs (75 to 90 cm wide cooktop)' }
    ],
    ductedVsDuctless: [
      'Ducted: Exhausts smoke, fumes, and steam outdoors via duct pipe for maximum air-flow performance.',
      'Ductless: Uses recirculating carbon filtration to purify air and return it into the kitchen when exterior ducting is impossible.'
    ]
  },

  // 5. Official Customer Support Troubleshooting Matrix (FAQ Table Section 10)
  troubleshootingGuide: {
    title: 'Official Customer Support Troubleshooting Matrix',
    subtitle: 'Verified troubleshooting steps for Faber chimneys and kitchen appliances',
    items: [
      {
        complaint: 'Chimney is not switching on',
        firstResponse: 'Check main power switch, wall socket plug point, and electrical voltage. If responsive neither to touch nor gesture, arrange authorized Faber service inspection.'
      },
      {
        complaint: 'Suction appears weak',
        firstResponse: 'Verify selected speed level (use Speeds 6–9 for deep frying / tadka). Check for obstructions in duct pipe, outer exhaust louvers, or full oil collector tray.'
      },
      {
        complaint: 'Chimney sounds noisy / loud',
        firstResponse: 'The Libra BLDC operates at an ultra-quiet 44–46 dB. Verify sound variation across speeds. Persistent unusual noise may indicate duct pipe bends or loose mounting; call Faber service.'
      },
      {
        complaint: 'Gesture control is not responding',
        firstResponse: 'Ensure the front glass sensor is clean and dry. Wave hand at 5–10 cm distance with steady movement. Check if touch controls work normally.'
      },
      {
        complaint: 'Auto-clean is not working',
        firstResponse: 'Ensure the 10-minute cycle is initiated (9 min heating + 1 min fan). Do not run manual high-speed extraction during heating. If heating coil fails to warm, contact support.'
      },
      {
        complaint: 'Smoke is not being extracted effectively',
        firstResponse: 'Check installation height (must be 65–75 cm above burners) and verify the hood width matches the cooktop surface area.'
      },
      {
        complaint: 'Oil or residue is accumulating / dripping',
        firstResponse: 'Empty and wash the metal oil collector tray immediately. Run a 10-minute Heat Auto-Clean cycle and wipe down outer glass canopy.'
      },
      {
        complaint: 'Chimney vibrates during operation',
        firstResponse: 'Cease operation immediately if mounting appears loose or unsafe. Ensure wall brackets are tightly secured and arrange professional service.'
      }
    ]
  },

  // 6. Dishwasher Care & Maintenance
  dishwasherCare: {
    title: 'Dishwasher Care & Chemical Guide',
    points: [
      { name: 'Dishwasher Salt', desc: 'Softens hard Indian water. Refill when the salt indicator illuminates to prevent white limescale on steel.' },
      { name: 'Rinse Aid', desc: 'Accelerates spotless drying and prevents cloudy water marks on glasses and cutlery.' },
      { name: 'Triple-Stage Filter', desc: 'Unscrew cylindrical filter at the tub bottom weekly, rinse under running tap water, and lock back in place.' },
      { name: 'Detergent Type', desc: 'Use ONLY automatic dishwasher tablets, powder, or gel. Never use liquid Vim/Pril which causes overflow foaming.' }
    ]
  }
};

// ============================================================================
// 3. CATALOG QUERY & RESOLUTION HELPERS
// ============================================================================

/**
 * Returns all 13 products in canonical sequence.
 */
export function getAllProducts() {
  return [
    FABER_PRODUCT_CATALOG.LIBRA_60,
    FABER_PRODUCT_CATALOG.LIBRA_75,
    FABER_PRODUCT_CATALOG.LIBRA_90,
    FABER_PRODUCT_CATALOG.FBID_8PR_14S,
    FABER_PRODUCT_CATALOG.FSID_8PR_14S,
    FABER_PRODUCT_CATALOG.FFSD_8PR_14S,
    FABER_PRODUCT_CATALOG.FFSD_8PR_14S_BK,
    FABER_PRODUCT_CATALOG.FFSD_7PR_14S_BK,
    FABER_PRODUCT_CATALOG.FFSD_6PR_14S_BK_DIGITAL,
    FABER_PRODUCT_CATALOG.FFSD_6PR_12S_NEO_INOX,
    FABER_PRODUCT_CATALOG.FFSD_6PR_12S_NEO_BK,
    FABER_PRODUCT_CATALOG.FFSD_6PR_8S_ACE_INOX,
    FABER_PRODUCT_CATALOG.FFSD_6PR_8S_ACE_BLACK
  ];
}

/**
 * Normalizes any string to alphanumeric lowercase for safe matching.
 */
function normalizeKey(str) {
  return String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Finds a product by exact or fuzzy alias.
 */
export function findProductByQuery(query) {
  if (!query) return null;
  const raw = String(query).trim();
  const q = normalizeKey(raw);
  const all = getAllProducts();

  // 1. Direct exact match on enumKey, id, sku, name, modelName
  for (const p of all) {
    if (
      normalizeKey(p.enumKey) === q ||
      normalizeKey(p.id) === q ||
      normalizeKey(p.sku) === q ||
      normalizeKey(p.name) === q ||
      normalizeKey(p.modelName) === q
    ) {
      return p;
    }
  }

  // 2. Check if the query contains the full normalized product name or modelName (or vice versa)
  for (const p of all) {
    const normName = normalizeKey(p.name);
    const normModel = normalizeKey(p.modelName);
    if (normName.length > 5 && (q.includes(normName) || normName.includes(q))) {
      return p;
    }
    if (normModel.length > 5 && (q.includes(normModel) || normModel.includes(q))) {
      return p;
    }
  }

  // 3. Color & Finish discriminators
  const isBlack = q.includes('black') || q.includes('bk') || q.includes('kali') || q.includes('काली') || q.includes('काला');
  const isInox = q.includes('inox') || q.includes('steel') || q.includes('silver') || q.includes('स्टील');

  // Chimneys - Libra BLDC series (60, 75, 90 cm)
  if (q.includes('libra') || q.includes('chimney') || q.includes('hood') || q.includes('चिमनी')) {
    if (q.includes('60') || q.includes('60cm') || q.includes('600')) return FABER_PRODUCT_CATALOG.LIBRA_60;
    if (q.includes('75') || q.includes('75cm') || q.includes('750')) return FABER_PRODUCT_CATALOG.LIBRA_75;
    if (q.includes('90') || q.includes('90cm') || q.includes('900')) return FABER_PRODUCT_CATALOG.LIBRA_90;
  }
  if (q.includes('60') && !q.includes('600') && !q.includes('14s') && !q.includes('12s')) return FABER_PRODUCT_CATALOG.LIBRA_60;
  if (q.includes('75')) return FABER_PRODUCT_CATALOG.LIBRA_75;
  if (q.includes('90') && !q.includes('90min') && !q.includes('90m')) return FABER_PRODUCT_CATALOG.LIBRA_90;
  if (q.includes('chimney1')) return FABER_PRODUCT_CATALOG.LIBRA_60;
  if (q.includes('chimney2')) return FABER_PRODUCT_CATALOG.LIBRA_75;
  if (q.includes('chimney3')) return FABER_PRODUCT_CATALOG.LIBRA_90;

  // Dishwashers - Built-in & Semi-Integrated
  if (q.includes('fbid') || (q.includes('builtin') && !q.includes('semi')) || q.includes('dishwasher1')) {
    return FABER_PRODUCT_CATALOG.FBID_8PR_14S;
  }
  if (q.includes('fsid') || q.includes('semi') || q.includes('dishwasher2')) {
    return FABER_PRODUCT_CATALOG.FSID_8PR_14S;
  }

  // Dishwashers - 8 Place Settings (Ace Tabletop)
  if (q.includes('8s') || q.includes('8place') || q.includes('ace') || q.includes('tabletop') || q.includes('countertop')) {
    if (isBlack) return FABER_PRODUCT_CATALOG.FFSD_6PR_8S_ACE_BLACK;
    return FABER_PRODUCT_CATALOG.FFSD_6PR_8S_ACE_INOX;
  }

  // Dishwashers - 12 Place Settings (Neo)
  if (q.includes('12s') || q.includes('12place') || q.includes('neo')) {
    if (isBlack) return FABER_PRODUCT_CATALOG.FFSD_6PR_12S_NEO_BK;
    return FABER_PRODUCT_CATALOG.FFSD_6PR_12S_NEO_INOX;
  }

  // Dishwashers - 14 Place Settings (Digital, 7PR, 8PR)
  if (q.includes('digital') || (q.includes('6pr') && q.includes('14s'))) {
    return FABER_PRODUCT_CATALOG.FFSD_6PR_14S_BK_DIGITAL;
  }
  if (q.includes('7pr') || q.includes('7programme') || q.includes('7program')) {
    return FABER_PRODUCT_CATALOG.FFSD_7PR_14S_BK;
  }
  if (q.includes('8pr') || q.includes('8programme') || q.includes('8program')) {
    if (isBlack) return FABER_PRODUCT_CATALOG.FFSD_8PR_14S_BK;
    return FABER_PRODUCT_CATALOG.FFSD_8PR_14S;
  }

  // 4. Substring match
  for (const p of all) {
    if (normalizeKey(p.name).includes(q) || normalizeKey(p.modelName).includes(q)) {
      return p;
    }
  }

  return null;
}

// ============================================================================
// 4. SMART MULTI-FEATURE TOOL DISPATCHER
// ============================================================================

/**
 * Resolves any incoming tool call payload into a rich component response:
 * Handles:
 * - action: "filter_by_price" (e.g. chimneys under 25000, dishwashers under 30000)
 * - action: "show_offers" / "offers"
 * - action: "dishwasher_loading" / "how to load dishwasher"
 * - action: "show_manual" / "heat auto clean"
 * - action: "compare_products" / "comparison"
 * - action: "show_products" / single or multiple products
 *
 * Resilient: If the agent provides raw voice strings like "chimneys under 25000" in `product`,
 * the resolver automatically detects the intent!
 */
export function resolveToolRequest(rawBody = {}, rawQuery = {}) {
  const merged = { ...rawQuery, ...rawBody };
  const allProducts = getAllProducts();

  // Normalize multi-variable inputs
  let action = String(merged.action || '').trim().toLowerCase();
  let category = String(merged.category || '').trim().toLowerCase();
  let maxPrice = Number(merged.max_price || merged.maxPrice || merged.budget || 0);

  // Extract raw text query from any potential field (or combination)
  const rawText = String(
    merged.query ||
    merged.product ||
    merged.products ||
    merged.product_name ||
    ''
  ).trim();

  const lowerText = rawText.toLowerCase();

  // --------------------------------------------------------------------------
  // Normalize Category & Detect Combined Categories
  // --------------------------------------------------------------------------
  if (
    category === 'both' ||
    category === 'chimney_and_dishwasher' ||
    (lowerText.includes('chimney') && (lowerText.includes('dish') || lowerText.includes('dishwasher'))) ||
    (lowerText.includes('चिमनी') && (lowerText.includes('डिशवॉशर') || lowerText.includes('dish')))
  ) {
    category = 'both';
  } else if (!category || category === 'all') {
    if (lowerText.includes('chimney') || lowerText.includes('hood') || lowerText.includes('चिमनी')) {
      category = 'chimney';
    } else if (lowerText.includes('dish') || lowerText.includes('bartan') || lowerText.includes('डिशवॉशर')) {
      category = 'dishwasher';
    }
  }

  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // Auto-Detect Intent from Action & Natural Voice Query
  // --------------------------------------------------------------------------
  if (
    action === 'installation' ||
    action === 'chimney_installation' ||
    action === 'install' ||
    lowerText.includes('install') ||
    lowerText.includes('installation') ||
    lowerText.includes('mount') ||
    lowerText.includes('mounting') ||
    lowerText.includes('फिटिंग') ||
    lowerText.includes('इनस्टॉल') ||
    ((action === 'loading_guide' || action === 'load') && (category === 'chimney' || lowerText.includes('chimney') || lowerText.includes('चिमनी')))
  ) {
    action = 'chimney_installation';
  } else if (
    action === 'chimney_cleaning' ||
    action === 'chimney_clean' ||
    action === 'auto_clean' ||
    action === 'autoclean' ||
    action === 'heat_auto_clean' ||
    action === 'heat_clean' ||
    ((action === 'cleaning' || action === 'clean' || action === 'maintenance') && (category === 'chimney' || !category || category === 'all')) ||
    lowerText.includes('auto clean') ||
    lowerText.includes('autoclean') ||
    lowerText.includes('heat clean') ||
    lowerText.includes('thermal heat') ||
    lowerText.includes('oil collector') ||
    (lowerText.includes('chimney') && (lowerText.includes('clean') || lowerText.includes('maintenance') || lowerText.includes('servicing') || lowerText.includes('साफ') || lowerText.includes('सर्विस'))) ||
    lowerText.includes('clean chimney') ||
    lowerText.includes('cleaning of the chimney') ||
    lowerText.includes('चिमनी साफ')
  ) {
    action = 'chimney_cleaning';
  } else if (
    action === 'dishwasher_cleaning' ||
    action === 'dishwasher_clean' ||
    action === 'dishwasher_maintenance' ||
    action === 'dishwasher_care' ||
    ((action === 'cleaning' || action === 'clean' || action === 'maintenance') && category === 'dishwasher') ||
    (lowerText.includes('dish') && (lowerText.includes('clean') || lowerText.includes('salt') || lowerText.includes('rinse aid') || lowerText.includes('descale') || lowerText.includes('descaling') || lowerText.includes('filter') || lowerText.includes('maintenance') || lowerText.includes('care') || lowerText.includes('साफ'))) ||
    lowerText.includes('cleaning of the dishwasher') ||
    lowerText.includes('clean dishwasher') ||
    lowerText.includes('डिशवॉशर साफ')
  ) {
    action = 'dishwasher_cleaning';
  } else if (
    action === 'dishwasher_usp' ||
    action === 'dishwasher_usps' ||
    action === 'dishwasher_features' ||
    action === 'usp' ||
    action === 'usps' ||
    lowerText.includes('usp') ||
    lowerText.includes('usps') ||
    lowerText.includes('unique selling') ||
    lowerText.includes('selling point') ||
    lowerText.includes('spray arm') ||
    lowerText.includes('dual zone') ||
    lowerText.includes('70c') ||
    lowerText.includes('70°c') ||
    lowerText.includes('70 degree') ||
    lowerText.includes('sanitization') ||
    lowerText.includes('hygiene wash') ||
    lowerText.includes('14 place') ||
    (lowerText.includes('dish') && (lowerText.includes('feature') || lowerText.includes('features') || lowerText.includes('खासियत'))) ||
    lowerText.includes('डिशवॉशर की खासियत')
  ) {
    action = 'dishwasher_usp';
  } else if (
    action === 'bldc_motor' ||
    action === 'bldc' ||
    action === 'motor' ||
    lowerText.includes('bldc') ||
    lowerText.includes('motor warranty') ||
    lowerText.includes('12 year motor') ||
    lowerText.includes('inverter motor') ||
    lowerText.includes('quiet motor') ||
    lowerText.includes('150w') ||
    lowerText.includes('150 watt') ||
    lowerText.includes('मोटर')
  ) {
    action = 'bldc_motor';
  } else if (
    action === 'chimney_controls' ||
    action === 'gesture_control' ||
    action === 'gesture' ||
    action === 'controls' ||
    lowerText.includes('gesture') ||
    lowerText.includes('wave') ||
    lowerText.includes('touch panel') ||
    lowerText.includes('touch control') ||
    lowerText.includes('sensor control') ||
    lowerText.includes('9 speed') ||
    lowerText.includes('जेस्चर')
  ) {
    action = 'chimney_controls';
  } else if (
    action === 'dishwasher_loading' ||
    action === 'loading_guide' ||
    action === 'load' ||
    lowerText.includes('how to load') ||
    lowerText.includes('loading guide') ||
    lowerText.includes('rack loading') ||
    (lowerText.includes('dish') && lowerText.includes('load')) ||
    (lowerText.includes('load') && !lowerText.includes('chimney') && !lowerText.includes('चिमनी')) ||
    lowerText.includes('bartan') ||
    lowerText.includes('utensil')
  ) {
    action = 'dishwasher_loading';
  } else if (
    action === 'show_offers' ||
    action === 'offers' ||
    action === 'discounts' ||
    action === 'deals' ||
    lowerText.includes('offer') ||
    lowerText.includes('discount') ||
    lowerText.includes('deal') ||
    lowerText.includes('best price') ||
    lowerText.includes('savings') ||
    lowerText.includes('ऑफर')
  ) {
    action = 'show_offers';
  } else if (
    action === 'compare_products' ||
    action === 'compare' ||
    action === 'comparison' ||
    category === 'both' ||
    lowerText.includes('compare') ||
    lowerText.includes('difference') ||
    lowerText.includes('vs') ||
    lowerText.includes('comparison') ||
    lowerText.includes('डिफरेंस') ||
    lowerText.includes('तुलना')
  ) {
    action = 'compare_products';
  } else if (
    action === 'filter_by_price' ||
    lowerText.includes('under') ||
    lowerText.includes('below') ||
    lowerText.includes('less than') ||
    lowerText.includes('budget') ||
    lowerText.includes('अंडर') ||
    maxPrice > 0 ||
    /\d{4,6}/.test(lowerText)
  ) {
    if (!maxPrice) {
      const match = lowerText.match(/(\d{4,6})/);
      if (match) maxPrice = Number(match[1]);
    }
    action = 'filter_by_price';
  } else if (
    lowerText.includes('manual') ||
    lowerText.includes('troubleshoot') ||
    lowerText.includes('troubleshooting') ||
    lowerText.includes('filterless') ||
    lowerText.includes('noisy') ||
    lowerText.includes('weak suction')
  ) {
    action = 'show_manual';
  }

  // --------------------------------------------------------------------------
  // Component 1: Chimney Installation Guide (Top Priority Guide)
  // --------------------------------------------------------------------------
  if (
    action === 'chimney_installation' ||
    action === 'installation' ||
    ((action === 'loading_guide' || action === 'guide') && (category === 'chimney' || lowerText.includes('chimney') || lowerText.includes('चिमनी'))) ||
    lowerText.includes('install') ||
    lowerText.includes('installation') ||
    lowerText.includes('mount')
  ) {
    return {
      componentType: 'chimney-installation',
      title: 'Faber Chimney Installation Guide',
      subtitle: 'BLDC Autoclean Cooker Hood Step-by-Step Installation Manual',
      products: [FABER_PRODUCT_CATALOG.LIBRA_60, FABER_PRODUCT_CATALOG.LIBRA_90],
      images: [
        {
          name: 'Chimney Installation Blueprint',
          title: '4-Step Wall Mount & Duct Installation',
          imageUrl: 'images/chimney_installation_hero.jpg',
          description: 'Step 1 Prepare Wall, Step 2 Fix Bracket, Step 3 Mount Chimney, Step 4 Connect & Test'
        }
      ]
    };
  }

  // --------------------------------------------------------------------------
  // Component 2: Dishwasher Loading Guide (Only for Dishwashers)
  // --------------------------------------------------------------------------
  if (action === 'dishwasher_loading' || action === 'loading_guide' || action === 'load') {
    if (category === 'chimney' || lowerText.includes('chimney') || lowerText.includes('चिमनी')) {
      return {
        componentType: 'chimney-installation',
        title: 'Faber Chimney Installation Guide',
        subtitle: 'BLDC Autoclean Cooker Hood Step-by-Step Installation Manual',
        products: [FABER_PRODUCT_CATALOG.LIBRA_60, FABER_PRODUCT_CATALOG.LIBRA_90],
        images: [
          {
            name: 'Chimney Installation Blueprint',
            title: '4-Step Wall Mount & Duct Installation',
            imageUrl: 'images/chimney_installation_hero.jpg',
            description: 'Step 1 Prepare Wall, Step 2 Fix Bracket, Step 3 Mount Chimney, Step 4 Connect & Test'
          }
        ]
      };
    }
    return {
      componentType: 'dishwasher-loading',
      title: 'How to Load a Faber Dishwasher',
      subtitle: 'Proper utensil arrangement for optimal cleaning and drainage',
      guideData: DISHWASHER_LOADING_GUIDE,
      products: [FABER_PRODUCT_CATALOG.FBID_8PR_14S, FABER_PRODUCT_CATALOG.FSID_8PR_14S],
      images: [
        {
          name: 'Dishwasher Loading Diagram',
          title: 'Faber Dishwasher Loading Architecture',
          imageUrl: DISHWASHER_LOADING_GUIDE.imageUrl,
          description: 'Upper basket for cups/glasses, lower basket for kadai/plates.'
        }
      ]
    };
  }

  // --------------------------------------------------------------------------
  // Component 3: User Manual / Auto-Clean Guide
  // --------------------------------------------------------------------------
  if (action === 'show_manual' || action === 'manual' || action === 'auto_clean' || action === 'troubleshooting') {
    return {
      componentType: 'manual',
      title: 'Faber User Manual & Official Maintenance Guide',
      subtitle: 'Heat auto-clean, wave gesture control, filterless care & troubleshooting matrix',
      manualData: USER_MANUAL_GUIDE,
      products: [FABER_PRODUCT_CATALOG.LIBRA_60, FABER_PRODUCT_CATALOG.FBID_8PR_14S],
      images: [
        {
          name: 'Chimney Auto-Clean Procedure',
          title: '9-Min Heating + 1-Min Fan Oil Collector Guide',
          imageUrl: FABER_PRODUCT_CATALOG.LIBRA_60.imageUrl,
          description: 'Thermal heat auto-clean separates oil into the stainless steel collector.'
        }
      ]
    };
  }

  // --------------------------------------------------------------------------
  // Component 2b: Chimney Cleaning & Servicing Guide
  // --------------------------------------------------------------------------
  if (action === 'chimney_cleaning') {
    return {
      componentType: 'chimney-cleaning',
      title: 'Cleaning & Maintenance of the Chimney',
      subtitle: 'Heat Auto-Clean & Stainless Steel Oil Collector Maintenance',
      products: [FABER_PRODUCT_CATALOG.LIBRA_60, FABER_PRODUCT_CATALOG.LIBRA_75, FABER_PRODUCT_CATALOG.LIBRA_90],
      images: [
        {
          name: 'Chimney Heat Auto-Clean Guide',
          title: '9-Min Thermal Heat + 1-Min Blower Flush',
          imageUrl: 'images/clean_hero_diag.jpg',
          description: 'Step 1 Surface Care, Step 2 9-Min Thermal Melting, Step 3 1-Min Centrifuge Flush, Step 4 Empty Stainless Oil Collector.'
        }
      ]
    };
  }

  // --------------------------------------------------------------------------
  // Component 2c: Dishwasher Maintenance & Cleaning Guide
  // --------------------------------------------------------------------------
  if (action === 'dishwasher_cleaning' || action === 'dishwasher_maintenance') {
    return {
      componentType: 'dishwasher-cleaning',
      title: 'Dishwasher Maintenance & Chemical Care',
      subtitle: 'Salt softener, rinse aid dispenser, 3-stage mesh filter & monthly descaling',
      products: [FABER_PRODUCT_CATALOG.FFSD_6PR_12S_NEO_BK, FABER_PRODUCT_CATALOG.FBID_8PR_14S],
      images: [
        {
          name: 'Dishwasher Care Guide',
          title: 'Essential Hygiene & Filter Maintenance',
          imageUrl: FABER_PRODUCT_CATALOG.FFSD_6PR_12S_NEO_BK.imageUrl,
          description: 'Add salt to prevent white limescale, refill rinse aid for streak-free drying, rinse 3-stage mesh filter weekly.'
        }
      ]
    };
  }

  // --------------------------------------------------------------------------
  // Component 2d: Dishwasher Unique Selling Points & Features
  // --------------------------------------------------------------------------
  if (action === 'dishwasher_usp' || action === 'dishwasher_features') {
    return {
      componentType: 'dishwasher-usp',
      title: 'Unique Selling Points of the Dishwasher',
      subtitle: 'Engineered for Heavy Indian Cooking, Burnt Kadai & 14-Place Hygiene',
      products: [FABER_PRODUCT_CATALOG.FBID_8PR_14S, FABER_PRODUCT_CATALOG.FSID_8PR_14S, FABER_PRODUCT_CATALOG.FFSD_7PR_14S_BK],
      images: [
        {
          name: 'Dishwasher Signature USPs',
          title: 'Faber 3D Hydro-Clean & 70°C Sanitization',
          imageUrl: 'images/dw_usp_hero.jpg',
          description: 'USP 1 3D Triple Spray Arms, USP 2 Dual Zone Wash, USP 3 70°C Intensive Hygiene, USP 4 14-Place Indian Cookware Capacity.'
        }
      ]
    };
  }

  // --------------------------------------------------------------------------
  // Component 2e: BLDC Inverter Motor Spotlight
  // --------------------------------------------------------------------------
  if (action === 'bldc_motor') {
    return {
      componentType: 'bldc-motor',
      title: 'Faber Inverter BLDC Motor Technology',
      subtitle: '50% energy savings, ultra-quiet 44–46 dB operation & 12-year warranty',
      products: [FABER_PRODUCT_CATALOG.LIBRA_60, FABER_PRODUCT_CATALOG.LIBRA_75, FABER_PRODUCT_CATALOG.LIBRA_90],
      images: [
        {
          name: 'Inverter BLDC Motor',
          title: 'Brushless DC Inverter Motor Architecture',
          imageUrl: FABER_PRODUCT_CATALOG.LIBRA_60.imageUrl,
          description: 'Consumes only 150W, runs whisper-quiet at 44-46 dB, and backed by an industry-leading 12-year warranty.'
        }
      ]
    };
  }

  // --------------------------------------------------------------------------
  // Component 2f: Chimney Controls & Wave Gesture
  // --------------------------------------------------------------------------
  if (action === 'chimney_controls' || action === 'gesture_control') {
    return {
      componentType: 'chimney-controls',
      title: 'Touch & Wave Gesture Control System',
      subtitle: 'Hands-free wave sensor navigation & 9-speed touch control interface',
      products: [FABER_PRODUCT_CATALOG.LIBRA_90],
      images: [
        {
          name: 'Gesture Controls',
          title: 'Touch & Wave Motion Sensor Guide',
          imageUrl: FABER_PRODUCT_CATALOG.LIBRA_90.imageUrl,
          description: 'Wave left-to-right to turn on and increase speed. Wave right-to-left to decrease speed and power down.'
        }
      ]
    };
  }

  // --------------------------------------------------------------------------
  // Component 3: Offers & Promotional Deals
  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // Component 3: Offers & Promotional Deals (with smart comparison redirect)
  // --------------------------------------------------------------------------
  if (action === 'show_offers' || action === 'offers' || action === 'discounts') {
    const wantsCompare = lowerText.includes('compare') || lowerText.includes('कंपेयर') || lowerText.includes('तुलना') || lowerText.includes('vs') || merged.compare === true || merged.compare === 'true';

    // If the customer says "जो जो ऑफर में हैं उनको कंपेयर कर दीजिए", route to comparison of offer models!
    if (wantsCompare) {
      let offerCandidates = [];
      if (category === 'chimney') {
        offerCandidates = [FABER_PRODUCT_CATALOG.LIBRA_60, FABER_PRODUCT_CATALOG.LIBRA_75, FABER_PRODUCT_CATALOG.LIBRA_90];
      } else if (category === 'dishwasher') {
        offerCandidates = [FABER_PRODUCT_CATALOG.FFSD_7PR_14S_BK, FABER_PRODUCT_CATALOG.FFSD_6PR_14S_BK_DIGITAL, FABER_PRODUCT_CATALOG.FFSD_6PR_12S_NEO_BK];
      } else {
        offerCandidates = [FABER_PRODUCT_CATALOG.LIBRA_60, FABER_PRODUCT_CATALOG.LIBRA_75, FABER_PRODUCT_CATALOG.FFSD_7PR_14S_BK, FABER_PRODUCT_CATALOG.FFSD_6PR_12S_NEO_BK];
      }

      if (maxPrice > 0) {
        offerCandidates = offerCandidates.filter((p) => p.price <= maxPrice);
      }

      const catTitle = category === 'chimney' ? 'Faber Chimney Offers Comparison' : category === 'dishwasher' ? 'Faber Dishwasher Offers Comparison' : 'Faber Special Offers Comparison';

      return {
        componentType: 'comparison',
        title: catTitle,
        subtitle: `Comparing ${offerCandidates.length} models with recorded promotional discounts up to 34% off`,
        products: offerCandidates,
        images: offerCandidates.map((p) => ({
          name: p.name,
          title: p.name,
          imageUrl: p.imageUrl,
          description: `Price: ₹${p.price.toLocaleString('en-IN')} (Save ₹${p.savings.toLocaleString('en-IN')})`
        }))
      };
    }

    let offerProducts = allProducts.filter((p) => p.isOffer);

    // Filter by category if strictly specified (and not 'both')
    if (category === 'chimney') {
      offerProducts = offerProducts.filter((p) => p.category === 'chimney');
    } else if (category === 'dishwasher') {
      offerProducts = offerProducts.filter((p) => p.category === 'dishwasher');
    }

    // Filter by maxPrice if specified
    if (maxPrice > 0) {
      const budgetOffers = offerProducts.filter((p) => p.price <= maxPrice);
      if (budgetOffers.length > 0) {
        offerProducts = budgetOffers;
      } else {
        const anyBudget = allProducts.filter((p) => (category && category !== 'both' ? p.category === category : true) && p.price <= maxPrice);
        if (anyBudget.length > 0) offerProducts = anyBudget;
      }
    }

    // Sort by largest savings amount descending
    offerProducts.sort((a, b) => b.savings - a.savings);

    const catLabel = category === 'chimney' ? 'Chimney' : category === 'dishwasher' ? 'Dishwasher' : category === 'both' ? 'Chimney & Dishwasher' : 'Appliance';
    const priceLabel = maxPrice > 0 ? ` under ₹${maxPrice.toLocaleString('en-IN')}` : '';

    return {
      componentType: 'offers',
      title: `Faber Special ${catLabel} Offers${priceLabel}`,
      subtitle: `Showing ${offerProducts.length} model${offerProducts.length === 1 ? '' : 's'} with special recorded discounts up to 34% off`,
      products: offerProducts,
      images: offerProducts.map((p) => ({
        name: p.name,
        title: `${p.name} (Save ₹${p.savings.toLocaleString('en-IN')})`,
        imageUrl: p.imageUrl,
        description: `Price: ₹${p.price.toLocaleString('en-IN')} (MRP: ₹${p.mrp.toLocaleString('en-IN')} • ${p.discountPercent}% off)`
      }))
    };
  }

  // --------------------------------------------------------------------------
  // Component 4: Price Filter Search & Multi-Condition Filter
  // --------------------------------------------------------------------------
  if (action === 'filter_by_price' || action === 'filter_price' || maxPrice > 0) {
    let filtered = allProducts;

    // 1. Category Condition
    if (category === 'chimney') {
      filtered = filtered.filter((p) => p.category === 'chimney');
    } else if (category === 'dishwasher') {
      filtered = filtered.filter((p) => p.category === 'dishwasher');
    }
    // Note: If category === 'both', we keep products from BOTH categories!

    // 2. Offer / Sale Condition
    const wantsOffers = lowerText.includes('offer') || lowerText.includes('discount') || lowerText.includes('deal') || lowerText.includes('ऑफर') || lowerText.includes('सेल') || merged.isOffer === true || merged.isOffer === 'true' || merged.is_offer === true || merged.is_offer === 'true';
    if (wantsOffers) {
      filtered = filtered.filter((p) => p.isOffer);
    }

    // 3. Filterless Condition
    const wantsFilterless = lowerText.includes('filterless') || lowerText.includes('फिल्टरलेस') || merged.filter === 'filterless' || merged.filterless === true || merged.filterless === 'true';
    if (wantsFilterless) {
      filtered = filtered.filter((p) => (p.filterDesign && p.filterDesign.toLowerCase().includes('filterless')));
    }

    // 4. Max Price Budget Condition
    if (maxPrice > 0) {
      filtered = filtered.filter((p) => p.price <= maxPrice);
    }

    filtered.sort((a, b) => a.price - b.price);

    const catLabel = category === 'chimney' ? 'Chimneys' : category === 'dishwasher' ? 'Dishwashers' : category === 'both' ? 'Chimneys & Dishwashers' : 'Appliances';

    // Graceful handling when no models match budget
    if (filtered.length === 0 && maxPrice > 0) {
      const closest = allProducts.filter((p) => (category && category !== 'both' ? p.category === category : true)).sort((a, b) => a.price - b.price);
      const startingPrice = closest.length > 0 ? closest[0].price : 21990;
      const suggestions = closest.slice(0, 2);

      return {
        componentType: 'products',
        title: `Faber ${catLabel} Budget Options`,
        subtitle: `No ${catLabel.toLowerCase()} found under ₹${maxPrice.toLocaleString('en-IN')}. Faber BLDC models start from ₹${startingPrice.toLocaleString('en-IN')}:`,
        products: suggestions,
        images: suggestions.map((p) => ({
          name: p.name,
          title: `${p.name} — Starting at ₹${p.price.toLocaleString('en-IN')}`,
          imageUrl: p.imageUrl,
          description: p.description
        }))
      };
    }

    const limitLabel = maxPrice > 0 ? `under ₹${maxPrice.toLocaleString('en-IN')}` : 'by Price';

    // Count breakdown for combined categories
    let countSummary = `Found ${filtered.length} model${filtered.length === 1 ? '' : 's'} matching budget`;
    if (category === 'both') {
      const chimCount = filtered.filter((p) => p.category === 'chimney').length;
      const dishCount = filtered.filter((p) => p.category === 'dishwasher').length;
      countSummary = `Found ${filtered.length} models (${chimCount} chimney${chimCount === 1 ? '' : 's'}, ${dishCount} dishwasher${dishCount === 1 ? '' : 's'}) under ₹${maxPrice.toLocaleString('en-IN')}`;
    }

    return {
      componentType: 'products',
      title: `Faber ${catLabel} ${limitLabel}`,
      subtitle: countSummary,
      products: filtered,
      images: filtered.map((p) => ({
        name: p.name,
        title: `${p.name} — ₹${p.price.toLocaleString('en-IN')}`,
        imageUrl: p.imageUrl,
        description: p.description
      }))
    };
  }

  // --------------------------------------------------------------------------
  // Component 5: Side-by-Side Comparison
  // --------------------------------------------------------------------------
  if (action === 'compare_products' || action === 'compare' || action === 'comparison') {
    let candidateList = [];

    // Parse products list FIRST (supports array, comma-separated, "and", "vs", "aur")
    let rawList = merged.products || merged.product_enums || merged.product;
    if (typeof rawList === 'string') {
      try {
        const parsed = JSON.parse(rawList);
        if (Array.isArray(parsed)) rawList = parsed;
        else rawList = rawList.split(/,| and | aur | vs | vs\. | \/ /i).map((s) => s.trim()).filter(Boolean);
      } catch {
        rawList = rawList.split(/,| and | aur | vs | vs\. | \/ /i).map((s) => s.trim()).filter(Boolean);
      }
    }

    if (Array.isArray(rawList)) {
      for (const item of rawList) {
        const lowerItem = item.toLowerCase();
        if (lowerItem === 'chimney' || lowerItem === 'चिमनी') {
          if (!candidateList.some((p) => p.category === 'chimney')) candidateList.push(FABER_PRODUCT_CATALOG.LIBRA_60);
          continue;
        }
        if (lowerItem === 'dishwasher' || lowerItem === 'डिशवॉशर') {
          if (!candidateList.some((p) => p.category === 'dishwasher')) candidateList.push(FABER_PRODUCT_CATALOG.FBID_8PR_14S);
          continue;
        }

        const matched = findProductByQuery(item);
        if (matched && !candidateList.some((p) => p.id === matched.id)) {
          candidateList.push(matched);
        }
      }
    }

    // Only apply intelligent fallbacks if user did NOT provide at least 2 exact products
    if (candidateList.length < 2) {
      const wantsOffers = lowerText.includes('offer') || lowerText.includes('discount') || lowerText.includes('deal') || lowerText.includes('ऑफर') || lowerText.includes('सेल') || merged.isOffer;
      const isThreeChimneys = lowerText.includes('तीनों चिमनी') || lowerText.includes('3 chimney') || lowerText.includes('all chimney') || lowerText.includes('teen chimney');

      if (isThreeChimneys || (category === 'chimney' && wantsOffers)) {
        candidateList = [FABER_PRODUCT_CATALOG.LIBRA_60, FABER_PRODUCT_CATALOG.LIBRA_75, FABER_PRODUCT_CATALOG.LIBRA_90];
      } else if (category === 'dishwasher' && wantsOffers) {
        candidateList = [FABER_PRODUCT_CATALOG.FFSD_7PR_14S_BK, FABER_PRODUCT_CATALOG.FFSD_6PR_14S_BK_DIGITAL, FABER_PRODUCT_CATALOG.FFSD_6PR_12S_NEO_BK];
      } else if (maxPrice > 0) {
        let budgetPool = allProducts.filter((p) => p.price <= maxPrice);
        if (category === 'chimney') budgetPool = budgetPool.filter((p) => p.category === 'chimney');
        else if (category === 'dishwasher') budgetPool = budgetPool.filter((p) => p.category === 'dishwasher');
        if (budgetPool.length >= 2) candidateList = budgetPool.slice(0, 4);
      } else if (candidateList.length === 1) {
        const single = candidateList[0];
        if (single.category === 'chimney') {
          const sibling = single.id === 'libra-60' ? FABER_PRODUCT_CATALOG.LIBRA_90 : FABER_PRODUCT_CATALOG.LIBRA_60;
          candidateList.push(sibling);
        } else {
          const sibling = single.id === 'fbid-8pr-14s' ? FABER_PRODUCT_CATALOG.FSID_8PR_14S : FABER_PRODUCT_CATALOG.FBID_8PR_14S;
          candidateList.push(sibling);
        }
      } else if (category === 'both') {
        candidateList = [FABER_PRODUCT_CATALOG.LIBRA_60, FABER_PRODUCT_CATALOG.FBID_8PR_14S];
      } else if (category === 'chimney') {
        candidateList = [FABER_PRODUCT_CATALOG.LIBRA_60, FABER_PRODUCT_CATALOG.LIBRA_75, FABER_PRODUCT_CATALOG.LIBRA_90];
      } else {
        candidateList = [FABER_PRODUCT_CATALOG.FBID_8PR_14S, FABER_PRODUCT_CATALOG.FSID_8PR_14S];
      }
    }

    const titleText = candidateList.length === 2
      ? `${candidateList[0].name} vs ${candidateList[1].name}`
      : `Appliance Comparison (${candidateList.length} Models)`;

    return {
      componentType: 'comparison',
      title: titleText,
      subtitle: candidateList.map((p) => p.name).join(' vs '),
      products: candidateList,
      images: candidateList.map((p) => ({
        name: p.name,
        title: p.name,
        imageUrl: p.imageUrl,
        description: `Price: ₹${p.price.toLocaleString('en-IN')} • ${p.category}`
      }))
    };
  }

  // --------------------------------------------------------------------------
  // Component 6: Standard Product Display (1, 2, 3, or more products)
  // --------------------------------------------------------------------------
  let itemsToDisplay = [];
  let rawList = merged.products || merged.product_enums || merged.product || merged.product_name;

  if (typeof rawList === 'string') {
    try {
      const parsed = JSON.parse(rawList);
      if (Array.isArray(parsed)) rawList = parsed;
      else rawList = rawList.split(/,| and | aur | vs | \/ /i).map((s) => s.trim()).filter(Boolean);
    } catch {
      rawList = rawList.split(/,| and | aur | vs | \/ /i).map((s) => s.trim()).filter(Boolean);
    }
  }

  if (Array.isArray(rawList)) {
    for (const item of rawList) {
      const matched = findProductByQuery(item);
      if (matched && !itemsToDisplay.some((p) => p.id === matched.id)) {
        itemsToDisplay.push(matched);
      }
    }
  } else if (rawList) {
    const matched = findProductByQuery(rawList);
    if (matched) itemsToDisplay.push(matched);
  }

  if (itemsToDisplay.length === 0 && (category === 'chimney' || category === 'dishwasher')) {
    itemsToDisplay = allProducts.filter((p) => p.category === category);
  }

  if (itemsToDisplay.length === 0) {
    itemsToDisplay = allProducts;
  }

  return {
    componentType: 'products',
    title: itemsToDisplay.length === 1 ? itemsToDisplay[0].name : `Faber Appliances (${itemsToDisplay.length})`,
    subtitle: itemsToDisplay.length === 1 ? itemsToDisplay[0].type : `Displaying ${itemsToDisplay.length} models`,
    products: itemsToDisplay,
    images: itemsToDisplay.map((p) => ({
      name: p.name,
      title: p.name,
      imageUrl: p.imageUrl,
      description: p.description
    }))
  };
}

// Backwards compatibility alias for older imports
export const resolveProductsByEnums = (rawInput) => {
  const res = resolveToolRequest({ product: rawInput });
  return res.products;
};

