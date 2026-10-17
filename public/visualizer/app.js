/**
 * Faber Product Visualizer - Decoupled Client Logic
 * Subscribes to Tool Backend (Cloudflare Worker or Local Node Server) via SSE / HTTP.
 * Fully decoupled: Can be run locally via file:// or static server, or deployed anywhere.
 */

(() => {
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

  // 4. Connect to Backend via Server-Sent Events (SSE)
  let activeEventSource = null;

  function connectSSE() {
    if (activeEventSource) {
      activeEventSource.close();
    }

    // Connect to universal 'default' stream so the visualizer updates even when the tool only sends { product }
    const sseUrl = `${backendUrl}/api/stream/default`;
    console.log('[SSE] Connecting to universal stream:', sseUrl);

    try {
      activeEventSource = new EventSource(sseUrl);

      activeEventSource.onopen = () => {
        if (serverStatusText) serverStatusText.textContent = 'Connected (SSE)';
        if (serverStatusPill) serverStatusPill.style.backgroundColor = '#ecfdf5';
      };

      activeEventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleIncomingImages(data);
        } catch (err) {
          console.warn('Failed to parse SSE data:', err, event.data);
        }
      };

      activeEventSource.onerror = () => {
        if (serverStatusText) serverStatusText.textContent = 'Reconnecting...';
        if (serverStatusPill) serverStatusPill.style.backgroundColor = '#fffbeb';
      };
    } catch (e) {
      console.error('[SSE Error]', e);
    }
  }

  // 5. Dynamic Component Viewport Renderer
  function handleIncomingImages(payload) {
    const compType = payload.componentType || (payload.images && payload.images.length > 0 ? 'products' : 'products');
    const products = payload.products || payload.images || [];

    if (displaySubtitle) {
      const time = new Date().toLocaleTimeString();
      displaySubtitle.textContent = payload.subtitle || `Synchronized live with agent at ${time}`;
    }

    const container = document.getElementById('component-viewport') || productGrid;
    if (!container) return;

    if (compType === 'comparison' && products.length >= 2) {
      if (displayModeBadge) displayModeBadge.textContent = `Comparing ${products.length} Models`;
      renderComparisonMatrix(container, products, payload.title);
    } else if (compType === 'dishwasher-loading') {
      if (displayModeBadge) displayModeBadge.textContent = 'Dishwasher Loading Guide';
      renderLoadingGuide(container, payload.guideData);
    } else if (compType === 'manual') {
      if (displayModeBadge) displayModeBadge.textContent = 'User Manual & Auto-Clean';
      renderUserManual(container, payload.manualData);
    } else if (compType === 'offers') {
      if (displayModeBadge) displayModeBadge.textContent = `Special Offers (${products.length})`;
      renderOffersShowcase(container, products, payload.title);
    } else {
      if (displayModeBadge) {
        displayModeBadge.textContent = products.length === 1 ? 'Featured Appliance (1)' : `${products.length} Appliances`;
      }
      renderProductCards(container, products);
    }
  }

  // Component A: Standard & Gallery Product Cards
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

    const isSingle = products.length === 1;
    const isDual = products.length === 2;
    const gridClass = isSingle ? 'product-grid single-item' : isDual ? 'product-grid dual-item' : 'product-grid';

    container.innerHTML = `
      <div class="${gridClass}">
        ${products.map((item, index) => {
          const price = Number(item.price || 0);
          const mrp = Number(item.mrp || 0);
          const savings = Number(item.savings || (mrp > price ? mrp - price : 0));
          const discount = item.discountPercent || (mrp > 0 && price > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0);
          const categoryLabel = item.categoryLabel || item.type || (item.category === 'chimney' ? 'Kitchen Chimney' : 'Dishwasher');
          const highlightTag = item.highlight || (item.isOffer ? 'Free Gift Inside' : 'Extended Warranty');

          return `
            <article class="product-card">
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
        }).join('')}
      </div>
    `;
  }

  // Component B: Side-by-Side Comparison Matrix (Inspired by Faber Comparison Mockup)
  function renderComparisonMatrix(container, products, title) {
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
                <th>Specs</th>
                ${products.map(p => `<td>✓ Airflow: <strong>${p.suctionPower || p.capacity || '-'}</strong></td>`).join('')}
              </tr>
              <tr>
                <th>Specs</th>
                ${products.map(p => `<td>✓ Filter: <strong>${p.filterDesign || p.cleaningFunction || 'Filterless Tech'}</strong></td>`).join('')}
              </tr>
              <tr>
                <th>Specs</th>
                ${products.map(p => `<td>✓ Controls: <strong>${p.controls || 'Motion Gesture & Touch'}</strong></td>`).join('')}
              </tr>
              <tr>
                <th>Specs</th>
                ${products.map(p => `<td>✓ Dimensions: <strong>${p.width || p.dimensions || 'Standard Model'}</strong></td>`).join('')}
              </tr>
              <tr>
                <th>Specs</th>
                ${products.map(p => `<td>✓ Warranty: <strong>${p.warranty || '2 Years Faber Warranty'}</strong></td>`).join('')}
              </tr>
              <tr>
                <th>CTA</th>
                ${products.map(p => `
                  <td>
                    <a href="${p.imageUrl}" target="_blank" class="btn-product-cta matrix-cta" rel="noopener">
                      Buy Now →
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

  // Component C: Dishwasher Loading Infographic Guide (Inspired by Faber Reference Mockup 1)
  function renderLoadingGuide(container, guideData) {
    const data = guideData || {};
    const title = data.title || 'DISHWASHER LOADING GUIDE';

    container.innerHTML = `
      <div class="loading-guide-lux-card">
        <div class="loading-lux-header">
          <div class="loading-lux-title-group">
            <h2>${title}</h2>
            <div class="loading-lux-subtitle">
              <span>Optimized for RapidDry 14-Place</span>
              <span class="badge-opt-gen">OPT/GEN</span>
            </div>
          </div>
          <div class="badge-capacity">14-PLACE CAPACITY</div>
        </div>

        <div class="loading-racks-visual">
          <!-- 01 / UPPER RACK -->
          <div class="rack-visual-box">
            <div class="rack-zone-badge">
              <span>01 / UPPER RACK</span>
              <span class="check-icon">✓</span>
            </div>
            <div class="matrix-img-box" style="height: 120px;">
              <svg width="180" height="90" viewBox="0 0 200 100" fill="none" stroke="#64748b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="20" y="20" width="160" height="60" rx="6" stroke="#94a3b8" />
                <line x1="20" y1="50" x2="180" y2="50" stroke="#cbd5e1" stroke-dasharray="3 3" />
                <line x1="60" y1="20" x2="60" y2="80" stroke="#e2e8f0" />
                <line x1="100" y1="20" x2="100" y2="80" stroke="#e2e8f0" />
                <line x1="140" y1="20" x2="140" y2="80" stroke="#e2e8f0" />
                <circle cx="50" cy="40" r="14" stroke="#0284c7" stroke-width="2" fill="#eff6ff" />
                <circle cx="90" cy="40" r="14" stroke="#0284c7" stroke-width="2" fill="#eff6ff" />
                <circle cx="130" cy="40" r="14" stroke="#0284c7" stroke-width="2" fill="#eff6ff" />
                <circle cx="160" cy="65" r="9" stroke="#0f172a" fill="#f8fafc" />
              </svg>
            </div>
            <div class="rack-callouts-list">
              <div class="rack-callout-item">
                <span class="callout-dot"></span>
                <span>Glasses, cups &amp; small bowls</span>
              </div>
              <div class="rack-callout-item">
                <span class="callout-dot"></span>
                <span>Angle downward to prevent water pooling</span>
              </div>
            </div>
          </div>

          <!-- 02 / LOWER RACK -->
          <div class="rack-visual-box">
            <div class="rack-zone-badge">
              <span>02 / LOWER RACK</span>
              <span class="check-icon">✓</span>
            </div>
            <div class="matrix-img-box" style="height: 120px;">
              <svg width="180" height="90" viewBox="0 0 200 100" fill="none" stroke="#64748b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="15" y="15" width="170" height="70" rx="6" stroke="#94a3b8" />
                <line x1="15" y1="50" x2="185" y2="50" stroke="#cbd5e1" stroke-dasharray="3 3" />
                <circle cx="55" cy="50" r="28" stroke="#0f172a" stroke-width="2.5" fill="#f8fafc" />
                <circle cx="68" cy="50" r="24" stroke="#475569" stroke-width="2" fill="#f1f5f9" />
                <rect x="110" y="30" width="55" height="40" rx="4" stroke="#ef4444" stroke-width="2" fill="#fee2e2" />
                <line x1="165" y1="45" x2="182" y2="45" stroke="#ef4444" stroke-width="2.5" />
              </svg>
            </div>
            <div class="rack-callouts-list">
              <div class="rack-callout-item">
                <span class="callout-dot"></span>
                <span>Plates face inward</span>
              </div>
              <div class="rack-callout-item">
                <span class="callout-dot"></span>
                <span>Pans and pots on the sides</span>
              </div>
              <div class="rack-callout-item">
                <span class="callout-dot"></span>
                <span>Heavy pots, pans &amp; large bowls</span>
              </div>
            </div>
          </div>

          <!-- 03 / CUTLERY TRAY -->
          <div class="rack-visual-box full-width">
            <div class="rack-zone-badge">
              <span>03 / CUTLERY TRAY</span>
              <span class="check-icon">✓</span>
            </div>
            <div class="matrix-img-box" style="height: 100px;">
              <svg width="240" height="60" viewBox="0 0 240 60" fill="none" stroke="#64748b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="10" y="10" width="220" height="40" rx="6" stroke="#94a3b8" fill="#f8fafc" />
                <line x1="80" y1="10" x2="80" y2="50" stroke="#cbd5e1" />
                <line x1="160" y1="10" x2="160" y2="50" stroke="#cbd5e1" />
                <line x1="30" y1="20" x2="30" y2="40" stroke="#0284c7" stroke-width="2" />
                <line x1="45" y1="20" x2="45" y2="40" stroke="#0284c7" stroke-width="2" />
                <line x1="60" y1="20" x2="60" y2="40" stroke="#0284c7" stroke-width="2" />
                <line x1="105" y1="20" x2="105" y2="40" stroke="#0f172a" stroke-width="2" />
                <line x1="125" y1="20" x2="125" y2="40" stroke="#0f172a" stroke-width="2" />
                <line x1="140" y1="20" x2="140" y2="40" stroke="#0f172a" stroke-width="2" />
                <line x1="185" y1="20" x2="185" y2="40" stroke="#64748b" stroke-width="2" />
                <line x1="205" y1="20" x2="205" y2="40" stroke="#64748b" stroke-width="2" />
              </svg>
            </div>
            <div class="rack-callouts-list">
              <div class="rack-callout-item">
                <span class="callout-dot"></span>
                <span>Place flatware and utensils here (alternate handles up &amp; down to prevent nesting)</span>
              </div>
            </div>
          </div>
        </div>

        <div class="loading-tips-footer-bar">
          <button id="btn-toggle-loading-tips" class="btn-loading-tips-link">LOADING TIPS &amp; INDIAN UTENSILS GUIDE ▾</button>
        </div>

        <div id="loading-tips-expanded" class="loading-tips-expanded" style="display: none; border-top: 1px solid #f1f5f9; padding-top: 1rem; margin-top: 0.5rem;">
          <div class="rack-grid">
            <div class="rack-card">
              <div class="rack-card-header"><span class="rack-card-icon">🍳</span><span class="rack-card-title">Lower Basket: Kadai &amp; Patila</span></div>
              <ul class="rack-rules-list">
                <li>Place heavy pots and kadai facing downwards at a 45° angle so water sprays inside and drains freely.</li>
                <li>Never stack utensils inside one another; each vessel needs direct spray access.</li>
                <li>Position large thalis and dinner plates vertically between the foldable rack tines.</li>
              </ul>
            </div>
            <div class="rack-card">
              <div class="rack-card-header"><span class="rack-card-icon">☕</span><span class="rack-card-title">Upper Basket: Glasses &amp; Katoris</span></div>
              <ul class="rack-rules-list">
                <li>Tilt glasses and chai mugs upside-down at an angle to prevent water pooling on curved bottoms.</li>
                <li>Secure steel katoris firmly between tines so water pressure does not flip them.</li>
              </ul>
            </div>
            <div class="rack-card warning-card">
              <div class="rack-card-header"><span class="rack-card-icon">⚠️</span><span class="rack-card-title">Pre-Start Checks &amp; Detergent</span></div>
              <ul class="rack-rules-list">
                <li>Spin spray arms by hand: Ensure tall spatulas or deep pots do not block rotation.</li>
                <li>Use ONLY automatic dishwasher tablets/powder. Never use liquid Vim/Pril which causes excessive foam overflows.</li>
                <li>Scrape food into the bin before loading; pre-rinsing is unnecessary.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;

    const btnTips = container.querySelector('#btn-toggle-loading-tips');
    const tipsBox = container.querySelector('#loading-tips-expanded');
    if (btnTips && tipsBox) {
      btnTips.addEventListener('click', () => {
        const isHidden = tipsBox.style.display === 'none';
        tipsBox.style.display = isHidden ? 'block' : 'none';
        btnTips.textContent = isHidden ? 'HIDE LOADING TIPS ▴' : 'LOADING TIPS & INDIAN UTENSILS GUIDE ▾';
      });
    }
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

  // 6. Send Tool Call to Backend
  async function hitTool(payload) {
    try {
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
          if (displayModeBadge) {
            displayModeBadge.textContent = `All Products (${data.products.length})`;
          }
        }
      }
    } catch (e) {
      console.warn('Initial load error:', e);
    }
  }

  // Initialize
  initOrationWidget();
  connectSSE();
  loadInitialImages();
})();
