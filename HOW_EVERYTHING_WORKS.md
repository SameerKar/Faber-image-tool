# Faber Visualizer: End-to-End System Architecture, Code Walkthrough & Visual Guide

This document is the master visual and technical guide for the **Faber Product Visualizer**. It illustrates the entire lifecycle:
1. **Screen Architecture (Dual-Pane Layout ASCII Diagram)**
2. **Morning vs. Current Version (Evolution Table)**
3. **End-to-End Trace of Every Query Type:**
   - Spoken Natural Language (Hindi / English)
   - Oration Tool Parameters & HTTP Request Body
   - Exact Backend Code Block (`catalog.js`)
   - Real-Time SSE Event Payload
   - Frontend Renderer Function (`app.js`)
   - **Exact ASCII UI Diagram of the Side Panel Output**
4. **Detailed Visual Specifications for All 5 Dynamic Components**

---

## 1. Overall Screen Architecture (Dual-Pane Viewport)

When you open `http://localhost:3000`, the screen is divided into two synchronized 50% split viewports:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  FABER LUXURY APPLIANCE VISUALIZER                      [ 🟢 Live Session: default ]  [ ⚡ Quick Triggers ▾ ] [ ⚙️ ]  │
├─────────────────────────────────────────────────────────┬──────────────────────────────────────────────────────────────┤
│               LEFT PANE: ORATION VOICE / CHAT           │                 RIGHT PANE: DYNAMIC VIEWPORT                 │
│                 (100% Full-Cover Height)                │             (Dynamic Real-Time Visual Component)             │
├─────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │ ┌──────────────────────────────────────────────────────────┐ │
│ │  Agent Header: "Faber Product Assistant"            │ │ │ [ Component Title Banner ]                               │ │
│ │                                                     │ │ │                                                          │ │
│ │  Transcript Chat Feed (Scrollable):                 │ │ │   Switches dynamically to 1 of 5 Components:             │ │
│ │  ┌────────────────────────────────────────────────┐ │ │   1. "products"            --> Product Cards Grid          │ │
│ │  │ User: "चिमनी और डिशवॉशर का डिफरेंस दिखाइए"     │ │ │   2. "comparison"          --> Side-by-Side Spec Matrix   │ │
│ │  └────────────────────────────────────────────────┘ │ │   3. "dishwasher-loading"  --> 4-Rack Loading Infographic │ │
│ │  ┌────────────────────────────────────────────────┐ │ │   4. "manual"              --> 4-Phase AutoClean Timeline │ │
│ │  │ Agent: "मैंने आपकी स्क्रीन पर दोनों का        │ │ │   5. "offers"              --> High-Savings Deal Cards    │ │
│ │  │ कंपैरिजन लगा दिया है..."                       │ │ │                                                          │ │
│ │  └────────────────────────────────────────────────┘ │ │                                                          │ │
│ │                                                     │ │                                                          │ │
│ │  Audio Waveform Visualizer (Real-time speech)       │ │                                                          │ │
│ │  [  ▂ ▃ ▅ ▆ ▇ ▆ ▅ ▃ ▂   ▂ ▃ ▄ ▅ ▆ ▇ █ ▇ ▆ ▅ ▄ ▂   ]  │ │                                                          │ │
│ │                                                     │ │                                                          │ │
│ │  [ 🎤 Start / Stop Speaking ]      [ 📞 End Call ]  │ │                                                          │ │
│ └─────────────────────────────────────────────────────┘ │ └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 2. Morning Baseline vs. Current Enhanced Version

| Feature | Morning Version (Old) | Current Version (Enhanced) |
| :--- | :--- | :--- |
| **Catalog** | 4 hardcoded items (2 chimneys, 2 dishwashers). | **All 13 official Faber appliances** (3 Libra BLDC chimneys + 10 dishwashers) with MRP, selling prices, discounts, savings, dimensions, suction power, wash programs, warranty, and Faber CDN images. |
| **Tool Extraction** | Single rigid string: `{"product": "..."}`. Rigid matching, unable to handle complex queries. | **Multi-Variable Structured Extraction**: `action`, `category`, `products`, `max_price`, and `query`. Fully backward-compatible with single strings. |
| **Comparisons** | Always defaulted to 3 fixed chimneys if exact names were not passed. | **Dynamic Comparison Matrix**: Compares **strictly the 2 models requested** (e.g. `Libra 60 vs Libra 90`), or generates a **Cross-Category Comparison** (Chimney vs Dishwasher). |
| **Offers & Deals** | Showed all offers globally; asking for *"dishwasher offers"* leaked chimney models into the results. | **Strict Category Isolation**: *"dishwasher offers"* strictly filters dishwashers only. Combines with price limits (e.g. *"offers under 30000"*). |
| **Price / Budget Filters** | Simple string match; if no products matched (e.g. chimneys under 20k), returned a blank, empty screen. | **Smart Budget Guidance**: Detects price numbers (e.g. 20k, 30k). If budget is below catalog starting price, informs customer and displays the nearest entry models. |
| **Visual Components** | Single static image card. | **5 Rich Responsive Components**: Products Grid, Side-by-Side Matrix, Dishwasher Loading Guide, Heat Auto-Clean Manual, and Special Offers Showcase. |

---

## 2.1 Master Presentation Matrix: Voice Queries vs. Visual Components Rendered

Use this reference table for slide presentations, stakeholder demos, and team walkthroughs. It maps every customer voice query to its exact backend action, rendered component, and right-screen layout.

