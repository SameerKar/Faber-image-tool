# Faber Product Visualizer - Standalone Frontend App

This is the **decoupled client-side web application** for the Faber Voice & Chat Product Visualizer.

It runs completely independently from the backend tool, allowing you to:
1. **View and test locally right now** without needing any build tools.
2. **Connect to your local Node server** (`http://localhost:3000`) or your **Cloudflare Worker** (`https://faber-visualizer.YOUR_NAME.workers.dev`).
3. **Deploy later to any static hosting provider** (Netlify, Vercel, GitHub Pages, Cloudflare Pages, AWS S3, or embed directly into Faber's official website).

---

## 🚀 How to View Locally Right Now

You can open and view this frontend locally using any of these simple methods:

### Option 1: Direct File Open (Zero Install)
- Simply double-click [`index.html`](file:///d:/Tatwa%20projects/FABER/frontend-app/index.html) in your file explorer to open it directly in Chrome, Edge, or Brave.
- By default, it will automatically connect to your backend tool running on `http://localhost:3000`.

### Option 2: VS Code Live Server
- In VS Code / Antigravity IDE, right-click [`index.html`](file:///d:/Tatwa%20projects/FABER/frontend-app/index.html) and select **"Open with Live Server"**.

### Option 3: Local Command-Line Static Server
Open a terminal in this directory (`frontend-app`) and run:
```bash
npx serve .
# Or using Python:
python -m http.server 8080
```
Then visit `http://localhost:8080` or `http://localhost:3000`.

---

## ⚙️ Connecting to Different Backends

The frontend has a built-in **Backend URL switcher** right in the top navigation bar:

1. Look at the **"Backend:"** pill in the top header.
2. Click the gear icon (**⚙️**).
3. Enter your backend URL:
   - For Local Node Server: `http://localhost:3000`
   - For Cloudflare Worker: `https://faber-visualizer.YOUR_SUBDOMAIN.workers.dev`
4. Click **OK**. The frontend saves your choice in `localStorage`, updates the real-time stream, and fetches the latest catalog immediately.

---

## 🎨 Clean Light-Theme Layout

- **Left Pane (45%)**: Mounts the official `<oration-widget>` using keys fetched dynamically from the backend (`/api/config`), plus instant test trigger buttons.
- **Right Pane (55%)**: Displays only the **4 authorized Faber demo appliances**:
  1. *Chimney 1*: Curved Glass Auto-Clean Chimney
  2. *Chimney 2*: Angular Filterless Luxury Chimney
  3. *Dishwasher 1*: Faber FBID 8PR 14S Integrated Dishwasher
  4. *Dishwasher 2*: Faber FSID 8PR 14S Freestanding Dishwasher

---

## 🚢 Deploying Somewhere Else Later

When you are ready to publish this web page to production:
- **Netlify**: Drag and drop the `frontend-app/` folder into Netlify Drop.
- **Vercel**: Run `npx vercel` inside `frontend-app/`.
- **GitHub Pages**: Push this folder to a GitHub repository and enable GitHub Pages in settings.
- **Faber Main Website**: Embed this page via an `<iframe>` or copy `index.html` markup into your CMS.
