# NutriScore Checkout Tool

## File purposes

- `manifest.json`: Chrome extension manifest containing metadata and permissions.
- `activatePrompt.js`: Shows first-run activation prompt to enable NutriScore on a page.
- `src/content.js`: Main content script — scans pages, injects icons, and manages activation.
- `src/iconLayer.js`: Creates and manages NutriScore grade icons/badges on product cards.
- `src/overlayLayer.js`: Displays product details overlay including the nutrient bar.
- `src/nutrientBar.js`: Renders nutritional breakdown bars used in the overlay.
- `src/tooltip.js`: Floating tooltip helper for icon hover states.
- `src/scraper.js`: Heuristics to locate product elements and extract name/price data.
- `popup/popup.html`: Extension popup UI (controls activation and quick actions).
- `popup/popup.css`: Styles for the popup UI.
- `popup/popup.js`: Popup behavior and messaging to the content script.
- `demo/index.html`: Local demo page with sample products for development.
- `README.md`: Project documentation and developer notes.