| # | Query Intent / Category | Sample Spoken Customer Questions (Hindi / English) | Backend Tool Payload (`POST /api/tool`) | Rendered Component (`componentType`) | Visual Representation on Right Screen | Total Possibilities & Variations Handled |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Cross-Category Comparison** *(Chimney vs. Dishwasher)* | • *"चिमनी और डिशवॉशर का डिफरेंस दिखाइए"*<br>• *"Show me the difference between chimney and dishwasher"*<br>• *"दोनों में क्या फर्क है, इमेज दिखाओ"* | `action: "compare"`<br>`category: "both"`<br>`products: "chimney, dishwasher"` | `comparison`<br>*(Side-by-Side Matrix)* | **Dual-column comparative table**: Chimney flagship vs. Dishwasher flagship side-by-side with pedestal images, prices, Faber Red discount pills, spec checkmarks (`✓ Airflow`, `✓ Capacity`, `✓ Filter`), and `Buy Now →` CTAs. | **1 canonical cross-category pair** (Flagship Chimney + Flagship Dishwasher). |
| **2** | **Intra-Category Multi-Model Comparison** *(2, 3, or 4 Models)* | • *"तीनों चिमनी कंपेयर करें"*<br>• *"Compare Libra 60 and Libra 90"*<br>• *"तीनों डिशवॉशर कंपेयर कर दीजिए"*<br>• *"Built-in aur freestanding dishwasher mein kya farak hai"* | `action: "compare"`<br>`category: "chimney"` or `"dishwasher"`<br>`products: ["Model A", "Model B", ...]` | `comparison`<br>*(Side-by-Side Matrix)* | **Multi-column spec matrix with horizontal smooth scroll arrows (`◄` `►`)**: Product pedestal cutouts, bold deal prices, struck MRP, Faber Red badges, suction/wash specs, dimensions, and individual `Buy Now →` buttons. | **Up to 4 models simultaneously**; handles 2-model, 3-model, and 4-model combinations across all 13 catalog appliances. |
| **3** | **Budget & Price Filters** *(Dual or Single Category)* | • *"30,000 के अंदर डिशवॉशर और चिमनी दिखाइए"*<br>• *"Chimneys under ₹25,000"*<br>• *"Dishwashers below 30k"*<br>• *"35000 mein kaun sa best aayega"* | `action: "filter_by_price"`<br>`max_price: 30000`<br>`category: "both" \| "chimney" \| "dishwasher"` | `products`<br>*(Product Cards Grid)* | **Ranked product showcase grid**: Models sorted by price and savings, Faber Red badges (`34% OFF`), feature bullet points (`• 1500 m³/hr`, `• 14-Place`), and `Try Visualizer →` CTA. If budget < 20k, displays smart guidance note + entry models. | **Any numerical budget** (e.g. ₹20k, ₹25k, ₹30k, ₹35k, ₹40k, ₹50k+). Renders 1 item (Hero), 2 items (Dual), or 3–6 items (Grid). |
| **4** | **Multi-Condition Filters** *(Filterless + Sale + Budget)* | • *"25,000 के अंदर जो फ़िल्टरलेस चिमनी सेल में हैं वो दिखाओ"*<br>• *"Filterless chimney on offer under 25k"*<br>• *"Discounted auto-clean chimney under 30000"* | `action: "filter_by_price"`<br>`category: "chimney"`<br>`filter: "filterless"`<br>`is_offer: true`<br>`max_price: 25000` | `products`<br>*(Targeted Product Grid)* | **Filtered high-relevance appliance cards**: Strictly filterless models with thermal auto-clean, verified sale tags (`Free Gift Inside`), struck MRP, and motion gesture sensor highlights. | **Triple-condition intersection**: `Category` + `Filter Type` + `Sale Condition` + `Price Ceiling`. |
| **5** | **Special Offers & Promotional Discounts** | • *"डिशवॉशर के क्या ऑफर हैं"*<br>• *"चिमनी पर क्या छूट है"*<br>• *"Show me festive offers"*<br>• *"Top promotional discounts"* | `action: "offers"` or `"show_offers"`<br>`category: "dishwasher" \| "chimney"`<br>`compare: true \| false` | `offers`<br>*(Festive Celebration Banner + Deal Cards)*<br>*(or `comparison` if compare=true)* | **Celebratory Festive Banner**: `• FESTIVE CELEBRATIONS • EXCLUSIVE FESTIVE OFFERS` with gold/red accent styling, followed by high-discount appliance cards with glowing Faber Red badges (`34%–38% OFF`), savings amount, and `Try Visualizer →` / `Claim Now →`. | **Category-isolated offers** (strictly chimneys, strictly dishwashers, or global deals). Optional matrix view if customer says *"compare offers"*. |
| **6** | **Dishwasher Utensil Loading Guide** *(Indian Cookware)* | • *"बर्तन कैसे लोड करते हैं"*<br>• *"कड़ाही और पतीला कहाँ रखें"*<br>• *"How to load heavy Indian cookware"*<br>• *"Can I put pressure cooker in dishwasher"* | `action: "dishwasher_loading"`<br>`query: "loading guide"` | `dishwasher-loading`<br>*(Infographic Loading Guide)* | **3 numbered rack visual blueprint matching appliance diagrams**: `01 / UPPER RACK ✓` (glasses, cups, katoris angled down), `02 / LOWER RACK ✓` (plates inward, kadai/patila at 45° angle), `03 / CUTLERY TRAY ✓` (flatware, spoons alternating), plus expandable **`LOADING TIPS & INDIAN UTENSILS GUIDE ▾`** (detergent rules, spray arm clearance). | **Complete visual manual**: 3 rack diagrams, 6 callout pointer tags, and 4 detailed Indian cookware rules. |
| **7** | **Step-by-Step Maintenance & Auto-Clean Manual** | • *"ऑटो क्लीन कैसे काम करता है"*<br>• *"How does 9-minute heat clean work"*<br>• *"जेस्चर कंट्रोल कैसे यूज़ करें"*<br>• *"Chimney troubleshooting & maintenance"* | `action: "show_manual"`<br>`manual_topic: "heat_auto_clean" \| "gesture_control" \| "troubleshooting"` | `manual`<br>*(Structured Timeline & Step Guide)* | **Numbered phased procedural cards**: Phase 1 (Press Auto-Clean) ➔ Phase 2 (9-Min Thermal Heating Coil melts grease) ➔ Phase 3 (1-Min High Speed Blower drains oil) ➔ Phase 4 (Stainless Steel Collector Tray removal & wash). | **3 distinct operational topics**: Heat Auto-Clean, Gesture Control Motion Sensor Guide, and Filterless Cleaning & Maintenance. |
| **8** | **Exact Appliance Lookup** *(Single Model Spotlight)* | • *"Faber FFSD 6PR 12S Neo Black दिखाओ"*<br>• *"Show me the Libra BLDC 90"*<br>• *"Show FSID 8PR 14S dishwasher"* | `action: "show_products"`<br>`products: ["Exact Model Name"]` | `products`<br>*(Hero Appliance Layout)* | **Studio Hero Layout**: Single massive centered appliance cutout image, `FABER` brand kicker, verified category tag, full specification matrix (suction, decibel level, wash programs, warranty), price breakdown, and `Try Visualizer →` link. | **All 13 official Faber catalog appliances** individually accessible. |
| **9** | **Full Catalog Overview** *(All Models)* | • *"सब प्रोडक्ट दिखाइए"*<br>• *"Show all appliances"*<br>• *"What all chimneys and dishwashers do you sell"* | `action: "show_all"` or `action: "show_products"` (empty/all) | `products`<br>*(Full Gallery Grid)* | **Comprehensive 13-Appliance Showcase Grid**: All 3 BLDC chimneys (60, 75, 90 cm) + all 10 freestanding, semi-integrated, and built-in dishwashers with category pills, live counts, and sorting. | **Complete catalog coverage** (13 total products). |

---

