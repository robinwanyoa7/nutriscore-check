# NutriScore Checkout Tool

## File purposes

- `manifest.json`: Chrome extension manifest containing metadata and permissions.
- `activatePrompt.js`: Shows first-run activation prompt to enable NutriScore on a page.
- `content.js`: Main content script — scans pages, injects icons, and manages activation.
- `iconLayer.js`: Creates and manages NutriScore grade icons/badges on product cards.
- `overlayLayer.js`: Displays product details overlay including the nutrient bar.
- `nutrientBar.js`: Renders nutritional breakdown bars used in the overlay.
- `tooltip.js`: Floating tooltip helper for icon hover states.
- `scraper.js`: Heuristics to locate product elements and extract name/price data.
- `popup.html`: Extension popup UI (controls activation and quick actions).
- `popup.css`: Styles for the popup UI.
- `popup.js`: Popup behavior and messaging to the content script.
- `test.html`: Local test page with sample products for development.
- `README.md`: Project documentation and developer notes.

