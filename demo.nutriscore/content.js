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
      const { element, name } = product;
      
      // Skip if already processed
      const key = element.dataset.productId || 
                  element.dataset.sku || 
                  element.id || 
                  element.outerHTML.slice(0, 50);
                  
      if (processedContainers.has(key)) continue;
      processedContainers.add(key);

      // Inject the grade icon
      injectGradeIcon(element, name);
    }
  }

  function injectGradeIcon(container, productName) {
    // Create a new IconLayer instance
    const icon = new IconLayer(container, productName, (name, iconElement) => {
      // This callback runs when the icon is clicked
      console.log(`[NutriScore] Icon clicked for: ${name}`);
      // TODO: Show detailed overlay here
    });
    
    // Store reference for cleanup
    iconInstances.push(icon);
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
    // Check initial state
    chrome.storage.local.get(['nsActive'], (result) => {
      if (chrome.runtime.lastError) {
        console.warn('[NutriScore] Storage error:', chrome.runtime.lastError);
        return;
      }
      
      if (result.nsActive === true) {
        activateNutriScore();
      }
    });
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();