### Component Distribution & Possibility Summary

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 COMPONENT SWITCHING MATRIX                                     │
├────────────────────────┬──────────────────────┬────────────────────────────────────────────────┤
│ Dynamic Component      │ Trigger Actions      │ Customer Scenarios & Possibilities             │
├────────────────────────┼──────────────────────┼────────────────────────────────────────────────┤
│ 1. "comparison"        │ compare, vs, differ  │ • 2-Model Chimney vs Chimney                   │
│                        │                      │ • 2-Model Dishwasher vs Dishwasher             │
│                        │                      │ • 2-Model Chimney vs Dishwasher (Cross-cat)    │
│                        │                      │ • 3-Model All Chimneys (60, 75, 90 cm)         │
│                        │                      │ • 3-Model Discounted Dishwashers               │
│                        │                      │ • 4-Model Budget Comparison (< ₹30k)           │
├────────────────────────┼──────────────────────┼────────────────────────────────────────────────┤
│ 2. "products"          │ filter_by_price,     │ • Single Hero Model Spotlight (1 item)         │
│                        │ show_products,       │ • Dual Model Comparison (2 items)              │
│                        │ show_all             │ • Price Budget Filter (e.g. < 25k, < 30k)      │
│                        │                      │ • Multi-Condition Filter (Filterless + Sale)   │
│                        │                      │ • Full Catalog Gallery (All 13 items)          │
├────────────────────────┼──────────────────────┼────────────────────────────────────────────────┤
│ 3. "dishwasher-loading"│ dishwasher_loading,  │ • How to load heavy Indian cookware            │
│                        │ loading guide        │ • Pressure cooker & Kadai 45° placement        │
│                        │                      │ • Chai cup, glassware & katori loading         │
│                        │                      │ • Spray arm clearance & detergent warnings     │
├────────────────────────┼──────────────────────┼────────────────────────────────────────────────┤
│ 4. "manual"            │ show_manual          │ • Chimney 9-Min Heat Auto-Clean Timeline       │
│                        │                      │ • Gesture Control Motion Sensor Wave Guide     │
│                        │                      │ • Troubleshooting & Maintenance FAQ            │
├────────────────────────┼──────────────────────┼────────────────────────────────────────────────┤
│ 5. "offers"            │ offers, show_offers  │ • Chimney Offers & Savings (up to 38% off)     │
│                        │                      │ • Dishwasher Offers & Savings (up to 34% off)  │
│                        │                      │ • Festive Combos & Promotional Bundles         │
└────────────────────────┴──────────────────────┴────────────────────────────────────────────────┘
```

---

## 3. End-to-End Query Lifecycles (Input -> Code -> Output)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                             UNIVERSAL PIPELINE ARCHITECTURE                                            │
│                                                                                                                        │
│  [Natural Language] ──► [Oration LLM] ──► [HTTP POST] ──► [catalog.js] ──► [SSE Event] ──► [app.js] ──► [Side Panel]  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### SCENARIO 1: Cross-Category Comparison (Chimney vs. Dishwasher)

#### Step 1: Spoken Natural Language
> **Customer:** *"उसका इमेज दिखाइए, चिमनी और डिशवॉशर का डिफरेंस दिखाइए।"*

#### Step 2: Oration LLM Extraction & HTTP Payload
Oration reads the tool description and extracts structured variables:
```json
// POST https://faber-image-tool.sameer-kar.workers.dev/api/tool
{
  "action": "compare",
  "category": "both",
  "products": "chimney, dishwasher",
  "max_price": 0,
  "query": "चिमनी और डिशवॉशर का डिफरेंस दिखाइए"
}
```

#### Step 3: Backend Execution in `tool-backend/src/catalog.js`
The backend resolver executes lines 819–836:
```javascript
// Check for Cross-Category Comparison (Chimney vs Dishwasher)
if (category === 'both') {
  candidateList = [FABER_PRODUCT_CATALOG.LIBRA_60, FABER_PRODUCT_CATALOG.FBID_8PR_14S];
  return {
    componentType: 'comparison',
    title: 'Faber Chimney vs Dishwasher Comparison',
    subtitle: 'Comparing Faber Libra BLDC Chimney (60 cm) vs Faber Built-in Dishwasher (14 Place)',
    products: candidateList,
    images: candidateList.map((p) => ({
      name: p.name,
      title: p.name,
      imageUrl: p.imageUrl,
      description: `Price: ₹${p.price.toLocaleString('en-IN')} • ${p.category}`
    }))
  };
}
```

#### Step 4: Real-Time SSE Stream Broadcast
The backend pushes the event through `/api/stream/default`:
```json
data: {
  "type": "PRODUCT_UPDATE",
  "action": "DISPLAY_COMPONENT",
  "componentType": "comparison",
  "title": "Faber Chimney vs Dishwasher Comparison",
  "subtitle": "Comparing Faber Libra BLDC Chimney (60 cm) vs Faber Built-in Dishwasher (14 Place)",
  "products": [
    { "name": "Faber Libra BLDC 60 cm", "price": 21330, "mrp": 32490, "category": "chimney", ... },
    { "name": "Faber FBID 8PR 14S", "price": 63901, "mrp": 70990, "category": "dishwasher", ... }
  ]
}
```

#### Step 5: Frontend Execution in `frontend-page/app.js`
`handleIncomingImages(data)` detects `componentType === 'comparison'` and invokes:
```javascript
renderComparisonMatrix(componentViewport, data.products, data.title);
```

#### Step 6: What Appears on the Right Side Panel (Exact ASCII Diagram)

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ Faber Chimney vs Dishwasher Comparison                                      [ Matrix View ]│
│ Comparing Faber Libra BLDC Chimney (60 cm) vs Faber Built-in Dishwasher (14 Place)         │
├──────────────────────┬───────────────────────────────────┬─────────────────────────────────┤
│ Specification Row    │ Faber Libra BLDC 60 cm (Chimney)  │ Faber FBID 8PR 14S (Dishwasher) │
├──────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ Image Header         │   [ 🖼️ Chimney Product Photo ]     │   [ 🖼️ Dishwasher Photo ]        │
│ Current Price        │   ₹21,330                         │   ₹63,901                       │
│ List Price (MRP)     │   MRP ₹32,490 (34% Off)           │   MRP ₹70,990 (10% Off)         │
├──────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ Type / Design        │ Wall Mounted Hood                 │ Fully Integrated Built-in       │
│ Dimensions           │ 600 × 418 × 485 mm                │ 815 × 598 × 600 mm              │
│ Airflow / Capacity   │ 1500 m³/hr High Suction           │ 14 Place Settings               │
│ Motor / Wash Cycles  │ BLDC Inverter Motor (9-Speed)     │ 8 Wash Programs (Dual Zone)     │
│ Cleaning Technology  │ Thermal Heat Auto-Clean           │ Natural Drying + Hot Water 70°C │
│ Control Interface    │ Touch Control + Motion Gesture    │ Hidden Top-Door Controls        │
│ Finish & Aesthetic   │ Black Curved Glass + Matte Body   │ Obsidian Black Glass Front      │
│ Official Warranty    │ 2 Yrs Comprehensive • 12 Yrs Motor│ 2 Yrs Full • 10 Yrs Cavity      │
└──────────────────────┴───────────────────────────────────┴─────────────────────────────────┘
```

