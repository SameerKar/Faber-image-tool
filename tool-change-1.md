# Oration Tool Action Configuration Guide: Multi-Variable Schema

This guide explains how to configure **multi-variable schema extraction** in the Oration console so the voice agent extracts structured parameters (`action`, `category`, `products`, `max_price`, `query`) instead of a single ambiguous text string.

---

## 🎯 Why Multi-Variable Extraction Solves the Real Voice Issues

| Issue in Single String (`{"product": "..."}`) | Solution with Multi-Variable Schema |
| :--- | :--- |
| **Ambiguous Comparisons:** User says *"चिमनी और डिशवॉशर का डिफरेंस दिखाइए"* but LLM sends `"compare chimneys"`, which showed 3 chimneys. | Extraction sets `action: "compare"`, `category: "both"` (or `products: "chimney, dishwasher"`). Backend displays exactly 1 chimney vs 1 dishwasher! |
| **Exact 2-Model Comparison:** User says *"Libra 60 और Libra 90 compare करो"*, but pre-made components forced 3 models. | Extraction sets `action: "compare"`, `products: "Libra 60, Libra 90"`. The matrix dynamically renders **ONLY those 2 models**! |
| **Category Leakage:** User says *"डिशवॉशर के बेस्ट ऑफर्स बताइए"*, but offers showed chimneys too. | Extraction sets `category: "dishwasher"`, `action: "offers"`. Backend strictly filters **ONLY dishwashers with discounts**! |
| **Combined Budget + Offer:** User says *"डिशवॉशर के बेस्ट ऑफर्स अंडर 30,000 दिखाइए"*. | Extraction sets `action: "offers"`, `category: "dishwasher"`, `max_price: 30000`. Returns only discounted dishwashers under ₹30,000! |

---

## 📋 1. Oration Tool Action Configuration

In the Oration **"Update Action"** drawer for `show_product`:

| Setting | Value |
| :--- | :--- |
| **Name** | `show_product` |
| **Method** | `POST` |
| **URL Template** | `https://faber-image-tool.sameer-kar.workers.dev/api/tool` |
| **Headers Template** | Key: `Content-Type`<br>Value: `application/json` |
| **Is Async** | **OFF** |
| **Wait Before Execution** | **OFF** |
| **Confirm Before Execution** | **OFF** |
| **Action Delay Timeout** | `10000` Milliseconds |
| **Action Failure Timeout** | `30000` Milliseconds |

---

## 📝 2. Action Description (The Main Prompt for LLM)

Paste this into the **"Description"** textarea under the Action Name:

```text
Call this tool whenever the customer asks to view, compare, filter by budget, check offers, or see maintenance guides for Faber chimneys and dishwashers.

Extract structured parameters:
1. 'action':
   - "view": Viewing specific product(s) or general category.
   - "compare": Comparing two or more products (e.g. 'Libra 60 vs Libra 90') OR comparing categories ('chimney vs dishwasher').
   - "offers": User asks for discounts, deals, promotions, or best prices.
   - "filter_price": User specifies a maximum budget (e.g. 'under 30000', 'under 20000').
   - "loading_guide": User asks how to load utensils or arrange dishes in a dishwasher.
   - "auto_clean": User asks about chimney auto-clean procedure or maintenance manual.

2. 'category':
   - "chimney": If request is about chimneys / hoods.
   - "dishwasher": If request is about dishwashers.
   - "both": If user asks to compare chimneys and dishwashers together.
   - "all": If general or unspecified.

3. 'products':
   - Comma-separated list of EXACT product names/models mentioned by the user (e.g. "Libra 60, Libra 90" or "FBID 8PR 14S").
   - If comparing chimney and dishwasher, pass "chimney, dishwasher".
   - When 2 specific models are mentioned, ONLY those 2 models will be compared.

4. 'max_price':
   - The numerical budget in INR mentioned by user (e.g. 30000 for "under 30,000", 20000 for "under 20k"). Set to 0 if not mentioned.

5. 'query':
   - The customer's exact spoken phrase in English or Hindi (e.g. "डिशवॉशर के बेस्ट ऑफर्स अंडर 30,000").
```

---

## 🧩 3. Schema Properties (In Oration Schema Builder)

Click **`+ Add Property`** in Oration and add these 5 fields:

### Property 1: `action`
- **Name:** `action`
- **Type:** `String`
- **Required:** **YES**
- **Description:**  
  `The action type: 'view' (show product), 'compare' (compare models or categories), 'offers' (discounts/deals), 'filter_price' (budget search), 'loading_guide' (how to load utensils), or 'auto_clean' (chimney cleaning manual).`

### Property 2: `category`
- **Name:** `category`
- **Type:** `String`
- **Required:** **NO** (optional)
- **Description:**  
  `The appliance category: 'chimney', 'dishwasher', 'both' (when comparing chimney vs dishwasher), or 'all'.`

