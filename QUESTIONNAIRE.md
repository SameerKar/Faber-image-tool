# Faber AI Visualizer: Master Questionnaire, Spoken Responses & Dynamic Screen Mapping Matrix

> **Document Version:** 2.0 (Comprehensive Production Release)  
> **Target System:** Faber Luxury Appliance Visualizer (Dual-Pane Voice & Visual Interface)  
> **Integration Endpoints:** `POST /api/tool` (Oration Webhook) & `GET /api/stream/:sessionId` (SSE Stream)  
> **Visualizer Viewport:** `http://localhost:3000/visualizer/index.html` & `http://localhost:8085/index.html`

---

## 1. Executive Summary & Dual-Pane Architecture

The **Faber Visualizer** is a dual-pane conversational AI application. While the customer speaks or types on the **Left Pane** (via Oration Voice AI or Web Chat), the **Right Pane** dynamically morphs with zero-reload transitions into rich interactive blueprints, comparison matrices, deal cards, and technical infographics.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  FABER LUXURY APPLIANCE VISUALIZER                      [ 🟢 Live Session: default ]  [ ⚡ Quick Triggers ▾ ] [ ⚙️ ]  │
├─────────────────────────────────────────────────────────┬──────────────────────────────────────────────────────────────┤
│               LEFT PANE: ORATION VOICE / CHAT           │                 RIGHT PANE: DYNAMIC VIEWPORT                 │
│                 (100% Full-Cover Height)                │             (Dynamic Real-Time Visual Component)             │
├─────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │ ┌──────────────────────────────────────────────────────────┐ │
│ │ Agent Header: "Faber Product Assistant"             │ │ │ [ Component Title Banner & Subtitle ]                    │ │
│ │                                                     │ │ │                                                          │ │
│ │ User: "डिशवॉशर में नमक कैसे डालते हैं?"             │ │ │ Dynamic Rendering of 1 of 18 Visual States:              │ │
│ │ Agent: "डिशवॉशर के बेस पर बने सॉल्ट चेंबर में      │ │ │ • "dishwasher-cleaning"  --> Salt & Care Blueprint       │ │
│ │         फनल लगाकर 1 से 1.5 किलो सॉल्ट डालें..."     │ │ │ • "chimney-installation" --> 4-Step Wall Mount Blueprint │ │
│ │                                                     │ │ │ • "dishwasher-loading"   --> Utensil Rack Blueprint      │ │
│ │ Audio Waveform: [ ▂ ▃ ▅ ▆ ▇ ▆ ▅ ▃ ▂   ▂ ▃ ▄ ▅ ▆ ▇ ] │ │ │ • "chimney-cleaning"    --> 4-Step Heat Auto-Clean Guide │ │
│ │ [ 🎤 Start Speaking ]               [ 📞 End Call ] │ │ │ • "comparison"           --> Side-by-Side Spec Matrix    │ │
│ └─────────────────────────────────────────────────────┘ │ └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 2. Master Screen Index: "What Opens for Which"

Below is the high-level mapping of every dynamic screen state supported by the system, its backend `componentType`, primary visual asset, and layout engine:

| # | Screen Name | `componentType` | Primary Visual Asset | Layout Engine & Key Interactive Features |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Chimney Installation Blueprint** | `chimney-installation` | `images/chimney_installation_hero.jpg` | 3-Column `.installation-guide-card`: 4-step auto-cycle (3.8s), radar pointer tags, wall prep & 65–75cm clearance. |
| **2** | **Chimney Cleaning & Auto-Clean** | `chimney-cleaning` | `images/clean_hero_diag.jpg` | 3-Column `.installation-guide-card`: 9-min heating coil, 1-min blower flush, stainless steel oil collector removal. |
| **3** | **Dishwasher Salt & Maintenance** | `dishwasher-cleaning` | `images/dw_clean_hero_diag.jpg` | 3-Column `.installation-guide-card`: Salt chamber funnel refill, rinse aid dial, 3-stage microfilter, 70°C descaling. |
| **4** | **Dishwasher Utensil Loading Guide** | `dishwasher-loading` | `images/dw_clean_hero_diag.jpg` | 3-Column `.installation-guide-card`: Lower rack 45° kadai/patila, upper rack cups/bowls, cutlery tray, spray arm check. |
| **5** | **Dishwasher USPs & 3D Wash Tech** | `dishwasher-usp` | `images/dw_usp_hero.jpg` | 4-Pillar Luxury Grid: 3D Triple Spray Arms, Dual Zone half-load, 70°C Intensive Sanitization, 14-Place Indian capacity. |
| **6** | **Inverter BLDC Motor Video Spotlight** | `bldc-motor` | `images/bldc_motor.mp4` | Cinematic Full-View Video: 1080p 3D motor cutaway loop, continuous playback, bottom-right Faber watermark logo overlay, clears old cards. |
| **7** | **Touch & Wave Gesture Controls** | `chimney-controls` | `images/libra_90_hero.jpg` | Motion Sensor Guide: Wave L-to-R (Power/Speed Up), Wave R-to-L (Speed Down/Off), capacitive touch button legend. |
| **8** | **Cross-Category Comparison** | `comparison` | Product cutouts (Libra 60 & FBID 14S) | Dual-Column Spec Matrix: Airflow vs Wash cycles, Dimensions, BLDC vs Hydro-Clean, struck MRP, and `Buy Now →` CTAs. |
| **9** | **Intra-Category 2-Model Comparison** | `comparison` | Product cutouts (e.g. Libra 60 vs 90) | Dual-Column Spec Matrix: Exact dimensions (600mm vs 900mm), cooktop match (2–4 vs 3–5 burners), prices & savings. |
| **10** | **Multi-Model 3/4-Model Comparison** | `comparison` | Up to 4 product cutouts | Multi-Column Smooth Scroll Matrix (`◄` `►` arrows): Compares all 3 Libra chimneys or 3-4 dishwashers simultaneously. |
| **11** | **Special Offers Comparison** | `comparison` | Discounted appliance cutouts | Side-by-side comparison triggered when customer says *"compare all models on offer"*. |
| **12** | **Budget & Price Ceiling Filter** | `products` | Product catalog images | Ranked Product Showcase Cards: Models strictly under price limit (e.g. <₹25k, <₹30k). Auto-marquee loop if multiple. |
| **13** | **Multi-Condition Targeted Filter** | `products` | Product catalog images | Multi-variable intersection (e.g. Filterless + On Offer + Under ₹25,000) with highlight badges. |
| **14** | **Single Model Studio Spotlight** | `products` | High-res transparent appliance PNG | Hero Studio Layout: Full technical specifications, dimension diagram, price breakdown, and warranty badges. |
| **15** | **Full 13-Appliance Showcase** | `products` | All 13 catalog image assets | Full Catalog Gallery: Marquee bottom-to-top auto-cycling or grid view with category filters (Chimneys & Dishwashers). |
| **16** | **Festive Deals & Offers Showcase** | `offers` | High-discount product assets | Celebratory Festive Banner (`EXCLUSIVE FESTIVE OFFERS`) in luxury red/gold accents with glowing discount badges. |
| **17** | **User Manual & Troubleshooting** | `manual` | Auto-clean & motor diagrams | 4-Phase Operational Timeline: Touch button ➔ 9-min coil heat ➔ 1-min blower drain ➔ oil collector tray wash & FAQ. |
| **18** | **Welcome Screen & Branding Reset** | `welcome` | Faber Logo & Omni Agent Logo | Emerald Green Morph Screen with enlarged Faber wordmark, Omni Agent logo, and quick starter pills. |

---

## 3. THE MASTER QUESTIONNAIRE & SCREEN MAPPING TABLE

This master table captures all real-world customer inquiries, phrasing variations across English, Hindi, and Hinglish, the exact spoken response given by the Faber AI voice agent, the backend tool payload, the rendered component, and the right-screen visual layout:

| # | Domain / Topic | What the User Might Ask (Phrasing Variations) | Agent's Spoken Voice Response | Backend Tool Payload (`POST /api/tool`) | Rendered Component (`componentType`) | What Screen Appears on the Right (Visual Layout & Assets) |
| :-: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Chimney Installation** | • *"चिमनी कैसे इनस्टॉल होती है?"*<br>• *"How to install Faber chimney?"*<br>• *"What is the mounting height above the gas stove?"*<br>• *"चिमनी लगाने का तरीका और हाइट बताइए"*<br>• *"Chimney ducting and bracket fitting guide"*<br>• *"Can I install chimney myself or need technician?"* | "फेबर चिमनी को गैस स्टोव से 65 से 75 सेंटीमीटर की ऊंचाई पर दीवार पर मजबूत ब्रैकेट से माउंट किया जाता है। इसमें 6-इंच का एंटी-वाइब्रेशन डक्ट पाइप बाहर की ओर निकाला जाता है। मैंने आपकी स्क्रीन पर 4-स्टेप इंस्टॉलेशन ब्लूप्रिंट लगा दिया है, जिसमें वॉल मार्किंग से लेकर पावर टेस्टिंग तक की पूरी प्रक्रिया दिखाई गई है।" | `{"action": "chimney_installation", "query": "installation"}` | `chimney-installation` | **Faber Chimney 4-Step Installation Blueprint**:<br>• Header with Faber wordmark & Auto-Cycle toggle.<br>• 4-step nav: Wall Prep ➔ Bracket ➔ Mount ➔ Duct.<br>• Left: Step 1 (Wall & Hole) & Step 2 (Fix Brackets).<br>• Center: `chimney_installation_hero.jpg` with 4 pulsing radar pointer tags.<br>• Right: Step 3 (Mount Chimney) & Step 4 (Power & Suction Test).<br>• Footer: 65–75 cm height spec & 1800-209-3484 support. |
| **2** | **Chimney Cleaning & Auto-Clean** | • *"चिमनी साफ कैसे करें?"*<br>• *"How does heat auto-clean work in Faber chimney?"*<br>• *"ऑटो क्लीन का क्या प्रोसेस है?"*<br>• *"How often should I clean the oil collector?"*<br>• *"ऑयल ट्रे कैसे निकालते हैं और साफ करते हैं?"*<br>• *"Do I need to wash filters in filterless chimney?"* | "फेबर की फिल्टरलेस चिमनी में थर्मल हीट ऑटो-क्लीन बटन दबाने पर 9 मिनट तक 80°C हीटिंग कॉइल जमी हुई चिकनाई को पिघलाती है। इसके बाद 1 मिनट तक ब्लोअर घूमकर सारा ऑयल पीछे स्टेनलेस स्टील ऑयल कलेक्टर में इकट्ठा कर देता है। आपको सिर्फ 15 से 20 दिन में ऑयल कलेक्टर को गुनगुने पानी से धोना होता है। स्क्रीन पर देखिए पूरा प्रोसेस।" | `{"action": "chimney_cleaning", "query": "chimney clean"}` | `chimney-cleaning` | **Cleaning & Maintenance Blueprint (`.installation-guide-card`)**:<br>• Header: "Cleaning & Maintenance of the Chimney".<br>• 4-step nav: Surface Care ➔ 9-Min Thermal ➔ Centrifuge ➔ Oil Collector.<br>• Left: Step 01 (Glass/Matte Care) & Step 02 (9-Min Thermal Melting).<br>• Center: `clean_hero_diag.jpg` with interactive pointer tags.<br>• Right: Step 03 (1-Min Fan Flush) & Step 04 (SS Oil Tray Empty & Wash).<br>• Footer: 15-day cleaning rule & Faber care hotline. |
| **3** | **Dishwasher Salt & Maintenance** | • *"डिशवॉशर में नमक (Salt) कैसे और कहाँ डालते हैं?"*<br>• *"Why do glasses get white marks in dishwasher?"*<br>• *"Rinse aid dispenser का क्या काम है?"*<br>• *"How to clean dishwasher filter?"*<br>• *"डिशवॉशर की सर्विस और मेंटेनेंस कैसे होती है?"*<br>• *"Dishwasher salt and descaling process"* | "भारतीय पानी में हार्डनेस के कारण बर्तनों पर सफेद दाग न पड़ें, इसके लिए डिशवॉशर के बेस पर बने सॉल्ट चेंबर में फनल की मदद से 1 से 1.5 किलो रीजेनरेटिंग सॉल्ट भरा जाता है। दरवाजे पर रिंस एड भरने से बर्तन बिना किसी धब्बे के पूरी तरह सूखते हैं। मैंने आपकी स्क्रीन पर सॉल्ट, रिंस एड, 3-स्टेज फिल्टर और 70°C डीस्केलिंग का पूरा ब्लूप्रिंट लगा दिया है।" | `{"action": "dishwasher_cleaning", "query": "dishwasher salt"}` | `dishwasher-cleaning` | **Dishwasher Maintenance & Care Blueprint**:<br>• Header: "Maintenance & Care of the Dishwasher".<br>• 4-step nav: Salt Softener ➔ Rinse Aid ➔ Microfilter ➔ 70°C Descaling.<br>• Left: Step 01 (`dw_clean_step1_salt.jpg`) & Step 02 (`dw_clean_step2_rinseaid.jpg`).<br>• Center: `dw_clean_hero_diag.jpg` cutaway diagram with 4 labeled pointer tags (A to F).<br>• Right: Step 03 (`dw_clean_step3_filter.jpg`) & Step 04 (`dw_clean_step4_descale.jpg`).<br>• Footer: Hard water warning & foam detergent prohibition. |
| **4** | **Dishwasher Utensil Loading** | • *"डिशवॉशर में बर्तन कैसे लोड करें?"*<br>• *"How to load heavy Indian cookware in Faber dishwasher?"*<br>• *"कड़ाही और पतीला कहाँ रखना चाहिए?"*<br>• *"Can we put pressure cooker and thalis in dishwasher?"*<br>• *"चम्मच और कांटे कहाँ रखें?"*<br>• *"बर्तन रखते वक्त क्या ध्यान रखना है?"* | "फेबर डिशवॉशर में भारी भारतीय बर्तन जैसे कड़ाही, पतीला और प्रेशर कुकर हमेशा नीचे वाले बास्केट में 45 डिग्री के कोण पर उल्टे रखे जाते हैं ताकि नीचे के स्प्रे आर्म से सीधा पानी लगे। ऊपर की बास्केट में चाय के कप और कटोरियां रखी जाती हैं। चम्मच कटलरी ट्रे में रखे जाते हैं। बर्तन लोड करने के बाद स्प्रे आर्म को हाथ से घुमाकर चेक करें कि वह कहीं अटक तो नहीं रहा। स्क्रीन पर देखिए।" | `{"action": "dishwasher_loading", "query": "how to load dishwasher"}` | `dishwasher-loading` | **Dishwasher Utensil Loading Blueprint**:<br>• Header: "How to Load a Faber Dishwasher".<br>• 4-step nav: Lower Basket ➔ Upper Basket ➔ Cutlery Tray ➔ Pre-Flight Checks.<br>• Left: Step 01 (Lower Basket 45° kadai/patila) & Step 02 (Upper Basket glassware/bowls).<br>• Center: `dw_clean_hero_diag.jpg` with loading target callouts.<br>• Right: Step 03 (Cutlery Tray alternating) & Step 04 (Spray Arm clearance check).<br>• Footer: Food scraping rule & detergent dosing advice. |
| **5** | **Dishwasher USPs & 3D Wash** | • *"फेबर डिशवॉशर की क्या खासियत है?"*<br>• *"What are the unique features / USPs of Faber dishwashers?"*<br>• *"Why should I choose Faber over Bosch or IFB?"*<br>• *"3D Wash Technology क्या होती है?"*<br>• *"What is Dual Zone wash?"*<br>• *"Does it kill bacteria on baby bottles and utensils?"* | "फेबर डिशवॉशर की सबसे बड़ी खासियत है 3D ट्रिपल स्प्रे आर्म्स जो 360 डिग्री से पानी फेंककर कड़ाही के जले हुए तेल और हल्दी के दाग साफ करते हैं। इसमें डुअल ज़ोन वॉश है जिससे आप सिर्फ ऊपर या नीचे की बास्केट चलाकर 40% पानी और बिजली बचा सकते हैं। साथ ही 70°C का इंटेंसिव हाइजीन वॉश 99.9% बैक्टीरिया को खत्म करता है। स्क्रीन पर इसके चारों मुख्य फीचर्स देखिए।" | `{"action": "dishwasher_usp", "query": "dishwasher features"}` | `dishwasher-usp` | **Dishwasher 4-Pillar Luxury USP Grid (`.dishwasher-usp-card`)**:<br>• Pillar 1: 3D Hydro-Clean Spray Arms (360° deep grease cutting).<br>• Pillar 2: Dual Zone Half-Load Wash (Save 40% water/energy).<br>• Pillar 3: 70°C Intensive Hygiene Wash (Sanitizes baby bottles & oily thalis).<br>• Pillar 4: 14-Place Indian Cookware Capacity (100+ utensils per load).<br>• Hero image: `images/dw_usp_hero.jpg` with gold badge. |
| **6** | **Inverter BLDC Motor Technology** | • *"BLDC मोटर वाली चिमनी के क्या फायदे हैं?"*<br>• *"What is BLDC inverter motor technology in Faber chimneys?"*<br>• *"What does BLDC mean / what does BLDC do?"*<br>• *"How much electricity does a BLDC chimney consume?"*<br>• *"चिमनी में कितना शोर (Noise) होता है?"*<br>• *"Why is BLDC motor backed by a 12-year warranty?"*<br>• *"Normal motor vs BLDC motor difference"* | "फेबर का इन्वर्टर BLDC मोटर केवल 150 वॉट बिजली की खपत करता है, जो सामान्य चिमनी की तुलना में 50% बिजली बचाता है। यह सिर्फ 44 से 46 डेसिबल पर बेहद शांत चलता है। कार्बन ब्रश न होने के कारण यह गर्म नहीं होता और इस पर 12 साल की मोटर वारंटी दी जाती है। स्क्रीन पर देखिए इसका 3D एनिमेशन वीडियो।" | `{"action": "bldc_motor", "query": "what is bldc motor"}` | `bldc-motor` | **BLDC Inverter Motor Looping Video (`.bldc-video-stage`)**:<br>• Full-bleed 1080p 3D motor cutaway animation playing in a continuous loop.<br>• Official Faber logo watermark overlay pinned to the bottom-right corner.<br>• Clears previous cards/content and focuses on pure visual storytelling.<br>• Discrèete audio toggle button in the top corner. |
| **7** | **Touch & Wave Gesture Controls** | • *"जेस्चर कंट्रोल कैसे काम करता है?"*<br>• *"How to operate Faber chimney hands-free with wave gestures?"*<br>• *"How to increase and decrease speed by waving hand?"*<br>• *"टच पैनल पर कौन-कौन से बटन हैं?"*<br>• *"Can I use gesture control with oily or wet hands?"*<br>• *"चिमनी का मोशन सेंसर कैसे यूज़ करें?"* | "फेबर लिब्रा चिमनी में मोशन जेस्चर सेंसर दिया गया है। जब आपके हाथ तेल या आटे से सने हों, तो बिना ग्लास को छुए बाएं से दाएं हाथ हिलाने पर चिमनी ऑन हो जाती है और स्पीड 1 से 9 तक बढ़ती है। दाएं से बाएं हाथ हिलाने पर स्पीड कम होती है और चिमनी बंद हो जाती है। इसके अलावा टच पैनल पर ऑटो-क्लीन और एलईडी लाइट के अलग बटन हैं। स्क्रीन पर इसका गाइड देखिए।" | `{"action": "chimney_controls", "query": "gesture control"}` | `chimney-controls` | **Touch & Wave Gesture System Guide (`.chimney-controls-card`)**:<br>• Animated Motion Wave Visual: Wave L-to-R (Turn ON / Speed 1–9) & Wave R-to-L (Speed Down / Power OFF).<br>• Capacitive Touch Panel Legend: Power, Speed 1-9, LED Light, and Thermal Auto-Clean button map.<br>• Glass touch responsiveness & zero-smudge warranty highlights. |
| **8** | **Cross-Category Comparison (Chimney vs. Dishwasher)** | • *"चिमनी और डिशवॉशर का डिफरेंस दिखाइए"*<br>• *"Show me the difference between chimney and dishwasher"*<br>• *"दोनों में क्या फर्क है, इमेज दिखाओ"*<br>• *"Compare chimney with dishwasher"*<br>• *"चिमनी और डिशवॉशर दोनों का कंपैरिजन स्क्रीन पर लगाओ"* | "चिमनी आपके किचन के धुएं, तेल और गंध को बाहर निकालकर हवा साफ रखती है, जबकि डिशवॉशर गंदे और चिकने बर्तनों को 70°C गर्म पानी में 99.9% कीटाणुरहित धोता है। मैंने स्क्रीन पर फेबर लिब्रा 60cm BLDC चिमनी (₹21,330) और 14-प्लेस बिल्ट-इन डिशवॉशर (₹63,901) का साइड-बाय-साइड कंपैरिजन लगा दिया है।" | `{"action": "compare", "category": "both", "products": "chimney, dishwasher"}` | `comparison` | **Dual-Column Cross-Category Matrix**:<br>• Left: Faber Libra BLDC 60 cm (₹21,330, MRP ₹32,490, 34% Off).<br>• Right: Faber FBID 8PR 14S Dishwasher (₹63,901, MRP ₹70,990, 10% Off).<br>• Spec Rows: Function (Air vs Dishes), Suction vs Capacity (1500 m³/hr vs 14 Place), Motor (BLDC 150W vs Hydro-Wash), Warranty (12 Yrs vs 10 Yrs), and individual `Buy Now →` CTAs. |
| **9** | **Intra-Category 2-Model Comparison** | • *"Libra 60 और Libra 90 को compare करो"*<br>• *"Compare Libra 60 and Libra 75"*<br>• *"Compare FFSD 6PR 12S Neo and FFSD 7PR 14S"*<br>• *"Built-in aur freestanding dishwasher mein kya farak hai"*<br>• *"12 place aur 14 place mein kya antar hai"* | "लिब्रा 60 और लिब्रा 90 दोनों में 1500 m³/hr का सक्शन, 150 वॉट BLDC मोटर और 9-स्पीड जेस्चर कंट्रोल समान हैं। मुख्य अंतर चौड़ाई का है: लिब्रा 60 2 से 4 बर्नर वाले चूल्हे के लिए ₹21,330 में आती है, जबकि लिब्रा 90 बड़े 3 से 5 बर्नर वाले चूल्हे के लिए ₹25,790 में आती है। स्क्रीन पर दोनों की विस्तृत तुलना देखिए।" | `{"action": "compare", "category": "chimney", "products": "Libra 60, Libra 90"}` | `comparison` | **Side-by-Side Dual-Model Comparison Matrix**:<br>• Column 1: Faber Libra BLDC 60 cm (600 mm width, ₹21,330, Save ₹11,160).<br>• Column 2: Faber Libra BLDC 90 cm (900 mm width, ₹25,790, Save ₹13,200).<br>• Rows: Dimensions, Cooktop Match, Price, MRP, Savings, Noise (44-46 dB), Warranty, and `Buy Now →` CTA buttons. |
| **10** | **Multi-Model 3-Chimney Comparison** | • *"तीनों चिमनी कंपेयर करें"*<br>• *"Compare all 3 Libra chimneys"*<br>• *"तीनों चिमनी का कंपैरिजन दिखाओ"*<br>• *"Compare Libra 60, 75 and 90"* | "फेबर लिब्रा BLDC सीरीज में 60cm, 75cm और 90cm के तीन मॉडल आते हैं। तीनों में 1500 m³/hr सक्शन, 44dB नॉइज़ और 12 साल की मोटर वारंटी समान है। 60cm की कीमत ₹21,330, 75cm की ₹23,118 और 90cm की ₹25,790 है। मैंने तीनों मॉडल्स का साइड-बाय-साइड स्पेक मैट्रिक्स आपकी स्क्रीन पर लगा दिया है।" | `{"action": "compare", "category": "chimney", "products": "all chimney"}` | `comparison` | **3-Column Spec Comparison Matrix**:<br>• Columns: Libra 60 cm, Libra 75 cm, Libra 90 cm side-by-side.<br>• Struck MRPs, deal prices, dimensions (600, 750, 900 mm), and checkmarks (`✓ Suction: 1500 m³/hr`, `✓ Motor: 150W BLDC`, `✓ 9 Speeds`).<br>• Smooth horizontal scroll arrows (`◄` `►`). |
| **11** | **Multi-Model Dishwasher Comparison** | • *"तीनों डिशवॉशर कंपेयर कर दीजिए"*<br>• *"Compare Faber 12S and 14S dishwashers"*<br>• *"Compare freestanding and built-in dishwashers"*<br>• *"Show dishwasher comparison matrix"* | "स्क्रीन पर फेबर के तीनों प्रमुख डिशवॉशर की तुलना देखिए: 12-प्लेस Neo Black (₹28,990) 3-4 सदस्यों के परिवार के लिए परफेक्ट है। 14-प्लेस Black (₹43,990) बड़े परिवारों और 3D वॉश के साथ आता है, और 14-प्लेस बिल्ट-इन (₹63,901) मॉड्यूलर किचन कैबिनेट्स के साथ पूरी तरह सीमलेस फिट होता है।" | `{"action": "compare", "category": "dishwasher", "products": "12S Neo, 14S Black, 14S Built-in"}` | `comparison` | **3-Column Dishwasher Comparison Matrix**:<br>• Columns: FFSD 6PR 12S Neo (₹28,990), FFSD 7PR 14S BK (₹43,990), FBID 8PR 14S (₹63,901).<br>• Rows: Place Settings (12 vs 14 vs 14), Wash Programs (6 vs 7 vs 8), Noise Rating (49 dB vs 44 dB), Drying Tech, Water Usage (10L vs 9L), and Warranty. |
| **12** | **Budget Filter (Chimneys Under ₹25,000)** | • *"25,000 के अंदर चिमनी दिखाइए"*<br>• *"Chimneys under 25k"*<br>• *"Chimneys below 25000"*<br>• *"25000 ke budget mein kaun si chimney aayegi?"* | "₹25,000 के बजट में फेबर के दो प्रीमियम BLDC मॉडल्स उपलब्ध हैं: लिब्रा 60cm ₹21,330 में (जिसपर ₹11,160 की बचत है) और लिब्रा 75cm ₹23,118 में (जिसपर ₹11,872 की बचत है)। दोनों में 1500 m³/hr का सक्शन और 12 साल की मोटर वारंटी मिलती है। स्क्रीन पर देखिए कार्ड्स।" | `{"action": "filter_by_price", "category": "chimney", "max_price": 25000}` | `products` | **Ranked Product Cards Showcase (Under ₹25k)**:<br>• Card 1: Faber Libra BLDC 60 cm (₹21,330 • 34% Off • Save ₹11,160).<br>• Card 2: Faber Libra BLDC 75 cm (₹23,118 • 34% Off • Save ₹11,872).<br>• Feature pills: `1500 m³/hr`, `BLDC Inverter`, `Touch & Gesture`, `12-Yr Warranty`.<br>• Auto-marquee upward motion with pause-on-hover. |
| **13** | **Budget Filter (Dishwashers Under ₹30,000)** | • *"30,000 के अंदर डिशवॉशर दिखाइए"*<br>• *"Dishwashers below 30k"*<br>• *"Dishwashers under 30000"*<br>• *"Kam budget ka dishwasher dikhao"* | "₹30,000 के अंदर फेबर के तीन डिशवॉशर उपलब्ध हैं: Ace 8S Black ₹23,990 में, Ace 8S Inox ₹24,990 में, और 12-प्लेस Neo Black ₹28,990 में। ये सभी मॉडल भारतीय बर्तनों की धुलाई के लिए पूरी तरह उपयुक्त हैं। स्क्रीन पर इनके कार्ड्स लगा दिए गए हैं।" | `{"action": "filter_by_price", "category": "dishwasher", "max_price": 30000}` | `products` | **Ranked Product Cards Showcase (Under ₹30k)**:<br>• Card 1: Faber FFSD 6PR 8S Ace BK (₹23,990 • 40% Off).<br>• Card 2: Faber FFSD 6PR 8S Ace Inox (₹24,990 • 40% Off).<br>• Card 3: Faber FFSD 6PR 12S Neo BK (₹28,990 • 33% Off).<br>• Direct `Try Visualizer →` and `Buy Now →` action buttons. |
| **14** | **Combined Category Budget Filter** | • *"30,000 के अंदर डिशवॉशर और चिमनी दिखाइए"*<br>• *"Show chimneys and dishwashers under 30k"*<br>• *"30000 mein dono appliance dikhao"*<br>• *"What chimneys and dishwashers come under 30000?"* | "₹30,000 के अंदर आपको फेबर लिब्रा 60cm और 75cm चिमनी मिल जाएगी, और डिशवॉशर में 8-प्लेस Ace और 12-प्लेस Neo मॉडल उपलब्ध हैं। स्क्रीन पर देखिए दोनों कैटेगरी के 5 मॉडल्स, जिनपर 40% तक की छूट मिल रही है।" | `{"action": "filter_by_price", "category": "both", "max_price": 30000}` | `products` | **Combined Multi-Category Showcase Grid**:<br>• Subtitle: "Found 5 models (2 chimneys, 3 dishwashers) under ₹30,000".<br>• Chimneys: Libra 60 (₹21,330), Libra 75 (₹23,118).<br>• Dishwashers: Ace 8S (₹23,990), Ace 8S Inox (₹24,990), Neo 12S (₹28,990).<br>• Marquee loop displaying models sequentially bottom-to-top. |
| **15** | **Smart Budget Guidance (Under ₹20,000)** | • *"20,000 के अंदर चिमनी या डिशवॉशर दिखाओ"*<br>• *"Appliances under 15k"*<br>• *"Can I get a chimney below 20000?"*<br>• *"15000 budget mein kya milega?"* | "फेबर की इनवर्टर BLDC चिमनी ₹21,330 से और डिशवॉशर ₹23,990 से शुरू होते हैं। ₹20,000 से कम में कोई मॉडल उपलब्ध नहीं है, लेकिन मैंने स्क्रीन पर फेबर के सबसे नजदीकी एंट्री-लेवल मॉडल्स लगा दिए हैं, जिनपर 34% से अधिक की बचत है।" | `{"action": "filter_by_price", "max_price": 20000}` | `products` | **Smart Budget Guidance Layout**:<br>• Subtitle: "No appliances found under ₹20,000. Faber BLDC models start from ₹21,330:".<br>• Suggested Entry Models: Libra BLDC 60 (₹21,330) & Ace 8S Dishwasher (₹23,990).<br>• High-visibility discount badges and feature highlights. |
| **16** | **Multi-Condition Filter (Filterless + Sale + Budget)** | • *"25,000 के अंदर जो फ़िल्टरलेस चिमनी सेल में हैं वो दिखाओ"*<br>• *"Filterless chimney on offer under 25k"*<br>• *"Discounted auto-clean chimney under 25000"* | "₹25,000 के बजट में सेल पर उपलब्ध फिल्टरलेस ऑटो-क्लीन चिमनी में फेबर लिब्रा 60cm सबसे बेहतरीन विकल्प है। ₹32,490 की एमआरपी वाली यह चिमनी 34% छूट के साथ मात्र ₹21,330 में मिल रही है। स्क्रीन पर देखिए इसकी पूरी डिटेल।" | `{"action": "filter_by_price", "category": "chimney", "filter": "filterless", "is_offer": true, "max_price": 25000}` | `products` | **Multi-Condition Filtered Grid**:<br>• Card: Faber Libra BLDC 60 cm with `FESTIVE OFFER` badge & `Filterless` tag.<br>• Struck MRP ₹32,490, Deal Price ₹21,330, Savings ₹11,160.<br>• Thermal Auto-Clean & 1500 m³/hr suction callouts. |
| **17** | **Special Offers & Discounts (Dishwasher)** | • *"डिशवॉशर के क्या ऑफर हैं?"*<br>• *"Show me dishwasher festive offers"*<br>• *"डिशवॉशर पर क्या डिस्काउंट चल रहा है?"*<br>• *"Best deals on Faber dishwasher"* | "डिशवॉशर पर इस समय 34% तक की स्पेशल छूट चल रही है। 14-प्लेस 7PR डिशवॉशर पर ₹14,000 की सीधी बचत है और 12-प्लेस मॉडल ₹28,990 में मिल रहा है। स्क्रीन पर देखिए फेस्टिव ऑफर्स का स्पेशल बैनर और डिस्काउंटेड मॉडल्स।" | `{"action": "show_offers", "category": "dishwasher"}` | `offers` | **Festive Celebration Banner & Deal Cards (`.offers-view`)**:<br>• Luxury Gold/Red Banner: `• FESTIVE CELEBRATIONS • EXCLUSIVE FESTIVE OFFERS`.<br>• Filtered strictly to dishwashers with `34% OFF` glowing Faber Red badges.<br>• Savings breakdown (e.g. Save ₹14,000) and `Claim Offer →` CTAs. |
| **18** | **Special Offers & Discounts (Chimney)** | • *"चिमनी पर क्या छूट या डिस्काउंट चल रहा है?"*<br>• *"Show chimney offers"*<br>• *"What is the best offer on Faber chimney?"*<br>• *"फेबर चिमनी पर क्या बचत होगी?"* | "फेबर लिब्रा BLDC चिमनी सीरीज के तीनों मॉडल्स पर फ्लैट 34% की छूट दी जा रही है। 60cm पर ₹11,160, 75cm पर ₹11,872 और 90cm पर ₹13,200 की भारी बचत है। स्क्रीन पर फेस्टिव ऑफर्स के तहत तीनों मॉडल्स लाइव हैं।" | `{"action": "show_offers", "category": "chimney"}` | `offers` | **Chimney Festive Offers Showcase**:<br>• Banner: `• FESTIVE CELEBRATIONS • EXCLUSIVE FESTIVE OFFERS`.<br>• Cards: Libra 60, Libra 75, and Libra 90 sorted by largest savings.<br>• Bold savings callouts: `Save ₹13,200 on Libra 90`. |
| **19** | **Compare Discounted Offers** | • *"जो जो ऑफर में हैं उनको कंपेयर कर दीजिए"*<br>• *"Compare all models currently on offer"*<br>• *"ऑफर वाले प्रोडक्ट्स कंपेयर करो"* | "बिल्कुल, मैंने फेस्टिव सेल में 34% तक की छूट पर चल रहे सभी प्रमुख मॉडल्स का साइड-बाय-साइड कंपैरिजन स्क्रीन पर लगा दिया है, ताकि आप कीमत और फीचर्स की आसानी से तुलना कर सकें।" | `{"action": "show_offers", "compare": true, "query": "जो जो ऑफर में हैं उनको कंपेयर कर दीजिए"}` | `comparison` | **Promotional Deals Comparison Matrix**:<br>• Subtitle: "Comparing models with recorded promotional discounts up to 34% off".<br>• Side-by-side spec comparison of only the discounted appliances with prices and savings. |
| **20** | **Exact Product Lookup (Libra 60)** | • *"Show Faber Libra BLDC 60 cm"*<br>• *"Faber Libra 60 दिखाओ"*<br>• *"Tell me about Libra 60 chimney"* | "फेबर लिब्रा 60cm एक कर्व्ड ग्लास वॉल-माउंटेड चिमनी है। इसमें 1500 m³/hr का सक्शन, 150 वॉट का इन्वर्टर BLDC मोटर, 44dB शांत साउंड, 9-स्पीड जेस्चर कंट्रोल और 12 साल की मोटर वारंटी मिलती है। इसकी डिस्काउंटेड कीमत ₹21,330 है। स्क्रीन पर देखिए इसका स्टूडियो व्यू।" | `{"action": "show_products", "products": ["Faber Libra BLDC 60 cm"]}` | `products` | **Studio Hero Layout (Libra 60)**:<br>• Centered massive appliance cutout with shadow pedestal.<br>• Kicker: `FABER LUXURY COOKER HOOD`.<br>• Price: ₹21,330 (MRP ₹32,490 • Save ₹11,160).<br>• Specs: 1500 m³/hr, 150W BLDC, 44–46 dB, 9 Speeds, 12-Year Warranty. |
| **21** | **Exact Product Lookup (Libra 90)** | • *"Show me Faber Libra BLDC 90"*<br>• *"Libra 90 cm chimney dikhao"*<br>• *"90 cm chimney details"* | "फेबर लिब्रा 90cm बड़े 3 से 5 बर्नर वाले गैस स्टोव के लिए सबसे बेहतरीन चिमनी है। 900mm चौड़ाई, 1500 m³/hr सक्शन, 9-स्पीड मोशन जेस्चर और हीट ऑटो-क्लीन के साथ यह ₹25,790 में उपलब्ध है। स्क्रीन पर देखिए इसकी स्पेसिफिकेशन्स।" | `{"action": "show_products", "products": ["Faber Libra BLDC 90 cm"]}` | `products` | **Studio Hero Layout (Libra 90)**:<br>• Wide 900 mm curved glass cutout image.<br>• Price: ₹25,790 (MRP ₹38,990 • Save ₹13,200 • 34% Off).<br>• Full technical breakdown for large modular kitchens. |
| **22** | **Exact Product Lookup (FFSD 12S Neo)** | • *"Faber FFSD 6PR 12S Neo Black दिखाओ"*<br>• *"Show me 12 place neo black dishwasher"*<br>• *"Tell me about FFSD 6PR 12S"* | "फेबर का FFSD 6PR 12S नियो ब्लैक एक 12-प्लेस फ्रीस्टैंडिंग डिशवॉशर है। इसमें 6 वॉश प्रोग्राम, हार्ड वाटर सॉफ़्नर और नेचुरल ड्राइंग तकनीक मिलती है। इसकी कीमत ₹28,990 है। स्क्रीन पर इसका पूरा विवरण देखिए।" | `{"action": "show_products", "products": ["FFSD 6PR 12S NEO BK"]}` | `products` | **Studio Hero Layout (FFSD 12S Neo)**:<br>• Obsidian Black front cutout.<br>• Price: ₹28,990 (MRP ₹42,990 • Save ₹14,000 • 33% Off).<br>• Specs: 12 Place, 6 Programs, Natural Drying, A++ Energy Rating. |
| **23** | **Exact Product Lookup (FBID 14S Built-in)** | • *"Show Faber FBID 8PR 14S built-in dishwasher"*<br>• *"बिल्ट-इन डिशवॉशर दिखाइए"*<br>• *"Fully integrated dishwasher details"* | "फेबर का FBID 8PR 14S पूरी तरह से इंटीग्रेटेड बिल्ट-इन डिशवॉशर है जो आपके मॉड्यूलर किचन की कैबिनेट्स के अंदर सीमलेस छुप जाता है। इसमें 14 प्लेस सेटिंग्स, 8 वॉश प्रोग्राम और डुअल ज़ोन वॉश मिलता है। इसकी कीमत ₹63,901 है। स्क्रीन पर देखिए।" | `{"action": "show_products", "products": ["FBID 8PR 14S"]}` | `products` | **Studio Hero Layout (FBID 14S Built-in)**:<br>• Luxury built-in dishwasher with hidden top controls.<br>• Price: ₹63,901 (MRP ₹70,990 • Save ₹7,089).<br>• Specs: 14 Place Settings, 8 Programs, 44 dB Sound, Dual Zone. |
| **24** | **Full Catalog Overview (All Appliances)** | • *"सब प्रोडक्ट दिखाइए"*<br>• *"Show all appliances in catalog"*<br>• *"What all chimneys and dishwashers do you sell?"*<br>• *"पूरा कैटलॉग दिखाओ"* | "स्क्रीन पर फेबर के सभी 13 प्रमाणित प्रोडक्ट्स लाइव हैं: 3 इनवर्टर BLDC चिमनी और 10 प्रीमियम डिशवॉशर। आप किसी भी प्रोडक्ट पर क्लिक करके उसकी पूरी जानकारी देख सकते हैं।" | `{"action": "show_all", "query": "सब प्रोडक्ट दिखाइए"}` | `products` | **Comprehensive 13-Appliance Showcase Grid**:<br>• Header: "Faber Appliances (13 Models)".<br>• Smooth marquee bottom-to-top auto-cycling showing all models.<br>• Filter tabs: All (13), Chimneys (3), Dishwashers (10). |
| **25** | **User Manual & General Troubleshooting** | • *"Faber user manual open karo"*<br>• *"Chimney weak suction troubleshoot kaise karein?"*<br>• *"What to do if chimney makes vibrating noise?"*<br>• *"चिमनी का यूजर मैनुअल और ट्रबलशूटिंग गाइड दिखाइए"* | "फेबर यूजर मैनुअल और ट्रबलशूटिंग गाइड मैंने आपकी स्क्रीन पर खोल दिया है। कमजोर सक्शन के लिए डक्ट पाइप का 6-इंच व्यास और बेंड्स चेक करें, तथा कंपन की आवाज कम करने के लिए वॉल ब्रैकेट के रबर पैड्स की जांच करें। स्क्रीन पर 4-फेज मेंटेनेंस टाइमलाइन देखिए।" | `{"action": "show_manual", "query": "manual"}` | `manual` | **4-Phase Operational Manual & Troubleshooting Timeline (`.manual-view`)**:<br>• Phase 1: Touch Auto-Clean activation.<br>• Phase 2: 9-Min Thermal heating coil grease liquification.<br>• Phase 3: 1-Min Centrifugal high-speed fan drain.<br>• Phase 4: Stainless steel oil collector tray removal & maintenance.<br>• Troubleshooting matrix for suction, noise, and gesture sensor. |
| **26** | **Welcome / Start New Session** | • *"Reset screen"*<br>• *"Start new session"*<br>• *"What can you help me with?"*<br>• *"नमस्ते, आप क्या कर सकते हैं?"* | "नमस्ते! मैं आपका फेबर लक्ज़री अप्लायंस असिस्टेंट हूँ। मैं आपको चिमनी और डिशवॉशर की विस्तृत तुलना, इंस्टॉलेशन और क्लीनिंग ब्लूप्रिंट्स, बर्तन लोड करने के तरीके और लाइव डिस्काउंट ऑफर्स दिखा सकता हूँ। आप किस प्रोडक्ट के बारे में जानना चाहते हैं?" | `{"action": "welcome", "componentType": "welcome"}` | `welcome` | **Emerald Luxury Welcome Screen (`.welcome-screen`)**:<br>• Emerald green accent background with smooth morph transition.<br>• Faber Wordmark & Omni Agent Logo.<br>• Tagline: "Luxury Appliance Assistant & Real-Time Product Visualizer".<br>• Interactive Quick Starter Prompt Pills. |

