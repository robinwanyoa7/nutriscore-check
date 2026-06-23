// iconLayer.js - Creates and manages grade icons/badges on product cards

(function() {
  'use strict';

  /**
   * IconLayer - Creates a grade badge on a product container
   * @param {HTMLElement} container - The product container element
   * @param {string} productName - Name of the product
   * @param {Function} onClick - Callback when icon is clicked (receives productName, grade, iconElement)
   */
  class IconLayer {
    constructor(container, product, onClick) {
      this.container = container;
      this.product = product || {};
      this.productName = this.product.name || 'Product';
      this.productPrice = this.product.price || '';
      this.onClick = onClick;
      this.iconElement = null;
      this.grade = this.calculateGrade(this.productName);
      this.nutrientData = null;
      
      // Create and inject the icon
      this.createIcon();
    }

    /**
     * Calculate a nutritional grade for the product
     * This is a mock - replace with real data later
     */
    calculateGrade(productName) {
      const lower = productName.toLowerCase();
      
      // Simple keyword-based grading (demo only)
      if (/sugar|candy|soda|cola|juice|sweet|chocolate|ice cream|pastry|cookie/i.test(lower)) {
        return 'D';
      }
      if (/processed|instant|noodles|packaged|frozen|microwave|canned/i.test(lower)) {
        return 'C';
      }
      if (/organic|natural|fresh|whole grain|vegetable|fruit|salad|kale|spinach/i.test(lower)) {
        return 'A';
      }
      if (/bread|pasta|rice|cereal|milk|yogurt|cheese|egg|chicken|fish|meat/i.test(lower)) {
        return 'B';
      }
      return 'C'; // Default middle grade
    }

    /**
     * Get color for a grade
     */
    getGradeColor(grade) {
      const colors = {
        'A': '#1a8d3c', // Dark green
        'B': '#86c440', // Light green
        'C': '#f9c852', // Yellow
        'D': '#f47a22', // Orange
        'E': '#da3b3b'  // Red
      };
      return colors[grade] || '#94a3b8';
    }

    /**
     * Get badge emoji for a grade
     */
    getGradeEmoji(grade) {
      const emojis = {
        'A': '🌟',
        'B': '👍',
        'C': '😐',
        'D': '⚠️',
        'E': '🚫'
      };
      return emojis[grade] || '📊';
    }

    /**
     * Create and inject the icon element
     */
    createIcon() {
      // Remove any existing icon from this container
      this.removeExistingIcon();

      // Create the icon container
      this.iconElement = document.createElement('div');
      this.iconElement.className = 'nutriscore-icon';
      this.iconElement.dataset.grade = this.grade;
      this.iconElement.dataset.product = this.productName;

      // Style the icon bar
      this.iconElement.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        z-index: 9999;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 110px;
        height: 36px;
        border-radius: 999px;
        background: #16a34a;
        color: white;
        font-weight: 700;
        font-size: 14px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.24);
        transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        border: 2px solid rgba(255,255,255,0.15);
        padding: 0 14px;
        user-select: none;
      `;

      const letterSpan = document.createElement('span');
      letterSpan.textContent = 'Nutriscore';
      letterSpan.style.cssText = `
        position: relative;
        z-index: 1;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
      `;
      this.iconElement.appendChild(letterSpan);

      const hoverCard = document.createElement('div');
      hoverCard.className = 'nutriscore-icon-hovercard';
      hoverCard.textContent = `${this.productName}${this.productPrice ? ' · ' + this.productPrice : ''}`;
      hoverCard.style.cssText = `
        position: absolute;
        top: -44px;
        right: 50%;
        transform: translateX(50%);
        min-width: 180px;
        padding: 10px 14px;
        border-radius: 14px;
        background: rgba(15, 23, 42, 0.95);
        color: white;
        font-size: 0.82rem;
        line-height: 1.4;
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.28);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.18s ease, transform 0.18s ease;
        z-index: 10000;
        white-space: normal;
        text-align: center;
      `;

      this.iconElement.appendChild(hoverCard);
      this.iconElement.dataset.hoverCard = 'true';

      // Add tooltip on hover
      this.iconElement.title = `${this.productName}\n${this.productPrice ? 'Price: ' + this.productPrice + '\n' : ''}Grade: ${this.grade}\nClick for details`;

      // Make container relative for positioning
      this.ensureContainerPosition();

      // Add click handler
      this.iconElement.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (this.onClick) {
          this.onClick(this.product, this.grade, this.iconElement);
        }
      });

      // Add hover effects
      this.iconElement.addEventListener('mouseenter', () => {
        this.iconElement.style.transform = 'scale(1.05)';
        this.iconElement.style.boxShadow = '0 6px 22px rgba(0, 0, 0, 0.32)';
        this.setHoverCardVisible(true);
        if (typeof window.showNutriScoreTooltip === 'function') {
          window.showNutriScoreTooltip(this.iconElement, `${this.productName}${this.productPrice ? ' · ' + this.productPrice : ''}\nGrade: ${this.grade}`);
        }
      });

      this.iconElement.addEventListener('mouseleave', () => {
        this.iconElement.style.transform = 'scale(1)';
        this.iconElement.style.boxShadow = '0 4px 18px rgba(0, 0, 0, 0.24)';
        this.setHoverCardVisible(false);
        if (typeof window.hideNutriScoreTooltip === 'function') {
          window.hideNutriScoreTooltip();
        }
      });

      // Inject into the container
      this.container.appendChild(this.iconElement);

      // Add a subtle entrance animation
      this.animateEntrance();
    }

    /**
     * Ensure the container has position: relative for absolute positioning
     */
    ensureContainerPosition() {
      const currentPosition = window.getComputedStyle(this.container).position;
      if (currentPosition === 'static') {
        this.container.style.position = 'relative';
      }
    }

    /**
     * Remove any existing NutriScore icon from the container
     */
    removeExistingIcon() {
      const existing = this.container.querySelector('.nutriscore-icon');
      if (existing) {
        existing.remove();
      }
    }

    /**
     * Add entrance animation
     */
    animateEntrance() {
      if (!this.iconElement) return;
      
      this.iconElement.style.transform = 'scale(0)';
      this.iconElement.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
      
      // Trigger reflow
      void this.iconElement.offsetWidth;
      
      this.iconElement.style.transform = 'scale(1)';
    }

    setHoverCardVisible(isVisible) {
      const hoverCard = this.iconElement.querySelector('.nutriscore-icon-hovercard');
      if (!hoverCard) return;
      hoverCard.style.opacity = isVisible ? '1' : '0';
      hoverCard.style.transform = isVisible ? 'translateX(50%) translateY(-4px)' : 'translateX(50%) translateY(0)';
    }

    /**
     * Update the icon with new grade data
     */
    updateGrade(newGrade) {
      if (!this.iconElement) return;
      
      this.grade = newGrade;
      this.iconElement.dataset.grade = newGrade;
      this.iconElement.style.background = this.getGradeColor(newGrade);
      this.iconElement.title = `${this.productName}\nGrade: ${newGrade}\nClick for details`;
      
      // Update the letter
      const letterSpan = this.iconElement.querySelector('span');
      if (letterSpan) {
        letterSpan.textContent = newGrade;
      }
      
      // Color flash animation
      this.iconElement.style.transition = 'background 0.3s ease';
      this.iconElement.style.background = '#ffffff';
      setTimeout(() => {
        this.iconElement.style.background = this.getGradeColor(newGrade);
      }, 150);
    }

    /**
     * Show a loading state
     */
    setLoading() {
      if (!this.iconElement) return;
      
      this.iconElement.style.background = '#94a3b8';
      this.iconElement.classList.add('loading');
      
      const letterSpan = this.iconElement.querySelector('span');
      if (letterSpan) {
        letterSpan.textContent = '…';
      }
    }

    /**
     * Remove loading state
     */
    clearLoading() {
      if (!this.iconElement) return;
      
      this.iconElement.classList.remove('loading');
      this.iconElement.style.background = this.getGradeColor(this.grade);
      
      const letterSpan = this.iconElement.querySelector('span');
      if (letterSpan) {
        letterSpan.textContent = this.grade;
      }
    }

    /**
     * Remove the icon from the DOM
     */
    remove() {
      if (this.iconElement && this.iconElement.parentNode) {
        this.iconElement.remove();
      }
      this.iconElement = null;
    }

    /**
     * Check if the icon is still in the DOM
     */
    isAttached() {
      return this.iconElement && this.iconElement.parentNode !== null;
    }
  }

  // Add global pulse animation style
  const style = document.createElement('style');
  style.textContent = `
    @keyframes nutriscore-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .nutriscore-icon.loading {
      animation: nutriscore-pulse 1.5s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);

  // Expose the class globally
  window.IconLayer = IconLayer;

})();