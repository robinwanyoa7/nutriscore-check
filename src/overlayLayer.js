/* overlayLayer.js - Creates and manages the product detail overlay shown when an icon is clicked */
(function() {
  'use strict';

  class OverlayLayer {
    constructor(productName, grade, nutrientData, anchorElement) {
      this.productName = productName;
      this.grade = grade;
      this.nutrientData = nutrientData || {};
      this.anchorElement = anchorElement;
      this.overlayElement = null;
      this.contentElement = null;
      this.bar = null;

      this.createOverlay();
      this.injectStyles();
    }

    createOverlay() {
      this.overlayElement = document.createElement('div');
      this.overlayElement.className = 'nutriscore-overlay-backdrop';
      this.overlayElement.addEventListener('click', (event) => {
        if (event.target === this.overlayElement) {
          this.hide();
        }
      });

      this.contentElement = document.createElement('div');
      this.contentElement.className = 'nutriscore-overlay-card';

      const header = document.createElement('div');
      header.className = 'nutriscore-overlay-header';
      const title = document.createElement('div');
      title.className = 'nutriscore-overlay-title';
      title.textContent = this.productName;

      const badge = document.createElement('div');
      badge.className = 'nutriscore-overlay-badge';
      badge.textContent = this.grade;
      badge.style.background = this.getGradeColor(this.grade);

      header.appendChild(title);
      header.appendChild(badge);

      const description = document.createElement('div');
      description.className = 'nutriscore-overlay-description';
      description.textContent = `Estimated grade for this product. Tap outside to close.`;

      const details = document.createElement('div');
      details.className = 'nutriscore-overlay-details';
      details.innerHTML = `
        <div><strong>Product:</strong> ${this.escapeHtml(this.productName)}</div>
        <div><strong>NutriScore:</strong> ${this.grade}</div>
      `;

      this.bar = new window.NutrientBar(this.nutrientData);

      this.contentElement.appendChild(header);
      this.contentElement.appendChild(description);
      this.contentElement.appendChild(details);
      this.contentElement.appendChild(this.bar.element);
      this.overlayElement.appendChild(this.contentElement);
    }

    show() {
      this.hideExistingOverlay();
      document.body.appendChild(this.overlayElement);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        this.overlayElement.classList.add('visible');
        this.contentElement.classList.add('visible');
      });
      this.focusFirstFocusable();
    }

    hide() {
      if (!this.overlayElement) return;
      this.overlayElement.classList.remove('visible');
      this.contentElement.classList.remove('visible');
      document.body.style.overflow = '';
      setTimeout(() => {
        if (this.overlayElement && this.overlayElement.parentNode) {
          this.overlayElement.remove();
        }
      }, 200);
    }

    hideExistingOverlay() {
      const existing = document.querySelector('.nutriscore-overlay-backdrop');
      if (existing) {
        existing.remove();
      }
    }

    focusFirstFocusable() {
      const focusable = this.contentElement.querySelector('button, a, input, textarea, [tabindex]');
      if (focusable) {
        focusable.focus();
      }
    }

    getGradeColor(grade) {
      const colors = {
        A: '#16a34a',
        B: '#22c55e',
        C: '#f59e0b',
        D: '#f97316',
        E: '#ef4444'
      };
      return colors[grade] || '#64748b';
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    injectStyles() {
      if (document.getElementById('nutriscore-overlay-layer-styles')) return;

      const style = document.createElement('style');
      style.id = 'nutriscore-overlay-layer-styles';
      style.textContent = `
        .nutriscore-overlay-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
          z-index: 2147483646;
        }
        .nutriscore-overlay-backdrop.visible {
          opacity: 1;
          pointer-events: auto;
        }
        .nutriscore-overlay-card {
          width: min(420px, calc(100% - 32px));
          max-height: calc(100vh - 64px);
          overflow-y: auto;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 24px 56px rgba(15, 23, 42, 0.2);
          padding: 24px;
          transform: translateY(24px) scale(0.97);
          opacity: 0;
          transition: transform 0.25s ease, opacity 0.25s ease;
        }
        .nutriscore-overlay-card.visible {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
        .nutriscore-overlay-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 12px;
        }
        .nutriscore-overlay-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
          flex: 1;
        }
        .nutriscore-overlay-badge {
          min-width: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          padding: 10px 14px;
          font-weight: 800;
          color: #ffffff;
          font-size: 0.95rem;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.12);
        }
        .nutriscore-overlay-description {
          color: #475569;
          font-size: 0.95rem;
          margin-bottom: 18px;
          line-height: 1.5;
        }
        .nutriscore-overlay-details {
          display: grid;
          gap: 10px;
          margin-bottom: 18px;
          font-size: 0.92rem;
          color: #334155;
        }
      `;
      document.head.appendChild(style);
    }
  }

  window.OverlayLayer = OverlayLayer;
})();