---

## 4. In-Depth Questionnaire Deep-Dive by Component Domain

This section provides an exhaustive reference of customer dialogues, technical questions, customer objections, and screen behaviors across each component domain:

---

### Domain 1: Chimney Installation & Ducting (`chimney-installation`)

#### Common Customer Questions:
1. **"चिमनी को गैस चूल्हे से कितनी ऊंचाई पर लगाना चाहिए?"**
   - **Voice Agent Answer:** *"फेबर चिमनी की आदर्श इंस्टॉलेशन ऊंचाई गैस स्टोव के बर्नर से 65 से 75 सेंटीमीटर (लगभग 26 से 30 इंच) होनी चाहिए। अगर आप इंडक्शन या इलेक्ट्रिक हॉब का उपयोग कर रहे हैं, तो इसे 55 से 65 सेंटीमीटर पर भी लगाया जा सकता है। इससे सक्शन क्षमता अधिकतम रहती है और आग लगने का कोई खतरा नहीं रहता।"*
   - **Screen Action:** The right screen highlights **Step 01 (Wall Preparation)** and the bottom mounting spec card showing `65–75 cm Height Clearance`.

2. **"क्या चिमनी के लिए दीवार में छेद (Duct Hole) होना जरूरी है?"**
   - **Voice Agent Answer:** *"जी हाँ, सबसे अच्छे सक्शन और धुआं बाहर निकालने के लिए 6-इंच (150 mm) व्यास का डक्ट पाइप बाहर निकालना सबसे सही रहता है। हालांकि फेबर लिब्रा चिमनी डक्टेड और डक्टलेस (कार्बन फिल्टर के साथ रीसर्क्युलेशन) दोनों मोड में काम कर सकती है।"*
   - **Screen Action:** Radar pointer tag #2 pulses on the duct opening of `chimney_installation_hero.jpg`.