---

### SCENARIO 2: Exact 2-Model Comparison (e.g. Libra 60 vs. Libra 90)

#### Step 1: Spoken Natural Language
> **Customer:** *"Libra 60 और Libra 90 को compare करो"*

#### Step 2: Oration LLM Extraction & HTTP Payload
```json
{
  "action": "compare",
  "category": "chimney",
  "products": "Libra 60, Libra 90",
  "max_price": 0,
  "query": "Libra 60 और Libra 90 को compare करो"
}
```

#### Step 3: Backend Execution in `catalog.js`
The backend splits `"Libra 60, Libra 90"` by comma, matches both IDs (`libra-60` and `libra-90`), and finds `candidateList.length === 2`:
```javascript
// Parse products list
let rawList = merged.products.split(/,| and | aur | vs /i).map(s => s.trim());
for (const item of rawList) {
  const matched = findProductByQuery(item);
  if (matched && !candidateList.some(p => p.id === matched.id)) {
    candidateList.push(matched);
  }
}

// User provided EXACTLY 2 products: CandidateList has strictly 2 items!
const titleText = `${candidateList[0].name} vs ${candidateList[1].name}`;
return {
  componentType: 'comparison',
  title: titleText,
  subtitle: candidateList.map(p => p.name).join(' vs '),
  products: candidateList,
  images: ...
};
```

#### Step 4: What Appears on the Right Side Panel (Exact ASCII Diagram)

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ Faber Libra BLDC 60 cm vs Faber Libra BLDC 90 cm                            [ Matrix View ]│
│ Detailed specification matrix comparing 2 Faber appliances.                                │
├──────────────────────┬───────────────────────────────────┬─────────────────────────────────┤
│ Specification Row    │ Faber Libra BLDC 60 cm            │ Faber Libra BLDC 90 cm          │
├──────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ Image Header         │   [ 🖼️ 60cm Hood Image ]           │   [ 🖼️ 90cm Hood Image ]         │
│ Current Price        │   ₹21,330                         │   ₹24,987                       │
│ List Price (MRP)     │   MRP ₹32,490 (34% Off)           │   MRP ₹35,490 (30% Off)         │
├──────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ Kitchen Stove Fit    │ Ideal for 2 to 4 burner stoves    │ Ideal for 3 to 5 burner stoves  │
│ Dimensions           │ 600 × 418 × 485 mm (Compact)      │ 900 × 418 × 490 mm (Full Width) │
│ Airflow / Suction    │ 1500 m³/hr Airflow                │ 1500 m³/hr Airflow              │
│ Motor Technology     │ BLDC Inverter Motor               │ BLDC Inverter Motor             │
│ Filter System        │ Baffle-less Surface               │ Baffle-less Surface             │
│ Control System       │ Touch & Gesture Controls          │ Touch & Gesture Controls        │
│ Official Warranty    │ 2 Yrs Comprehensive • 12 Yrs Motor│ 2 Yrs Comprehensive • 12 Yrs Motor│
└──────────────────────┴───────────────────────────────────┴─────────────────────────────────┘
```
*(Notice: Strictly 2 models are displayed! No third product is added.)*

---

### SCENARIO 3: Category-Isolated Offers & Budget (Discounts under ₹30,000)

#### Step 1: Spoken Natural Language
> **Customer:** *"डिशवॉशर के बेस्ट ऑफर्स अंडर 30,000 दिखाइए।"*

#### Step 2: Oration LLM Extraction & HTTP Payload
```json
{
  "action": "offers",
  "category": "dishwasher",
  "products": "",
  "max_price": 30000,
  "query": "डिशवॉशर के बेस्ट ऑफर्स अंडर 30,000 दिखाइए"
}
```

#### Step 3: Backend Execution in `catalog.js`
The backend isolates `category === 'dishwasher'` and filters `price <= 30000`:
```javascript
let offerProducts = allProducts.filter((p) => p.isOffer);

// Strict category isolation prevents chimneys from appearing!
if (category === 'dishwasher') {
  offerProducts = offerProducts.filter((p) => p.category === 'dishwasher');
}

// Budget filtering applied directly on the discounted inventory
if (maxPrice > 0) {
  offerProducts = offerProducts.filter((p) => p.price <= maxPrice);
}

offerProducts.sort((a, b) => b.savings - a.savings);
return {
  componentType: 'offers',
  title: 'Faber Special Dishwasher Offers under ₹30,000',
  products: offerProducts,
  ...
};
```

#### Step 4: Frontend Execution in `app.js`
`renderOffersShowcase(componentViewport, data.products, data.title)` renders the promotional card.

#### Step 5: What Appears on the Right Side Panel (Exact ASCII Diagram)

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🎁 Faber Special Dishwasher Offers under ₹30,000                           [ 1 Special Deal ]│
│ Showing 1 model with special recorded discounts up to 34% off                              │
├────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │  [ 🖼️ FFSD 6PR 12S Neo Black Photo ]           [ 🏷️ Save ₹7,491 ] [ 20% OFF ]          │ │
│ │                                                                                        │ │
│ │  Faber FFSD 6PR 12S Neo Black                                                          │ │
│ │  Freestanding Dishwasher • 12 Place Settings • Obsidian Black Finish                   │ │
│ │                                                                                        │ │
│ │  Price: ₹29,999              MRP: ₹37,490 (Strikethrough)                              │ │
│ │                                                                                        │ │
│ │  Key Highlights:                                                                       │ │
│ │  • [ Under ₹30k (₹29,999) ]   • [ 12 Place Settings ]   • [ Half Load Mode ]           │ │
│ │  • [ 6 Wash Programs ]        • [ 5-Year Cavity Warranty ]                             │ │
│ │                                                                                        │ │
│ │  [ 🔍 View Product Details ]                             [ 🛒 Buy on Faber Store ↗ ]   │ │
│ └────────────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```
*(Notice: No chimneys leaked in. Exactly matches the ₹30,000 budget and discount criteria.)*

---

### SCENARIO 4: Dishwasher Loading Guide (Utensil Arrangement)

#### Step 1: Spoken Natural Language
> **Customer:** *"डिशवॉशर में बर्तन कैसे लोड करें?"* or *"How to load Kadai and utensils?"*

#### Step 2: Oration LLM Extraction & HTTP Payload
```json
{
  "action": "loading_guide",
  "category": "dishwasher",
  "products": "",
  "max_price": 0,
  "query": "डिशवॉशर में बर्तन कैसे लोड करें"
}
```

