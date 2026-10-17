/**
 * Faber Product Visualizer - Decoupled Client Logic
 * Subscribes to Tool Backend (Cloudflare Worker or Local Node Server) via SSE / HTTP.
 * Fully decoupled: Can be run locally via file:// or static server, or deployed anywhere.
 */

(() => {
  const pageStartTime = Date.now();

  // 1. Backend URL Management
  function getInitialBackendUrl() {
    const saved = localStorage.getItem('faber_backend_url');
    if (saved) return saved.trim();

    if (window.FABER_BACKEND_URL) return window.FABER_BACKEND_URL.trim();

    // Default to the Cloudflare Worker backend
    return 'https://faber-image-tool.sameer-kar.workers.dev';
  }

  let backendUrl = getInitialBackendUrl();
  if (backendUrl.endsWith('/')) {
    backendUrl = backendUrl.slice(0, -1);
  }

  // 2. Session ID Management
  function getSessionId() {
    let sess = sessionStorage.getItem('faber_visualizer_session');
    if (!sess) {
      sess = 'sess_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem('faber_visualizer_session', sess);
    }
    return sess;
  }

  const sessionId = getSessionId();

  // DOM Elements
  const displaySessionEl = document.getElementById('display-session-id');
  const btnCopySession = document.getElementById('btn-copy-session');
  const serverStatusPill = document.getElementById('server-status-pill');
  const serverStatusText = document.getElementById('server-status-text');
  const backendUrlDisplay = document.getElementById('backend-url-display');
  const btnEditBackend = document.getElementById('btn-edit-backend');
  const productGrid = document.getElementById('product-grid');
  const displayModeBadge = document.getElementById('display-mode-badge');
  const displaySubtitle = document.getElementById('display-subtitle');
  const toastMsg = document.getElementById('toast-msg');
  const widgetMountPoint = document.getElementById('widget-mount-point');
  const agentStatusLabel = document.getElementById('agent-status-label');
  const btnToggleMenu = document.getElementById('btn-toggle-menu');
  const triggersDropdown = document.getElementById('triggers-dropdown');
  const triggersMenuDropdown = document.querySelector('.triggers-menu-dropdown');

  if (displaySessionEl) {
    displaySessionEl.textContent = sessionId;
  }

  // Micro-interaction: Animated display badge update
  function updateDisplayBadge(text) {
    if (!displayModeBadge) return;
    displayModeBadge.textContent = text;
    displayModeBadge.classList.remove('badge-updated');
    void displayModeBadge.offsetWidth;
    displayModeBadge.classList.add('badge-updated');
  }

  // Subtle Faber Green Morph Transition for Tool Calls & Screen Switches
  const morphGlowEl = document.getElementById('morph-glow-fx');
  const splashLoaderEl = document.getElementById('faber-splash-loader');

  // Full-Screen Faber × OmniAgent Accent Green Splash Loader Lifecycle
  function dismissSplashLoader() {
    if (!splashLoaderEl || splashLoaderEl.classList.contains('morph-out')) return;
    splashLoaderEl.classList.add('morph-out');

    // Smoothly morph into main application screen
    playGreenMorphTransition();

    setTimeout(() => {
      splashLoaderEl.classList.add('hidden');
    }, 700);
  }

  function showSplashLoaderAndMorph(onComplete) {
    if (!splashLoaderEl) {
      if (onComplete) onComplete();
      return;
    }
    splashLoaderEl.classList.remove('hidden', 'morph-out');
    void splashLoaderEl.offsetWidth; // Force reflow

    setTimeout(() => {
      dismissSplashLoader();
      if (onComplete) onComplete();
    }, 1300);
  }

  // Auto-dismiss splash loader on page load after pleasant brand presentation
  window.addEventListener('load', () => {
    setTimeout(dismissSplashLoader, 1400);
  });
  if (document.readyState === 'complete') {
    setTimeout(dismissSplashLoader, 1400);
  }

  let lastMorphTimestamp = 0;
  function playGreenMorphTransition() {
    if (!morphGlowEl) return;
    const now = Date.now();
    // Guard against rapid duplicate firing within 380ms (eliminates double-render & clicky snap)
    if (now - lastMorphTimestamp < 380) return;
    lastMorphTimestamp = now;

    morphGlowEl.classList.remove('active');
    void morphGlowEl.offsetWidth; // Force reflow
    morphGlowEl.classList.add('active');
  }

  if (morphGlowEl) {
    morphGlowEl.addEventListener('animationend', () => {
      morphGlowEl.classList.remove('active');
    });
  }

  // Enhanced screen switching transition helper with subtle green morph and double-render guard
  let lastViewTransitionTimestamp = 0;
  function prepareViewTransition(container) {
    const target = container || document.getElementById('component-viewport') || productGrid;
    if (!target) return target;

    const now = Date.now();
    // Strict guard against duplicate calls within 380ms (eliminates double reflow and clicky stutter)
    if (now - lastViewTransitionTimestamp < 380) {
      return target;
    }
    lastViewTransitionTimestamp = now;

    target.scrollTop = 0;
    target.classList.remove('view-enter-active');
    void target.offsetWidth;
    target.classList.add('view-enter-active');

    // Trigger subtle green morph sheen
    playGreenMorphTransition();

    return target;
  }

  function updateBackendUrlDisplay() {
    if (backendUrlDisplay) {
      backendUrlDisplay.textContent = backendUrl || window.location.origin;
    }
    const btnCf = document.getElementById('btn-switch-cf');
    const btnLocal = document.getElementById('btn-switch-local');
    if (btnCf && btnLocal) {
      const isCf = backendUrl.includes('workers.dev');
      btnCf.classList.toggle('active', isCf);
      btnLocal.classList.toggle('active', !isCf);
    }
  }
  updateBackendUrlDisplay();

  // One-click backend switchers
  const btnSwitchCf = document.getElementById('btn-switch-cf');
  const btnSwitchLocal = document.getElementById('btn-switch-local');

  if (btnSwitchCf) {
    btnSwitchCf.addEventListener('click', () => {
      backendUrl = btnSwitchCf.getAttribute('data-url') || 'https://faber-image-tool.sameer-kar.workers.dev';
      localStorage.setItem('faber_backend_url', backendUrl);
      updateBackendUrlDisplay();
      showToast('Switched to Cloudflare Worker backend!');
      if (activeEventSource) activeEventSource.close();
      connectSSE();
      loadInitialImages();
    });
  }

  if (btnSwitchLocal) {
    btnSwitchLocal.addEventListener('click', () => {
      backendUrl = btnSwitchLocal.getAttribute('data-url') || 'http://localhost:3000';
      localStorage.setItem('faber_backend_url', backendUrl);
      updateBackendUrlDisplay();
      showToast('Switched to Local Node server (:3000)!');
      if (activeEventSource) activeEventSource.close();
      connectSSE();
      loadInitialImages();
    });
  }

  // Toast feedback helper
  function showToast(text) {
    if (!toastMsg) return;
    toastMsg.textContent = text;
    toastMsg.classList.add('visible');
    setTimeout(() => toastMsg.classList.remove('visible'), 2400);
  }

  if (btnCopySession) {
    btnCopySession.addEventListener('click', () => {
      navigator.clipboard.writeText(sessionId).then(() => showToast('Session ID copied!'));
    });
  }

  // Start New Session Button
  const btnNewSession = document.getElementById('btn-new-session');
  if (btnNewSession) {
    btnNewSession.addEventListener('click', () => {
      const newSess = 'sess_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem('faber_visualizer_session', newSess);
      if (displaySessionEl) {
        displaySessionEl.textContent = newSess;
      }
      showToast('New session started: ' + newSess);

      // Trigger full accent green splash morph into fresh welcome screen
      showSplashLoaderAndMorph(() => {
        renderFaberWelcomeScreen();
        initOrationWidget();
      });
    });
  }

  // Edit Backend URL prompt
  if (btnEditBackend) {
    btnEditBackend.addEventListener('click', () => {
      const current = backendUrl || window.location.origin;
      const input = prompt(
        'Enter Backend Tool API URL:\n(e.g., http://localhost:3000 or https://faber-image-tool.sameer-kar.workers.dev)',
        current
      );
      if (input !== null) {
        let cleaned = input.trim();
        if (cleaned.endsWith('/')) cleaned = cleaned.slice(0, -1);
        backendUrl = cleaned;
        localStorage.setItem('faber_backend_url', cleaned);
        updateBackendUrlDisplay();
        showToast('Backend URL updated! Reconnecting...');

        // Reconnect SSE and reload
        if (activeEventSource) {
          activeEventSource.close();
        }
        initOrationWidget();
        connectSSE();
        loadInitialImages();
      }
    });
  }

  // Quick Triggers Dropdown Menu Toggle (Moved to Right Pane)
  if (btnToggleMenu && triggersDropdown) {
    btnToggleMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = triggersDropdown.classList.contains('open');
      if (isOpen) {
        triggersDropdown.classList.remove('open');
        triggersMenuDropdown?.classList.remove('open');
      } else {
        triggersDropdown.classList.add('open');
        triggersMenuDropdown?.classList.add('open');
      }
    });

    // Close when clicking anywhere outside
    document.addEventListener('click', (e) => {
      if (!triggersDropdown.contains(e.target) && !btnToggleMenu.contains(e.target)) {
        triggersDropdown.classList.remove('open');
        triggersMenuDropdown?.classList.remove('open');
      }
    });
  }

  // 3. Fetch Oration Keys from Backend and Mount <oration-widget>
  async function initOrationWidget() {
    try {
      const targetUrl = `${backendUrl}/api/config`;
      const res = await fetch(targetUrl);
      if (!res.ok) return;

      const config = await res.json();
      let pk = config.publicKey || '';
      let ag = config.agentId || '';
      if (!pk || pk.startsWith('pk_your_')) pk = '70588826-0a19-4c4f-abdf-6de6c720d793';
      if (!ag || ag.startsWith('ag_your_')) ag = '538568f1-6a55-4e3f-989c-164f391a8443';

      if (widgetMountPoint) {
        widgetMountPoint.innerHTML = '';

        if (!ag || ag.startsWith('ag_your_')) {
          widgetMountPoint.innerHTML = `
            <div style="text-align: center; padding: 2.5rem 1.5rem; color: #475569; max-width: 380px; margin: auto;">
              <div style="width: 54px; height: 54px; background: #e0f2fe; color: #0284c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 1.6rem;">🎙️</div>
              <h3 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 0.4rem;">Oration Agent Ready</h3>
              <p style="font-size: 0.8rem; line-height: 1.5; color: #64748b; margin-bottom: 1.25rem;">
                Set your <code>ORATION_PUBLIC_KEY</code> and <code>ORATION_AGENT_ID</code> in backend environment.
              </p>
              <div style="background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem; font-size: 0.75rem; font-family: monospace; text-align: left; color: #334155;">
                ORATION_PUBLIC_KEY="..."<br/>
                ORATION_AGENT_ID="..."
              </div>
            </div>
          `;
          if (agentStatusLabel) agentStatusLabel.textContent = 'Awaiting Keys';
        } else {
          // Mount official <oration-widget> directly filling the left pane
          widgetMountPoint.innerHTML = `
            <oration-widget
              public-key="${pk}"
              default-agent-id="${ag}"
              conversation-type="both"
              dynamic-variables='${JSON.stringify({ sessionId })}'>
            </oration-widget>
          `;
          if (agentStatusLabel) agentStatusLabel.textContent = `Active (${ag.slice(0, 8)}...)`;

          const widget = widgetMountPoint.querySelector('oration-widget');
          embedWidgetInLeftPane(widget);
        }
      }
    } catch (e) {
      console.warn('Could not fetch /api/config from backend', e);
    }
  }

  // Embeds <oration-widget> to completely cover the Left Pane vertically
  function embedWidgetInLeftPane(widgetEl) {
    if (!widgetEl) return;

    function applyLeftPaneStyles() {
      try {
        const root = widgetEl.shadowRoot;
        if (!root) return;

        let styleTag = root.getElementById('embedded-left-pane-override');
        if (!styleTag) {
          styleTag = document.createElement('style');
          styleTag.id = 'embedded-left-pane-override';
          styleTag.textContent = `
            /* Fill 100% of the left vertical screen */
            div[class*="fixed"] {
              position: relative !important;
              bottom: auto !important;
              right: auto !important;
              top: auto !important;
              left: auto !important;
              z-index: 10 !important;
              width: 100% !important;
              height: 100% !important;
              max-width: 100% !important;
              min-width: 0 !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: stretch !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            /* Container card edge-to-edge inside Left Pane */
            .bg-card {
              width: 100% !important;
              height: 100% !important;
              max-width: 100% !important;
              min-height: 0 !important;
              flex: 1 1 auto !important;
              display: flex !important;
              flex-direction: column !important;
              border-radius: 0 !important;
              border: none !important;
              background: #ffffff !important;
              box-shadow: none !important;
              margin: 0 !important;
              overflow: hidden !important;
            }

            /* Flex layout covering full vertical space */
            .bg-card > div,
            .bg-card div.w-full.h-full {
              height: 100% !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              overflow: hidden !important;
            }

            div[class*="space-y-4"] {
              display: flex !important;
              flex-direction: column !important;
              height: 100% !important;
              padding: 1rem 1.25rem !important;
              gap: 0.75rem !important;
              overflow: hidden !important;
            }

            div[class*="space-y-4"] > :not([hidden]) ~ :not([hidden]) {
              margin-top: 0 !important;
            }

            /* Fixed Header at Top */
            div[class*="space-y-4"] > div:first-child {
              flex-shrink: 0 !important;
              padding-bottom: 0.65rem !important;
              border-bottom: 1px solid #f1f5f9 !important;
            }

            /* Middle Scrollable Transcript remains fixed in center */
            div.flex-1.w-full {
              flex: 1 1 auto !important;
              min-height: 0 !important;
              height: 100% !important;
              overflow: hidden !important;
              display: flex !important;
              flex-direction: column !important;
            }

            .transcript-scrollbar {
              flex: 1 1 auto !important;
              max-height: 100% !important;
              height: 100% !important;
              overflow-y: auto !important;
              padding: 0.5rem 0.25rem !important;
            }

            /* Fixed Bottom Controls & Action Buttons */
            div[class*="space-y-4"] > div:last-child {
              flex-shrink: 0 !important;
              margin-top: auto !important;
              padding-top: 0.75rem !important;
              border-top: 1px solid #f1f5f9 !important;
              background: #ffffff !important;
            }

            /* Centered Start / Call Button when Idle */
            div:has(> button[type="button"]) {
              margin: auto !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              justify-content: center !important;
              padding: 2rem !important;
              height: 100% !important;
            }

            button[type="button"] {
              border-radius: 12px !important;
              font-weight: 600 !important;
              transition: all 0.2s ease !important;
            }

            button[type="button"]:hover {
              transform: translateY(-1px) !important;
              box-shadow: 0 4px 12px rgba(2, 132, 199, 0.2) !important;
            }
          `;
          root.appendChild(styleTag);
        }
      } catch (err) {
        console.warn('Could not inject left-pane style override into shadowRoot', err);
      }
    }

    applyLeftPaneStyles();
    const interval = setInterval(applyLeftPaneStyles, 150);
    setTimeout(() => clearInterval(interval), 5000);

    try {
      const observer = new MutationObserver(applyLeftPaneStyles);
      if (widgetEl.shadowRoot) {
        observer.observe(widgetEl.shadowRoot, { childList: true, subtree: true });
      }
    } catch (_) {}
  }

  // 4. Live Multi-Protocol Synchronization Manager (WebSocket + SSE + Smart Polling)
  let activeEventSource = null;
  let activeWebSocket = null;
  let pollingInterval = null;
  let lastPayloadFingerprint = null;

  // 5. Dynamic Component Viewport Renderer
  function handleIncomingImages(payload) {
    if (!payload) return;

    // Reject stale cached/replayed events from prior sessions so refresh stays on Faber screen
    if (payload.timestamp) {
      const eventTime = new Date(payload.timestamp).getTime();
      if (!isNaN(eventTime) && eventTime < pageStartTime - 2000) {
        console.log('[Visualizer] Ignored stale replayed payload from previous session:', payload.title || payload.componentType);
        return;
      }
    }

    // Deduplicate identical payloads if unchanged
    const currentFingerprint = `${payload.timestamp || ''}_${payload.title || ''}_${payload.componentType || ''}_${(payload.products || []).length}`;
    if (currentFingerprint && currentFingerprint === lastPayloadFingerprint) {
      return;
    }
    lastPayloadFingerprint = currentFingerprint;

    const compType = payload.componentType || (payload.images && payload.images.length > 0 ? 'products' : 'products');
    const products = payload.products || payload.images || [];

    if (displaySubtitle) {
      const time = new Date().toLocaleTimeString();
      displaySubtitle.textContent = payload.subtitle || `Synchronized live with agent at ${time}`;
    }

    const container = document.getElementById('component-viewport') || productGrid;
    if (!container) return;
    prepareViewTransition(container);

    if (
      compType === 'welcome' ||
      payload.action === 'welcome' ||
      payload.componentType === 'welcome'
    ) {
      renderFaberWelcomeScreen(container);
      return;
    }

    if (
      compType === 'installation' ||
      compType === 'chimney-installation' ||
      compType === 'chimney_installation' ||
      payload.action === 'installation' ||
      payload.action === 'chimney_installation' ||
      (payload.title && payload.title.toLowerCase().includes('installation')) ||
      (payload.query && payload.query.toLowerCase().includes('install'))
    ) {
      updateDisplayBadge('Installation Guide');
      renderChimneyInstallation(container);
    } else if (
      compType === 'chimney-cleaning' ||
      compType === 'chimney_cleaning' ||
      payload.action === 'chimney_cleaning' ||
      (payload.title && payload.title.toLowerCase().includes('chimney cleaning'))
    ) {
      updateDisplayBadge('Chimney Cleaning Guide');
      renderChimneyCleaning(container);
    } else if (
      compType === 'dishwasher-cleaning' ||
      compType === 'dishwasher_cleaning' ||
      compType === 'dishwasher_maintenance' ||
      payload.action === 'dishwasher_cleaning' ||
      payload.action === 'dishwasher_maintenance' ||
      (payload.title && payload.title.toLowerCase().includes('dishwasher maintenance'))
    ) {
      updateDisplayBadge('Dishwasher Care Guide');
      renderDishwasherCleaning(container);
    } else if (
      compType === 'dishwasher-usp' ||
      compType === 'dishwasher_usp' ||
      compType === 'dishwasher_features' ||
      payload.action === 'dishwasher_usp' ||
      payload.action === 'dishwasher_features' ||
      (payload.title && payload.title.toLowerCase().includes('features & usps'))
    ) {
      updateDisplayBadge('Dishwasher USPs');
      renderDishwasherUSP(container);
    } else if (
      compType === 'bldc-motor' ||
      compType === 'bldc_motor' ||
      payload.action === 'bldc_motor' ||
      (payload.title && payload.title.toLowerCase().includes('bldc motor'))
    ) {
      updateDisplayBadge('Inverter BLDC Motor');
      renderBLDCMotor(container);
    } else if (
      compType === 'chimney-controls' ||
      compType === 'chimney_controls' ||
      compType === 'gesture_control' ||
      payload.action === 'chimney_controls' ||
      payload.action === 'gesture_control' ||
      (payload.title && payload.title.toLowerCase().includes('gesture control'))
    ) {
      updateDisplayBadge('Wave Gesture Controls');
      renderChimneyControls(container);
    } else if (compType === 'comparison' && products.length >= 2) {
      updateDisplayBadge(`Comparing ${products.length} Models`);
      renderComparisonMatrix(container, products, payload.title);
    } else if (compType === 'dishwasher-loading') {
      updateDisplayBadge('Installation Guide');
      renderChimneyInstallation(container);
    } else if (compType === 'manual') {
      updateDisplayBadge('User Manual & Auto-Clean');
      renderUserManual(container, payload.manualData);
    } else if (compType === 'offers') {
      updateDisplayBadge(`Special Offers (${products.length})`);
      renderOffersShowcase(container, products, payload.title);
    } else {
      updateDisplayBadge(products.length === 1 ? 'Featured Appliance (1)' : `${products.length} Appliances`);
      renderProductCards(container, products);
    }
  }

  // 4a. Connect WebSocket (Cloudflare Durable Object Hibernation API)
  function connectWebSocket() {
    try {
      if (activeWebSocket) {
        activeWebSocket.close();
      }

      const wsProtocol = backendUrl.startsWith('https') ? 'wss:' : 'ws:';
      const wsHost = backendUrl.replace(/^https?:\/\//, '');
      const wsUrl = `${wsProtocol}//${wsHost}/api/ws?sessionId=${encodeURIComponent(sessionId)}`;

      activeWebSocket = new WebSocket(wsUrl);

      activeWebSocket.onopen = () => {
        if (serverStatusText) serverStatusText.textContent = 'Live Sync (Active)';
        if (serverStatusPill) serverStatusPill.style.backgroundColor = '#ecfdf5';
      };

      activeWebSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && (data.type === 'PRODUCT_UPDATE' || data.products || data.componentType)) {
            handleIncomingImages(data);
          }
        } catch (_) {}
      };

      activeWebSocket.onclose = () => {
        setTimeout(connectWebSocket, 4000);
      };
    } catch (_) {}
  }

  // 4b. Connect Server-Sent Events (SSE)
  function connectSSE() {
    if (activeEventSource) {
      activeEventSource.close();
    }

    const sseUrl = `${backendUrl}/api/stream/default`;

    try {
      activeEventSource = new EventSource(sseUrl);

      activeEventSource.onopen = () => {
        if (serverStatusText) serverStatusText.textContent = 'Live Sync (Active)';
        if (serverStatusPill) serverStatusPill.style.backgroundColor = '#ecfdf5';
      };

      activeEventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleIncomingImages(data);
        } catch (_) {}
      };

      activeEventSource.onerror = () => {
        if (serverStatusText && !activeWebSocket) serverStatusText.textContent = 'Syncing...';
      };
    } catch (_) {}
  }

  // 4c. Smart Polling Fallback (Guarantees screen updates within 1.2s even if sockets drop)
  function startSmartPolling() {
    if (pollingInterval) clearInterval(pollingInterval);

    async function pollState() {
      try {
        const stateUrl = `${backendUrl}/api/last-state?sessionId=${encodeURIComponent(sessionId)}&_t=${Date.now()}`;
        const res = await fetch(stateUrl);
        if (res.ok) {
          const data = await res.json();
          if (data && data.payload) {
            handleIncomingImages(data.payload);
          }
        }
      } catch (_) {}
    }

    pollState();
    pollingInterval = setInterval(pollState, 1200);
  }

  function initLiveSync() {
    connectWebSocket();
    connectSSE();
    startSmartPolling();
  }

  // Component 0: Faber Official Logo Welcome Screen (Fresh Load & Refresh Default)
  function renderFaberWelcomeScreen(container) {
    const target = container || document.getElementById('component-viewport') || productGrid;
    if (!target) return;
    prepareViewTransition(target);

    updateDisplayBadge('Faber Studio');
    if (displaySubtitle) displaySubtitle.textContent = 'Speak to the assistant or select an appliance to begin';

    target.innerHTML = `
      <div class="faber-welcome-container">
        <div class="faber-welcome-card glass-panel">
          <div class="welcome-brand-emblem glass-card">
            <img src="https://faberindia.com/cdn/shop/files/image_903.png?v=1778867879" alt="Faber" class="welcome-faber-logo" />
          </div>

          <div class="welcome-title-wrap">
            <span class="welcome-kicker">ITALIAN HERITAGE • SINCE 1955</span>
            <h2 class="welcome-headline">Faber Smart Appliance Visualizer</h2>
            <p class="welcome-lead">
              Official interactive showcase for Faber chimneys &amp; dishwashers. Speak with the AI assistant on the left to explore appliances, guides &amp; comparisons.
            </p>
          </div>

          <div class="welcome-action-hint glass-pill">
            <div class="hint-pulse"></div>
            <span>Speak to the <strong>Faber AI Assistant</strong> on the left, or select a quick topic below:</span>
          </div>

          <div class="welcome-quick-pills">
            <button class="welcome-pill glass-button" data-welcome-query="30,000 के अंदर डिशवॉशर और चिमनी">🔍 Models under ₹30k</button>
            <button class="welcome-pill glass-button" data-welcome-action="installation">🛠️ Chimney Installation</button>
            <button class="welcome-pill glass-button" data-welcome-action="chimney_cleaning">🧼 Cleaning &amp; Care</button>
            <button class="welcome-pill glass-button" data-welcome-action="dishwasher_usp">⭐ Dishwasher USPs</button>
            <button class="welcome-pill glass-button" data-welcome-action="show_all">👁️ Browse All 13 Models</button>
          </div>
        </div>
      </div>
    `;

    // Wire suggestion pills inside the welcome card
    target.querySelectorAll('.welcome-pill').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const query = btn.getAttribute('data-welcome-query');
        const action = btn.getAttribute('data-welcome-action');
        if (query) {
          hitTool({ query });
          showToast(`Sending: "${query}"`);
        } else if (action) {
          hitTool({ action: action === 'show_all' ? 'show_products' : action });
          showToast(`Showing: ${action}`);
        }
      });
    });
  }

  // Component A: Standard & Gallery Product Cards
  // Component A: Standard & Gallery Product Cards (Continuous Looping Marquee with 3-Card Viewport)
  function renderProductCards(container, products) {
    if (!products || products.length === 0) {
      container.innerHTML = `
        <div class="empty-placeholder">
          <h3>No Appliances Found</h3>
          <p>Try searching for a different price range or ask the agent to show all models.</p>
        </div>
      `;
      return;
    }
    prepareViewTransition(container);

    const isSingle = products.length === 1;
    const isDual = products.length === 2;
    const isMarquee = products.length >= 3;

    function renderCard(item, index, keySuffix = '') {
      const price = Number(item.price || 0);
      const mrp = Number(item.mrp || 0);
      const savings = Number(item.savings || (mrp > price ? mrp - price : 0));
      const discount = item.discountPercent || (mrp > 0 && price > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0);
      const categoryLabel = item.categoryLabel || item.type || (item.category === 'chimney' ? 'Kitchen Chimney' : 'Dishwasher');
      const highlightTag = item.highlight || (item.isOffer ? 'Free Gift Inside' : 'Extended Warranty');

      return `
        <article class="product-card" data-key="${item.modelName || item.name || index}-${keySuffix}">
          <div class="product-image-box">
            <div class="card-badge-container">
              <span class="badge-brand-kicker">FABER</span>
              <span class="badge-feature-highlight">${highlightTag}</span>
            </div>
            <img src="${item.imageUrl}" alt="${item.name || item.title}" loading="eager" />
          </div>

          <div class="card-details">
            <div class="card-header-info">
              <span class="card-category-label">${categoryLabel}</span>
              <h3 class="card-title">${item.name || item.title}</h3>
            </div>

            ${item.keyFeatures && item.keyFeatures.length > 0 ? `
              <ul class="card-features-bullet-list">
                ${item.keyFeatures.slice(0, 3).map(f => `<li>• ${f}</li>`).join('')}
              </ul>
            ` : (item.suctionPower ? `
              <ul class="card-features-bullet-list">
                <li>• Suction: ${item.suctionPower}</li>
                <li>• Filterless Auto-Clean Technology</li>
                <li>• Motion Sensor Gesture Control</li>
              </ul>
            ` : `
              <ul class="card-features-bullet-list">
                <li>• Capacity: ${item.capacity || '14-Place RapidDry'}</li>
                <li>• Multi-Wash Hygienic Spray Arms</li>
                <li>• Ultra-Silent BLDC Inverter Motor</li>
              </ul>
            `)}

            ${price > 0 ? `
              <div class="price-container">
                ${discount > 0 ? `
                  <div class="badge-faber-red" title="Faber Promotional Savings">
                    <span>Faber Red</span>
                    <strong>${discount}% OFF</strong>
                  </div>
                ` : ''}
                <div class="price-amounts-col">
                  ${mrp > price ? `<span class="price-mrp">Was ₹${mrp.toLocaleString('en-IN')}</span>` : ''}
                  <span class="price-amount">₹${price.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ` : ''}

            <div class="card-footer-cta">
              <a href="${item.imageUrl}" target="_blank" class="btn-product-cta" rel="noopener">
                Try Visualizer →
              </a>
            </div>
          </div>
        </article>
      `;
    }

    if (products.length === 1) {
      container.innerHTML = `
        <div class="product-grid single-item">
          ${renderCard(products[0], 0)}
        </div>
      `;
      return;
    }

    if (products.length === 2) {
      container.innerHTML = `
        <div class="product-grid dual-item">
          ${renderCard(products[0], 0)}
          ${renderCard(products[1], 1)}
        </div>
      `;
      return;
    }

    // Group products into pairs of 2 for stepped vertical sliding (bottom to top)
    const pairs = [];
    for (let i = 0; i < products.length; i += 2) {
      pairs.push(products.slice(i, i + 2));
    }

    let currentSlide = 0;
    const totalSlides = pairs.length;

    container.innerHTML = `
      <div class="product-stepper-wrapper" id="product-stepper-wrapper">
        <div class="stepper-header-bar">
          <div class="stepper-header-left">
            <span class="stepper-live-dot"></span>
            <span class="stepper-title-txt">SHOWCASE • 2 AT A TIME</span>
            <span class="badge-stepper-page" id="stepper-counter-badge">1–2 of ${products.length}</span>
          </div>

          <div class="stepper-header-right">
            <div class="stepper-dots-nav" id="stepper-dots-nav">
              ${pairs.map((_, idx) => `
                <button class="stepper-dot ${idx === 0 ? 'active' : ''}" data-slide="${idx}" title="Go to items ${idx * 2 + 1}–${Math.min((idx + 1) * 2, products.length)}" aria-label="Slide ${idx + 1}"></button>
              `).join('')}
            </div>

            <div class="stepper-nav-arrows">
              <button class="btn-stepper-arrow" id="btn-stepper-prev" title="Previous 2 appliances (Up)" aria-label="Previous pair">▲</button>
              <button class="btn-stepper-arrow" id="btn-stepper-next" title="Next 2 appliances (Down)" aria-label="Next pair">▼</button>
            </div>
          </div>
        </div>

        <div class="product-stepper-viewport" id="product-stepper-viewport">
          <div class="product-stepper-track" id="product-stepper-track" style="transform: translateY(0%);">
            ${pairs.map((pair, pIdx) => `
              <div class="product-stepper-slide ${pair.length === 1 ? 'single-card-slide' : ''}" data-pair="${pIdx}">
                ${pair.map((item, i) => renderCard(item, pIdx * 2 + i)).join('')}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Connect slider controls & bottom-to-top auto-advancing logic
    const track = container.querySelector('#product-stepper-track');
    const counterBadge = container.querySelector('#stepper-counter-badge');
    const dots = container.querySelectorAll('.stepper-dot');
    const btnPrev = container.querySelector('#btn-stepper-prev');
    const btnNext = container.querySelector('#btn-stepper-next');
    const wrapper = container.querySelector('#product-stepper-wrapper');

    function goToSlide(index) {
      if (!track) return;
      currentSlide = (index + totalSlides) % totalSlides;
      // Bottom to top vertical slide transition
      track.style.transform = `translateY(-${currentSlide * 100}%)`;

      // Update counter badge
      if (counterBadge) {
        const startIdx = currentSlide * 2 + 1;
        const endIdx = Math.min((currentSlide + 1) * 2, products.length);
        counterBadge.textContent = `${startIdx}–${endIdx} of ${products.length}`;
      }

      // Update dot states
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentSlide);
      });
    }

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        goToSlide(currentSlide - 1);
        resetAutoAdvance();
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        goToSlide(currentSlide + 1);
        resetAutoAdvance();
      });
    }

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const target = parseInt(dot.getAttribute('data-slide'), 10);
        if (!isNaN(target)) {
          goToSlide(target);
          resetAutoAdvance();
        }
      });
    });

    // Auto-advance bottom-to-top every 3.8 seconds
    let autoAdvanceTimer = null;
    function startAutoAdvance() {
      if (autoAdvanceTimer) clearInterval(autoAdvanceTimer);
      autoAdvanceTimer = setInterval(() => {
        goToSlide(currentSlide + 1);
      }, 3800);
    }

    function stopAutoAdvance() {
      if (autoAdvanceTimer) {
        clearInterval(autoAdvanceTimer);
        autoAdvanceTimer = null;
      }
    }

    function resetAutoAdvance() {
      stopAutoAdvance();
      startAutoAdvance();
    }

    // Pause on hover
    if (wrapper) {
      wrapper.addEventListener('mouseenter', stopAutoAdvance);
      wrapper.addEventListener('mouseleave', startAutoAdvance);

      // Mouse wheel stepped navigation (throttled)
      let wheelThrottled = false;
      wrapper.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaY) > 20 || Math.abs(e.deltaX) > 20) {
          e.preventDefault();
          if (wheelThrottled) return;
          wheelThrottled = true;
          const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
          if (delta > 0) {
            goToSlide(currentSlide + 1); // Wheel down -> Next 2 (bottom to top)
          } else {
            goToSlide(currentSlide - 1); // Wheel up -> Previous 2
          }
          resetAutoAdvance();
          setTimeout(() => {
            wheelThrottled = false;
          }, 450);
        }
      }, { passive: false });

      // Touch / swipe support (vertical swipe)
      let touchStartY = 0;
      wrapper.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
      }, { passive: true });

      wrapper.addEventListener('touchend', (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        const diffY = touchEndY - touchStartY;
        if (Math.abs(diffY) > 40) {
          if (diffY < 0) {
            goToSlide(currentSlide + 1); // Swipe up -> Next 2 (bottom to top)
          } else {
            goToSlide(currentSlide - 1); // Swipe down -> Previous 2
          }
          resetAutoAdvance();
        }
      }, { passive: true });
    }

    startAutoAdvance();
  }

  // Component B: Side-by-Side Comparison Matrix (Inspired by Faber Comparison Mockup)
  function renderComparisonMatrix(container, products, title) {
    if (!container) return;
    prepareViewTransition(container);
    container.innerHTML = `
      <div class="comparison-card">
        <div class="comparison-header-banner">
          <div class="comparison-header-left">
            <h3 class="comparison-title-uppercase">COMPARISON MATRIX</h3>
            <span class="badge-item-count">${products.length} Items</span>
          </div>
          <div class="comparison-header-controls">
            <div class="table-scroll-arrows">
              <button class="btn-matrix-scroll" id="btn-matrix-scroll-left" title="Scroll matrix left" aria-label="Scroll left">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button class="btn-matrix-scroll" id="btn-matrix-scroll-right" title="Scroll matrix right" aria-label="Scroll right">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>
        </div>

        <div class="comparison-table-scroll" id="comparison-table-scroll">
          <table class="comparison-table">
            <thead>
              <tr>
                <th class="matrix-spec-header">Appliance</th>
                ${products.map(p => {
                  return `
                    <td class="comparison-product-header">
                      <div class="matrix-img-box">
                        <img src="${p.imageUrl}" alt="${p.name}" />
                      </div>
                      <div class="matrix-brand-kicker">FABER</div>
                      <h4 class="matrix-product-title">${p.name}</h4>
                    </td>
                  `;
                }).join('')}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Price</th>
                ${products.map(p => {
                  const price = Number(p.price || 0);
                  const mrp = Number(p.mrp || 0);
                  const discount = p.discountPercent || (mrp > 0 && price > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0);
                  return `
                    <td>
                      <div class="matrix-price-cell">
                        <div class="matrix-price-main">
                          <span class="matrix-price-val">₹${price.toLocaleString('en-IN')}</span>
                          ${mrp > price ? `<span class="matrix-price-mrp">Was ₹${mrp.toLocaleString('en-IN')}</span>` : ''}
                        </div>
                        ${discount > 0 ? `
                          <div class="badge-faber-red matrix-red-pill">
                            <span>Faber Red</span>
                            <strong>${discount}% OFF</strong>
                          </div>
                        ` : ''}
                      </div>
                    </td>
                  `;
                }).join('')}
              </tr>
              <tr>
                <th>Airflow / Cap</th>
                ${products.map(p => `<td><strong>${p.suctionPower || p.capacity || '-'}</strong></td>`).join('')}
              </tr>
              <tr>
                <th>Filter Tech</th>
                ${products.map(p => `<td><strong>${p.filterDesign || p.cleaningFunction || 'Filterless Tech'}</strong></td>`).join('')}
              </tr>
              <tr>
                <th>Controls</th>
                ${products.map(p => `<td>${p.controls || 'Motion Gesture & Touch'}</td>`).join('')}
              </tr>
              <tr>
                <th>Warranty</th>
                ${products.map(p => `<td>${p.warranty || '2 Years Faber Warranty'}</td>`).join('')}
              </tr>
              <tr>
                <th>Action</th>
                ${products.map(p => `
                  <td>
                    <a href="${p.imageUrl}" target="_blank" class="btn-product-cta matrix-cta" rel="noopener">
                      Try Visualizer →
                    </a>
                  </td>
                `).join('')}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Wire smooth horizontal scrolling arrows
    const btnLeft = container.querySelector('#btn-matrix-scroll-left');
    const btnRight = container.querySelector('#btn-matrix-scroll-right');
    const scrollContainer = container.querySelector('#comparison-table-scroll');

    if (btnLeft && scrollContainer) {
      btnLeft.addEventListener('click', () => scrollContainer.scrollBy({ left: -260, behavior: 'smooth' }));
    }
    if (btnRight && scrollContainer) {
      btnRight.addEventListener('click', () => scrollContainer.scrollBy({ left: 260, behavior: 'smooth' }));
    }
  }

  // Component C: Replaced with 4-Step Chimney Installation Visual
  function renderLoadingGuide(container, guideData) {
    if (displayModeBadge) displayModeBadge.textContent = 'Installation Guide';
    renderChimneyInstallation(container);
  }

  // Component D: User Manual & Comprehensive Maintenance / Troubleshooting Guide
  function renderUserManual(container, manualData) {
    const data = manualData || {};
    const autoClean = data.chimneyAutoClean || {};
    const steps = autoClean.steps || [];
    const gesture = data.gestureControl || {};
    const filterless = data.filterlessMaintenance || {};
    const install = data.installationGuide || {};
    const troubleshooting = data.troubleshootingGuide || {};
    const troubleshootItems = troubleshooting.items || [];
    const dishCare = data.dishwasherCare || {};

    container.innerHTML = `
      <div class="manual-container">
        <!-- 1. Auto-Clean Procedure Card -->
        <section class="manual-box-card">
          <div class="manual-section-header">
            <div>
              <h3>♨️ Chimney Heat Auto-Clean Step-by-Step Procedure</h3>
              <p class="section-subtext">Automated thermal coil liquefaction channels heavy grease into the collector tray</p>
            </div>
            <span class="price-discount-pill" style="color: #0284c7; background: #e0f2fe; border-color: #bae6fd;">10-Min Thermal Cycle</span>
          </div>

          <div class="autoclean-timeline">
            <div class="step-box">
              <span class="step-num-badge">1</span>
              <h4>Press Auto-Clean</h4>
              <p>Touch the Auto-Clean icon on the curved glass panel or trigger the wave gesture sensor.</p>
            </div>
            <div class="step-box">
              <span class="step-num-badge">2</span>
              <h4>Heating Phase (9 Mins)</h4>
              <p>Internal heating elements warm up the motor chamber to liquefy thick oil and stubborn grease.</p>
            </div>
            <div class="step-box">
              <span class="step-num-badge">3</span>
              <h4>Fan Drain Phase (1 Min)</h4>
              <p>High-speed blower fan rotates to channel the liquefied grease directly into the stainless steel collector.</p>
            </div>
            <div class="step-box">
              <span class="step-num-badge">4</span>
              <h4>Empty Collector Tray</h4>
              <p>Slide out the metal collector tray, dispose of accumulated oil, wash with warm soapy water, and replace.</p>
            </div>
          </div>
        </section>

        <!-- 2. Touch & Wave Gesture Control Operation Card (FAQ Q19-Q21) -->
        <section class="manual-box-card">
          <div class="manual-section-header">
            <div>
              <h3>👋 Touch & Wave Gesture Control Operating Guide</h3>
              <p class="section-subtext">Hands-free optical motion sensor operating at 5–10 cm distance across 9 speed levels</p>
            </div>
            <span class="view-badge">9 Speeds Control</span>
          </div>

          <div class="gesture-grid">
            <div class="gesture-card gesture-card-on">
              <div class="gesture-card-header">
                <span class="gesture-icon">👋 ➡️</span>
                <span class="gesture-badge badge-on">Power ON / Step Up</span>
              </div>
              <h4>Wave Left-to-Right</h4>
              <p>Wave hand smoothly from left to right across the optical sensor to turn chimney on at Speed 1. Successive waves increment speed through all 9 BLDC levels up to Speed 9.</p>
            </div>

            <div class="gesture-card gesture-card-off">
              <div class="gesture-card-header">
                <span class="gesture-icon">⬅️ 👋</span>
                <span class="gesture-badge badge-off">Step Down / Power OFF</span>
              </div>
              <h4>Wave Right-to-Left</h4>
              <p>Wave hand smoothly from right to left to step down speed level (9 → 1). A final wave at Speed 1 powers off the chimney completely.</p>
            </div>

            <div class="gesture-card gesture-card-touch">
              <div class="gesture-card-header">
                <span class="gesture-icon">👆 🔘</span>
                <span class="gesture-badge badge-touch">Capacitive Touch</span>
              </div>
              <h4>Direct Glass Touch Panel</h4>
              <p>Touch icons on the black tempered glass panel offer direct 1-tap control for all 9 speeds, LED lighting, and Auto-Clean when hands are wet or oily.</p>
            </div>
          </div>
        </section>

        <!-- 3. Filterless Reality & Maintenance Guidelines Card (FAQ Q13-Q18) -->
        <section class="manual-box-card">
          <div class="filterless-notice-box">
            <div class="notice-header">
              <span class="notice-icon">ℹ️</span>
              <strong>Filterless Reality Check: Filterless ≠ Maintenance-Free</strong>
            </div>
            <p>
              Filterless design eliminates messy baffle filters and wire mesh scrub replacements. However, regular maintenance remains essential:
              wipe exterior glass and canopy weekly with a damp microfiber cloth, empty the metal oil collector tray every 2–3 weeks, and trigger Auto-Clean monthly.
            </p>
          </div>
        </section>

        <!-- 4. Cooktop Sizing & Installation Clearance Card (FAQ Q27-Q30) -->
        <section class="manual-box-card">
          <div class="manual-section-header">
            <div>
              <h3>📐 Cooktop Sizing & Installation Clearance</h3>
              <p class="section-subtext">Recommended chimney width coverage and mounting guidelines</p>
            </div>
            <span class="view-badge">650–750 mm Height</span>
          </div>

          <div class="cooktop-sizing-grid">
            <div class="size-item">
              <span class="size-width">60 cm Hood (600 mm)</span>
              <span class="size-dims">600 × 418 × 485 mm</span>
              <p>Best suited for 2 to 4 burner cooktops up to 60 cm wide.</p>
            </div>
            <div class="size-item">
              <span class="size-width">75 cm Hood (750 mm)</span>
              <span class="size-dims">750 × 418 × 490 mm</span>
              <p>Best suited for 3 to 4 burner cooktops up to 75 cm wide.</p>
            </div>
            <div class="size-item">
              <span class="size-width">90 cm Hood (900 mm)</span>
              <span class="size-dims">900 × 418 × 490 mm</span>
              <p>Best suited for 3 to 5 burner cooktops (75 to 90 cm wide).</p>
            </div>
          </div>
        </section>

        <!-- 5. Customer Support Troubleshooting Matrix Card (FAQ Section 10) -->
        <section class="manual-box-card">
          <div class="manual-section-header">
            <div>
              <h3>🛠️ Customer Support Troubleshooting Matrix</h3>
              <p class="section-subtext">Official Faber first-response troubleshooting guide for common complaints</p>
            </div>
            <span class="price-discount-pill" style="color: #7c3aed; background: #faf5ff; border-color: #e9d5ff;">Official Support FAQ</span>
          </div>

          <div class="troubleshooting-grid">
            ${(troubleshootItems.length > 0 ? troubleshootItems : [
              { complaint: 'Chimney is not switching on', firstResponse: 'Check main power switch, wall socket plug point, and electrical voltage. If responsive neither to touch nor gesture, arrange authorized Faber service inspection.' },
              { complaint: 'Suction appears weak', firstResponse: 'Verify selected speed level (use Speeds 6–9 for deep frying / tadka). Check for obstructions in duct pipe, outer exhaust louvers, or full oil collector tray.' },
              { complaint: 'Chimney sounds noisy / loud', firstResponse: 'The Libra BLDC operates at an ultra-quiet 44–46 dB. Verify sound variation across speeds. Persistent unusual noise may indicate duct pipe bends or loose mounting; call Faber service.' },
              { complaint: 'Gesture control is not responding', firstResponse: 'Ensure the front glass sensor is clean and dry. Wave hand at 5–10 cm distance with steady movement. Check if touch controls work normally.' },
              { complaint: 'Auto-clean is not working', firstResponse: 'Ensure the 10-minute cycle is initiated (9 min heating + 1 min fan). Do not run manual high-speed extraction during heating. If heating coil fails to warm, contact support.' },
              { complaint: 'Smoke is not being extracted effectively', firstResponse: 'Check installation height (must be 65–75 cm above burners) and verify the hood width matches the cooktop surface area.' },
              { complaint: 'Oil or residue is accumulating / dripping', firstResponse: 'Empty and wash the metal oil collector tray immediately. Run a 10-minute Heat Auto-Clean cycle and wipe down outer glass canopy.' },
              { complaint: 'Chimney vibrates during operation', firstResponse: 'Cease operation immediately if mounting appears loose or unsafe. Ensure wall brackets are tightly secured and arrange professional service.' }
            ]).map(t => `
              <div class="trouble-card">
                <div class="trouble-complaint">
                  <span class="trouble-q-badge">Issue</span>
                  <strong>${t.complaint}</strong>
                </div>
                <div class="trouble-response">
                  <span class="trouble-a-badge">Faber Recommended Action</span>
                  <p>${t.firstResponse}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- 6. Dishwasher Maintenance & Care Card -->
        <section class="manual-box-card">
          <div class="manual-section-header">
            <div>
              <h3>✨ Dishwasher Essential Maintenance & Chemical Guide</h3>
              <p class="section-subtext">Prevent limescale, water spots, and ensure sparkling hygiene</p>
            </div>
            <span class="price-discount-pill">Routine Care</span>
          </div>

          <div class="care-checklist">
            <div class="care-item">
              <h4>🧂 Dishwasher Salt Refill</h4>
              <p>Essential for hard Indian water. Softens water in the ion-exchanger to prevent cloudy white limescale stains on stainless steel utensils.</p>
            </div>
            <div class="care-item">
              <h4>💧 Rinse Aid Dispenser</h4>
              <p>Accelerates spot-free sheet drying and eliminates water droplet marks on glasses and cutlery.</p>
            </div>
            <div class="care-item">
              <h4>🔄 Triple-Stage Filter</h4>
              <p>Unscrew cylindrical filter at the tub bottom weekly, rinse trapped food particles under running tap water, and lock back in place.</p>
            </div>
            <div class="care-item">
              <h4>🚫 Detergent Safety</h4>
              <p>Use ONLY automatic dishwasher tablets, powder, or gel. Never use liquid Vim/Pril which causes massive foam overflows.</p>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  // Component E: Offers & Deals Showcase (Inspired by Faber Reference Mockup 3)
  function renderOffersShowcase(container, products, title) {
    container.innerHTML = `
      <div class="festive-offers-banner">
        <div class="festive-sparkle-decor">✨</div>
        <div class="festive-banner-content">
          <span class="festive-eyebrow">• FESTIVE CELEBRATIONS •</span>
          <h2 class="festive-headline">EXCLUSIVE FESTIVE OFFERS</h2>
          <p class="festive-subline">Get Up To 40% OFF + Assured Gifts on Faber Flagships</p>
        </div>
        <button class="btn-festive-cta" id="btn-festive-filterless">
          Try Visualizer →
        </button>
      </div>
      <div class="festive-combos-header">
        <span class="festive-combos-kicker">FESTIVE COMBOS &amp; PROMOTIONAL SAVINGS</span>
      </div>
      <div id="offers-grid-container"></div>
    `;
    const subContainer = document.getElementById('offers-grid-container');
    renderProductCards(subContainer, products);

    const btnFestive = container.querySelector('#btn-festive-filterless');
    if (btnFestive) {
      btnFestive.addEventListener('click', () => {
        hitTool({ action: 'filter_by_price', category: 'chimney', filter: 'filterless', isOffer: true, maxPrice: 25000 });
      });
    }
  }

  // Component F: Chimney Installation Guide (Interactive 4-Step Animated Highlighter)
  function renderChimneyInstallation(container) {
    if (!container) return;

    if (displaySubtitle) {
      displaySubtitle.textContent = 'BLDC Autoclean Cooker Hood Step-by-Step Installation Manual';
    }

    container.innerHTML = `
      <div class="installation-guide-card" id="installation-guide-comp">
        <header class="guide-header">
          <div class="brand-title-group">
            <div class="brand-wordmark">
              <span class="brand-wordmark-text">FABER</span>
              <span class="brand-accent-line"></span>
            </div>
            <h1 class="main-title">INSTALLATION OF THE CHIMNEY</h1>
            <div class="sub-title">BLDC AUTOCLEAN COOKER HOOD</div>
          </div>

          <div class="playback-controls">
            <button id="btn-toggle-cycle-pane" class="btn-auto-play-toggle" title="Pause or Resume Auto Cycle">
              <span id="cycle-icon-pane">⏸</span>
              <span id="cycle-text-pane">Auto Cycle Active</span>
            </button>
          </div>

          <nav class="steps-nav-tracker" aria-label="Installation Steps">
            <div class="step-nav-item active" data-step="1">
              <div class="step-circle">1</div>
              <span class="step-label">Prepare Wall</span>
            </div>
            <div class="step-nav-item" data-step="2">
              <div class="step-circle">2</div>
              <span class="step-label">Fix Bracket</span>
            </div>
            <div class="step-nav-item" data-step="3">
              <div class="step-circle">3</div>
              <span class="step-label">Mount Chimney</span>
            </div>
            <div class="step-nav-item" data-step="4">
              <div class="step-circle">4</div>
              <span class="step-label">Connect &amp; Test</span>
            </div>
          </nav>
        </header>

        <main class="installation-canvas">
          <div class="steps-column">
            <article class="step-card active" id="pane-step-card-1" data-step="1">
              <div class="step-info-col">
                <div class="step-title-header">
                  <span class="step-num-pill">01</span>
                  <h2 class="step-heading">PREPARE THE WALL</h2>
                </div>
                <ul class="step-bullets-list">
                  <li>Ensure the wall is strong enough to hold the chimney.</li>
                  <li>Mark the level mounting positions as per the measurements.</li>
                  <li>Drill holes and insert suitable wall plugs.</li>
                </ul>
              </div>
              <div class="step-square-box" title="Step 1: Wall Drilling Image">
                <img src="images/step1_prepare_wall.jpg" alt="Prepare and drill wall" />
              </div>
            </article>

            <article class="step-card" id="pane-step-card-2" data-step="2">
              <div class="step-info-col">
                <div class="step-title-header">
                  <span class="step-num-pill">02</span>
                  <h2 class="step-heading">FIX THE BRACKET</h2>
                </div>
                <ul class="step-bullets-list">
                  <li>Secure the wall mounting bracket with appropriate screws.</li>
                  <li>Ensure the bracket is level and properly aligned.</li>
                  <li>Use the correct wall plugs and screws for your wall type.</li>
                </ul>
              </div>
              <div class="step-square-box" title="Step 2: Fixing Mounting Bracket Image">
                <img src="images/step2_fix_bracket.jpg" alt="Fixing bracket with screws" />
              </div>
            </article>
          </div>

          <div class="hero-center-column">
            <div class="hero-chimney-img-box">
              <img src="images/chimney_installation_hero.jpg" alt="Faber Chimney Installed Diagram" />
              <div class="hero-pointer-tag pointer-pos-01 active" id="pane-pointer-01" data-step="1" title="01: Wall Mounting Anchors">01</div>
              <div class="hero-pointer-tag pointer-pos-02" id="pane-pointer-02" data-step="2" title="02: Wall Mounting Bracket">02</div>
              <div class="hero-pointer-tag pointer-pos-03" id="pane-pointer-03" data-step="3" title="03: Chimney Body Hanging Point">03</div>
              <div class="hero-pointer-tag pointer-pos-04" id="pane-pointer-04" data-step="4" title="04: Corrugated Duct & Wall Flange">04</div>
            </div>
          </div>

          <div class="steps-column">
            <article class="step-card" id="pane-step-card-3" data-step="3">
              <div class="step-info-col">
                <div class="step-title-header">
                  <span class="step-num-pill">03</span>
                  <h2 class="step-heading">MOUNT THE CHIMNEY</h2>
                </div>
                <ul class="step-bullets-list">
                  <li>With two people, carefully hang the hood on the wall bracket.</li>
                  <li>Ensure the chimney is level.</li>
                  <li>Secure the hood body and fix the chimney cover / spacers as per the model.</li>
                </ul>
              </div>
              <div class="step-square-box" title="Step 3: Mounting Chimney Image">
                <img src="images/step3_mount_chimney.jpg" alt="Mount chimney on bracket" />
              </div>
            </article>

            <article class="step-card" id="pane-step-card-4" data-step="4">
              <div class="step-info-col">
                <div class="step-title-header">
                  <span class="step-num-pill">04</span>
                  <h2 class="step-heading">CONNECT &amp; TEST</h2>
                </div>
                <ul class="step-bullets-list">
                  <li>Connect the exhaust pipe to the hood and to the wall outlet.</li>
                  <li>Ensure a proper seal to avoid leakage.</li>
                  <li>Connect only to an earthed power socket after installation.</li>
                  <li>Test all functions for normal operation (fan, lights, auto-clean, etc.).</li>
                </ul>
              </div>
              <div class="step-square-box" title="Step 4: Exhaust Duct and Power Connection Image">
                <img src="images/step4_connect_test.jpg" alt="Connect exhaust duct and power socket" />
              </div>
            </article>
          </div>
        </main>

        <footer class="guide-bottom-strip">
          <div class="bottom-info-card">
            <div class="bottom-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="5" y="2" width="14" height="6" rx="1" />
                <line x1="3" y1="18" x2="21" y2="18" />
                <line x1="12" y1="9" x2="12" y2="15" />
                <polyline points="9 11 12 8 15 11" />
                <polyline points="9 13 12 16 15 13" />
              </svg>
            </div>
            <div class="bottom-card-text">
              <span class="bottom-card-title">Mounting height</span>
              <p class="bottom-card-desc">Verify the correct clearance for your model with an authorised installer (650–750 mm above cooktop).</p>
            </div>
          </div>

          <div class="bottom-info-card">
            <div class="bottom-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="5" stroke-dasharray="2 2" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
            <div class="bottom-card-text">
              <span class="bottom-card-title">Outlet hole</span>
              <p class="bottom-card-desc">Outlet hole shown in manual: 160 mm; confirm model requirements before drilling.</p>
            </div>
          </div>

          <div class="bottom-notice-card">
            <div class="notice-shield-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <div class="notice-card-text">
              <span class="notice-card-title">Installation by an authorised service representative</span>
              <p class="notice-card-desc">Two people required to move/install. Call 1800-209-3484 for Faber authorized technician.</p>
            </div>
          </div>
        </footer>
      </div>
    `;

    initInstallationStepCycle(container);
  }

  function initInstallationStepCycle(container) {
    if (!container) return;
    let currentStep = 1;
    const totalSteps = 4;
    let autoPlay = true;
    let cycleTimer = null;
    const cycleIntervalMs = 3800;

    const navItems = container.querySelectorAll('.step-nav-item');
    const stepCards = container.querySelectorAll('.step-card');
    const pointerTags = container.querySelectorAll('.hero-pointer-tag');
    const btnToggle = container.querySelector('#btn-toggle-cycle-pane');
    const cycleIcon = container.querySelector('#cycle-icon-pane');
    const cycleText = container.querySelector('#cycle-text-pane');
    const compCard = container.querySelector('#installation-guide-comp');

    function setActiveStep(stepNum) {
      currentStep = Number(stepNum);

      navItems.forEach((nav) => {
        const s = Number(nav.getAttribute('data-step'));
        nav.classList.toggle('active', s === currentStep);
      });

      stepCards.forEach((card) => {
        const s = Number(card.getAttribute('data-step'));
        card.classList.toggle('active', s === currentStep);
      });

      pointerTags.forEach((ptr) => {
        const s = Number(ptr.getAttribute('data-step'));
        ptr.classList.toggle('active', s === currentStep);
      });
    }

    function nextStep() {
      let next = currentStep + 1;
      if (next > totalSteps) next = 1;
      setActiveStep(next);
    }

    function startCycle() {
      if (cycleTimer) clearInterval(cycleTimer);
      cycleTimer = setInterval(nextStep, cycleIntervalMs);
      autoPlay = true;
      if (cycleIcon) cycleIcon.textContent = '⏸';
      if (cycleText) cycleText.textContent = 'Auto Cycle Active';
    }

    function stopCycle() {
      if (cycleTimer) {
        clearInterval(cycleTimer);
        cycleTimer = null;
      }
      autoPlay = false;
      if (cycleIcon) cycleIcon.textContent = '▶';
      if (cycleText) cycleText.textContent = 'Paused (Click to play)';
    }

    navItems.forEach((nav) => {
      nav.addEventListener('click', () => {
        setActiveStep(nav.getAttribute('data-step'));
        stopCycle();
      });
    });

    stepCards.forEach((card) => {
      card.addEventListener('click', () => {
        setActiveStep(card.getAttribute('data-step'));
        stopCycle();
      });
    });

    pointerTags.forEach((ptr) => {
      ptr.addEventListener('click', () => {
        setActiveStep(ptr.getAttribute('data-step'));
        stopCycle();
      });
    });

    if (btnToggle) {
      btnToggle.addEventListener('click', () => {
        if (autoPlay) stopCycle();
        else startCycle();
      });
    }

    if (compCard) {
      compCard.addEventListener('mouseenter', () => {
        if (autoPlay && cycleTimer) clearInterval(cycleTimer);
      });
      compCard.addEventListener('mouseleave', () => {
        if (autoPlay) startCycle();
      });
    }

    setActiveStep(1);
    startCycle();
  }

  // ==========================================================================
  // COMPONENT: CHIMNEY CLEANING & SERVICING GUIDE (Faber Reference Blueprint)
  // ==========================================================================
  function renderChimneyCleaning(container) {
    if (!container) return;

    if (displaySubtitle) {
      displaySubtitle.textContent = 'Heat Auto-Clean & Stainless Steel Oil Collector Maintenance';
    }

    container.innerHTML = `
      <div class="installation-guide-card" id="chimney-cleaning-comp">
        <header class="guide-header">
          <div class="brand-title-group">
            <div class="brand-wordmark">
              <span class="brand-wordmark-text">FABER</span>
              <span class="brand-accent-line"></span>
            </div>
            <h1 class="main-title">CLEANING &amp; MAINTENANCE OF THE CHIMNEY</h1>
            <div class="sub-title">HEAT AUTO-CLEAN &amp; FILTERLESS BLDC COOKER HOOD</div>
          </div>

          <div class="playback-controls">
            <button id="btn-toggle-cleaning-cycle" class="btn-auto-play-toggle" title="Pause or Resume Auto Cycle">
              <span id="cycle-icon-clean">⏸</span>
              <span id="cycle-text-clean">Auto Cycle Active</span>
            </button>
          </div>

          <nav class="steps-nav-tracker" aria-label="Cleaning Steps">
            <div class="step-nav-item active" data-step="1">
              <div class="step-circle">1</div>
              <span class="step-label">Surface Care</span>
            </div>
            <div class="step-nav-item" data-step="2">
              <div class="step-circle">2</div>
              <span class="step-label">Heat Melting</span>
            </div>
            <div class="step-nav-item" data-step="3">
              <div class="step-circle">3</div>
              <span class="step-label">Blower Flush</span>
            </div>
            <div class="step-nav-item" data-step="4">
              <div class="step-circle">4</div>
              <span class="step-label">Oil Collector</span>
            </div>
          </nav>
        </header>

        <main class="installation-canvas">
          <div class="steps-column">
            <article class="step-card active" id="clean-step-card-1" data-step="1">
              <div class="step-info-col">
                <div class="step-title-header">
                  <span class="step-num-pill">01</span>
                  <h2 class="step-heading">REGULAR SURFACE CARE</h2>
                </div>
                <ul class="step-bullets-list">
                  <li>Clean the exterior shell every 3 days.</li>
                  <li>Wipe curved tempered glass with soft microfiber cloth &amp; mild neutral detergent.</li>
                  <li>Auto-clean reminder appears after approx 30 hours of operation.</li>
                </ul>
              </div>
              <div class="step-square-box" title="Step 1: Microfiber Surface Cleaning">
                <img src="images/clean_step1_surface.jpg" alt="Surface cleaning with microfiber" />
              </div>
            </article>

            <article class="step-card" id="clean-step-card-2" data-step="2">
              <div class="step-info-col">
                <div class="step-title-header">
                  <span class="step-num-pill">02</span>
                  <h2 class="step-heading">9-MIN THERMAL MELTING</h2>
                </div>
                <ul class="step-bullets-list">
                  <li>Press 1-touch Auto-Clean button on panel.</li>
                  <li>Heating coil encasing blower chamber heats to ~80°C.</li>
                  <li>Liquefies thick sticky grease, ghee &amp; tadka residue hands-free.</li>
                </ul>
              </div>
              <div class="step-square-box" title="Step 2: 80°C Heating Coil Melting">
                <img src="images/clean_step2_heat.jpg" alt="Heating coil melting grease" />
              </div>
            </article>
          </div>

          <div class="hero-center-column">
            <div class="hero-chimney-img-box">
              <img src="images/clean_hero_diag.jpg" alt="Faber Heat Auto-Clean System Diagram" />
              <div class="hero-pointer-tag active" style="bottom: 26%; left: 16%;" id="clean-pointer-01" data-step="1" title="01: Tempered Curved Glass Shell">01</div>
              <div class="hero-pointer-tag" style="top: 36%; right: 36%;" id="clean-pointer-02" data-step="2" title="02: 80°C Internal Heating Coil">02</div>
              <div class="hero-pointer-tag" style="top: 48%; left: 45%;" id="clean-pointer-03" data-step="3" title="03: Centrifugal Blower Turbine">03</div>
              <div class="hero-pointer-tag" style="bottom: 12%; left: 48%;" id="clean-pointer-04" data-step="4" title="04: Stainless Steel Oil Collector Tray">04</div>
            </div>
          </div>

          <div class="steps-column">
            <article class="step-card" id="clean-step-card-3" data-step="3">
              <div class="step-info-col">
                <div class="step-title-header">
                  <span class="step-num-pill">03</span>
                  <h2 class="step-heading">1-MIN CENTRIFUGE FLUSH</h2>
                </div>
                <ul class="step-bullets-list">
                  <li>At minute 9, 1500 m³/hr BLDC motor spins high-speed centrifugal flush.</li>
                  <li>Expels liquefied oil droplets into drainage channel.</li>
                  <li>Prevents sticky oil accumulation on motor blades.</li>
                </ul>
              </div>
              <div class="step-square-box" title="Step 3: Centrifugal Blower Flush">
                <img src="images/clean_step3_blower.jpg" alt="Centrifugal blower flushing oil" />
              </div>
            </article>

            <article class="step-card" id="clean-step-card-4" data-step="4">
              <div class="step-info-col">
                <div class="step-title-header">
                  <span class="step-num-pill">04</span>
                  <h2 class="step-heading">EMPTY OIL COLLECTOR</h2>
                </div>
                <ul class="step-bullets-list">
                  <li>Slide out stainless steel oil collector from bottom slot.</li>
                  <li>Empty grease residue every 15 to 20 days.</li>
                  <li>Rinse in warm soapy water, dry thoroughly, and slide back.</li>
                </ul>
              </div>
              <div class="step-square-box" title="Step 4: Slide-Out Oil Tray">
                <img src="images/clean_step4_oiltray.jpg" alt="Slide out stainless steel oil tray" />
              </div>
            </article>
          </div>
        </main>

        <footer class="guide-bottom-strip">
          <div class="bottom-info-card">
            <div class="bottom-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div class="bottom-card-text">
              <span class="bottom-card-title">3-Day Routine Maintenance</span>
              <p class="bottom-card-desc">Wipe exterior glass every 3 days. Run auto-clean when prompted after 30h cooking.</p>
            </div>
          </div>

          <div class="bottom-info-card">
            <div class="bottom-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <div class="bottom-card-text">
              <span class="bottom-card-title">6-Month Authorized Servicing</span>
              <p class="bottom-card-desc">Full internal blower overhaul &amp; impeller servicing every 6 months by authorized personnel only.</p>
            </div>
          </div>

          <div class="bottom-notice-card">
            <div class="notice-shield-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div class="notice-card-text">
              <span class="notice-card-title">Safety Restriction: Power Off First</span>
              <p class="notice-card-desc">Disconnect main power before cleaning. Non-professionals must never open internal motor/impeller.</p>
            </div>
          </div>
        </footer>
      </div>
    `;

    initCleaningStepCycle(container);
  }

  function initCleaningStepCycle(container) {
    if (!container) return;
    let currentStep = 1;
    const totalSteps = 4;
    let autoPlay = true;
    let cycleTimer = null;
    const cycleIntervalMs = 3800;

    const navItems = container.querySelectorAll('.step-nav-item');
    const stepCards = container.querySelectorAll('.step-card');
    const pointerTags = container.querySelectorAll('.hero-pointer-tag');
    const btnToggle = container.querySelector('#btn-toggle-cleaning-cycle');
    const cycleIcon = container.querySelector('#cycle-icon-clean');
    const cycleText = container.querySelector('#cycle-text-clean');
    const compCard = container.querySelector('#chimney-cleaning-comp');

    function setActiveStep(stepNum) {
      currentStep = Number(stepNum);

      navItems.forEach((nav) => {
        const s = Number(nav.getAttribute('data-step'));
        nav.classList.toggle('active', s === currentStep);
      });

      stepCards.forEach((card) => {
        const s = Number(card.getAttribute('data-step'));
        card.classList.toggle('active', s === currentStep);
      });

      pointerTags.forEach((ptr) => {
        const s = Number(ptr.getAttribute('data-step'));
        ptr.classList.toggle('active', s === currentStep);
      });
    }

    function nextStep() {
      let next = currentStep + 1;
      if (next > totalSteps) next = 1;
      setActiveStep(next);
    }

    function startCycle() {
      if (cycleTimer) clearInterval(cycleTimer);
      cycleTimer = setInterval(nextStep, cycleIntervalMs);
      autoPlay = true;
      if (cycleIcon) cycleIcon.textContent = '⏸';
      if (cycleText) cycleText.textContent = 'Auto Cycle Active';
    }

    function stopCycle() {
      if (cycleTimer) {
        clearInterval(cycleTimer);
        cycleTimer = null;
      }
      autoPlay = false;
      if (cycleIcon) cycleIcon.textContent = '▶';
      if (cycleText) cycleText.textContent = 'Paused (Click to play)';
    }

    navItems.forEach((nav) => {
      nav.addEventListener('click', () => {
        setActiveStep(nav.getAttribute('data-step'));
        stopCycle();
      });
    });

    stepCards.forEach((card) => {
      card.addEventListener('click', () => {
        setActiveStep(card.getAttribute('data-step'));
        stopCycle();
      });
    });

    pointerTags.forEach((ptr) => {
      ptr.addEventListener('click', () => {
        setActiveStep(ptr.getAttribute('data-step'));
        stopCycle();
      });
    });

    if (btnToggle) {
      btnToggle.addEventListener('click', () => {
        if (autoPlay) stopCycle();
        else startCycle();
      });
    }

    if (compCard) {
      compCard.addEventListener('mouseenter', () => {
        if (autoPlay && cycleTimer) clearInterval(cycleTimer);
      });
      compCard.addEventListener('mouseleave', () => {
        if (autoPlay) startCycle();
      });
    }

    setActiveStep(1);
    startCycle();
  }

  // ==========================================================================
  // COMPONENT: DISHWASHER MAINTENANCE & CHEMICAL CARE
  // ==========================================================================
  function renderDishwasherCleaning(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="component-dashboard-card" id="dishwasher-cleaning-comp">
        <header class="dash-header">
          <div class="dash-title-group">
            <span class="dash-kicker">Hygiene &amp; Longevity</span>
            <h2 class="dash-heading">DISHWASHER MAINTENANCE &amp; CHEMICAL CARE</h2>
            <span class="dash-subheading">Salt softener, rinse aid dispenser, 3-stage mesh filter &amp; monthly descaling</span>
          </div>
          <div class="dash-badge-pill blue">
            <span>💧 Water Softening System</span>
          </div>
        </header>

        <div class="dash-body-grid-4">
          <!-- Card 1: Dishwasher Salt -->
          <article class="dash-feature-card highlight">
            <div class="dash-card-top">
              <div class="dash-icon-box blue">🧂</div>
              <div>
                <span class="dash-kicker" style="color:#0284c7;">Step 01</span>
                <h3 class="dash-card-heading">DISHWASHER SALT</h3>
              </div>
            </div>
            <p class="dash-card-desc">Softens hard Indian water by recharging ion-exchange resin. Prevents white limescale buildup on stainless steel utensils.</p>
            <ul class="dash-card-bullets">
              <li>Refill tub base chamber with funnel.</li>
              <li>Top up when 'S' salt LED glows.</li>
              <li>Crucial for lifespan of internal pump.</li>
            </ul>
            <div class="dash-card-bottom-pill blue">Prevents Limescale Film</div>
          </article>

          <!-- Card 2: Rinse Aid -->
          <article class="dash-feature-card">
            <div class="dash-card-top">
              <div class="dash-icon-box emerald">✨</div>
              <div>
                <span class="dash-kicker" style="color:#059669;">Step 02</span>
                <h3 class="dash-card-heading">RINSE AID DISPENSER</h3>
              </div>
            </div>
            <p class="dash-card-desc">Lowers water surface tension during final hot rinse. Ensures rapid moisture sheet evaporation without milky drop stains.</p>
            <ul class="dash-card-bullets">
              <li>Fill door dispenser beside tablet door.</li>
              <li>Dial level 3 or 4 for Indian glassware.</li>
              <li>Streak-free dry finish on crockery.</li>
            </ul>
            <div class="dash-card-bottom-pill emerald">Spotless Glass Drying</div>
          </article>

          <!-- Card 3: 3-Stage Filter -->
          <article class="dash-feature-card">
            <div class="dash-card-top">
              <div class="dash-icon-box red">🔄</div>
              <div>
                <span class="dash-kicker" style="color:#e11d48;">Step 03</span>
                <h3 class="dash-card-heading">3-STAGE MESH FILTER</h3>
              </div>
            </div>
            <p class="dash-card-desc">Traps rice, seeds, masala residues before water recirculation. Unscrew cylindrical filter at bottom weekly and rinse.</p>
            <ul class="dash-card-bullets">
              <li>Twist 90° anti-clockwise to remove.</li>
              <li>Rinse under tap with soft brush.</li>
              <li>Prevents spray nozzle blockage.</li>
            </ul>
            <div class="dash-card-bottom-pill red">Weekly Tap Rinse</div>
          </article>

          <!-- Card 4: Monthly Descale -->
          <article class="dash-feature-card">
            <div class="dash-card-top">
              <div class="dash-icon-box blue">🌡️</div>
              <div>
                <span class="dash-kicker" style="color:#0284c7;">Step 04</span>
                <h3 class="dash-card-heading">70°C HOT DESCALING</h3>
              </div>
            </div>
            <p class="dash-card-desc">Run monthly machine care cycle with descaler powder at 70°C in an empty machine to eliminate hidden grease and odor.</p>
            <ul class="dash-card-bullets">
              <li>Removes hidden oil from pipe bends.</li>
              <li>Eliminates food odor completely.</li>
              <li>Restores peak heating performance.</li>
            </ul>
            <div class="dash-card-bottom-pill blue">Monthly Self-Clean</div>
          </article>
        </div>

        <footer class="dash-footer-strip">
          <div class="bottom-info-card">
            <div class="bottom-card-icon">🧼</div>
            <div class="bottom-card-text">
              <span class="bottom-card-title">Detergent Rule</span>
              <p class="bottom-card-desc">Use ONLY automatic dishwasher tablets or powder. Never manual soap.</p>
            </div>
          </div>
          <div class="bottom-info-card">
            <div class="bottom-card-icon">⛔</div>
            <div class="bottom-card-text">
              <span class="bottom-card-title">Strict Warning</span>
              <p class="bottom-card-desc">NEVER put Vim/Pril liquid into dispenser—causes foam overflow and error codes.</p>
            </div>
          </div>
          <div class="bottom-notice-card">
            <div class="notice-shield-icon">📞</div>
            <div class="notice-card-text">
              <span class="notice-card-title">Authorized Faber Service</span>
              <p class="notice-card-desc">For descaling kits &amp; genuine salts call Faber Support at 1800-209-3484.</p>
            </div>
          </div>
        </footer>
      </div>
    `;
  }

  // ==========================================================================
  // COMPONENT: DISHWASHER UNIQUE SELLING POINTS & ADVANCED FEATURES
  // ==========================================================================
  function renderDishwasherUSP(container) {
    if (!container) return;

    if (displaySubtitle) {
      displaySubtitle.textContent = 'Engineered for Heavy Indian Cooking, Burnt Kadai & 14-Place Hygiene';
    }

    container.innerHTML = `
      <div class="installation-guide-card" id="dishwasher-usp-comp">
        <header class="guide-header">
          <div class="brand-title-group">
            <div class="brand-wordmark">
              <span class="brand-wordmark-text">FABER</span>
              <span class="brand-accent-line"></span>
            </div>
            <h1 class="main-title">UNIQUE SELLING POINTS OF THE DISHWASHER</h1>
            <div class="sub-title">TAILORED FOR HEAVY INDIAN COOKING, MASALAS &amp; HYGIENE</div>
          </div>

          <div class="playback-controls">
            <button id="btn-toggle-usp-cycle" class="btn-auto-play-toggle" title="Pause or Resume Auto Cycle">
              <span id="cycle-icon-usp">⏸</span>
              <span id="cycle-text-usp">Auto Cycle Active</span>
            </button>
          </div>

          <nav class="steps-nav-tracker" aria-label="Dishwasher USPs">
            <div class="step-nav-item active" data-step="1">
              <div class="step-circle">1</div>
              <span class="step-label">3D Spray Arms</span>
            </div>
            <div class="step-nav-item" data-step="2">
              <div class="step-circle">2</div>
              <span class="step-label">Dual Zone</span>
            </div>
            <div class="step-nav-item" data-step="3">
              <div class="step-circle">3</div>
              <span class="step-label">70°C Hygiene</span>
            </div>
            <div class="step-nav-item" data-step="4">
              <div class="step-circle">4</div>
              <span class="step-label">14-Place Load</span>
            </div>
          </nav>
        </header>

        <main class="installation-canvas">
          <div class="steps-column">
            <article class="step-card active" id="usp-step-card-1" data-step="1">
              <div class="step-info-col">
                <div class="step-title-header">
                  <span class="step-num-pill">01</span>
                  <h2 class="step-heading">3D TRIPLE SPRAY ARMS</h2>
                </div>
                <ul class="step-bullets-list">
                  <li>Ceiling, middle &amp; lower high-pressure rotating spray arms.</li>
                  <li>360° hydro-streams scour burnt oil &amp; stubborn dal.</li>
                  <li>Omni-directional jets reach deep corners of tall pots.</li>
                </ul>
              </div>
              <div class="step-square-box" title="USP 1: 3D High Pressure Spray Arms">
                <img src="images/usp1_spray_arms.jpg" alt="3D rotating spray arms" />
              </div>
            </article>

            <article class="step-card" id="usp-step-card-2" data-step="2">
              <div class="step-info-col">
                <div class="step-title-header">
                  <span class="step-num-pill">02</span>
                  <h2 class="step-heading">DUAL ZONE WASH</h2>
                </div>
                <ul class="step-bullets-list">
                  <li>Selective upper or lower rack wash without waiting.</li>
                  <li>Concentrates heavy spray on lower rack for greasy kadais.</li>
                  <li>Saves up to 40% water and electricity on half loads.</li>
                </ul>
              </div>
              <div class="step-square-box" title="USP 2: Dual Zone Independent Wash">
                <img src="images/usp2_dual_zone.jpg" alt="Dual zone wash racks" />
              </div>
            </article>
          </div>

          <div class="hero-center-column">
            <div class="hero-chimney-img-box">
              <img src="images/dw_usp_hero.jpg" alt="Faber Dishwasher Interior Technology Cutaway" />
              <div class="hero-pointer-tag active" style="top: 40%; left: 48%;" id="usp-pointer-01" data-step="1" title="01: 3D Rotating Stainless Spray Arms">01</div>
              <div class="hero-pointer-tag" style="top: 32%; right: 18%;" id="usp-pointer-02" data-step="2" title="02: Dual Zone Water Paths">02</div>
              <div class="hero-pointer-tag" style="bottom: 22%; left: 52%;" id="usp-pointer-03" data-step="3" title="03: 70°C High-Temp Hygiene Heater">03</div>
              <div class="hero-pointer-tag" style="top: 56%; left: 46%;" id="usp-pointer-04" data-step="4" title="04: Loaded Cooker &amp; Kadai">04</div>
            </div>
          </div>

          <div class="steps-column">
            <article class="step-card" id="usp-step-card-3" data-step="3">
              <div class="step-info-col">
                <div class="step-title-header">
                  <span class="step-num-pill">03</span>
                  <h2 class="step-heading">70°C INTENSIVE HYGIENE</h2>
                </div>
                <ul class="step-bullets-list">
                  <li>Thermal cycle kills 99.9% of bacteria, germs &amp; viruses.</li>
                  <li>Melts hardened animal ghee, mustard oil &amp; burnt gravy.</li>
                  <li>Certified sterilization for baby bottles &amp; infant cutlery.</li>
                </ul>
              </div>
              <div class="step-square-box" title="USP 3: 70°C Intensive Hygiene Wash">
                <img src="images/usp3_70c_wash.jpg" alt="70 degree hygiene sanitization" />
              </div>
            </article>

            <article class="step-card" id="usp-step-card-4" data-step="4">
              <div class="step-info-col">
                <div class="step-title-header">
                  <span class="step-num-pill">04</span>
                  <h2 class="step-heading">14-PLACE INDIAN CAPACITY</h2>
                </div>
                <ul class="step-bullets-list">
                  <li>Fits 102+ utensils including 5-liter cookers &amp; deep kadais.</li>
                  <li>Foldable tines and height-adjustable upper basket.</li>
                  <li>Dedicated third cutlery rack for spoons, spatulas &amp; knives.</li>
                </ul>
              </div>
              <div class="step-square-box" title="USP 4: 14 Place Settings Capacity">
                <img src="images/usp4_14place.jpg" alt="14 place settings loading" />
              </div>
            </article>
          </div>
        </main>

        <footer class="guide-bottom-strip">
          <div class="bottom-info-card">
            <div class="bottom-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <div class="bottom-card-text">
              <span class="bottom-card-title">10–12L Water Efficiency</span>
              <p class="bottom-card-desc">Uses only 10–12 liters per wash cycle vs 60+ liters consumed in manual handwashing (saves ~80% water).</p>
            </div>
          </div>

          <div class="bottom-info-card">
            <div class="bottom-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <div class="bottom-card-text">
              <span class="bottom-card-title">10-Year Cavity Warranty</span>
              <p class="bottom-card-desc">2-Year Comprehensive + 10-Year Inner Cavity Rust-Through Warranty across 14-place models.</p>
            </div>
          </div>

          <div class="bottom-notice-card">
            <div class="notice-shield-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <div class="notice-card-text">
              <span class="notice-card-title">Detergent Guardrail: Automatic Only</span>
              <p class="notice-card-desc">Use automatic dishwasher tablets or powder. Never use manual liquid soap (Vim/Pril) which causes foam overflows.</p>
            </div>
          </div>
        </footer>
      </div>
    `;

    initDishwasherUSPStepCycle(container);
  }

  function initDishwasherUSPStepCycle(container) {
    if (!container) return;
    let currentStep = 1;
    const totalSteps = 4;
    let autoPlay = true;
    let cycleTimer = null;
    const cycleIntervalMs = 3800;

    const navItems = container.querySelectorAll('.step-nav-item');
    const stepCards = container.querySelectorAll('.step-card');
    const pointerTags = container.querySelectorAll('.hero-pointer-tag');
    const btnToggle = container.querySelector('#btn-toggle-usp-cycle');
    const cycleIcon = container.querySelector('#cycle-icon-usp');
    const cycleText = container.querySelector('#cycle-text-usp');
    const compCard = container.querySelector('#dishwasher-usp-comp');

    function setActiveStep(stepNum) {
      currentStep = Number(stepNum);

      navItems.forEach((nav) => {
        const s = Number(nav.getAttribute('data-step'));
        nav.classList.toggle('active', s === currentStep);
      });

      stepCards.forEach((card) => {
        const s = Number(card.getAttribute('data-step'));
        card.classList.toggle('active', s === currentStep);
      });

      pointerTags.forEach((ptr) => {
        const s = Number(ptr.getAttribute('data-step'));
        ptr.classList.toggle('active', s === currentStep);
      });
    }

    function nextStep() {
      let next = currentStep + 1;
      if (next > totalSteps) next = 1;
      setActiveStep(next);
    }

    function startCycle() {
      if (cycleTimer) clearInterval(cycleTimer);
      cycleTimer = setInterval(nextStep, cycleIntervalMs);
      autoPlay = true;
      if (cycleIcon) cycleIcon.textContent = '⏸';
      if (cycleText) cycleText.textContent = 'Auto Cycle Active';
    }

    function stopCycle() {
      if (cycleTimer) {
        clearInterval(cycleTimer);
        cycleTimer = null;
      }
      autoPlay = false;
      if (cycleIcon) cycleIcon.textContent = '▶';
      if (cycleText) cycleText.textContent = 'Paused (Click to play)';
    }

    navItems.forEach((nav) => {
      nav.addEventListener('click', () => {
        setActiveStep(nav.getAttribute('data-step'));
        stopCycle();
      });
    });

    stepCards.forEach((card) => {
      card.addEventListener('click', () => {
        setActiveStep(card.getAttribute('data-step'));
        stopCycle();
      });
    });

    pointerTags.forEach((ptr) => {
      ptr.addEventListener('click', () => {
        setActiveStep(ptr.getAttribute('data-step'));
        stopCycle();
      });
    });

    if (btnToggle) {
      btnToggle.addEventListener('click', () => {
        if (autoPlay) stopCycle();
        else startCycle();
      });
    }

    if (compCard) {
      compCard.addEventListener('mouseenter', () => {
        if (autoPlay && cycleTimer) clearInterval(cycleTimer);
      });
      compCard.addEventListener('mouseleave', () => {
        if (autoPlay) startCycle();
      });
    }

    setActiveStep(1);
    startCycle();
  }

  // ==========================================================================
  // COMPONENT: INVERTER BLDC MOTOR SPOTLIGHT & 9-SPEED CONSOLE
  // ==========================================================================
  function renderBLDCMotor(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="component-dashboard-card" id="bldc-motor-comp">
        <header class="dash-header">
          <div class="dash-title-group">
            <span class="dash-kicker">Motor Innovation</span>
            <h2 class="dash-heading">FABER INVERTER BLDC MOTOR SPOTLIGHT</h2>
            <span class="dash-subheading">Brushless direct-current inverter motor with 9 precision speeds &amp; 12-year warranty</span>
          </div>
          <div class="dash-badge-pill red">
            <span>12-Year Motor Warranty • 1500 m³/hr</span>
          </div>
        </header>

        <div class="dash-body-grid-3">
          <!-- Column 1: BLDC vs AC Benchmark -->
          <article class="dash-feature-card highlight">
            <div class="dash-card-top">
              <div class="dash-icon-box red">⚡</div>
              <div>
                <span class="dash-kicker" style="color:#e11d48;">Benchmark</span>
                <h3 class="dash-card-heading">BLDC VS TRADITIONAL AC</h3>
              </div>
            </div>
            <p class="dash-card-desc">Permanent magnet synchronous design eliminates carbon brush friction, reducing energy consumption by half while doubling lifespan.</p>
            <ul class="dash-card-bullets">
              <li><strong>Wattage:</strong> 150W Inverter vs 300W AC Motor.</li>
              <li><strong>Energy:</strong> 50% power savings on daily run.</li>
              <li><strong>Sound:</strong> 44–46 dB vs 62–68 dB noisy AC.</li>
              <li><strong>Heat:</strong> No internal friction coil overheating.</li>
            </ul>
            <div class="dash-card-bottom-pill red">50% Electricity Saved</div>
          </article>

          <!-- Column 2: Interactive 9-Speed Selector -->
          <article class="dash-feature-card" style="background:#ffffff;border-color:#cbd5e1;">
            <div class="dash-card-top">
              <div class="dash-icon-box blue">🎛️</div>
              <div>
                <span class="dash-kicker" style="color:#0284c7;">Interactive Console</span>
                <h3 class="dash-card-heading">9-SPEED AIRFLOW DIAL</h3>
              </div>
            </div>
            <p class="dash-card-desc">Click any speed level below to simulate real-time inverter suction RPM, acoustic decibels, and recommended Indian cooking mode:</p>
            
            <div class="bldc-speed-console">
              <div class="speed-dial-header">
                <span class="speed-dial-title">Inverter Speed</span>
                <span class="speed-live-feedback" id="bldc-feedback-txt">Speed 5 • Everyday Cooking</span>
              </div>
              <div class="speed-dial-pills" id="bldc-speed-pills">
                <button class="speed-dial-btn" data-speed="1">1</button>
                <button class="speed-dial-btn" data-speed="2">2</button>
                <button class="speed-dial-btn" data-speed="3">3</button>
                <button class="speed-dial-btn" data-speed="4">4</button>
                <button class="speed-dial-btn active" data-speed="5">5</button>
                <button class="speed-dial-btn" data-speed="6">6</button>
                <button class="speed-dial-btn" data-speed="7">7</button>
                <button class="speed-dial-btn" data-speed="8">8</button>
                <button class="speed-dial-btn" data-speed="9">9</button>
              </div>
              <div class="speed-meter-row">
                <div class="meter-col">
                  <span class="meter-lbl">Suction</span>
                  <span class="meter-val" id="bldc-suction-val">980 m³/hr</span>
                </div>
                <div class="meter-col">
                  <span class="meter-lbl">Noise</span>
                  <span class="meter-val" id="bldc-noise-val">44.8 dB</span>
                </div>
                <div class="meter-col">
                  <span class="meter-lbl">Wattage</span>
                  <span class="meter-val" id="bldc-watts-val">85 Watts</span>
                </div>
              </div>
            </div>
            <div class="dash-card-bottom-pill blue" style="margin-top:0.4rem;">Click Speeds 1–9 to test</div>
          </article>

          <!-- Column 3: 12-Year Warranty & Engineering -->
          <article class="dash-feature-card">
            <div class="dash-card-top">
              <div class="dash-icon-box emerald">🛡️</div>
              <div>
                <span class="dash-kicker" style="color:#059669;">Durability</span>
                <h3 class="dash-card-heading">12-YEAR WARRANTY</h3>
              </div>
            </div>
            <p class="dash-card-desc">Faber provides an industry-leading 12-year motor warranty on the Libra BLDC range, backed by sealed industrial bearings.</p>
            <ul class="dash-card-bullets">
              <li>100% pure copper heavy windings.</li>
              <li>Thermal cutoff protection against spikes.</li>
              <li>Sealed rotor prevents grease ingress.</li>
              <li>Engineered for 15+ years of kitchen service.</li>
            </ul>
            <div class="dash-card-bottom-pill emerald">12-Year Warranty Shield</div>
          </article>
        </div>

        <footer class="dash-footer-strip">
          <div class="bottom-info-card">
            <div class="bottom-card-icon">🔇</div>
            <div class="bottom-card-text">
              <span class="bottom-card-title">Ultra Quiet 44 dB</span>
              <p class="bottom-card-desc">Conversational kitchen comfort—listen to podcasts or take phone calls while cooking.</p>
            </div>
          </div>
          <div class="bottom-info-card">
            <div class="bottom-card-icon">⚡</div>
            <div class="bottom-card-text">
              <span class="bottom-card-title">Inverter Efficiency</span>
              <p class="bottom-card-desc">Draws variable wattage based on selected speed rather than fixed high power.</p>
            </div>
          </div>
          <div class="bottom-notice-card">
            <div class="notice-shield-icon">⭐</div>
            <div class="notice-card-text">
              <span class="notice-card-title">Available in 60, 75, 90 cm</span>
              <p class="notice-card-desc">Standard across the Faber Libra BLDC curved glass cooker hood lineup.</p>
            </div>
          </div>
        </footer>
      </div>
    `;

    initBLDCSpeedDial(container);
  }

  function initBLDCSpeedDial(container) {
    const pills = container.querySelectorAll('.speed-dial-btn');
    const feedbackTxt = container.querySelector('#bldc-feedback-txt');
    const suctionVal = container.querySelector('#bldc-suction-val');
    const noiseVal = container.querySelector('#bldc-noise-val');
    const wattsVal = container.querySelector('#bldc-watts-val');

    const speedData = {
      1: { name: 'Low Simmer / Tea', suction: '450 m³/hr', noise: '44.0 dB', watts: '30 W' },
      2: { name: 'Boiling / Steaming', suction: '580 m³/hr', noise: '44.2 dB', watts: '42 W' },
      3: { name: 'Light Sautéing', suction: '720 m³/hr', noise: '44.5 dB', watts: '55 W' },
      4: { name: 'Medium Sauté / Sabzi', suction: '850 m³/hr', noise: '44.7 dB', watts: '70 W' },
      5: { name: 'Everyday Cooking', suction: '980 m³/hr', noise: '44.9 dB', watts: '85 W' },
      6: { name: 'Dal Tadka / Spices', suction: '1120 m³/hr', noise: '45.2 dB', watts: '105 W' },
      7: { name: 'Heavy Frying / Puri', suction: '1250 m³/hr', noise: '45.5 dB', watts: '120 W' },
      8: { name: 'Fish Fry / Grilling', suction: '1380 m³/hr', noise: '45.8 dB', watts: '135 W' },
      9: { name: 'Max Smoke & Tadka', suction: '1500 m³/hr', noise: '46.0 dB', watts: '150 W' }
    };

    pills.forEach((btn) => {
      btn.addEventListener('click', () => {
        pills.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const s = btn.getAttribute('data-speed');
        const d = speedData[s];
        if (d) {
          if (feedbackTxt) feedbackTxt.textContent = `Speed ${s} • ${d.name}`;
          if (suctionVal) suctionVal.textContent = d.suction;
          if (noiseVal) noiseVal.textContent = d.noise;
          if (wattsVal) wattsVal.textContent = d.watts;
        }
      });
    });
  }

  // ==========================================================================
  // COMPONENT: TOUCH & WAVE GESTURE MOTION CONTROLS
  // ==========================================================================
  function renderChimneyControls(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="component-dashboard-card" id="chimney-controls-comp">
        <header class="dash-header">
          <div class="dash-title-group">
            <span class="dash-kicker">User Interface Guide</span>
            <h2 class="dash-heading">TOUCH &amp; WAVE GESTURE MOTION CONTROLS</h2>
            <span class="dash-subheading">Hands-free dual optical motion sensors &amp; 9-speed capacitive touch panel</span>
          </div>
          <div class="dash-badge-pill red">
            <span>👋 Dual Optical Motion Sensors</span>
          </div>
        </header>

        <div class="dash-body-grid-3">
          <!-- Column 1: Wave Left to Right -->
          <article class="dash-feature-card highlight">
            <div class="dash-card-top">
              <div class="dash-icon-box red">👋 ➡️</div>
              <div>
                <span class="dash-kicker" style="color:#e11d48;">Gesture Motion 01</span>
                <h3 class="dash-card-heading">WAVE LEFT TO RIGHT</h3>
              </div>
            </div>
            <p class="dash-card-desc">Wave hand smoothly 5–10 cm in front of the sensors from left to right. Turns power ON at Speed 1; successive waves increment speed up to 9.</p>
            <ul class="dash-card-bullets">
              <li>1st Wave: Power ON at Speed 1.</li>
              <li>Next Waves: Increments Speed 2 ➔ 9.</li>
              <li>Touchless hygienic operation with oily hands.</li>
            </ul>
            <div class="wave-guide-arrow">
              <span>👋</span>
              <span>══════▶</span>
              <span>Power ON / Speed UP</span>
            </div>
            <div class="dash-card-bottom-pill red" style="margin-top:0.4rem;">Left-to-Right = Step Up</div>
          </article>

          <!-- Column 2: Simulated Touch Screen Glass Panel -->
          <article class="dash-feature-card" style="background:#ffffff;border-color:#cbd5e1;">
            <div class="dash-card-top">
              <div class="dash-icon-box blue">🎛️</div>
              <div>
                <span class="dash-kicker" style="color:#0284c7;">Interactive Panel</span>
                <h3 class="dash-card-heading">GLASS TOUCH CONSOLE</h3>
              </div>
            </div>
            <p class="dash-card-desc">Interactive capacitive touch screen with digital readout. Test clicking the control buttons below:</p>

            <div class="gesture-console-screen">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <span style="font-size:0.65rem;color:#64748b;font-weight:700;">FABER INTELLISENSE OLED</span>
                <div style="display:flex;align-items:center;gap:6px;">
                  <span id="console-light-dot" style="font-size:0.6rem;color:#facc15;display:none;">💡 LED</span>
                  <span id="console-autoclean-dot" style="font-size:0.6rem;color:#ef4444;display:none;">♨️ AutoClean</span>
                </div>
              </div>

              <div class="console-glass-panel">
                <button class="console-touch-key" id="key-power" title="Power Toggle">
                  <span>⏻</span>
                  <span>Power</span>
                </button>
                <button class="console-touch-key" id="key-speed-down" title="Decrease Speed">
                  <span>➖</span>
                  <span>Down</span>
                </button>
                <div class="console-display-digit" id="console-speed-digit">1</div>
                <button class="console-touch-key" id="key-speed-up" title="Increase Speed">
                  <span>➕</span>
                  <span>Up</span>
                </button>
                <button class="console-touch-key" id="key-light" title="LED Light Toggle">
                  <span>💡</span>
                  <span>Light</span>
                </button>
                <button class="console-touch-key" id="key-autoclean" title="10-Min Heat Auto-Clean">
                  <span>♨️</span>
                  <span>Clean</span>
                </button>
              </div>

              <div style="font-size:0.64rem;color:#38bdf8;text-align:center;font-family:monospace;" id="console-status-line">
                Status: Powered ON • Speed 1 (Simmer)
              </div>
            </div>
            <div class="dash-card-bottom-pill blue" style="margin-top:0.4rem;">Direct Touch Backup</div>
          </article>

          <!-- Column 3: Wave Right to Left -->
          <article class="dash-feature-card">
            <div class="dash-card-top">
              <div class="dash-icon-box blue">⬅️ 👋</div>
              <div>
                <span class="dash-kicker" style="color:#0284c7;">Gesture Motion 02</span>
                <h3 class="dash-card-heading">WAVE RIGHT TO LEFT</h3>
              </div>
            </div>
            <p class="dash-card-desc">Wave hand smoothly from right to left across optical sensors. Steps down speed level from 9 ➔ 1. A final wave from Speed 1 shuts power OFF.</p>
            <ul class="dash-card-bullets">
              <li>Each Wave: Decrements speed by 1 level.</li>
              <li>At Speed 1: Final wave powers OFF completely.</li>
              <li>Immediate response without glass smudges.</li>
            </ul>
            <div class="wave-guide-arrow">
              <span>◀══════</span>
              <span>👋</span>
              <span>Speed DOWN / Power OFF</span>
            </div>
            <div class="dash-card-bottom-pill blue" style="margin-top:0.4rem;">Right-to-Left = Step Down</div>
          </article>
        </div>

        <footer class="dash-footer-strip">
          <div class="bottom-info-card">
            <div class="bottom-card-icon">📏</div>
            <div class="bottom-card-text">
              <span class="bottom-card-title">Optimal Distance</span>
              <p class="bottom-card-desc">Wave hand at 5 to 10 cm (2–4 inches) distance with steady, moderate speed.</p>
            </div>
          </div>
          <div class="bottom-info-card">
            <div class="bottom-card-icon">✨</div>
            <div class="bottom-card-text">
              <span class="bottom-card-title">Sensor Cleanliness</span>
              <p class="bottom-card-desc">Keep black glass sensor area clean and free of water drops for prompt motion detection.</p>
            </div>
          </div>
          <div class="bottom-notice-card">
            <div class="notice-shield-icon">👆</div>
            <div class="notice-card-text">
              <span class="notice-card-title">Dual Control Reliability</span>
              <p class="notice-card-desc">If gesture is ever disrupted, full capacitive touch buttons provide instant direct control.</p>
            </div>
          </div>
        </footer>
      </div>
    `;

    initConsoleSimulator(container);
  }

  function initConsoleSimulator(container) {
    let powerOn = true;
    let speed = 1;
    let lightOn = false;
    let autoCleanOn = false;

    const digit = container.querySelector('#console-speed-digit');
    const statusLine = container.querySelector('#console-status-line');
    const lightDot = container.querySelector('#console-light-dot');
    const cleanDot = container.querySelector('#console-autoclean-dot');

    const btnPower = container.querySelector('#key-power');
    const btnDown = container.querySelector('#key-speed-down');
    const btnUp = container.querySelector('#key-speed-up');
    const btnLight = container.querySelector('#key-light');
    const btnClean = container.querySelector('#key-autoclean');

    function update() {
      if (!powerOn) {
        if (digit) digit.textContent = 'OFF';
        if (statusLine) statusLine.textContent = 'Status: Powered OFF (Wave left-to-right to turn on)';
        if (btnPower) btnPower.classList.remove('active');
        return;
      }
      if (btnPower) btnPower.classList.add('active');
      if (digit) digit.textContent = speed;
      if (statusLine) {
        statusLine.textContent = autoCleanOn
          ? 'Status: Auto-Clean Active (9m Heat + 1m Fan)'
          : `Status: Powered ON • Speed ${speed} (Inverter Suction)`;
      }
      if (lightDot) lightDot.style.display = lightOn ? 'inline' : 'none';
      if (cleanDot) cleanDot.style.display = autoCleanOn ? 'inline' : 'none';
      if (btnLight) btnLight.classList.toggle('active', lightOn);
      if (btnClean) btnClean.classList.toggle('active', autoCleanOn);
    }

    if (btnPower) {
      btnPower.addEventListener('click', () => {
        powerOn = !powerOn;
        if (powerOn && speed === 0) speed = 1;
        update();
      });
    }

    if (btnUp) {
      btnUp.addEventListener('click', () => {
        if (!powerOn) { powerOn = true; speed = 1; }
        else if (speed < 9) speed++;
        update();
      });
    }

    if (btnDown) {
      btnDown.addEventListener('click', () => {
        if (!powerOn) return;
        if (speed > 1) speed--;
        else { powerOn = false; }
        update();
      });
    }

    if (btnLight) {
      btnLight.addEventListener('click', () => {
        lightOn = !lightOn;
        update();
      });
    }

    if (btnClean) {
      btnClean.addEventListener('click', () => {
        autoCleanOn = !autoCleanOn;
        if (autoCleanOn) powerOn = true;
        update();
      });
    }

    update();
  }

  // 6. Send Tool Call to Backend
  async function hitTool(payload) {
    try {
      const q = (payload.query || payload.action || '').toLowerCase();
      const container = document.getElementById('component-viewport') || productGrid;

      if (container) {
        prepareViewTransition(container);
        if (payload.action === 'welcome' || q === 'welcome' || q.includes('welcome') || q.includes('home')) {
          renderFaberWelcomeScreen(container);
          showToast('Displaying Faber Welcome Screen');
          return;
        } else if (q.includes('install') || payload.action === 'installation' || payload.action === 'chimney_installation') {
          updateDisplayBadge('Installation Guide');
          renderChimneyInstallation(container);
          showToast('Displaying Chimney Installation Guide');
        } else if (payload.action === 'chimney_cleaning' || q.includes('chimney clean') || q.includes('oil collector')) {
          updateDisplayBadge('Chimney Cleaning Guide');
          renderChimneyCleaning(container);
          showToast('Displaying Chimney Cleaning Guide');
        } else if (payload.action === 'dishwasher_cleaning' || payload.action === 'dishwasher_maintenance' || q.includes('dishwasher clean') || q.includes('rinse aid') || q.includes('salt')) {
          updateDisplayBadge('Dishwasher Care Guide');
          renderDishwasherCleaning(container);
          showToast('Displaying Dishwasher Care Guide');
        } else if (payload.action === 'dishwasher_usp' || payload.action === 'dishwasher_features' || q.includes('spray arm') || q.includes('dual zone') || q.includes('usp')) {
          updateDisplayBadge('Dishwasher USPs');
          renderDishwasherUSP(container);
          showToast('Displaying Dishwasher USPs');
        } else if (payload.action === 'bldc_motor' || q.includes('bldc') || q.includes('inverter motor')) {
          updateDisplayBadge('Inverter BLDC Motor');
          renderBLDCMotor(container);
          showToast('Displaying Inverter BLDC Motor');
        } else if (payload.action === 'chimney_controls' || payload.action === 'gesture_control' || q.includes('gesture') || q.includes('wave') || q.includes('touch panel')) {
          updateDisplayBadge('Wave Gesture Controls');
          renderChimneyControls(container);
          showToast('Displaying Wave Gesture Controls');
        }
      }

      const toolUrl = `${backendUrl}/api/tool?sessionId=${encodeURIComponent(sessionId)}`;
      const res = await fetch(toolUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          ...payload
        })
      });

      const result = await res.json();
      showToast(`Action: ${result.title || result.componentType || 'Updated'}`);
    } catch (err) {
      console.error('Failed to hit tool endpoint:', err);
      showToast('Error calling tool');
    }
  }

  // 7. Off-Canvas Side Nav Drawer Toggle and Escape Logic
  const sideNavDrawer = document.getElementById('side-nav-drawer');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const btnCloseDrawer = document.getElementById('btn-close-drawer');
  const btnOpenDrawer = document.getElementById('btn-open-drawer');
  const btnOpenDrawerBurger = document.getElementById('btn-open-drawer-burger');
  const btnOpenDrawerRight = document.getElementById('btn-open-drawer-right');

  function openDrawer() {
    if (sideNavDrawer) {
      sideNavDrawer.classList.add('open');
      sideNavDrawer.setAttribute('aria-hidden', 'false');
    }
  }

  function closeDrawer() {
    if (sideNavDrawer) {
      sideNavDrawer.classList.remove('open');
      sideNavDrawer.setAttribute('aria-hidden', 'true');
    }
  }

  if (btnOpenDrawer) btnOpenDrawer.addEventListener('click', openDrawer);
  if (btnOpenDrawerBurger) btnOpenDrawerBurger.addEventListener('click', openDrawer);
  if (btnOpenDrawerRight) btnOpenDrawerRight.addEventListener('click', openDrawer);
  if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sideNavDrawer?.classList.contains('open')) {
      closeDrawer();
    }
  });

  // Backward compatibility for dropdown toggle if present
  if (btnToggleMenu && triggersDropdown) {
    btnToggleMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      openDrawer();
    });
  }

  // 8. Wire Live Interactive Test Simulator Bar & Preset Pills
  const inputSimulatedQuery = document.getElementById('input-simulated-query');
  const btnRunSimulatedQuery = document.getElementById('btn-run-simulated-query');

  function executeSimulatedQuery() {
    if (!inputSimulatedQuery) return;
    const queryText = inputSimulatedQuery.value.trim();
    if (!queryText) {
      showToast('Please type a voice query first (e.g. 30,000 के अंदर डिशवॉशर और चिमनी)');
      inputSimulatedQuery.focus();
      return;
    }
    hitTool({ query: queryText });
    showToast(`Sending: "${queryText}"`);
  }

  if (btnRunSimulatedQuery) {
    btnRunSimulatedQuery.addEventListener('click', executeSimulatedQuery);
  }

  if (inputSimulatedQuery) {
    inputSimulatedQuery.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        executeSimulatedQuery();
      }
    });
  }

  // Wire Preset Pills for One-Click Testing
  document.querySelectorAll('.preset-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const query = pill.getAttribute('data-preset-query');
      const action = pill.getAttribute('data-preset-action');
      const category = pill.getAttribute('data-preset-category');
      const maxPrice = pill.getAttribute('data-preset-max-price');
      const rawProducts = pill.getAttribute('data-preset-products');
      const filter = pill.getAttribute('data-preset-filter');
      const isOffer = pill.getAttribute('data-preset-is-offer');
      const compare = pill.getAttribute('data-preset-compare');

      if (query) {
        if (inputSimulatedQuery) inputSimulatedQuery.value = query;
        hitTool({ query });
        showToast(`Testing query: "${query}"`);
      } else if (action) {
        let products = undefined;
        if (rawProducts) {
          try { products = JSON.parse(rawProducts); } catch { products = rawProducts.split(','); }
        }
        hitTool({
          action,
          category: category || undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          products: products,
          filter: filter || undefined,
          isOffer: isOffer === 'true' ? true : undefined,
          compare: compare === 'true' ? true : undefined
        });
        showToast(`Testing: ${action} (${category || 'all'})`);
      }
    });
  });

  // Wire Preset Carousel Left and Right Scroll Navigation Buttons
  const btnPresetsScrollLeft = document.getElementById('btn-presets-scroll-left');
  const btnPresetsScrollRight = document.getElementById('btn-presets-scroll-right');
  const simulatorPresetsScroll = document.getElementById('simulator-presets-scroll');

  if (btnPresetsScrollLeft && simulatorPresetsScroll) {
    btnPresetsScrollLeft.addEventListener('click', () => {
      simulatorPresetsScroll.scrollBy({ left: -220, behavior: 'smooth' });
    });
  }

  if (btnPresetsScrollRight && simulatorPresetsScroll) {
    btnPresetsScrollRight.addEventListener('click', () => {
      simulatorPresetsScroll.scrollBy({ left: 220, behavior: 'smooth' });
    });
  }

  // 9. Wire Quick Trigger Buttons inside Dropdown Menu
  document.querySelectorAll('.btn-test').forEach((btn) => {
    btn.addEventListener('click', () => {
      triggersDropdown?.classList.remove('open');
      triggersMenuDropdown?.classList.remove('open');
      btnToggleMenu?.setAttribute('aria-expanded', 'false');

      const action = btn.getAttribute('data-action');
      const category = btn.getAttribute('data-category');
      const maxPrice = btn.getAttribute('data-max-price');
      const rawProducts = btn.getAttribute('data-products');
      const manualTopic = btn.getAttribute('data-manual-topic');
      const filter = btn.getAttribute('data-filter');
      const isOffer = btn.getAttribute('data-is-offer');
      const compare = btn.getAttribute('data-compare');
      const query = btn.getAttribute('data-query');
      const trigger = btn.getAttribute('data-trigger');

      if (action) {
        let products = undefined;
        if (rawProducts) {
          try { products = JSON.parse(rawProducts); } catch { products = rawProducts.split(','); }
        }

        hitTool({
          action: action === 'show_all' ? 'show_products' : action,
          category: category || undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          products: products,
          manualTopic: manualTopic || undefined,
          filter: filter || undefined,
          isOffer: isOffer === 'true' ? true : undefined,
          compare: compare === 'true' ? true : undefined,
          query: query || undefined
        });
      } else if (trigger) {
        hitTool({ product: trigger });
      }
    });
  });

  // 9. Preload all 13 products on startup
  async function loadInitialImages() {
    try {
      const targetUrl = `${backendUrl}/api/products`;
      const res = await fetch(targetUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          handleIncomingImages({
            componentType: 'products',
            title: 'Faber Appliance Collection (13 Models)',
            subtitle: 'All 13 official Faber chimneys and dishwashers loaded. Ask the agent or select a trigger.',
            products: data.products
          });
          updateDisplayBadge(`All Products (${data.products.length})`);
        }
      }
    } catch (e) {
      console.warn('Initial load error:', e);
    }
  }

  // Initialize
  initOrationWidget();
  connectSSE();
  renderFaberWelcomeScreen();
})();
