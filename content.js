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
      const { element, key } = product;
      
      // Skip if already processed
      const productKey = key || element.dataset.productId || element.dataset.sku || element.id || element.outerHTML.slice(0, 50);
      if (processedContainers.has(productKey)) continue;
      processedContainers.add(productKey);

      // Inject the grade icon
      injectGradeIcon(element, product);
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

  function startObserver() {
    if (observer) {
      observer.disconnect();
    }

    observer = new MutationObserver((mutations) => {
      if (!isActive) return;
      
      // Check if new products might have been added
      let shouldProcess = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length) {
          shouldProcess = true;
          break;
        }
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
        activateNutriScore();
      } else {
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
        activateNutriScore();
      } else {
        deactivateNutriScore();
      }
    }
  });

  /* ----------------------------------------------------------------
     INITIALIZATION
     ---------------------------------------------------------------- */

  function initialize() {
    // Add the activation prompt immediately when the page loads
    if (typeof window.showActivatePrompt === 'function') {
      window.showActivatePrompt(() => {
        activateNutriScore();
      });
    } else {
      activateNutriScore();
    }
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();