#### Step 3: Backend Execution in `catalog.js`
The backend resolver executes lines 737–753:
```javascript
if (action === 'dishwasher_loading' || action === 'loading_guide') {
  return {
    componentType: 'dishwasher-loading',
    title: 'How to Load a Faber Dishwasher',
    subtitle: 'Proper utensil arrangement for optimal cleaning and drainage',
    guideData: DISHWASHER_LOADING_GUIDE,
    ...
  };
}
```

#### Step 4: What Appears on the Right Side Panel (Exact ASCII Diagram)

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🍽️ How to Load a Faber Dishwasher for Indian Cookware                                      │
│ Official loading techniques tailored for heavy Indian masala cookware and dinnerware      │
├────────────────────────────────────────────────────────────┬───────────────────────────────┤
│ 🍳 Lower Basket (Heaviest Cookware)                        │ ☕ Upper Basket (Glasses/Mugs) │
├────────────────────────────────────────────────────────────┼───────────────────────────────┤
│ Items: Pressure cookers, Kadai, Patila, Large thalis       │ Items: Chai cups, steel bowls │
│                                                            │                               │
│ • Place heavy pots/kadai facing DOWNWARDS at 45° angle.    │ • Tilt glasses upside-down.   │
│ • Never nest vessels inside one another.                   │ • Secure light steel bowls.   │
│ • Position large plates vertically between rack tines.     │ • Adjust basket height if tall│
│                                                            │   pots are in bottom basket.  │
├────────────────────────────────────────────────────────────┼───────────────────────────────┤
│ 🍴 Cutlery Tray / Basket                                   │ ⚠️ Critical Checks Pre-Start  │
├────────────────────────────────────────────────────────────┼───────────────────────────────┤
│ Items: Spoons, forks, butter knives, small peelers         │ Items: Spray arms, detergent  │
│                                                            │                               │
│ • Alternate spoon handles up/down so they don't nest.      │ • SPIN SPRAY ARMS BY HAND:    │
│ • Place knife blades pointing DOWNWARDS for safety.        │   Ensure kadai handles do not │
│ • Lay long ladles and tongs flat on top shelf.             │   block arm from rotating.    │
│                                                            │ • Scrape large bones/rinds.   │
└────────────────────────────────────────────────────────────┴───────────────────────────────┘
```

---

### SCENARIO 5: Heat Auto-Clean Manual (Chimney Maintenance)

#### Step 1: Spoken Natural Language
> **Customer:** *"चिमनी का ऑटो क्लीन कैसे काम करता है?"* or *"Show auto clean manual"*

#### Step 2: Oration LLM Extraction & HTTP Payload
```json
{
  "action": "auto_clean",
  "category": "chimney",
  "products": "Libra 60",
  "max_price": 0,
  "query": "चिमनी का ऑटो क्लीन कैसे काम करता है"
}
```

#### Step 3: Backend Execution in `catalog.js`
The backend resolver executes lines 755–773:
```javascript
if (action === 'show_manual' || action === 'manual' || action === 'auto_clean') {
  return {
    componentType: 'manual',
    title: 'Faber User Manual & Appliance Maintenance',
    subtitle: 'Step-by-step Auto-Clean and chemical maintenance protocols',
    manualData: USER_MANUAL_GUIDE,
    ...
  };
}
```

#### Step 4: What Appears on the Right Side Panel (Exact ASCII Diagram)

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ 📘 Faber User Manual & Thermal Heat Auto-Clean Protocol                                    │
│ Step-by-step thermal maintenance guide for Libra BLDC Chimneys                             │
├────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────┐   ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ STEP 01 │──►│ ACTIVATE AUTO-CLEAN MODE                                                 │ │
│ └─────────┘   │ Press and hold the Heat Auto-Clean icon on the touch panel for 3 sec.    │ │
│               └──────────────────────────────────────────────────────────────────────────┘ │
│ ┌─────────┐   ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ STEP 02 │──►│ THERMAL HEATING CYCLE (9 MINUTES)                                        │ │
│ └─────────┘   │ Electric heating element warms internal chamber to 80°C to liquefy       │ │
│               │ stubborn cooking oil and grease stuck to motor housing.                  │ │
│               └──────────────────────────────────────────────────────────────────────────┘ │
│ ┌─────────┐   ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ STEP 03 │──►│ TURBO BLOWER EXTRACTION (1 MINUTE)                                       │ │
│ └─────────┘   │ High-speed BLDC blower fan draws melted oil droplets directly into the   │ │
│               │ rear stainless steel oil collector tray.                                 │ │
│               └──────────────────────────────────────────────────────────────────────────┘ │
│ ┌─────────┐   ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ STEP 04 │──►│ OIL COLLECTOR EMPTYING                                                   │ │
│ └─────────┘   │ Slide out the stainless steel tray from the back, rinse in warm water,   │ │
│               │ and snap back into place. Clean once every 15-20 days.                   │ │
│               └──────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### SCENARIO 6: Budget Floor Guidance (e.g. Chimneys under ₹20,000)

#### Step 1: Spoken Natural Language
> **Customer:** *"अंडर 20,000 में कोई चिमनी बताइए"*

#### Step 2: Oration LLM Extraction & HTTP Payload
```json
{
  "action": "filter_price",
  "category": "chimney",
  "products": "",
  "max_price": 20000,
  "query": "अंडर 20,000 में कोई चिमनी बताइए"
}
```

#### Step 3: Backend Execution in `catalog.js` (Smart Budget Fallback)
```javascript
// Check if filtered list is empty when budget is too low
if (filtered.length === 0 && maxPrice > 0) {
  const closest = allProducts.filter(p => p.category === category).sort((a,b) => a.price - b.price);
  const startingPrice = closest[0].price; // ₹21,330

  return {
    componentType: 'products',
    title: 'Faber Chimneys Budget Options',
    subtitle: `No chimneys found under ₹20,000. Faber BLDC models start from ₹21,330:`,
    products: closest.slice(0, 2),
    ...
  };
}
```

#### Step 4: What Appears on the Right Side Panel (Exact ASCII Diagram)

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ Faber Chimneys Budget Options                                              [ 2 Appliances ]│
│ ℹ️ No chimneys found under ₹20,000. Faber BLDC models start from ₹21,330:                   │
├─────────────────────────────────────────────┬──────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │ ┌──────────────────────────────────────────┐ │
│ │ [ 🖼️ Faber Libra BLDC 60 cm Image ]      │ │ │ [ 🖼️ Faber Libra BLDC 75 cm Image ]       │ │
│ │                                         │ │ │                                          │ │
│ │ Faber Libra BLDC 60 cm                  │ │ │ Faber Libra BLDC 75 cm                   │ │
│ │ Wall Mounted Chimney • 1500 m³/hr       │ │ │ Wall Mounted Chimney • 1500 m³/hr        │ │
│ │                                         │ │ │                                          │ │
│ │ Price: ₹21,330      MRP: ₹32,490 (34%)  │ │ │ Price: ₹23,118      MRP: ₹33,990 (32%)   │ │
│ │                                         │ │ │                                          │ │
│ │ • [ Lowest Price BLDC (₹21,330) ]       │ │ │ • [ Medium Stoves (75 cm) ]              │ │
│ │ • [ Heat Auto-Clean ]                   │ │ │ • [ Heat Auto-Clean ]                    │ │
│ │ • [ Touch & Gesture Control ]           │ │ │ • [ Touch & Gesture Control ]            │ │
│ │                                         │ │ │                                          │ │
│ │ [ 🔍 View Product Details ]             │ │ │ [ 🔍 View Product Details ]              │ │
│ └─────────────────────────────────────────┘ │ └──────────────────────────────────────────┘ │
└─────────────────────────────────────────────┴──────────────────────────────────────────────┘
```
*(Notice: Instead of an empty, broken screen, the customer receives polite guidance and the two nearest entry models!)*

