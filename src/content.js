// content.js - Main engine for the NutriScore extension

(function() {
  'use strict';

  /* ----------------------------------------------------------------
     STATE
     ---------------------------------------------------------------- */
  let isActive = false;
  let processedContainers = new Set();
  let observer = null;
  let iconInstances = [];

  /* ----------------------------------------------------------------
     ACTIVATION / DEACTIVATION
     ---------------------------------------------------------------- */

  function activateNutriScore() {
    if (isActive) return;
    isActive = true;
    console.log('[NutriScore] Activated');

    // Persist active state so the popup and other scripts stay in sync
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ nsActive: true }, () => {});
      }
    } catch (e) {}

    // Process existing products
    processProducts();

    // Start observing for new products
    startObserver();
  }

  function deactivateNutriScore() {
    if (!isActive) return;
    isActive = false;
    console.log('[NutriScore] Deactivated');

    // Stop observing
    if (observer) {
      observer.disconnect();
      observer = null;
    }

    // Remove all icons
    removeAllIcons();

    // Clear state
    processedContainers.clear();

    // Persist inactive state so the popup and other scripts stay in sync
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ nsActive: false }, () => {});
      }
    } catch (e) {}
  }

  /* ----------------------------------------------------------------
     PRODUCT PROCESSING
     ---------------------------------------------------------------- */

  function processProducts() {
    // Check if scraper is available
    if (typeof window.scrapeProducts !== 'function') {
      console.warn('[NutriScore] scraper.js not loaded');
      return;
    }

    const products = window.scrapeProducts();
    if (!products || !products.length) {
      console.log('[NutriScore] No products found');
      return;
    }

    console.log(`[NutriScore] Found ${products.length} products`);

    for (const product of products) {
      const container = product.element || product.anchorElement || document.body;
      if (!container || typeof container.querySelector !== 'function') continue;

      if (processedContainers.has(container)) continue;
      if (container.querySelector('.nutriscore-icon')) {
        processedContainers.add(container);
        continue;
      }

      processedContainers.add(container);
      injectGradeIcon(container, product);
    }
  }

