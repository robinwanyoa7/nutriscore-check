// This runner integrates the extension pieces that are exposed as globals
// in this repository (non-module builds). It prefers `window.*` helpers
// provided by the other scripts (iconLayer/IconLayer, scraper, tooltip, etc.).

const createGradeChip = null; // not used in this runner (UI created by IconLayer)
const createNutrientBar = null;
const createBetterSwapBanner = null;
const mountOverlay = null;
const scrapeProducts = () => (window.scrapeProducts ? window.scrapeProducts() : []);
const showTooltip = (product, el) => { if (window.showNutriScoreTooltip) window.showNutriScoreTooltip(el, `${product.name}\nGrade: ${product.grade || 'C'}`); };
const hideTooltip = () => { if (window.hideNutriScoreTooltip) window.hideNutriScoreTooltip(); };
const showActivatePrompt = (onActivate, onDismiss) => {
  if (window.showActivatePrompt) return window.showActivatePrompt(onActivate, onDismiss);
  if (onActivate) onActivate();
};

const productData = {
  grade: 'B',
  name: 'Whole Grain Oat Cereal',
  size: '500g',
  brand: "Kellogg's",
  retailer: 'Naivas',
  nutrients: [
    { label: 'Calories', value: 362, max: 500, unit: ' kcal' },
    { label: 'Sugar', value: 8.2, max: 25, unit: 'g' },
    { label: 'Saturated Fat', value: 1.1, max: 20, unit: 'g' },
    { label: 'Fiber', value: 7.8, max: 8, unit: 'g', direction: 'good' },
    { label: 'Sodium', value: 420, max: 800, unit: 'mg' }
  ],
  alternative: {
    name: 'Pure Organic Oats',
    benefitText: '52% less sugar'
  }
};

function isSupportedHost() {
  // Allow any Naivas subdomain/TLD
  return /(?:^|\.)naivas\./i.test(location.hostname);
}

function createFallbackProduct() {
  const productCard = document.querySelector('.product-card');
  const fallbackName = document.querySelector('.product-name, .product-title, h1');
  const element = productCard || fallbackName || document.body;
  const rect = element.getBoundingClientRect();

  return [{
    element,
    name: fallbackName?.textContent?.trim() || productData.name,
    rect,
    grade: productData.grade,
    nutrients: productData.nutrients,
    alternative: productData.alternative
  }];
}

let refreshTimer = null;
let iconInstances = [];
let observer = null;

function refreshOverlay() {
  // Use the page-level scraper (if available) to find products
  const products = scrapeProducts();
  const items = products.length > 0 ? products.map(product => ({
    ...product,
    grade: product.grade || productData.grade,
    nutrients: productData.nutrients,
    alternative: productData.alternative
  })) : createFallbackProduct();

  // Clear previously created IconLayer instances
  if (Array.isArray(iconInstances) && iconInstances.length) {
    for (const inst of iconInstances) {
      try { if (inst && typeof inst.remove === 'function') inst.remove(); } catch (e) {}
    }
    iconInstances = [];
  }

  // Create a new IconLayer for each product using the global class `IconLayer`
  for (const product of items) {
    try {
      const container = product.element || product.anchorElement || document.body;
      if (window.IconLayer && typeof window.IconLayer === 'function') {
        const icon = new window.IconLayer(container, product, (prod, grade, iconEl) => {
          // show overlay when clicked
          if (window.OverlayLayer && typeof window.OverlayLayer === 'function') {
            const nutrientData = (prod && prod.name) ? generateNutrientData(prod.name, grade) : productData.nutrients;
            const overlay = new window.OverlayLayer(prod.name || product.name, grade, nutrientData, iconEl);
            overlay.show();
          } else {
            // fallback simple alert
            window.alert(`Showing insights for ${prod.name}`);
          }
        });
        iconInstances.push(icon);
      } else {
        // If IconLayer isn't available, fallback to adding a simple badge
        const badge = document.createElement('div');
        badge.className = 'nutriscore-icon';
        badge.textContent = product.grade || productData.grade;
        badge.style.position = 'absolute';
        badge.style.zIndex = 9999;
        badge.style.background = '#16a34a';
        badge.style.color = 'white';
        badge.style.padding = '6px 8px';
        badge.style.borderRadius = '999px';
        container.appendChild(badge);
        iconInstances.push({ remove: () => badge.remove() });
      }
    } catch (e) {
      console.error('[NutriScore] Failed to create icon for product', e);
    }
  }
}