---

## 4. Summary of Code Responsibilities

| File Path | Primary Function in Architecture |
| :--- | :--- |
| `tool-backend/src/catalog.js` | Master product database (13 appliances), static guides, fuzzy query matchers, multi-variable intent resolution, and components payload generation. |
| `tool-backend/src/index.js` | Cloudflare Worker entrypoint with CORS, route management, tool webhook handler, and Durable Object broadcasting. |
| `tool-backend/src/sessionRoom.js` | Cloudflare Durable Object managing persistent WebSocket connections and Server-Sent Events (SSE) streams per session. |
| `tool-backend/server.js` | Standalone Express.js server providing identical endpoints and in-memory SSE streaming for local development (`http://localhost:3000`). |
| `frontend-page/app.js` | Subscribes to SSE stream, injects Shadow DOM styles to `<oration-widget>`, and dispatches dynamic component renderers. |
| `frontend-page/styles.css` | Design system styling for comparison tables, cards grids, infographics, and modals. |
| `tool-change-1.md` | Oration Action configuration reference (copy-paste prompts and property schemas). |

---

## 5. Tool Backend Code: Section-by-Section Deep Dive

The backend is composed of two primary engines:
1. **The Intelligence Core (`tool-backend/src/catalog.js`):** Stores all appliance data and resolves voice inputs into visual payloads.
2. **The Communications Gateway (`tool-backend/src/index.js` / `server.js`):** Receives HTTP webhooks from Oration and broadcasts events to the user's screen in real time.

---

### PART A: `tool-backend/src/catalog.js` (The Intelligence Core)

`catalog.js` is pure, framework-independent JavaScript. It has zero external dependencies, making it universally portable between Node.js and Cloudflare Workers.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CATALOG.JS ARCHITECTURE                                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. DATA DICTIONARIES   : FABER_PRODUCT_CATALOG, DISHWASHER_LOADING_GUIDE, USER_MANUAL  │
│ 2. MATCHING UTILITIES  : normalizeKey(), getAllProducts(), findProductByQuery()        │
│ 3. RESOLVER ENGINE     : resolveToolRequest(rawBody, rawQuery)                         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Section A.1: The Product Database (`FABER_PRODUCT_CATALOG`)
This constant is an indexed dictionary containing all 13 official Faber appliances. Every item adheres to a standardized schema:

```javascript
export const FABER_PRODUCT_CATALOG = {
  LIBRA_60: {
    id: 'libra-60',                      // URL-safe unique slug
    enumKey: 'LIBRA_60',                 // Strict uppercase identifier
    sequenceOrder: 1,                    // Default display rank
    name: 'Faber Libra BLDC 60 cm',      // Human-readable title
    modelName: 'LIBRA 3D IND HC BLDC',   // Official Faber factory model name
    sku: '110.0698.814',                 // Official manufacturing SKU
    category: 'chimney',                 // Primary category ("chimney" | "dishwasher")
    categoryLabel: 'Wall Mounted Chimney',// UI badge label
    type: 'Wall Mounted',                // Sub-type
    price: 21330,                        // Current recorded selling price in INR
    mrp: 32490,                          // Maximum Retail Price (List Price) in INR
    discountPercent: 34,                 // Pre-calculated discount percentage
    savings: 11160,                      // Total customer savings in INR
    isOffer: true,                       // Boolean flag indicating special promotional pricing
    finish: 'Black Curved Glass & Matte Body',
    controls: 'Touch Control & Motion Gesture',
    suctionPower: '1500 m³/hr Airflow',
    motor: 'BLDC Inverter Motor',
    cleaningFunction: 'Thermal Heat Auto-Clean',
    dimensions: '600 × 418 × 485 mm',
    warranty: '2 Years Comprehensive • 12 Years on Motor',
    imageUrl: 'https://faberindia.com/cdn/shop/products/IMG_4526-2.jpg?v=1652172625&width=1100',
    productPageUrl: 'https://faberindia.com/collections/appliances',
    description: 'Ultra-efficient BLDC motor chimney with 1500 m³/hr suction...',
    keyFeatures: ['1500 m³/hr Suction', 'BLDC Motor', 'Heat Auto Clean', 'Gesture Control']
  },
  // ... (12 more products: Libra 75, Libra 90, Built-in dishwashers, Freestanding, Tabletop)
};
```

**Why this structure matters:**
- **No external database required:** Eliminates SQL/NoSQL roundtrips, allowing sub-millisecond execution inside Cloudflare's serverless edge.
- **Pre-computed savings & discounts:** Both `savings` and `discountPercent` are pre-calculated so the UI never needs to perform float arithmetic on prices.
- **Backward-Compatibility Aliases:** At the bottom of the dictionary, aliases are registered:
  ```javascript
  FABER_PRODUCT_CATALOG.CHIMNEY_1 = FABER_PRODUCT_CATALOG.LIBRA_60;
  FABER_PRODUCT_CATALOG.CHIMNEY_2 = FABER_PRODUCT_CATALOG.LIBRA_75;
  ```
  If older clients or legacy prompts send `"chimney 1"`, it automatically maps to `Libra 60`.

---

#### Section A.2: Static Guide Objects (`DISHWASHER_LOADING_GUIDE` & `USER_MANUAL_GUIDE`)
These constants store structured educational content tailored for Indian homes:

```javascript
export const DISHWASHER_LOADING_GUIDE = {
  title: 'How to Load a Faber Dishwasher for Indian Cookware',
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
    // ... Upper Basket, Cutlery Basket, and Critical Pre-Start Checks
  ]
};
```

**Functionality:**
- Instead of returning plain text or markdown that a voice agent might summarize awkwardly, the backend returns structured JSON.
- The frontend parses `sections` and renders interactive cards with icons (`🍳`, `☕`, `🍴`, `⚠️`), colored borders, and checklist items.

---

#### Section A.3: The Normalization & Matching Engine
Voice recognition systems introduce typos, spaces, and punctuation (e.g. `"libra-60"`, `"libra 60"`, `"Libra60"`). Three helper functions handle this:

