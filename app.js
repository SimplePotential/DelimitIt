/* global document, window, FileReader, navigator, Blob, URL */
'use strict';

// =========================================================
//  DelimitIt — app.js
//  Vanilla JS, no dependencies
// =========================================================

// ---------------------------------------------------------
//  DOM References
// ---------------------------------------------------------
const themeToggle   = document.getElementById('themeToggle');
const inputText     = document.getElementById('inputText');
const outputText    = document.getElementById('outputText');
const convertBtn    = document.getElementById('convertBtn');
const clearBtn      = document.getElementById('clearBtn');
const copyBtn       = document.getElementById('copyBtn');
const exportBtn     = document.getElementById('exportBtn');
const importBtn     = document.getElementById('importBtn');
const fileInput     = document.getElementById('fileInput');
const delimiterInput = document.getElementById('delimiter');
const ignoreCharsInput = document.getElementById('ignoreChars');
const savePrefsBtn  = document.getElementById('savePrefsBtn');
const resetPrefsBtn = document.getElementById('resetPrefsBtn');
const ignoreGroup   = document.getElementById('ignoreGroup');
const statusMsg     = document.getElementById('statusMsg');

const PREFERENCES_KEY = 'delimitit-preferences';
const DEFAULT_PREFERENCES = {
  delimiter: ',',
  quoteStyle: 'none',
  inputMode: 'numeric',
  ignoreChars: ''
};

// ---------------------------------------------------------
//  Theme Management
// ---------------------------------------------------------
(function initTheme() {
  const stored = localStorage.getItem('delimitit-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  applyTheme(theme, false);
})();

(function initPreferences() {
  applyPreferences(loadSavedPreferences());
})();

function applyTheme(theme, persist = true) {
  document.documentElement.setAttribute('data-theme', theme);
  const isDark = theme === 'dark';
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  if (persist) {
    localStorage.setItem('delimitit-theme', theme);
  }
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// ---------------------------------------------------------
//  Tab character in delimiter field
//  Intercept the Tab key to insert a literal tab character
//  rather than shifting focus away.
// ---------------------------------------------------------
delimiterInput.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    delimiterInput.value = '\t';
    announce('Delimiter set to Tab');
  }
});

// Show a visual representation of tab in the delimiter field
// without overriding the actual value used for conversion.
delimiterInput.addEventListener('input', () => {
  // Keep maxlength=2 in HTML to accommodate possible two-char input,
  // but enforce single logical character (or tab) after typing.
  if (delimiterInput.value.length > 1 && delimiterInput.value !== '\t') {
    delimiterInput.value = delimiterInput.value.slice(-1);
  }
});

// ---------------------------------------------------------
//  Input Mode toggle — show/hide "Ignore Characters"
// ---------------------------------------------------------
function getInputMode() {
  const checked = document.querySelector('input[name="inputMode"]:checked');
  return checked ? checked.value : DEFAULT_PREFERENCES.inputMode;
}

function syncIgnoreGroupVisibility() {
  const isNumeric = getInputMode() === 'numeric';
  ignoreGroup.classList.toggle('hidden', isNumeric);
}

document.querySelectorAll('input[name="inputMode"]').forEach((radio) => {
  radio.addEventListener('change', syncIgnoreGroupVisibility);
});

// Run once on load to set correct initial state
syncIgnoreGroupVisibility();

savePrefsBtn.addEventListener('click', () => {
  savePreferences(getOptions());
  announce('Preferences saved.');
});

resetPrefsBtn.addEventListener('click', () => {
  resetPreferences();
  announce('Preferences reset to defaults.');
});

// ---------------------------------------------------------
//  Tokenizers
// ---------------------------------------------------------

/**
 * Numeric mode:
 *   Any character that is not a digit or a decimal point is
 *   treated as a separator. Consecutive separators collapse.
 *
 * @param {string} text
 * @returns {string[]}
 */
function tokenizeNumeric(text) {
  // Replace any run of non-numeric chars (not digit/decimal) with a single space
  return text
    .replace(/[^0-9.]+/g, '\x00')
    .split('\x00')
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && t !== '.');
}

