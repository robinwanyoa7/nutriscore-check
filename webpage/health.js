// demo/health.js
// Persist selected health issues and additional notes to Firestore,
// tied to the signed-in Google account (via chrome.identity + Firebase Auth).
//
// NOTE: This file assumes you have a local, bundled copy of the Firebase
// modular SDK (via webpack/esbuild/rollup) since Manifest V3's CSP blocks
// remotely-hosted scripts. Adjust the import path below to match your build.

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';

// --- Firebase project configuration ---
// Get these values from Firebase Console > Project Settings > General
const firebaseConfig = {
  apiKey: "AIzaSyB05umupSWPt96qNWaevFJnS4ovaj907Gc",
  authDomain: "nutriscore-check.firebaseapp.com",
  projectId: "nutriscore-check",
  storageBucket: "nutriscore-check.firebasestorage.app",
  messagingSenderId: "923932588057",
  appId: "1:923932588057:web:8575308e753659b6a85288",
  measurementId: "G-TFJ44W73CX"
};

// Initialize Firebase app, Auth, and Firestore once for this page
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Track the currently signed-in user's UID (null when signed out)
let currentUserId = null;

/**
 * Kicks off Google sign-in using Chrome's built-in identity API,
 * then exchanges that token for a Firebase credential so we get
 * a stable Firebase Auth UID to key data against.
 */
async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    currentUserId = result.user.uid;

    showStatus(`Signed in as ${result.user.email}`);
    updateAccountUI(true);
    // Once signed in, pull any previously saved preferences for this account
    await loadHealthPreferencesFromFirestore(currentUserId);
  } catch (error) {
    console.error('Firebase sign-in failed:', error);
    showStatus('Sign-in failed. Please try again.', true);
  }
}

/**
 * Signs the user out of Firebase Auth and clears local UI state.
 * Does not revoke the underlying Chrome/Google token (that's managed by Chrome).
 */
function signOutUser() {
  auth.signOut().then(() => {
    currentUserId = null;
    applyStoredPreferences({ conditions: [], additionalInfo: '' });
    updateAccountUI(false);
    showStatus('Signed out.');
  });
}

/**
 * Reads which condition checkboxes are currently checked on the page.
 * Returns an array of string values, e.g. ['diabetes', 'vegan'].
 */
function readSelections() {
  const checkboxes = Array.from(document.querySelectorAll('input[name="condition"]'));
  return checkboxes
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
}

/**
 * Applies a saved preferences object back onto the form —
 * checks the right boxes and fills the notes textarea.
 */
function applyStoredPreferences(preferences) {
  if (!preferences) return;

  const checkboxes = Array.from(document.querySelectorAll('input[name="condition"]'));
  checkboxes.forEach((checkbox) => {
    checkbox.checked =
      Array.isArray(preferences.conditions) && preferences.conditions.includes(checkbox.value);
  });

  const details = document.getElementById('healthDetails');
  if (details && typeof preferences.additionalInfo === 'string') {
    details.value = preferences.additionalInfo;
  }
}

/**
 * Saves the current form's selections to Firestore, under a document
 * scoped to the signed-in user's UID. Firestore security rules (configured
 * separately in the Firebase console) ensure only that user can read/write it.
 */
async function saveHealthPreferencesToFirestore() {
  if (!currentUserId) {
    showStatus('Please sign in before saving.', true);
    return;
  }

  const healthDetails = document.getElementById('healthDetails');
  const preferences = {
    conditions: readSelections(),
    additionalInfo: healthDetails ? healthDetails.value.trim() : '',
    updatedAt: new Date().toISOString()
  };

  try {
    // Path: users/{uid}/settings/health — one health doc per user
    await setDoc(doc(db, 'users', currentUserId, 'settings', 'health'), preferences);
    showStatus('Health details saved to your account.');
  } catch (error) {
    console.error('Failed to save health preferences to Firestore:', error);
    showStatus('Unable to save health details. Please try again.', true);
  }
}

/**
 * Loads the signed-in user's saved preferences from Firestore
 * and applies them to the form.
 */
async function loadHealthPreferencesFromFirestore(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'settings', 'health'));
    if (snap.exists()) {
      applyStoredPreferences(snap.data());
    }
  } catch (error) {
    console.error('Failed to load health preferences from Firestore:', error);
    showStatus('Unable to load saved details.', true);
  }
}

/**
 * Displays a status message under the save button (success or error styling).
 */
function showStatus(message, isError = false) {
  const status = document.getElementById('saveStatus');
  if (!status) return;
  status.textContent = message;
  status.style.color = isError ? '#b91c1c' : '#0f766e';
}

/**
 * Shows the "Sign in" button when signed out, or the "Sign out" button
 * (plus save controls) when signed in, so the form reflects auth state.
 */
function updateAccountUI(isSignedIn) {
  const signInButton = document.getElementById('signInWithGoogle');
  const signOutButton = document.getElementById('signOutButton');
  const saveButton = document.getElementById('saveHealthDetails');

  if (signInButton) signInButton.style.display = isSignedIn ? 'none' : 'inline-block';
  if (signOutButton) signOutButton.style.display = isSignedIn ? 'inline-block' : 'none';
  if (saveButton) saveButton.disabled = !isSignedIn;
}

/**
 * Wires up button clicks and restores auth/session state on page load.
 * onAuthStateChanged fires automatically if Firebase already has a
 * cached session, so returning users don't need to sign in again.
 */
function init() {
  const saveButton = document.getElementById('saveHealthDetails');
  const signInButton = document.getElementById('signInWithGoogle');
  const signOutButton = document.getElementById('signOutButton');

  if (saveButton) {
    saveButton.addEventListener('click', saveHealthPreferencesToFirestore);
  }
  if (signInButton) {
    signInButton.addEventListener('click', signInWithGoogle);
  }
  if (signOutButton) {
    signOutButton.addEventListener('click', signOutUser);
  }

  // Restore session on load if the user was already signed in previously
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUserId = user.uid;
      showStatus(`Signed in as ${user.email}`);
      updateAccountUI(true);
      await loadHealthPreferencesFromFirestore(currentUserId);
    } else {
      currentUserId = null;
      updateAccountUI(false);
    }
  });
}

window.addEventListener('DOMContentLoaded', init);