1. **`normalizeKey(str)`:**
   ```javascript
   function normalizeKey(str = '') {
     return String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
   }
   ```
   - Converts `"Faber Libra BLDC 60 cm!"` into `"faberlibrabldc60cm"`.
   - Strips whitespace, hyphens, and punctuation for collision-free comparison.

2. **`getAllProducts()`:**
   ```javascript
   export function getAllProducts() {
     return Object.values(FABER_PRODUCT_CATALOG)
       .filter((item, index, self) => index === self.findIndex((t) => t.id === item.id))
       .sort((a, b) => (a.sequenceOrder || 99) - (b.sequenceOrder || 99));
   }
   ```
   - De-duplicates products (removes alias duplicates like `CHIMNEY_1`).
   - Returns a sorted array by `sequenceOrder` (1 to 13).

3. **`findProductByQuery(query)`:**
   A 5-tier waterfall algorithm to match any user query to a catalog product:
   - **Tier 1 (Direct ID/Key Match):** Checks if normalized query matches product ID or enum key (e.g. `"libra60"` -> `LIBRA_60`).
   - **Tier 2 (Numeric Chimney Aliases):** `"chimney 1"` -> `Libra 60`, `"chimney 2"` -> `Libra 75`, `"chimney 3"` -> `Libra 90`.
   - **Tier 3 (Hindi Aliases):** `"चिमनी 1"` -> `Libra 60`, `"डिशवॉशर 1"` -> `FBID 8PR 14S`.
   - **Tier 4 (Dishwasher Sequence Codes):** Matches common shorthand like `"8pr14s"`, `"12s neo black"`, `"table top black"`.
   - **Tier 5 (Fuzzy Substring Search):** Scans all product names and model strings:
     ```javascript
     for (const p of getAllProducts()) {
       if (normalizeKey(p.name).includes(q) || normalizeKey(p.modelName).includes(q)) {
         return p;
       }
     }
     ```

---

#### Section A.4: The Multi-Variable Dispatcher (`resolveToolRequest`)
This is the core decision engine. It takes the raw parameters from Oration (`rawBody`, `rawQuery`) and outputs a structured visual package.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        resolveToolRequest() DECISION TREE                              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Parameter Normalization: action, category, max_price, query                         │
│ 2. Category Inference: Detects "both" (cross-category), "chimney", "dishwasher"       │
│ 3. Natural Language Intent Fallback: If action is empty/vague, infers from text        │
│ 4. Execution Branches:                                                                 │
│    ├── Branch 1: "dishwasher_loading"  ──► Returns loading infographic                 │
│    ├── Branch 2: "show_manual"         ──► Returns Heat Auto-Clean timeline            │
│    ├── Branch 3: "show_offers"         ──► Category-isolated discounts                 │
│    ├── Branch 4: "filter_by_price"     ──► Budget filter + floor fallback              │
│    ├── Branch 5: "compare_products"    ──► Cross-category or exact 2-product matrix    │
│    └── Branch 6: "show_products"       ──► Standard multi-card showcase                │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

##### 1. Parameter Normalization
```javascript
const merged = { ...rawQuery, ...rawBody };
let action = String(merged.action || '').trim().toLowerCase();
let category = String(merged.category || '').trim().toLowerCase();
let maxPrice = Number(merged.max_price || merged.maxPrice || merged.budget || 0);
const rawText = String(merged.query || merged.product || merged.products || '').trim();
const lowerText = rawText.toLowerCase();
```
- Safely handles any naming style (`max_price` vs `maxPrice` vs `budget`).
- Consolidates user voice text into `lowerText`.

##### 2. Category Inference & Cross-Category Detection
```javascript
if (
  category === 'both' ||
  (lowerText.includes('chimney') && lowerText.includes('dish')) ||
  (lowerText.includes('चिमनी') && lowerText.includes('डिशवॉशर'))
) {
  category = 'both'; // Flags cross-category comparison
} else if (!category || category === 'all') {
  if (lowerText.includes('chimney') || lowerText.includes('hood') || lowerText.includes('चिमनी')) {
    category = 'chimney';
  } else if (lowerText.includes('dish') || lowerText.includes('bartan') || lowerText.includes('डिशवॉशर')) {
    category = 'dishwasher';
  }
}
```

##### 3. Natural Language Intent Fallback
If Oration's LLM sends a single string like `product: "chimneys under 25000"`, the intent is inferred automatically:
- Mentions *"load"*, *"bartan"*, or *"utensil"* -> `action = 'dishwasher_loading'`
- Mentions *"manual"*, *"auto clean"* -> `action = 'show_manual'`
- Mentions *"offer"*, *"discount"*, *"deal"*, *"ऑफर"* -> `action = 'show_offers'`
- Mentions *"compare"*, *"difference"*, *"vs"*, *"डिफरेंस"*, or `category === 'both'` -> `action = 'compare_products'`
- Mentions *"under"*, *"below"*, *"अंडर"*, or numbers `/\d{4,6}/` -> extracts number to `maxPrice` and sets `action = 'filter_by_price'`.

##### 4. Branch Execution Details:
- **Branch: Offers (`show_offers`)**:
  Filters by `isOffer: true`. Then strictly applies `category` so dishwashers never include chimneys. If `maxPrice > 0`, it limits results to offers under that price. Finally sorts by `savings` descending (`b.savings - a.savings`).
- **Branch: Budget Search (`filter_by_price`)**:
  Filters products where `p.price <= maxPrice`. If zero products match (e.g. user asks for chimneys under 20k), it triggers the **Budget Fallback**: finds the cheapest chimney (`Libra 60` at ₹21,330) and returns a friendly message: *"No chimneys found under ₹20,000. Faber BLDC models start from ₹21,330:"*.
- **Branch: Comparison (`compare_products`)**:
  - If `category === 'both'`, sets `candidateList = [Libra 60, FBID 8PR 14S]`.
  - Otherwise, parses `products` by splitting on commas, *"and"*, *"vs"*, or *"aur"*.
  - Matches each token using `findProductByQuery()`.
  - If the user gave 2 products (e.g. `Libra 60, Libra 90`), `candidateList` contains **strictly those 2 models**. No 3rd model is added!

---

### PART B: `tool-backend/src/index.js` (The Cloudflare Worker Gateway)

