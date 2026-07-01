// demo/health.js - Persist selected health issues and additional notes in browser local storage

const HEALTH_STORAGE_KEY = 'nsHealthPreferences';

function getStoredHealthPreferences() {
  try {
    const raw = window.localStorage.getItem(HEALTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Failed to read health preferences from localStorage:', error);
    return null;
  }
}

function saveHealthPreferences(preferences) {
  try {
    window.localStorage.setItem(HEALTH_STORAGE_KEY, JSON.stringify(preferences));
    return true;
  } catch (error) {
    console.error('Failed to save health preferences to localStorage:', error);
    return false;
  }
}

function readSelections() {
  const checkboxes = Array.from(document.querySelectorAll('input[name="condition"]'));
  return checkboxes
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
}

function applyStoredPreferences(preferences) {
  if (!preferences) return;

  const checkboxes = Array.from(document.querySelectorAll('input[name="condition"]'));
  checkboxes.forEach((checkbox) => {
    checkbox.checked = Array.isArray(preferences.conditions) && preferences.conditions.includes(checkbox.value);
  });

  const details = document.getElementById('healthDetails');
  if (details && typeof preferences.additionalInfo === 'string') {
    details.value = preferences.additionalInfo;
  }
}

function showStatus(message, isError = false) {
  const status = document.getElementById('saveStatus');
  if (!status) return;
  status.textContent = message;
  status.style.color = isError ? '#b91c1c' : '#0f766e';
}

function init() {
  const saveButton = document.getElementById('saveHealthDetails');
  const healthDetails = document.getElementById('healthDetails');

  const storedPreferences = getStoredHealthPreferences();
  applyStoredPreferences(storedPreferences);

  saveButton.addEventListener('click', () => {
    const preferences = {
      conditions: readSelections(),
      additionalInfo: healthDetails ? healthDetails.value.trim() : ''
    };

    const saved = saveHealthPreferences(preferences);
    if (saved) {
      showStatus('Health details saved locally.');
    } else {
      showStatus('Unable to save health details. Please try again.', true);
    }
  });
}

window.addEventListener('DOMContentLoaded', init);