3. **"क्या मैं खुद चिमनी लगा सकता हूँ या तकनीशियन की जरूरत होगी?"**
   - **Voice Agent Answer:** *"फेबर हमेशा अधिकृत तकनीशियन से ही इंस्टॉलेशन कराने की सलाह देता है ताकि दीवार में ब्रैकेट सही लेवल पर लगे और 12 साल की मोटर वारंटी सुरक्षित रहे। फेबर हेल्पलाइन नंबर 1800-209-3484 पर कॉल करके आप इंस्टॉलेशन बुक कर सकते हैं।"*
   - **Screen Action:** Displays the Faber Authorized Care hotline card in the footer.

---

### Domain 2: Chimney Cleaning & Heat Auto-Clean Maintenance (`chimney-cleaning`)

#### Common Customer Questions:
1. **"हीट ऑटो-क्लीन कैसे काम करता है और इसमें कितना समय लगता है?"**
   - **Voice Agent Answer:** *"हीट ऑटो-क्लीन प्रक्रिया में कुल 10 मिनट का समय लगता है। पहले 9 मिनट तक इंटरनल थर्मल हीटिंग कॉइल मोटर के चारों ओर जमी हुई चिपचिपी चिकनाई और तेल को पिघलाती है। इसके बाद अंतिम 1 मिनट में ब्लोअर फैन हाई स्पीड पर घूमकर सारा पिघला हुआ तेल पीछे लगे स्टेनलेस स्टील कलेक्टर में गिरा देता है।"*
   - **Screen Action:** Step 02 (9-Min Thermal Melting) and Step 03 (1-Min Fan Flush) are highlighted sequentially on `clean_hero_diag.jpg`.