/**
 * Non-numeric mode:
 *   Non-alphanumeric characters are separators, UNLESS they
 *   appear in the ignoreChars set — those are kept in the token.
 *
 * @param {string} text
 * @param {string} ignoreChars  Characters to treat as part of a token
 * @returns {string[]}
 */
function tokenizeNonNumeric(text, ignoreChars) {
  if (!text) return [];

  // Build a set of chars to ignore (keep in tokens)
  // Always ignore actual word chars (\w), then additionally keep ignoreChars
  const ignoredSet = new Set([...ignoreChars]);

  const tokens = [];
  let current = '';

  for (const ch of text) {
    const isWordChar = /\w/.test(ch);
    const isIgnored  = ignoredSet.has(ch);

    if (isWordChar || isIgnored) {
      current += ch;
    } else {
      // This character is a delimiter
      const trimmed = current.trim();
      if (trimmed.length > 0) {
        tokens.push(trimmed);
      }
      current = '';
    }
  }

  // Flush last token
  const trimmed = current.trim();
  if (trimmed.length > 0) {
    tokens.push(trimmed);
  }

  return tokens;
}

// ---------------------------------------------------------
//  Output Builder
// ---------------------------------------------------------

/**
 * @param {string[]} tokens
 * @param {string}   delimiter
 * @param {string}   quoteStyle  'none' | 'single' | 'double'
 * @returns {string}
 */
function buildOutput(tokens, delimiter, quoteStyle) {
  let q = '';
  if (quoteStyle === 'single') q = "'";
  if (quoteStyle === 'double') q = '"';

  return tokens.map((t) => `${q}${t}${q}`).join(delimiter);
}

// ---------------------------------------------------------
//  Read current options
// ---------------------------------------------------------
function getOptions() {
  const delimiterValue = delimiterInput.value;
  // If the field is empty, fallback to comma
  const delimiter = delimiterValue.length === 0 ? DEFAULT_PREFERENCES.delimiter : delimiterValue;

  const quoteStyle = document.querySelector('input[name="quoteStyle"]:checked').value;
  const inputMode  = getInputMode();
  const ignoreChars = ignoreCharsInput.value; // raw chars string

  return { delimiter, quoteStyle, inputMode, ignoreChars };
}

function loadSavedPreferences() {
  const stored = localStorage.getItem(PREFERENCES_KEY);
  if (!stored) return DEFAULT_PREFERENCES;

  try {
    const parsed = JSON.parse(stored);
    return {
      delimiter: typeof parsed.delimiter === 'string' && parsed.delimiter.length > 0
        ? parsed.delimiter
        : DEFAULT_PREFERENCES.delimiter,
      quoteStyle: ['none', 'single', 'double'].includes(parsed.quoteStyle)
        ? parsed.quoteStyle
        : DEFAULT_PREFERENCES.quoteStyle,
      inputMode: ['numeric', 'nonnumeric'].includes(parsed.inputMode)
        ? parsed.inputMode
        : DEFAULT_PREFERENCES.inputMode,
      ignoreChars: typeof parsed.ignoreChars === 'string'
        ? parsed.ignoreChars
        : DEFAULT_PREFERENCES.ignoreChars
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function applyPreferences(preferences) {
  delimiterInput.value = preferences.delimiter;
  ignoreCharsInput.value = preferences.ignoreChars;

  const quoteStyleRadio = document.querySelector(`input[name="quoteStyle"][value="${preferences.quoteStyle}"]`);
  const inputModeRadio = document.querySelector(`input[name="inputMode"][value="${preferences.inputMode}"]`);

  if (quoteStyleRadio) {
    quoteStyleRadio.checked = true;
  }

  if (inputModeRadio) {
    inputModeRadio.checked = true;
  }

  syncIgnoreGroupVisibility();
}

function savePreferences(preferences) {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
}

function resetPreferences() {
  localStorage.removeItem(PREFERENCES_KEY);
  applyPreferences(DEFAULT_PREFERENCES);
}

// ---------------------------------------------------------
//  Convert
// ---------------------------------------------------------
convertBtn.addEventListener('click', convert);

// Also allow Ctrl+Enter / Cmd+Enter in either textarea
[inputText, outputText].forEach((el) => {
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      convert();
    }
  });
});

