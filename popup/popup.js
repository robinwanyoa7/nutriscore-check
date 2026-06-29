// popup.js - Controls the popup UI and communicates with content script

document.addEventListener('DOMContentLoaded', () => {
  // DOM element references
  const toggleButton = document.getElementById('toggleButton');
  const dismissButton = document.getElementById('dismissButton');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');

  // Helper: Update UI based on active state
  function updateUI(isActive) {
    if (isActive) {
      statusDot.classList.add('active');
      statusText.textContent = 'NutriScore is active';
      toggleButton.textContent = 'Deactivate';
      toggleButton.classList.add('deactivate');
    } else {
      statusDot.classList.remove('active');
      statusText.textContent = 'NutriScore is ready';
      toggleButton.textContent = 'Activate';
      toggleButton.classList.remove('deactivate');
    }
  }

  // Helper: Send message to content script
  function sendToggleMessage(active) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0]) return;
      
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'toggleNutriScore',
        active: active
      }, (response) => {
        // Optional: handle response if needed
        if (chrome.runtime.lastError) {
          // Content script might not be loaded yet
          console.log('Content script not ready, storage will sync on load');
        }
      });
    });
  }

  // Load initial state from storage
  chrome.storage.local.get(['nsActive'], (result) => {
    const isActive = result.nsActive === true;
    updateUI(isActive);
  });

  // Toggle button click handler
  toggleButton.addEventListener('click', () => {
    chrome.storage.local.get(['nsActive'], (result) => {
      const currentState = result.nsActive === true;
      const newState = !currentState;
      
      // Update storage
      chrome.storage.local.set({ nsActive: newState }, () => {
        updateUI(newState);
        sendToggleMessage(newState);
        
        // Close popup after a short delay
        setTimeout(() => {
          window.close();
        }, 300);
      });
    });
  });

  // Dismiss button click handler
  dismissButton.addEventListener('click', () => {
    window.close();
  });

  // Keyboard shortcut: Escape to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.close();
    }
  });

  // Listen for storage changes (in case another popup updates it)
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.nsActive) {
      const newState = changes.nsActive.newValue === true;
      updateUI(newState);
    }
  });
});