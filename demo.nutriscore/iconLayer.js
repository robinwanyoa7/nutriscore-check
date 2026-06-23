// iconLayer.js - Creates and manages grade icons/badges on product cards

(function() {
  'use strict';

  /**
   * IconLayer - Creates a grade badge on a product container
   * @param {HTMLElement} container - The product container element
   * @param {string} productName - Name of the product
   * @param {Function} onClick - Callback when icon is clicked (receives productName, iconElement)
   */
  class IconLayer {
    constructor(container, productName, onClick) {
      this.container = container;
      this.productName = productName;
      this.onClick = onClick;
      this.iconElement = null;
      this.grade = this.calculateGrade(productName);
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

      // Style the icon
      this.iconElement.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        z-index: 9999;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: ${this.getGradeColor(this.grade)};
        color: white;
        font-weight: 700;
        font-size: 16px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        border: 2px solid white;
        user-select: none;
      `;

      // Add letter
      const letterSpan = document.createElement('span');
      letterSpan.textContent = this.grade;
      letterSpan.style.cssText = `
        position: relative;
        z-index: 1;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      `;
      this.iconElement.appendChild(letterSpan);

      // Add tooltip on hover
      this.iconElement.title = `${this.productName}\nGrade: ${this.grade}\nClick for details`;

      // Make container relative for positioning
      this.ensureContainerPosition();

      // Add click handler
      this.iconElement.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (this.onClick) {
          this.onClick(this.productName, this.iconElement);
        }
      });

      // Add hover effects
      this.iconElement.addEventListener('mouseenter', () => {
        this.iconElement.style.transform = 'scale(1.15)';
        this.iconElement.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.35)';
      });

      this.iconElement.addEventListener('mouseleave', () => {
        this.iconElement.style.transform = 'scale(1)';
        this.iconElement.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.25)';
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