### Property 3: `products`
- **Name:** `products`
- **Type:** `String`
- **Required:** **NO** (optional)
- **Description:**  
  `Comma-separated names of specific products to display or compare (e.g. 'Libra 60, Libra 90' or 'FBID 8PR 14S' or 'chimney, dishwasher'). If user asks to compare 2 models, pass both here.`

### Property 4: `max_price`
- **Name:** `max_price`
- **Type:** `Integer` (or `Number`)
- **Required:** **NO** (optional)
- **Description:**  
  `Maximum price budget in INR (e.g. 30000 for 'under 30000'). Set to 0 if no budget mentioned.`

### Property 5: `query`
- **Name:** `query`
- **Type:** `String`
- **Required:** **NO** (optional)
- **Description:**  
  `The customer's original spoken request or keywords in English or Hindi.`

---

## 📦 4. Complete Raw JSON Schema

If your Oration console allows editing or pasting the raw JSON Schema, paste this:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "action": {
      "type": "string",
      "enum": ["view", "compare", "offers", "filter_price", "loading_guide", "auto_clean"],
      "description": "The action type: 'view' (show product), 'compare' (compare models or categories), 'offers' (discounts/deals), 'filter_price' (budget search), 'loading_guide' (how to load utensils), or 'auto_clean' (chimney cleaning manual)."
    },
    "category": {
      "type": "string",
      "enum": ["chimney", "dishwasher", "both", "all"],
      "description": "The appliance category: 'chimney', 'dishwasher', 'both' (when comparing chimney vs dishwasher), or 'all'."
    },
    "products": {
      "type": "string",
      "description": "Comma-separated names of specific products to display or compare (e.g. 'Libra 60, Libra 90' or 'FBID 8PR 14S' or 'chimney, dishwasher'). If user asks to compare 2 models, pass both here."
    },
    "max_price": {
      "type": "integer",
      "description": "Maximum price budget in INR (e.g. 30000 for 'under 30000'). Set to 0 if no budget mentioned."
    },
    "query": {
      "type": "string",
      "description": "The customer's original spoken request or keywords in English or Hindi."
    }
  },
  "required": [
    "action"
  ],
  "additionalProperties": false
}
```

---

## 📬 5. Body Template

In the **Body Template** field of Oration, paste:

```json
{
  "action": "{{action}}",
  "category": "{{category}}",
  "products": "{{products}}",
  "max_price": "{{max_price}}",
  "query": "{{query}}"
}
```

> **Why quotes around `"{{max_price}}"`:**  
> If the user doesn't mention a price, Oration leaves `{{max_price}}` blank. With quotes (`"{{max_price}}"`), it remains valid JSON (`""`), and the backend converts it to `0` without throwing a JSON syntax error!

---

## 🔍 6. Real Dialogue Test Matrix (From Your Test Chat)

| Turn | Customer Spoken Utterance | What Oration Extracts | What Backend & Screen Displays |
| :--- | :--- | :--- | :--- |
| **1** | *"चिमनी और डिशवॉशर का डिफरेंस दिखाइए"* | `action`: `"compare"`<br>`category`: `"both"`<br>`products`: `"chimney, dishwasher"` | **Chimney vs Dishwasher Comparison Matrix!** Displays `Libra 60` vs `FBID 8PR 14S` side-by-side with full specs. |
| **2** | *"Libra 60 और Libra 90 को compare करो"* | `action`: `"compare"`<br>`products`: `"Libra 60, Libra 90"` | **Exact 2-Model Comparison!** Displays strictly `Libra 60` and `Libra 90` (not 3 models). |
| **3** | *"डिशवॉशर के बेस्ट ऑफर्स बताइए"* | `action`: `"offers"`<br>`category`: `"dishwasher"` | **Special Dishwasher Offers Only!** Strictly filters dishwashers with discounts (no chimneys shown). |
| **4** | *"डिशवॉशर के बेस्ट ऑफर्स अंडर 30,000 दिखाइए"* | `action`: `"offers"`<br>`category`: `"dishwasher"`<br>`max_price`: `30000` | **Discounted Dishwashers under ₹30,000!** Shows `FFSD 6PR 12S Neo Black` (₹29,999, 20% off). |
| **5** | *"अंडर 20,000 में कोई चिमनी बताइए"* | `action`: `"filter_price"`<br>`category`: `"chimney"`<br>`max_price`: `20000` | **Smart Budget Feedback!** Informs customer that BLDC chimneys start at ₹21,330 and shows entry models. |
| **6** | *"डिशवॉशर में बर्तन कैसे अरेंज करें?"* | `action`: `"loading_guide"`<br>`category`: `"dishwasher"` | **Dishwasher Loading Architecture!** Infographic diagram showing upper & lower basket layout. |
| **7** | *"चिमनी का ऑटो क्लीन कैसे करें?"* | `action`: `"auto_clean"`<br>`category`: `"chimney"` | **Heat Auto-Clean Manual!** 9-minute heating + 1-minute fan oil collection timeline. |