2. **"क्या फिल्टरलेस चिमनी में कभी कोई फिल्टर धोना नहीं पड़ता?"**
   - **Voice Agent Answer:** *"बिल्कुल, फिल्टरलेस तकनीक का मतलब है कि इसमें कोई मेश या बैफल फिल्टर नहीं होता जिसे बार-बार निकालकर साबुन से रगड़ना पड़े। सारा तेल सीधे इंटरनल ड्रेन से ऑयल कलेक्टर में इकट्ठा होता है, जिससे आपका समय और मेहनत दोनों बचते हैं।"*
   - **Screen Action:** Displays the filterless benefits callout on the right screen.

3. **"ऑयल कलेक्टर ट्रे को कितने दिन में खाली करना चाहिए?"**
   - **Voice Agent Answer:** *"भारतीय कुकिंग में अगर रोजाना तेल-मसाले का इस्तेमाल होता है, तो ऑयल कलेक्टर ट्रे को हर 15 से 20 दिन में बाहर निकालकर गुनगुने पानी और डिशवॉश लिक्विड से साफ कर लेना चाहिए।"*
   - **Screen Action:** Step 04 (Empty Stainless Oil Collector) card expands with oil collector slide-out diagram.

---

### Domain 3: Dishwasher Utensil Loading for Heavy Indian Cookware (`dishwasher-loading`)

