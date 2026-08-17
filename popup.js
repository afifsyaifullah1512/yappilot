// DOM Elements
const urlsTextarea = document.getElementById('urls');
const saveUrlsBtn = document.getElementById('saveUrlsBtn');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const settingsBtn = document.getElementById('settingsBtn');
const progressSection = document.getElementById('progressSection');
const progressText = document.getElementById('progressText');
const statusText = document.getElementById('statusText');
const progressFill = document.getElementById('progressFill');
const logContainer = document.getElementById('logContainer');
const clearLogBtn = document.getElementById('clearLogBtn');

// State
let isRunning = false;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadState();
  await loadLogs();
  await loadSavedUrls();
  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  // Side Panel button
  const openSidePanelBtn = document.getElementById('openSidePanelBtn');
  if (openSidePanelBtn) {
    openSidePanelBtn.addEventListener('click', () => {
      chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
    });
  }

  // Helper function to detect if running in side panel
  function isInSidePanel() {
    // Side panel URLs start with chrome-extension:// and are opened via sidePanel API
    // We can detect by checking if window.location includes 'sidepanel' or by width
    // More reliable: check if opened via chrome.sidePanel (width > 400 is typical)
    return window.innerWidth >= 400;
  }


  // Failed button - navigate in side panel, open new tab in popup
  document.getElementById('viewFailedBtn').addEventListener('click', () => {
    if (isInSidePanel()) {
      // Side panel - navigate in place
      window.location.href = 'failed.html';
    } else {
      // Popup - open new tab
      chrome.tabs.create({ url: 'failed.html' });
    }
  });



  // Success button - navigate in side panel, open new tab in popup
  const viewSuccessBtn = document.getElementById('viewSuccessBtn');
  if (viewSuccessBtn) {
    viewSuccessBtn.addEventListener('click', () => {
      if (isInSidePanel()) {
        // Side panel - navigate in place
        window.location.href = 'success.html';
      } else {
        // Popup - open new tab
        chrome.tabs.create({ url: 'success.html' });
      }
    });
  }

  saveUrlsBtn.addEventListener('click', handleSaveUrls);
  startBtn.addEventListener('click', handleStart);
  stopBtn.addEventListener('click', handleStop);


  // AI Switcher
  const switchAIBtn = document.getElementById('switchAIBtn');
  if (switchAIBtn) {
    switchAIBtn.addEventListener('click', async () => {
      const provider = document.getElementById('aiProviderSwitch').value;
      const settings = await chrome.storage.local.get([
        'openaiApiKey', 'claudeApiKey', 'grokApiKey', 'groqApiKey', 'deepseekApiKey', 'geminiApiKey',
        'openaiModel', 'claudeModel', 'grokModel', 'groqModel', 'deepseekModel', 'geminiModel',
        'customEndpointUrl', 'customModel'
      ]);

      let apiKey = '';
      let model = '';

      if (provider === 'openai') { apiKey = settings.openaiApiKey; model = settings.openaiModel; }
      else if (provider === 'claude') { apiKey = settings.claudeApiKey; model = settings.claudeModel; }
      else if (provider === 'grok') { apiKey = settings.grokApiKey; model = settings.grokModel; }
      else if (provider === 'groq') { apiKey = settings.groqApiKey; model = settings.groqModel; }
      else if (provider === 'deepseek') { apiKey = settings.deepseekApiKey; model = settings.deepseekModel; }
      else if (provider === 'gemini') { apiKey = settings.geminiApiKey; model = settings.geminiModel; }
      else if (provider === 'custom') { apiKey = settings.customEndpointUrl; model = settings.customModel; }

      chrome.runtime.sendMessage({ type: 'SWITCH_AI_PROVIDER', provider, apiKey, model });
      addLog({ type: 'success', message: `Switching to ${provider.toUpperCase()}...` });

      // Update current model display
      await updateCurrentModelDisplay();
    });
  }

  settingsBtn.addEventListener('click', openSettings);

  clearLogBtn.addEventListener('click', clearLogs);

  // Listen for updates from background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'PROGRESS_UPDATE') {
      updateProgress({ current: message.current, total: message.total });
    } else if (message.type === 'LOG_UPDATE') {
      addLog(message.log);
    } else if (message.type === 'STATUS_UPDATE') {
      updateStatus(message.status);
    } else if (message.type === 'FAILED_POST') {
      // Save failed post to storage
      chrome.storage.local.get(['failedPosts'], (result) => {
        const failedPosts = result.failedPosts || [];
        failedPosts.push({
          url: message.url,
          reason: message.reason,
          timestamp: new Date().toLocaleString()
        });
        chrome.storage.local.set({ failedPosts });
        console.log('[Failed Post] Added:', message.url);
      });
    }
  });

  // Listen for storage changes to sync button states
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
      if (changes.isRunning) {
        syncButtonStates();
      }
    }
  });
}