function injectGradeIcon(container, product) {
    const icon = new IconLayer(container, product, (productObject, grade, iconElement) => {
      console.log(`[NutriScore] Icon clicked for: ${productObject.name}`);
      showProductOverlay(productObject, grade, iconElement);
    });

    // Store reference for cleanup
    iconInstances.push(icon);
  }

  function showProductOverlay(product, grade, anchorElement) {
    if (typeof window.OverlayLayer !== 'function') {
      console.warn('[NutriScore] OverlayLayer not available');
      return;
    }

    const nutrientData = generateNutrientData(product.name, grade);
    const overlay = new OverlayLayer(product.name, grade, nutrientData, anchorElement);
    overlay.show();
  }

  function generateNutrientData(productName, grade) {
    const defaults = {
      calories: 0,
      fat: 0,
      sugar: 0,
      salt: 0,
      fiber: 0,
      protein: 0,
    };

    // Product-specific overrides (simple heuristics / demo data)
    const name = (productName || '').toLowerCase();
    if (/sunrice|sunrice basmati|basmati rice/i.test(name) || /basmati/i.test(name)) {
      return { ...defaults, calories: 360, fat: 1.0, sugar: 0.1, salt: 0.01, fiber: 1.2, protein: 7.5 };
    }
    if (/milk|yogurt|cheese|butter/i.test(name)) {
      return { ...defaults, calories: 150, fat: 8, sugar: 5, salt: 0.1, fiber: 0, protein: 6 };
    }
    if (/sugar|cola|candy|chocolate|ice cream|pastry|cookie/i.test(name)) {
      return { ...defaults, calories: 420, fat: 18, sugar: 36, salt: 0.2, fiber: 0.5, protein: 3 };
    }

    // Fallback by grade to provide a reasonable demo
    if (grade === 'A') {
      return { ...defaults, calories: 150, fat: 4, sugar: 2, salt: 0.2, fiber: 5, protein: 8 };
    }
    if (grade === 'B') {
      return { ...defaults, calories: 220, fat: 8, sugar: 7, salt: 0.4, fiber: 4, protein: 6 };
    }
    if (grade === 'C') {
      return { ...defaults, calories: 320, fat: 12, sugar: 14, salt: 0.8, fiber: 2, protein: 5 };
    }
    if (grade === 'D') {
      return { ...defaults, calories: 430, fat: 18, sugar: 24, salt: 1.2, fiber: 1, protein: 4 };
    }
    return { ...defaults, calories: 520, fat: 24, sugar: 32, salt: 1.8, fiber: 0.5, protein: 3 };
  }

  function removeAllIcons() {
    for (const icon of iconInstances) {
      if (icon && typeof icon.remove === 'function') {
        icon.remove();
      }
    }
    iconInstances = [];
  }

  /* ----------------------------------------------------------------
     OBSERVER - Watch for new products
     ---------------------------------------------------------------- */

  function isOurInjectedNode(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return false;
    if (node.classList.contains('nutriscore-icon') || node.classList.contains('nutriscore-activate-backdrop')) {
      return true;
    }
    if (node.querySelector && node.querySelector('.nutriscore-icon, .nutriscore-activate-backdrop')) {
      return true;
    }
    return false;
  }

  function startObserver() {
    if (observer) {
      observer.disconnect();
    }

    observer = new MutationObserver((mutations) => {
      if (!isActive) return;
      
      // Check if new products might have been added
      let shouldProcess = false;
      for (const mutation of mutations) {
        if (!mutation.addedNodes.length) continue;
        for (const node of mutation.addedNodes) {
          if (!isOurInjectedNode(node)) {
            shouldProcess = true;
            break;
          }
        }
        if (shouldProcess) break;
      }

      if (shouldProcess) {
        // Debounce: process after a short delay
        clearTimeout(observer._timeout);
        observer._timeout = setTimeout(() => {
          processProducts();
        }, 300);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /* ----------------------------------------------------------------
     MESSAGE LISTENERS
     ---------------------------------------------------------------- */

  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'toggleNutriScore') {
      if (request.active) {
        if (typeof window.initializeNutriScoreExtension === 'function') {
          window.initializeNutriScoreExtension();
        } else {
          activateNutriScore();
        }
      } else {
        if (typeof window.shutdownNutriScore === 'function') {
          window.shutdownNutriScore();
        }
        deactivateNutriScore();
      }
      sendResponse({ success: true });
      return true;
    }
    return false;
  });

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.nsActive) {
      if (changes.nsActive.newValue === true) {
        if (typeof window.initializeNutriScoreExtension === 'function') {
          window.initializeNutriScoreExtension();
        } else {
          activateNutriScore();
        }
      } else {
        if (typeof window.shutdownNutriScore === 'function') {
          window.shutdownNutriScore();
        }
        deactivateNutriScore();
      }
    }
  });

  /* ----------------------------------------------------------------
     INITIALIZATION
     ---------------------------------------------------------------- */

  function markPromptSeen() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ nsPromptSeen: true }, () => {});
      }
    } catch (e) {}
  }

  function initialize() {
    const initializeNow = () => {
      if (typeof window.initializeNutriScoreExtension === 'function') {
        window.initializeNutriScoreExtension();
        return;
      }

      // Fallback: Add the activation prompt only on the first run
      if (typeof window.showActivatePrompt === 'function') {
        window.showActivatePrompt(() => {
          markPromptSeen();
          activateNutriScore();
        }, () => {
          markPromptSeen();
        });
      } else {
        activateNutriScore();
      }
    };

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['nsActive', 'nsPromptSeen'], (result = {}) => {
        if (result.nsActive === true) {
          if (typeof window.initializeNutriScoreExtension === 'function') {
            window.initializeNutriScoreExtension();
          } else {
            activateNutriScore();
          }
          return;
        }

        if (result.nsPromptSeen === true) {
          return;
        }

        initializeNow();
      });
    } else {
      initializeNow();
    }
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();