/* nutrientBar.js - Renders a compact nutrient breakdown bar used inside the product overlay */
(function() {
  'use strict';

  class NutrientBar {
    constructor(nutrientData) {
      this.nutrientData = nutrientData || {};
      this.maxValues = {
        calories: 600,
        fat: 30,
        sugar: 40,
        salt: 2,
        fiber: 12,
        protein: 20
      };
      this.element = null;
      this.render();
      this.injectStyles();
    }

    render() {
      this.element = document.createElement('div');
      this.element.className = 'nutriscore-nutrient-bar';

      const header = document.createElement('div');
      header.className = 'nutriscore-nutrient-bar-header';
      header.textContent = 'Nutrition details';
      this.element.appendChild(header);

      const rows = document.createElement('div');
      rows.className = 'nutriscore-nutrient-bar-rows';

      const nutrients = [
        { key: 'calories', label: 'Calories', unit: 'kcal' },
        { key: 'fat', label: 'Fat', unit: 'g' },
        { key: 'sugar', label: 'Sugar', unit: 'g' },
        { key: 'salt', label: 'Salt', unit: 'g' },
        { key: 'fiber', label: 'Fiber', unit: 'g' },
        { key: 'protein', label: 'Protein', unit: 'g' }
      ];

      nutrients.forEach((nutrient) => {
        const value = this.formatValue(this.nutrientData[nutrient.key]);
        const ratio = this.normalizeValue(value, this.maxValues[nutrient.key]);

        const row = document.createElement('div');
        row.className = 'nutriscore-nutrient-row';

        const label = document.createElement('div');
        label.className = 'nutriscore-nutrient-label';
        label.textContent = nutrient.label;

        const valueEl = document.createElement('div');
        valueEl.className = 'nutriscore-nutrient-value';
        valueEl.textContent = `${value}${nutrient.unit}`;

        const track = document.createElement('div');
        track.className = 'nutriscore-nutrient-track';

        const fill = document.createElement('div');
        fill.className = 'nutriscore-nutrient-fill';
        fill.style.width = `${Math.min(ratio * 100, 100)}%`;
        fill.style.background = this.getFillColor(nutrient.key);

        track.appendChild(fill);
        row.appendChild(label);
        row.appendChild(valueEl);
        row.appendChild(track);
        rows.appendChild(row);
      });

      this.element.appendChild(rows);
    }

    formatValue(value) {
      if (typeof value !== 'number') return 0;
      return Math.round(value * 10) / 10;
    }

    normalizeValue(value, max) {
      if (!max || max <= 0) return 0;
      return Math.min(Math.max(value / max, 0), 1);
    }

    getFillColor(key) {
      const colors = {
        calories: '#4f46e5',
        fat: '#ec4899',
        sugar: '#f59e0b',
        salt: '#22c55e',
        fiber: '#14b8a6',
        protein: '#0ea5e9'
      };
      return colors[key] || '#94a3b8';
    }

    injectStyles() {
      if (document.getElementById('nutriscore-nutrient-bar-styles')) return;

      const style = document.createElement('style');
      style.id = 'nutriscore-nutrient-bar-styles';
      style.textContent = `
        .nutriscore-nutrient-bar {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 14px 0 0 0;
        }
        .nutriscore-nutrient-bar-header {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: 0.01em;
        }
        .nutriscore-nutrient-bar-rows {
          display: grid;
          gap: 12px;
        }
        .nutriscore-nutrient-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          align-items: center;
        }
        .nutriscore-nutrient-label {
          font-size: 0.88rem;
          color: #334155;
        }
        .nutriscore-nutrient-value {
          font-size: 0.88rem;
          color: #0f172a;
          font-weight: 700;
          text-align: right;
        }
        .nutriscore-nutrient-track {
          grid-column: 1 / -1;
          height: 6px;
          border-radius: 999px;
          background: #e2e8f0;
          overflow: hidden;
          margin-top: 4px;
        }
        .nutriscore-nutrient-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.35s ease;
        }
      `;
      document.head.appendChild(style);
    }
  }

  window.NutrientBar = NutrientBar;
})();