function convert() {
  const raw = inputText.value;

  if (!raw.trim()) {
    outputText.value = '';
    setOutputEnabled(false);
    announce('No input text to convert.');
    return;
  }

  const { delimiter, quoteStyle, inputMode, ignoreChars } = getOptions();

  let tokens;
  if (inputMode === 'numeric') {
    tokens = tokenizeNumeric(raw);
  } else {
    tokens = tokenizeNonNumeric(raw, ignoreChars);
  }

  if (tokens.length === 0) {
    outputText.value = '';
    setOutputEnabled(false);
    announce('No valid tokens found in the input.');
    return;
  }

  const result = buildOutput(tokens, delimiter, quoteStyle);
  outputText.value = result;
  setOutputEnabled(true);
  announce(`Converted ${tokens.length} item${tokens.length !== 1 ? 's' : ''}.`);
}

// ---------------------------------------------------------
//  Enable / disable output action buttons
// ---------------------------------------------------------
function setOutputEnabled(enabled) {
  copyBtn.disabled   = !enabled;
  exportBtn.disabled = !enabled;
}

// ---------------------------------------------------------
//  Clear
// ---------------------------------------------------------
clearBtn.addEventListener('click', () => {
  inputText.value  = '';
  outputText.value = '';
  setOutputEnabled(false);
  inputText.focus();
  announce('Input cleared.');
});

// ---------------------------------------------------------
//  Import File
// ---------------------------------------------------------
importBtn.addEventListener('click', () => {
  fileInput.value = ''; // reset so the same file can be re-imported
  fileInput.click();
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    inputText.value = e.target.result;
    announce(`File "${file.name}" imported.`);
    inputText.focus();
  };
  reader.onerror = () => {
    announce('Error reading file. Please try again.');
  };
  reader.readAsText(file, 'UTF-8');
});

// ---------------------------------------------------------
//  Copy to Clipboard
// ---------------------------------------------------------
let copyResetTimer = null;

copyBtn.addEventListener('click', () => {
  const text = outputText.value;
  if (!text) return;

  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    navigator.clipboard.writeText(text).then(() => {
      onCopied();
    }).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
});

function fallbackCopy(text) {
  const tmp = document.createElement('textarea');
  tmp.value = text;
  tmp.style.position = 'fixed';
  tmp.style.opacity  = '0';
  tmp.style.pointerEvents = 'none';
  document.body.appendChild(tmp);
  tmp.focus();
  tmp.select();
  try {
    document.execCommand('copy');
    onCopied();
  } catch {
    announce('Copy failed. Please select the output text and copy manually.');
  } finally {
    document.body.removeChild(tmp);
  }
}

function onCopied() {
  // Briefly change the button to a "Copied!" state
  clearTimeout(copyResetTimer);
  const originalHTML = copyBtn.innerHTML;
  copyBtn.innerHTML = '<svg class="icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied!';
  copyBtn.classList.add('btn-copied');
  announce('Output copied to clipboard.');
  copyResetTimer = setTimeout(() => {
    copyBtn.innerHTML = originalHTML;
    copyBtn.classList.remove('btn-copied');
  }, 2000);
}

// ---------------------------------------------------------
//  Export to File
// ---------------------------------------------------------
exportBtn.addEventListener('click', () => {
  const text = outputText.value;
  if (!text) return;

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'delimited-output.txt';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);

  announce('File downloaded as delimited-output.txt');
});

// ---------------------------------------------------------
//  Accessible status announcements
// ---------------------------------------------------------
let announceTimer = null;

function announce(message) {
  clearTimeout(announceTimer);
  statusMsg.textContent = '';
  // Brief delay so screen readers re-announce on repeated messages
  announceTimer = setTimeout(() => {
    statusMsg.textContent = message;
  }, 50);
}