`src/index.js` acts as the serverless API router in Cloudflare Workers.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               SRC/INDEX.JS ROUTER MAP                                  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ OPTIONS /*                   ──► CORS preflight response (204 No Content)              │
│ GET     /api/config          ──► Serves public keys (ORATION_PUBLIC_KEY, AGENT_ID)     │
│ GET     /api/products        ──► Returns all 13 products in JSON                       │
│ GET     /api/health          ──► Heartbeat check { status: "ok" }                      │
│ GET     /api/ws              ──► Upgrades to WebSocket (Durable Object)                │
│ GET     /api/stream/:session ──► Subscribes to Server-Sent Events (Durable Object)     │
│ POST    /api/tool            ──► Receives Oration tool webhook & broadcasts via DO     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Section B.1: The CORS Engine (`getCorsHeaders`)
```javascript
function getCorsHeaders(env, request) {
  const origin = request.headers.get('Origin') || '*';
  const allowed = env.ALLOWED_ORIGIN || '*';
  const resolvedOrigin = allowed === '*' ? '*' : allowed.includes(origin) ? origin : allowed;

  return {
    'Access-Control-Allow-Origin': resolvedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400'
  };
}
```
**Functionality:**
- Allows the frontend to run on any port (e.g. `localhost:3000`, `localhost:8080`, or a custom domain) without browser CORS blocks.
- Responds to `OPTIONS` preflight requests in 0ms with a `204 No Content`.

---

#### Section B.2: The Configuration Endpoint (`/api/config`)
```javascript
if ((rawPath === '/api/config' || rawPath === '/config') && request.method === 'GET') {
  const pk = env.ORATION_PUBLIC_KEY || '70588826-0a19-4c4f-abdf-6de6c720d793';
  const ag = env.ORATION_AGENT_ID || '538568f1-6a55-4e3f-989c-164f391a8443';

  return new Response(JSON.stringify({ publicKey: pk, agentId: ag, defaultSessionId: 'default' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}
```
**Security & Decoupling:**
- The frontend HTML never hardcodes API keys or Agent IDs.
- On page load, `app.js` calls `/api/config` to retrieve them securely from environment variables.

---

#### Section B.3: The Tool Webhook Handler (`POST /api/tool`)
When Oration's AI Agent calls the tool, this code block executes:

```javascript
// 1. Parse JSON body (with plain text fallback)
let body = {};
if (request.method === 'POST') {
  const rawText = await request.text();
  if (rawText && rawText.trim().length > 0) {
    try { body = JSON.parse(rawText); } 
    catch { body = { product: rawText.trim() }; }
  }
}

// 2. Extract Session ID
let sessionId = url.searchParams.get('sessionId') || body.sessionId || 'default';

// 3. Resolve Payload from Catalog Engine
const resolved = resolveToolRequest(body, queryParams);

// 4. Assemble the Visual Event Payload
const visualPayload = {
  type: 'PRODUCT_UPDATE',
  action: 'DISPLAY_COMPONENT',
  componentType: resolved.componentType || 'products',
  title: resolved.title,
  subtitle: resolved.subtitle,
  sessionId,
  timestamp: new Date().toISOString(),
  products: resolved.products,
  images: resolved.images,
  guideData: resolved.guideData || null,
  manualData: resolved.manualData || null
};

// 5. Broadcast to the Universal 'default' Room via Durable Object
const defaultDoId = env.SESSION_ROOM.idFromName('default');
const defaultStub = env.SESSION_ROOM.get(defaultDoId);
await defaultStub.fetch('http://internal/broadcast', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(visualPayload)
});

// 6. Return confirmation to Oration
return new Response(JSON.stringify({
  status: 'success',
  message: `Sent visual component (${resolved.componentType}): ${resolved.title}`,
  componentType: resolved.componentType,
  title: resolved.title,
  displayedCount: resolved.products.length,
  sessionId
}), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
```

**Key Execution Highlights:**
- **Double Broadcast Strategy:** The event is always dispatched to the `'default'` Durable Object room **and** the specific `sessionId` room. This guarantees that whether the browser connects with a specific session ID or the default session, the visual update is never dropped.
- **Fast 200 OK Response:** The HTTP response returns to Oration in ~300ms, enabling the voice agent to begin speaking immediately without lag.

---

### PART C: `tool-backend/src/sessionRoom.js` (The Real-Time Durable Object)

`sessionRoom.js` provides persistent state in Cloudflare's serverless runtime. Since Cloudflare Workers are stateless, a **Durable Object** keeps HTTP SSE streams open indefinitely.

```javascript
export class SessionRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();   // Active WebSocket connections
    this.sseStreams = new Map(); // Active SSE stream controllers
  }

  async fetch(request) {
    const url = new URL(request.url);

    // Endpoint 1: /broadcast
    if (url.pathname === '/broadcast' && request.method === 'POST') {
      const payload = await request.text();
      const message = `data: ${payload}\n\n`;

      // Push down all open SSE streams
      this.sseStreams.forEach((controller) => {
        try { controller.enqueue(new TextEncoder().encode(message)); } 
        catch { /* client closed */ }
      });
      return new Response('ok');
    }

    // Endpoint 2: /stream (SSE Handshake)
    if (url.pathname === '/stream') {
      const streamId = crypto.randomUUID();
      const stream = new ReadableStream({
        start: (controller) => {
          this.sseStreams.set(streamId, controller);
          // Send initial connected comment
          controller.enqueue(new TextEncoder().encode(': sse connected\n\n'));
        },
        cancel: () => {
          this.sseStreams.delete(streamId);
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
}
```

**Functionality:**
- When the browser creates `new EventSource('/api/stream/default')`, `ReadableStream` holds the HTTP pipe open.
- When `/api/tool` calls `/broadcast`, the Durable Object loops through `this.sseStreams` and pushes `data: { ... }\n\n` into the open pipe.
- The browser catches this in `app.js` with zero polling.

---

### PART D: `tool-backend/server.js` (The Node.js Development Mirror)

For local development without Wrangler or Cloudflare credentials, `server.js` implements the exact same logic using Node.js and Express:
- Maintains an in-memory `activeClients = new Map()` storing active Express response objects (`res`).
- On `/api/stream/:sessionId`, sends `res.setHeader('Content-Type', 'text/event-stream')` and sets a 25-second keepalive interval (`res.write(': keepalive\n\n')`).
- On `handleToolCall(req, res)`, invokes the exact same `resolveToolRequest()` from `catalog.js` and loops through `activeClients.forEach(client => client.write(...))`.
- Serves the `frontend-page/` directory as static files so visiting `http://localhost:3000` loads the full UI immediately.

---

## 6. How to Test Any Scenario Right Now

1. **Via Browser UI:**
   - Open `http://localhost:3000`.
   - Click the **`⚡ Quick Triggers ▾`** dropdown button in the top right.
   - Click any pre-configured scenario (e.g. *"Chimneys Under ₹25k"*, *"Best Offers"*, *"Utensil Loading Guide"*, *"Heat Auto-Clean"*).
2. **Via Voice in the Left Pane:**
   - Click the microphone button in the left `<oration-widget>`.
   - Speak naturally in English or Hindi (e.g., *"Libra 60 और Libra 90 को compare करो"* or *"डिशवॉशर के बेस्ट ऑफर्स दिखाइए"*).
   - Watch the right pane update instantly!