// Sync button states from storage
async function syncButtonStates() {
  const { isRunning, isPaused } = await chrome.storage.local.get(['isRunning', 'isPaused']);

  if (isRunning) {
    startBtn.disabled = true;
    stopBtn.disabled = false;
    urlsTextarea.disabled = true;
    progressSection.classList.remove('hidden');
  } else {
    startBtn.disabled = false;
    stopBtn.disabled = true;
    urlsTextarea.disabled = false;
    progressSection.classList.add('hidden');
  }
}

// Save URLs - Extract clean URLs and update textarea
async function handleSaveUrls() {
  const rawText = urlsTextarea.value.trim();

  if (!rawText) {
    return;
  }

  // Extract clean URLs
  const urlRegex = /https?:\/\/(?:x\.com|twitter\.com)\/[a-zA-Z0-9_]+\/status\/\d+/gi;
  const extractedUrls = rawText.match(urlRegex) || [];

  // Remove duplicates
  const cleanUrls = [...new Set(extractedUrls)];

  if (cleanUrls.length === 0) {
    return;
  }

  // Update textarea with clean URLs
  const cleanText = cleanUrls.join('\n');
  urlsTextarea.value = cleanText;

  // Save to storage
  await chrome.storage.local.set({ savedUrls: cleanText });

  // Show feedback
  saveUrlsBtn.classList.add('saved');
  setTimeout(() => {
    saveUrlsBtn.classList.remove('saved');
  }, 2000);
}

