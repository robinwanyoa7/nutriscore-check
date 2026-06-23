// scraper.js - Extracts product information from the page

(function() {
  'use strict';

  /**
   * Main function to scrape products from the page
   * Returns an array of { element: HTMLElement, name: string, price: string }
   */
  window.scrapeProducts = function() {
    const products = [];

    const selectors = [
      '.product-card',
      '.product-item',
      '.product',
      '[data-product-id]',
      '[data-sku]',
      '.item',
      '.listing-item',
      '.product-grid-item',
      'article',
      '.grid-item'
    ];

    let candidates = [];
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length) {
        candidates = candidates.concat(Array.from(elements));
      }
    }

    if (candidates.length) {
      for (const element of candidates) {
        if (isNavigationElement(element)) continue;
        if (isInsideNavigationMenu(element)) continue;

        const name = extractProductName(element);
        if (!name) continue;
        if (!isLikelyProductCard(element)) continue;

        const price = extractProductPrice(element);
        const key = element.dataset.productId || element.dataset.sku || element.id || name;

        products.push({ element, name, price, key });
      }
    }

    if (products.length === 0) {
      const headings = document.querySelectorAll('h2, h3, .product-title, .item-title, .title');
      for (const heading of headings) {
        if (isNavigationElement(heading)) continue;
        if (isInsideNavigationMenu(heading)) continue;

        const name = heading.textContent.trim();
        if (name && name.length > 2 && name.length < 100) {
          let container = heading.closest('.product, .item, .card, article, [data-product-id], [data-sku]');
          if (!container) {
            container = heading.parentElement;
          }
          if (container && !isNavigationElement(container) && !isInsideNavigationMenu(container) && isLikelyProductCard(container)) {
            const price = extractProductPrice(container);
            products.push({ element: container, name, price, key: container.dataset.productId || container.dataset.sku || container.id || name });
          }
        }
      }
    }

    return products;
  };

  function extractProductName(element) {
    const nameSelectors = [
      '[data-testid="product-title"]',
      '.product-card__title',
      '.product-title',
      '.product-name',
      '.item-title',
      '.title',
      '.name',
      'h2',
      'h3',
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

    const text = element.textContent.trim();
    if (!text) return null;

    const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
    for (const line of lines) {
      if (line.length > 2 && line.length < 100) {
        return line;
      }
    }

    return null;
  }

  function extractProductPrice(element) {
    const priceSelectors = [
      '[data-testid="product-price"]',
      '.price',
      '.product-price',
      '.product-card__price',
      '.item-price',
      '.price-value'
    ];

    for (const selector of priceSelectors) {
      const priceEl = element.querySelector(selector);
      if (priceEl) {
        const priceText = priceEl.textContent.trim();
        if (priceText) return priceText;
      }
    }

    return null;
  }

  function isNavigationElement(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;

    const navSelectors = [
      'nav',
      '.nav',
      '.navbar',
      '.navigation',
      '[role="navigation"]',
      '.menu',
      '.site-header',
      '.top-bar',
      '.header',
      '.header-menu'
    ];

    for (const selector of navSelectors) {
      if (element.matches(selector) || element.closest(selector)) {
        return true;
      }
    }

    const text = element.textContent || '';
    if (/home|shop|categories|account|search|sign in|register|cart|checkout/i.test(text)) {
      return true;
    }

    return false;
  }

  function isLikelyProductCard(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;

    const cardSelectors = [
      '.product-card',
      '.product-item',
      '.product',
      '.item',
      '.listing-item',
      '.product-grid-item',
      '.grid-item',
      'article',
      '.card'
    ];

    for (const selector of cardSelectors) {
      if (element.matches(selector)) {
        return true;
      }
    }

    const name = extractProductName(element);
    if (!name) return false;

    const price = extractProductPrice(element);
    const hasAction = extractProductAction(element);
    const hasImage = Boolean(element.querySelector('img'));

    return Boolean(price || hasAction || hasImage);
  }

  function extractProductAction(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;

    const actionSelectors = [
      'button',
      'input[type="button"]',
      'input[type="submit"]',
      '.add-to-cart',
      '.add-to-basket',
      '.buy-button',
      '.cart-button',
      '.purchase',
      '.add-button',
      '.button-buy',
      '.btn-add',
      '.btn-cart'
    ];

    for (const selector of actionSelectors) {
      const actionEl = element.querySelector(selector);
      if (actionEl && actionEl.textContent.trim().length > 0) {
        return true;
      }
    }

    return false;
  }

  function isInsideNavigationMenu(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;

    const navSelectors = [
      'nav',
      '.nav',
      '.navbar',
      '.navigation',
      '.menu',
      '.dropdown-menu',
      '.site-header',
      '.top-bar',
      '.header',
      '.header-menu'
    ];

    for (const selector of navSelectors) {
      if (element.closest(selector)) {
        return true;
      }
    }

    return false;
  }

})();