#### Common Customer Questions:
1. **"क्या फेबर डिशवॉशर में कड़ाही और कुकर साफ हो सकते हैं?"**
   - **Voice Agent Answer:** *"जी बिल्कुल! फेबर डिशवॉशर को विशेष रूप से भारतीय बर्तनों के लिए डिजाइन किया गया है। कड़ाही, 5-लीटर प्रेशर कुकर, पतीला और बड़ी थालियों को नीचे वाली रैक में 45 डिग्री के कोण पर उल्टा रखें ताकि नीचे के शक्तिशाली 3D स्प्रे आर्म्स का सीधा प्रेशर इनपर पड़े।"*
   - **Screen Action:** Step 01 (Lower Basket) card activates with callouts on heavy Indian utensil arrangement.

2. **"चाय के कप और कांच के गिलास कहाँ रखने चाहिए?"**
   - **Voice Agent Answer:** *"कांच के गिलास, कप और छोटी कटोरियों को हमेशा ऊपर की रैक (Upper Rack) में थोड़ा तिरछा करके रखें, ताकि उनके नीचे पानी इकट्ठा न हो और वे सुरक्षित रूप से चमकते हुए सूखें।"*
   - **Screen Action:** Step 02 (Upper Basket) highlights with glassware protection guidelines.