// Handle Start
async function handleStart() {
  const rawText = urlsTextarea.value.trim();

  if (!rawText) {
    addLog({ type: 'error', message: 'Please enter at least one URL' });
    return;
  }

  // Extract all URLs from text
  const urlRegex = /https?:\/\/(?:x\.com|twitter\.com)\/[a-zA-Z0-9_]+\/status\/\d+/gi;
  const extractedUrls = rawText.match(urlRegex) || [];

  // Remove duplicates
  const urls = [...new Set(extractedUrls)];

  if (urls.length === 0) {
    addLog({ type: 'error', message: 'No valid X/Twitter URLs found' });
    return;
  }

  // Show extracted URLs count
  if (extractedUrls.length > urls.length) {
    addLog({
      type: 'info',
      message: `Removed ${extractedUrls.length - urls.length} duplicate URLs`
    });
  }

  // VALIDATE LICENSE (auto-refresh token when expired - no more "validate again" loops)
  const licenseOk = await ensureLicenseValid();
  if (!licenseOk) return;

  // Check if settings configured
  const settings = await chrome.storage.local.get(['aiProvider', 'openaiApiKey', 'claudeApiKey', 'grokApiKey', 'groqApiKey', 'deepseekApiKey', 'geminiApiKey', 'customEndpointUrl']);
  const aiProvider = settings.aiProvider || 'gemini';

  let apiKeyMissing = false;
  let providerName = '';

  if (aiProvider === 'openai' && !settings.openaiApiKey) {
    apiKeyMissing = true;
    providerName = 'OpenAI';
  } else if (aiProvider === 'claude' && !settings.claudeApiKey) {
    apiKeyMissing = true;
    providerName = 'Claude';
  } else if (aiProvider === 'grok' && !settings.grokApiKey) {
    apiKeyMissing = true;
    providerName = 'Grok';
  } else if (aiProvider === 'groq' && !settings.groqApiKey) {
    apiKeyMissing = true;
    providerName = 'Groq';
  } else if (aiProvider === 'deepseek' && !settings.deepseekApiKey) {
    apiKeyMissing = true;
    providerName = 'DeepSeek';
  } else if (aiProvider === 'gemini' && !settings.geminiApiKey) {
    apiKeyMissing = true;
    providerName = 'Gemini';
  } else if (aiProvider === 'custom' && !settings.customEndpointUrl) {
    apiKeyMissing = true;
    providerName = 'Custom Endpoint';
  }

  if (apiKeyMissing) {
    addLog({ type: 'error', message: `Active provider is ${providerName} but its API key is empty. Configure it in Settings (AI Engine tab).` });
    openSettings();
    return;
  }

  // Start automation
  isRunning = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  urlsTextarea.disabled = true;
  progressSection.classList.remove('hidden');

  // Enable pause button, disable resume, show AI switcher
  const pauseBtn = document.getElementById('pauseBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  const aiSwitcher = document.getElementById('aiSwitcher');
  console.log('[Popup] pauseBtn:', pauseBtn, 'disabled:', pauseBtn?.disabled);
  if (pauseBtn) pauseBtn.disabled = false;
  if (resumeBtn) resumeBtn.disabled = true;
  if (aiSwitcher) aiSwitcher.classList.remove('hidden');
  console.log('[Popup] After enable - pauseBtn.disabled:', pauseBtn?.disabled);

  // Update current model display
  await updateCurrentModelDisplay();

  addLog({ type: 'info', message: `Starting automation for ${urls.length} posts` });

  // Send to background
  try {
    chrome.runtime.sendMessage({
      type: 'START_AUTOMATION',
      urls: urls
    });
  } catch (error) {
    console.log('Message send failed (popup closed):', error);
  }

  // Save state
  await chrome.storage.local.set({ isRunning: true, currentUrls: urls });
}

// Handle Stop
async function handleStop() {
  isRunning = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;
  urlsTextarea.disabled = false;

  // Hide pause/resume buttons and AI switcher
  const pauseBtn = document.getElementById('pauseBtn');
  const resumeBtn = document.getElementById('resumeBtn');
  const aiSwitcher = document.getElementById('aiSwitcher');
  if (pauseBtn) pauseBtn.disabled = true;
  if (resumeBtn) resumeBtn.disabled = true;
  if (aiSwitcher) aiSwitcher.classList.add('hidden');

  addLog({ type: 'info', message: 'Stopping automation...' });

  // Send to background
  try {
    chrome.runtime.sendMessage({ type: 'STOP_AUTOMATION' });
  } catch (error) {
    console.log('Stop message failed (popup closed):', error);
  }

  // Save state
  await chrome.storage.local.set({ isRunning: false });
}

// Update Progress
function updateProgress(data) {
  const { current, total } = data;
  progressText.textContent = `Processing ${current}/${total}`;

  const percentage = total > 0 ? (current / total) * 100 : 0;
  progressFill.style.width = `${percentage}%`;

  if (current === total && total > 0) {
    statusText.textContent = 'Complete';
    statusText.className = 'status-complete';
    startBtn.disabled = false;
    stopBtn.disabled = true;
    urlsTextarea.disabled = false;
    isRunning = false;
  }
}

// Update Status
function updateStatus(status) {
  statusText.textContent = status;

  if (status.toLowerCase().includes('running') || status.toLowerCase().includes('processing')) {
    statusText.className = 'status-running';
  } else if (status.toLowerCase().includes('stopped')) {
    statusText.className = 'status-stopped';
  } else if (status.toLowerCase().includes('complete')) {
    statusText.className = 'status-complete';
  } else {
    statusText.className = 'status-idle';
  }
}

// Add Log Entry
async function addLog(data) {
  const { type, message } = data;
  const timestamp = new Date().toLocaleTimeString();

  // Remove empty state
  const emptyState = logContainer.querySelector('.log-empty');
  if (emptyState) {
    emptyState.remove();
  }

  // Create log entry
  const logEntry = document.createElement('div');
  logEntry.className = 'log-entry';
  logEntry.innerHTML = `
    <span class="log-time">${timestamp}</span>
    <span class="log-message log-${type}">${message}</span>
  `;

  logContainer.insertBefore(logEntry, logContainer.firstChild);

  // Limit to 50 entries
  while (logContainer.children.length > 50) {
    logContainer.removeChild(logContainer.lastChild);
  }

  // Save to storage
  await saveLogs();
}

// Clear Logs
async function clearLogs() {
  logContainer.innerHTML = '<div class="log-empty">No activity yet. Add URLs and click Start!</div>';
  await chrome.storage.local.set({ logs: [] });
}

// Save Logs
async function saveLogs() {
  const logs = [];
  const entries = logContainer.querySelectorAll('.log-entry');
  entries.forEach(entry => {
    const time = entry.querySelector('.log-time').textContent;
    const message = entry.querySelector('.log-message').textContent;
    const type = Array.from(entry.querySelector('.log-message').classList)
      .find(c => c.startsWith('log-'))
      ?.replace('log-', '') || 'info';
    logs.push({ time, message, type });
  });
  await chrome.storage.local.set({ logs });
}

// Load Logs
async function loadLogs() {
  const { logs } = await chrome.storage.local.get(['logs']);
  if (logs && logs.length > 0) {
    logContainer.innerHTML = '';
    logs.forEach(log => {
      const logEntry = document.createElement('div');
      logEntry.className = 'log-entry';
      logEntry.innerHTML = `
        <span class="log-time">${log.time}</span>
        <span class="log-message log-${log.type}">${log.message}</span>
      `;
      logContainer.appendChild(logEntry);
    });
  }
}

// Load State
async function loadState() {
  const state = await chrome.storage.local.get(['isRunning', 'isPaused', 'currentUrls', 'progress']);

  if (state.isRunning) {
    isRunning = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    urlsTextarea.disabled = true;
    progressSection.classList.remove('hidden');
    statusText.textContent = 'Running';
    statusText.className = 'status-running';

    // Sync pause/resume buttons
    const pauseBtn = document.getElementById('pauseBtn');
    const resumeBtn = document.getElementById('resumeBtn');
    if (pauseBtn && resumeBtn) {
      if (state.isPaused) {
        pauseBtn.disabled = true;
        resumeBtn.disabled = false;
      } else {
        pauseBtn.disabled = false;
        resumeBtn.disabled = true;
      }
    }

    // Show AI switcher when automation is running
    const aiSwitcher = document.getElementById('aiSwitcher');
    if (aiSwitcher) aiSwitcher.classList.remove('hidden');

    // Update current model display
    await updateCurrentModelDisplay();

    if (state.progress) {
      updateProgress(state.progress);
    }
  }
}

// Load Saved URLs
async function loadSavedUrls() {
  const { savedUrls } = await chrome.storage.local.get(['savedUrls']);
  if (savedUrls) {
    urlsTextarea.value = savedUrls;
  }
}

// Open Settings
function openSettings() {
  chrome.runtime.openOptionsPage();
}

// Update Current Model Display
async function updateCurrentModelDisplay() {
  const settings = await chrome.storage.local.get(['aiProvider', 'openaiModel', 'claudeModel', 'grokModel', 'groqModel', 'deepseekModel', 'geminiModel', 'customModel']);
  const aiProvider = settings.aiProvider || 'gemini';
  const currentModelDisplay = document.getElementById('currentModelDisplay');

  // Set dropdown to match current provider
  const dropdown = document.getElementById('aiProviderSwitch');
  if (dropdown) {
    dropdown.value = aiProvider;
  }

  if (currentModelDisplay) {
    const displayByProvider = {
      openai: settings.openaiModel || 'OpenAI',
      claude: settings.claudeModel || 'Claude',
      grok: settings.grokModel || 'Grok',
      groq: settings.groqModel || 'Groq',
      deepseek: settings.deepseekModel || 'DeepSeek',
      gemini: settings.geminiModel || 'Gemini',
      custom: `Custom: ${settings.customModel || 'endpoint'}`
    };
    const displayText = displayByProvider[aiProvider] || aiProvider;
    currentModelDisplay.textContent = displayText;
  }
}

// ---------------------------------------------------------------------------
// License validation with automatic token refresh
// ---------------------------------------------------------------------------
async function getDeviceId() {
  const stored = await chrome.storage.local.get('deviceId');
  if (stored.deviceId) return stored.deviceId;
  const id = (crypto.randomUUID ? crypto.randomUUID() : 'dev-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10));
  await chrome.storage.local.set({ deviceId: id });
  return id;
}

async function ensureLicenseValid() {
  const { licenseToken, licenseKey } = await chrome.storage.local.get(['licenseToken', 'licenseKey']);

  // Nothing stored at all
  if (!licenseToken && !licenseKey) {
    addLog({ type: 'error', message: 'License belum ada!' });
    alert('License key belum divalidasi!\n\nSilakan validasi license key di Settings terlebih dahulu.');
    openSettings();
    return false;
  }

  // 1) Try the stored token first
  if (licenseToken) {
    addLog({ type: 'info', message: 'Validating license with server...' });
    try {
      const res = await fetch('https://auto-yap-api.vercel.app/api/validate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: licenseToken })
      });
      const result = await res.json();
      if (result.valid) {
        addLog({ type: 'success', message: 'License valid!' });
        return true;
      }
      addLog({ type: 'info', message: 'Token expired - refreshing automatically...' });
    } catch (error) {
      addLog({ type: 'error', message: 'Validation failed: ' + error.message });
      alert('Gagal validasi license!\n\nError: ' + error.message + '\n\nPastikan koneksi internet aktif.');
      return false;
    }
  }

  // 2) Token missing/expired -> auto re-exchange using the stored license key
  if (licenseKey) {
    addLog({ type: 'info', message: 'Refreshing license token...' });
    try {
      const deviceId = await getDeviceId();
      const res = await fetch('https://auto-yap-api.vercel.app/api/exchange-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: licenseKey, device_id: deviceId })
      });
      const result = await res.json();
      if (result.success) {
        await chrome.storage.local.set({
          licenseToken: result.token,
          tokenExpiry: Date.now() + result.expires_in * 1000
        });
        addLog({ type: 'success', message: 'License refreshed automatically!' });
        return true;
      }
      addLog({ type: 'error', message: 'License refresh failed: ' + (result.error || 'Unknown') });
      alert('License gagal diperbarui otomatis!\n\nError: ' + (result.error || 'Unknown') + '\n\nSilakan cek di Settings.');
      openSettings();
      return false;
    } catch (error) {
      addLog({ type: 'error', message: 'Refresh failed: ' + error.message });
      alert('Gagal refresh license!\n\nError: ' + error.message + '\n\nPastikan koneksi internet aktif.');
      return false;
    }
  }

  // Token expired and no stored key to refresh from
  addLog({ type: 'error', message: 'License token expired!' });
  alert('License token expired!\n\nSilakan validasi ulang di Settings.');
  openSettings();
  return false;
}
