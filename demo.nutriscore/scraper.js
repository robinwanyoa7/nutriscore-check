// scraper.js - Extracts product information from the page

(function() {
  'use strict';

  /**
   * Main function to scrape products from the page
   * Returns an array of { element: HTMLElement, name: string }
   */
  window.scrapeProducts = function() {
    const products = [];
    
    // Look for product elements with common selectors
    const selectors = [
      '.product-item',
      '.product-card', 
      '.product',
      '[data-product-id]',
      '[data-sku]',
      '.item',
      '.listing-item',
      '.product-grid-item'
    ];

    let candidates = [];
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length) {
        candidates = candidates.concat(Array.from(elements));
      }
    }

    // If we found candidates, extract product names
    if (candidates.length) {
      for (const element of candidates) {
        const name = extractProductName(element);
        if (name) {
          products.push({ element, name });
        }
      }
    }

    // If no products found with standard selectors, try fallback
    if (products.length === 0) {
      // Fallback: Look for any heading that might be a product name
      const headings = document.querySelectorAll('h2, h3, .product-title, .item-title, .title');
      for (const heading of headings) {
        const name = heading.textContent.trim();
        if (name && name.length > 2 && name.length < 100) {
          // Try to find a parent container
          let container = heading.closest('.product, .item, .card, [data-product-id], [data-sku]');
          if (!container) {
            container = heading.parentElement;
          }
          if (container) {
            products.push({ element: container, name });
          }
        }
      }
    }

    return products;
  };

  /**
   * Extract product name from an element
   */
  function extractProductName(element) {
    const nameSelectors = [
      '.product-title',
      '.product-name',
      '.item-title',
      '.title',
      '.name',
      'h2',
      'h3',
      '.product-description h2',
      '.product-description h3',
      '.product-heading',
      '.product-header'
    ];

    for (const selector of nameSelectors) {
      const nameEl = element.querySelector(selector);
      if (nameEl) {
        const text = nameEl.textContent.trim();
        if (text) return text;
      }
    }

    // If no specific element found, use the element's own text
    const text = element.textContent.trim();
    const lines = text.split('\n').map(s => s.trim()).filter(s => s);
    
    // Return the first line that looks like a product name (not too short, not too long)
    for (const line of lines) {
      if (line.length > 2 && line.length < 100) {
        return line;
      }
    }
    
    return lines.length > 0 ? lines[0] : null;
  }

})();