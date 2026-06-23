(function() {
  'use strict';

  let tooltipElement = null;
  let removalTimer = null;

  function createTooltipElement(text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'nutriscore-tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
      position: absolute;
      z-index: 10001;
      max-width: 240px;
      padding: 10px 14px;
      border-radius: 14px;
      background: rgba(15, 23, 42, 0.94);
      color: #f8fafc;
      font-size: 0.85rem;
      line-height: 1.4;
      box-shadow: 0 16px 40px rgba(15, 23, 42, 0.28);
      opacity: 0;
      transition: opacity 0.18s ease, transform 0.18s ease;
      pointer-events: none;
    `;
    document.body.appendChild(tooltip);
    return tooltip;
  }

  function positionTooltip(target, tooltip) {
    if (!target || !tooltip) return;
    const rect = target.getBoundingClientRect();
    const offsetY = -10;
    const top = rect.top + window.scrollY + offsetY - tooltip.offsetHeight;
    const left = rect.left + window.scrollX + rect.width / 2 - tooltip.offsetWidth / 2;

    tooltip.style.top = `${Math.max(top, 10)}px`;
    tooltip.style.left = `${Math.min(Math.max(left, 10), window.innerWidth - tooltip.offsetWidth - 10)}px`;
    tooltip.style.transform = 'translateY(0)';
  }

  window.showNutriScoreTooltip = function(target, text) {
    if (!target || !text) return;
    if (tooltipElement) {
      tooltipElement.remove();
      tooltipElement = null;
    }
    if (removalTimer) {
      clearTimeout(removalTimer);
      removalTimer = null;
    }

    tooltipElement = createTooltipElement(text);
    requestAnimationFrame(() => {
      positionTooltip(target, tooltipElement);
      tooltipElement.style.opacity = '1';
      tooltipElement.style.transform = 'translateY(-4px)';
    });
  };

  window.hideNutriScoreTooltip = function() {
    if (!tooltipElement) return;
    tooltipElement.style.opacity = '0';
    tooltipElement.style.transform = 'translateY(0)';
    removalTimer = window.setTimeout(() => {
      if (tooltipElement) {
        tooltipElement.remove();
        tooltipElement = null;
      }
      removalTimer = null;
    }, 180);
  };
})();