function generateNutrientData(productName, grade) {
  // Basic heuristic-based demo data (kept small — extend or connect to real DB)
  const defaults = { calories: 0, fat: 0, sugar: 0, salt: 0, fiber: 0, protein: 0 };
  const name = (productName || '').toLowerCase();
  if (/rice|basmati|sunrice/i.test(name)) return { ...defaults, calories: 360, fat: 1, sugar: 0.1, salt: 0.01, fiber: 1.2, protein: 7.5 };
  if (/milk|yogurt|cheese|butter/i.test(name)) return { ...defaults, calories: 150, fat: 8, sugar: 5, salt: 0.1, fiber: 0, protein: 6 };
  // fallback by grade
  if (grade === 'A') return { ...defaults, calories: 150, fat: 4, sugar: 2, salt: 0.2, fiber: 5, protein: 8 };
  if (grade === 'B') return { ...defaults, calories: 220, fat: 8, sugar: 7, salt: 0.4, fiber: 4, protein: 6 };
  if (grade === 'C') return { ...defaults, calories: 320, fat: 12, sugar: 14, salt: 0.8, fiber: 2, protein: 5 };
  if (grade === 'D') return { ...defaults, calories: 430, fat: 18, sugar: 24, salt: 1.2, fiber: 1, protein: 4 };
  return { ...defaults, calories: 520, fat: 24, sugar: 32, salt: 1.8, fiber: 0.5, protein: 3 };
}

function observeProductChanges() {
  const root = document.body;
  if (!root) return;

  const observer = new MutationObserver(() => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }
    refreshTimer = window.setTimeout(() => {
      refreshOverlay();
      refreshTimer = null;
    }, 250);
  });

  observer.observe(root, {
    childList: true,
    subtree: true,
    attributes: true
  });

  window.addEventListener('scroll', () => {
    repositionIcons();
    hideTooltip();
  }, { passive: true });

  window.addEventListener('resize', () => {
    repositionIcons();
  }, { passive: true });

}

function setupOverlay() {
  refreshOverlay();
  observeProductChanges();
}

function markPromptSeen() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ nsPromptSeen: true }, () => {});
    }
  } catch (e) {}
}

function initializeNutriScoreExtension() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['nsActive', 'nsPromptSeen'], (result = {}) => {
      if (result.nsActive === true) {
        setupOverlay();
        return;
      }

      if (result.nsPromptSeen === true) {
        return;
      }

      showActivatePrompt(() => {
        markPromptSeen();
        try {
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ nsActive: true }, () => {});
          }
        } catch (e) {}
        setupOverlay();
      }, () => {
        markPromptSeen();
      });
    });
  } else {
    showActivatePrompt(() => {
      setupOverlay();
    }, () => {});
  }
}

function repositionIcons() {
  if (!iconInstances || !iconInstances.length) return;
  for (const inst of iconInstances) {
    try { if (inst && typeof inst.updatePosition === 'function') inst.updatePosition(); } catch (e) {}
  }
}

function shutdown() {
  // Stop observer
  try { if (observer) observer.disconnect(); } catch (e) {}
  observer = null;

  // Remove icons
  if (Array.isArray(iconInstances)) {
    for (const inst of iconInstances) {
      try { if (inst && typeof inst.remove === 'function') inst.remove(); } catch (e) {}
    }
  }
  iconInstances = [];

  // Persist inactive state so popup and other scripts stay in sync
  try { if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) chrome.storage.local.set({ nsActive: false }); } catch(e) {}
}

function resetNutriScoreState() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ nsActive: false, nsPromptSeen: false }, () => {});
    }
  } catch (e) {}
}

// Expose a simple global API so the rest of the non-module scripts can call into this runner
if (typeof window !== 'undefined') {
  window.initializeNutriScoreExtension = initializeNutriScoreExtension;
  window.setupNutriScoreOverlay = setupOverlay;
  window.refreshNutriScoreOverlay = refreshOverlay;
  window.repositionNutriScoreIcons = repositionIcons;
  window.shutdownNutriScore = shutdown;
  window.resetNutriScoreState = resetNutriScoreState;
  window.isSupportedNutriScoreHost = isSupportedHost;
}