3. **"डिशवॉशर चालू करने से पहले सबसे जरूरी सावधानी क्या है?"**
   - **Voice Agent Answer:** *"डिशवॉशर चालू करने से पहले रैक को अंदर धकेलें और दोनों स्प्रे आर्म्स को हाथ से एक बार पूरा 360 डिग्री घुमाकर देखें कि कोई लंबा चम्मच या कड़ाही का हैंडल उनके घूमने में रुकावट तो नहीं डाल रहा।"*
   - **Screen Action:** Step 04 (Pre-Flight Checks) expands with the spray arm rotation clearance warning.

---

### Domain 4: Dishwasher Maintenance, Regenerating Salt & Filters (`dishwasher-cleaning`)

#### Common Customer Questions:
1. **"डिशवॉशर में नमक (Salt) डालना क्यों जरूरी है?"**
   - **Voice Agent Answer:** *"भारत के ज्यादातर शहरों में पानी हार्ड (खारा) होता है। डिशवॉशर सॉल्ट मशीन के अंदर लगे वॉटर सॉफ्टनर रेजिन को रीजेनरेट करता है, जिससे पानी सॉफ्ट होता है और बर्तनों व ग्लास पर सफेद कैल्शियम के दाग नहीं पड़ते। इसे मशीन के फर्श पर बने गोल चेंबर में फनल से डाला जाता है।"*
   - **Screen Action:** Step 01 card with `dw_clean_step1_salt.jpg` opens, showing the funnel and floor chamber.

2. **"रिंस एड (Rinse Aid) का क्या फायदा है?"**
   - **Voice Agent Answer:** *"रिंस एड पानी के सरफेस टेंशन को कम करता है, जिससे पानी बर्तनों पर बूंद बनकर रुकने के बजाय तुरंत बह जाता है। इससे बर्तन 100% बिना किसी पानी के धब्बे के एकदम शीशे की तरह चमकते हुए सूखते हैं।"*
   - **Screen Action:** Step 02 card with `dw_clean_step2_rinseaid.jpg` displays the door dispenser dial.

3. **"फिल्टर को कब और कैसे साफ करना चाहिए?"**
   - **Voice Agent Answer:** *"डिशवॉशर के बेस पर लगे 3-स्टेज माइक्रोफिल्टर को हफ्ते में एक बार घुमाकर बाहर निकालें और नल के बहते पानी के नीचे टूथब्रश से साफ कर लें। इससे कोई भी खाने का कण पाइप में नहीं फंसता और पानी कभी जाम नहीं होता।"*
   - **Screen Action:** Step 03 card with `dw_clean_step3_filter.jpg` highlights the 3-stage mesh filter.

---

### Domain 5: Dishwasher USPs, 3D Wash & 70°C Sanitization (`dishwasher-usp`)

#### Common Customer Questions:
1. **"फेबर का 3D वॉश टेक्नोलॉजी क्या है?"**
   - **Voice Agent Answer:** *"फेबर 3D वॉश में नीचे, बीच में और ऊपर तीन अलग-अलग स्प्रे आर्म्स दिए गए हैं जो हर कोने से हाई-प्रेशर वॉटर जेट्स फेंकते हैं। यह तेल, घी और हल्दी के जिद्दी दागों को बर्तनों से पूरी तरह उखाड़ फेंकता है।"*
   - **Screen Action:** Displays Pillar 1 of the 4-Pillar Luxury Grid (`.dishwasher-usp-card`).

2. **"डुअल ज़ोन वॉश (Dual Zone Wash) क्या होता है?"**
   - **Voice Agent Answer:** *"अगर आपके पास कम बर्तन हैं, तो आपको डिशवॉशर पूरा भरने की जरूरत नहीं है। डुअल ज़ोन वॉश से आप केवल ऊपर की बास्केट या केवल नीचे की बास्केट सेलेक्ट करके आधे लोड पर डिशवॉशर चला सकते हैं, जिससे 40% तक पानी और बिजली की बचत होती है।"*
   - **Screen Action:** Displays Pillar 2 of the USP Grid.

3. **"क्या 70°C हाइजीन वॉश से बच्चों के बर्तन सुरक्षित साफ होते हैं?"**
   - **Voice Agent Answer:** *"जी हाँ, 70 डिग्री सेल्सियस का गर्म पानी 99.9% बैक्टीरिया और जर्म्स को खत्म करता है। यह बच्चों की दूध की बोतलों, टिफिन और ऑयली बर्तनों के लिए हॉस्पिटल-ग्रेड सैनिटाइजेशन प्रदान करता है।"*
   - **Screen Action:** Displays Pillar 3 with the 70°C Intensive Hygiene badge.

---

### Domain 6: BLDC Inverter Motor & 12-Year Warranty (`bldc-motor`)

#### Common Customer Questions:
1. **"BLDC मोटर साधारण चिमनी मोटर से कैसे अलग है?"**
   - **Voice Agent Answer:** *"साधारण चिमनी में 250 वॉट की एसी मोटर होती है जो ज्यादा बिजली खाती है और गर्म होती है। फेबर की BLDC मोटर नियोडिमियम मैग्नेट्स पर चलती है, केवल 150 वॉट बिजली लेती है (50% बचत), गर्म नहीं होती और 9 अलग-अलग स्पीड सेटिंग्स प्रदान करती है।"*
   - **Screen Action:** Completely clears previous cards and renders the full-bleed 1080p 3D motor cutaway looping video (`images/bldc_motor.mp4`) with the official Faber logo watermark pinned to the bottom-right corner.

2. **"क्या फेबर चिमनी आवाज बहुत कम करती है?"**
   - **Voice Agent Answer:** *"हाँ, फेबर लिब्रा BLDC चिमनी केवल 44 से 46 डेसिबल पर चलती है। यह सामान्य बातचीत या लाइब्रेरी के शांत माहौल जितनी आवाज है, जिससे खाना बनाते समय कोई परेशानी नहीं होती।"*
   - **Screen Action:** Plays the 8-second 3D motor animation in a continuous loop with discreet audio toggle in the top corner.

3. **"What does BLDC mean / What is BLDC motor?"**
   - **Voice Agent Answer:** *"BLDC stands for Brushless Direct Current motor. It uses permanent magnets to achieve high suction efficiency with half the power consumption of traditional motors, backed by an industry-leading 12-year warranty."*
   - **Screen Action:** Refreshes the viewport with the cinematic BLDC cutaway animation loop.

---

### Domain 7: Wave Gesture Sensor & Touch Controls (`chimney-controls`)

#### Common Customer Questions:
1. **"हाथ हिलाकर चिमनी की स्पीड कैसे बढ़ाते और घटाते हैं?"**
   - **Voice Agent Answer:** *"ग्लास पैनल के दोनों तरफ मोशन सेंसर्स दिए गए हैं। बाएं से दाएं हाथ हिलाने पर चिमनी स्टार्ट होती है और हर वेव के साथ स्पीड 1 से 9 तक बढ़ती है। दाएं से बाएं हाथ हिलाने पर स्पीड घटती है और लगातार वेव करने पर चिमनी बंद हो जाती है।"*
   - **Screen Action:** Motion sensor navigation guide displays animated L-to-R and R-to-L arrows.

2. **"अगर हाथ गीले हों तो क्या टच बटन काम करते हैं?"**
   - **Voice Agent Answer:** *"गीले या चिकने हाथों से टच पैनल को छूने के बजाय वेव जेस्चर का उपयोग करना सबसे सुरक्षित और आसान है। इससे ग्लास पर कोई उंगलियों के निशान भी नहीं पड़ते।"*
   - **Screen Action:** Displays the capacitive glass panel layout.

---

## 5. Complete 13-Appliance Catalog Reference Table

Below is the verified master catalog of all 13 official Faber appliances available in the system:

| # | Product Name | Category | SKU / Code | Dimensions (W×D×H) | Price | MRP | Savings | Suction / Capacity | Warranty |
| :-: | :--- | :--- | :--- | :--- | :-: | :-: | :-: | :--- | :--- |
| **1** | **Faber Libra BLDC 60 cm** | Chimney | `325.0741.435` | 600 × 418 × 485 mm | **₹21,330** | ₹32,490 | **₹11,160 (34%)** | 1500 m³/hr • 150W BLDC | 2 Yrs Comprehensive • 12 Yrs Motor |
| **2** | **Faber Libra BLDC 75 cm** | Chimney | `325.0741.436` | 750 × 418 × 490 mm | **₹23,118** | ₹34,990 | **₹11,872 (34%)** | 1500 m³/hr • 150W BLDC | 2 Yrs Comprehensive • 12 Yrs Motor |
| **3** | **Faber Libra BLDC 90 cm** | Chimney | `325.0741.437` | 900 × 418 × 490 mm | **₹25,790** | ₹38,990 | **₹13,200 (34%)** | 1500 m³/hr • 150W BLDC | 2 Yrs Comprehensive • 12 Yrs Motor |
| **4** | **FFSD 6PR 8S Ace BK** | Dishwasher | `315.0645.789` | 550 × 500 × 595 mm | **₹23,990** | ₹39,990 | **₹16,000 (40%)** | 8 Place Settings • 6 Programs | 2 Yrs Comprehensive • 5 Yrs Motor |
| **5** | **FFSD 6PR 8S Ace Inox** | Dishwasher | `315.0645.790` | 550 × 500 × 595 mm | **₹24,990** | ₹41,990 | **₹17,000 (40%)** | 8 Place Settings • 6 Programs | 2 Yrs Comprehensive • 5 Yrs Motor |
| **6** | **FFSD 6PR 12S Neo BK** | Dishwasher | `315.0645.791` | 600 × 600 × 845 mm | **₹28,990** | ₹42,990 | **₹14,000 (33%)** | 12 Place Settings • 6 Programs | 2 Yrs Comprehensive • 5 Yrs Motor |
| **7** | **FFSD 6PR 12S Neo Inox** | Dishwasher | `315.0645.792` | 600 × 600 × 845 mm | **₹29,990** | ₹44,990 | **₹15,000 (33%)** | 12 Place Settings • 6 Programs | 2 Yrs Comprehensive • 5 Yrs Motor |
| **8** | **FFSD 6PR 14S BK Digital** | Dishwasher | `315.0645.793` | 600 × 600 × 845 mm | **₹36,990** | ₹54,990 | **₹18,000 (33%)** | 14 Place Settings • 6 Programs | 2 Yrs Comprehensive • 10 Yrs Cavity |
| **9** | **FFSD 6PR 14S Inox Digital** | Dishwasher | `315.0645.794` | 600 × 600 × 845 mm | **₹38,490** | ₹56,990 | **₹18,500 (32%)** | 14 Place Settings • 6 Programs | 2 Yrs Comprehensive • 10 Yrs Cavity |
| **10** | **FFSD 7PR 14S BK** | Dishwasher | `315.0645.795` | 600 × 600 × 845 mm | **₹43,990** | ₹57,990 | **₹14,000 (24%)** | 14 Place Settings • 7 Programs (3D Wash) | 2 Yrs Comprehensive • 10 Yrs Cavity |
| **11** | **FFSD 7PR 14S Inox** | Dishwasher | `315.0645.796` | 600 × 600 × 845 mm | **₹45,490** | ₹59,990 | **₹14,500 (24%)** | 14 Place Settings • 7 Programs (3D Wash) | 2 Yrs Comprehensive • 10 Yrs Cavity |
| **12** | **FSID 8PR 14S** | Dishwasher | `315.0645.797` | 598 × 570 × 815 mm | **₹52,990** | ₹65,990 | **₹13,000 (20%)** | 14 Place • Semi-Integrated • 8 Programs | 2 Yrs Comprehensive • 10 Yrs Cavity |
| **13** | **FBID 8PR 14S** | Dishwasher | `315.0645.798` | 598 × 550 × 815 mm | **₹63,901** | ₹70,990 | **₹7,089 (10%)** | 14 Place • Fully Integrated Built-in | 2 Yrs Comprehensive • 10 Yrs Cavity |

---

## 6. Voice Keyword & Intent Trigger Dictionary

The backend webhook parser (`tool-backend/server.js` and `tool-backend/src/catalog.js`) resolves customer queries through the following phonetic and keyword dictionaries:

```javascript
// Master Intent Resolution Routing Logic
{
  "chimney-installation": [
    "install", "installation", "mount", "mounting", "फिटिंग", "इनस्टॉल", "चिमनी लगाना", "how to install chimney"
  ],
  "chimney-cleaning": [
    "auto clean", "autoclean", "heat clean", "thermal heat", "oil collector", "clean chimney", "cleaning of the chimney", "चिमनी साफ", "चिमनी सर्विस", "ऑयल कलेक्टर"
  ],
  "dishwasher-cleaning": [
    "dishwasher salt", "salt", "water softener", "rinse aid", "descale", "descaling", "filter", "dishwasher maintenance", "dishwasher care", "डिशवॉशर साफ", "डिशवॉशर सॉल्ट", "सॉल्ट", "सफाई", "केयर"
  ],
  "dishwasher-loading": [
    "how to load", "loading guide", "rack loading", "bartan load", "utensil", "बर्तन कैसे रखें", "कड़ाही कहाँ रखें", "पतीला", "कुकर"
  ],
  "dishwasher-usp": [
    "usp", "usps", "unique selling", "spray arm", "dual zone", "70c", "70°c", "70 degree", "sanitization", "hygiene wash", "14 place", "डिशवॉशर की खासियत", "3d wash"
  ],
  "bldc-motor": [
    "bldc", "motor warranty", "12 year motor", "inverter motor", "quiet motor", "150w", "150 watt", "मोटर", "बिजली की खपत", "नॉइज़"
  ],
  "chimney-controls": [
    "gesture", "wave", "touch panel", "touch control", "sensor control", "9 speed", "जेस्चर", "हाथ हिलाकर", "मोशन सेंसर"
  ],
  "comparison": [
    "compare", "difference", "vs", "comparison", "डिफरेंस", "तुलना", "दोनों में क्या फर्क है", "तीनों चिमनी"
  ],
  "offers": [
    "offer", "discount", "deal", "best price", "savings", "ऑफर", "छूट", "डिस्काउंट", "फेस्टिवल सेल"
  ],
  "filter_by_price": [
    "under", "below", "less than", "budget", "अंडर", "25000 के अंदर", "30000 के अंदर", "सस्ती चिमनी"
  ]
}
```

---

## 7. Verification & Testing Checklist

When testing queries manually in the browser or via API:
1. **Local Test Frontend:** Open `http://localhost:8085/index.html`
2. **Backend Visualizer:** Open `http://localhost:3000/visualizer/index.html`
3. **Webhook Test Command:**
   ```powershell
   # Test Dishwasher Salt & Maintenance
   Invoke-RestMethod -Uri "http://localhost:3000/api/tool" -Method POST -ContentType "application/json" -Body '{"query": "डिशवॉशर में सॉल्ट कैसे डालते हैं?"}'
   
   # Test Chimney Installation
   Invoke-RestMethod -Uri "http://localhost:3000/api/tool" -Method POST -ContentType "application/json" -Body '{"query": "चिमनी इंस्टॉलेशन कैसे होती है?"}'
   
   # Test Cross-Category Comparison
   Invoke-RestMethod -Uri "http://localhost:3000/api/tool" -Method POST -ContentType "application/json" -Body '{"query": "चिमनी और डिशवॉशर का डिफरेंस दिखाइए"}'
   
   # Test Budget Filter Under 30k
   Invoke-RestMethod -Uri "http://localhost:3000/api/tool" -Method POST -ContentType "application/json" -Body '{"query": "30,000 के अंदर डिशवॉशर और चिमनी दिखाइए"}'
   ```
4. **Visual Behavior:**
   - The right screen must morph with a subtle green accent fade (380ms throttle).
   - No double-rendering or duplicate clicks.
   - For guide blueprints (`chimney-installation`, `chimney-cleaning`, `dishwasher-cleaning`, `dishwasher-loading`), auto-cycling occurs every 3.8 seconds with direct-click jump and pause-on-hover.
   - Struck MRP, deal prices, and official warranty seals match the verified catalog.
