/* activatePrompt.js - Shows a first-run activation prompt to enable NutriScore on the current page */
(function() {
  'use strict';

  function showActivatePrompt(onActivate, onDismiss) {
    if (document.querySelector('.nutriscore-activate-backdrop')) return;

    const backdrop = document.createElement('div');
    backdrop.className = 'nutriscore-activate-backdrop';
    backdrop.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2147483647;
    `;

    const card = document.createElement('div');
    card.className = 'nutriscore-activate-card';
    card.style.cssText = `
      width: min(420px, calc(100% - 32px));
      border-radius: 24px;
      background: #ffffff;
      padding: 26px;
      box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const heading = document.createElement('h2');
    heading.textContent = 'Activate NutriScore?';
    heading.style.cssText = 'font-size: 1.35rem; margin: 0 0 12px; color: #0f172a;';

    const message = document.createElement('p');
    message.textContent = 'Show NutriScore icons on this page to explore nutritional detail for each product.';
    message.style.cssText = 'color: #475569; margin: 0 0 22px; line-height: 1.5;';

    const buttonRow = document.createElement('div');
    buttonRow.style.cssText = 'display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;';

    const activateButton = document.createElement('button');
    activateButton.textContent = 'Activate';
    activateButton.style.cssText = `
      padding: 12px 22px;
      border-radius: 999px;
      border: none;
      background: #16a34a;
      color: white;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 12px 26px rgba(22, 163, 74, 0.24);
    `;

    const dismissButton = document.createElement('button');
    dismissButton.textContent = 'Dismiss';
    dismissButton.style.cssText = `
      padding: 12px 22px;
      border-radius: 999px;
      border: 1px solid #cbd5e1;
      background: white;
      color: #475569;
      cursor: pointer;
    `;

    activateButton.addEventListener('click', () => {
      backdrop.remove();
      if (onActivate) onActivate();
      if (onDismiss) onDismiss();
    });

    dismissButton.addEventListener('click', () => {
      backdrop.remove();
      if (onDismiss) onDismiss();
    });

    buttonRow.appendChild(activateButton);
    buttonRow.appendChild(dismissButton);

    card.appendChild(heading);
    card.appendChild(message);
    card.appendChild(buttonRow);
    backdrop.appendChild(card);
    document.body.appendChild(backdrop);
  }

  window.showActivatePrompt = showActivatePrompt;
})();