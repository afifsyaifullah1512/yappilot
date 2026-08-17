// YapPilot v2.0.0 - Settings Script

// DOM Elements
const licenseKeyInput = document.getElementById('licenseKey');
const validateKeyBtn = document.getElementById('validateKeyBtn');
const keyStatus = document.getElementById('keyStatus');

// AI Provider
const aiProviderRadios = document.getElementsByName('aiProvider');

const PROVIDERS = ['openai', 'claude', 'grok', 'groq', 'deepseek', 'gemini', 'custom'];

const keyInputs = {
    openai: document.getElementById('openaiApiKey'),
    claude: document.getElementById('claudeApiKey'),
    grok: document.getElementById('grokApiKey'),
    groq: document.getElementById('groqApiKey'),
    deepseek: document.getElementById('deepseekApiKey'),
    gemini: document.getElementById('geminiApiKey'),
    custom: document.getElementById('customApiKey')
};
const modelInputs = {
    openai: document.getElementById('openaiModel'),
    claude: document.getElementById('claudeModel'),
    grok: document.getElementById('grokModel'),
    groq: document.getElementById('groqModel'),
    deepseek: document.getElementById('deepseekModel'),
    gemini: document.getElementById('geminiModel')
};
const sections = {};
PROVIDERS.forEach(p => { sections[p] = document.getElementById(p + 'KeySection'); });

const customEndpointUrlInput = document.getElementById('customEndpointUrl');
const customModelInput = document.getElementById('customModel');

// Model suggestions (datalist) — shortcuts only; free-text allowed
const MODEL_SUGGESTIONS = {
    openai: ['gpt-5.1', 'gpt-5.1-mini', 'gpt-5.1-nano', 'gpt-5', 'gpt-5-mini', 'gpt-4o', 'gpt-4o-mini'],
    claude: ['claude-sonnet-4-5', 'claude-opus-4-5', 'claude-haiku-4-5', 'claude-opus-4-1', 'claude-sonnet-4'],
    grok: ['grok-4.1', 'grok-4', 'grok-3-mini', 'grok-3'],
    groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'meta-llama/llama-4-scout-17b-16e-instruct', 'gemma2-9b-it'],
    deepseek: ['deepseek-chat', 'deepseek-reasoner'],
    gemini: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash-lite', 'gemini-2.0-flash']
};

// ---------------------------------------------------------------------------
// Auto-fetch latest model per provider (calls provider API with the user's key)
// ---------------------------------------------------------------------------
const MODEL_ENDPOINTS = {
    openai: {
        url: 'https://api.openai.com/v1/models',
        auth: (key) => ({ 'Authorization': 'Bearer ' + key }),
        parse: (d) => (d.data || []).map(m => m.id),
        prefer: ['gpt-5.1', 'gpt-5', 'gpt-4.1', 'gpt-4o', 'gpt-4']
    },
    claude: {
        url: 'https://api.anthropic.com/v1/models',
        auth: (key) => ({ 'x-api-key': key, 'anthropic-version': '2023-06-01' }),
        parse: (d) => (d.data || []).map(m => m.id),
        prefer: ['claude-opus-4', 'claude-sonnet-4', 'claude-haiku-4', 'claude-3-7', 'claude-3-5']
    },
    grok: {
        url: 'https://api.x.ai/v1/models',
        auth: (key) => ({ 'Authorization': 'Bearer ' + key }),
        parse: (d) => (d.data || []).map(m => m.id),
        prefer: ['grok-4', 'grok-3', 'grok-2']
    },
    groq: {
        url: 'https://api.groq.com/openai/v1/models',
        auth: (key) => ({ 'Authorization': 'Bearer ' + key }),
        parse: (d) => (d.data || []).map(m => m.id),
        prefer: ['llama-3.3', 'llama-4-scout', 'llama-3.1-8b-instant', 'mixtral', 'gemma2', 'qwen']
    },
    deepseek: {
        url: 'https://api.deepseek.com/models',
        auth: (key) => ({ 'Authorization': 'Bearer ' + key }),
        parse: (d) => (d.data || []).map(m => m.id),
        prefer: ['deepseek-chat', 'deepseek-reasoner', 'deepseek-coder']
    },
    gemini: {
        url: (key) => 'https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(key),
        auth: () => ({}),
        parse: (d) => (d.models || []).map(m => (m.name || '').replace(/^models\//, '')),
        prefer: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5']
    }
};

const MODEL_NOISE = /deprecated|internal|embed|tts|whisper|dall|audio|image|realtime|babbage|davinci|search-grounding|learning/i;

async function fetchLatestModel(provider) {
    const keyInput = keyInputs[provider];
    const key = keyInput ? keyInput.value.trim() : '';
    if (!key) {
        showMessage('error', 'Enter the ' + provider + ' API key first, then click again');
        setTimeout(() => saveMessage.classList.add('hidden'), 3500);
        return;
    }

    const cfg = MODEL_ENDPOINTS[provider];
    const btn = document.getElementById('auto' + provider.charAt(0).toUpperCase() + provider.slice(1) + 'Model');
    if (btn) { btn.disabled = true; btn.textContent = 'Fetching...'; }

    try {
        const url = typeof cfg.url === 'function' ? cfg.url(key) : cfg.url;
        const res = await fetch(url, { headers: cfg.auth(key) });
        if (!res.ok) throw new Error('API returned ' + res.status);
        const data = await res.json();

        const models = cfg.parse(data).filter(m => m && !MODEL_NOISE.test(m));
        if (!models.length) throw new Error('no models returned');

        let picked = null;
        for (const prefix of cfg.prefer) {
            picked = models.find(m => m.toLowerCase().startsWith(prefix.toLowerCase()));
            if (picked) break;
        }
        if (!picked) picked = models[0];

        modelInputs[provider].value = picked;
        showMessage('success', 'Model set to: ' + picked);
    } catch (err) {
        showMessage('error', 'Fetch latest model failed: ' + err.message);
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Get latest model'; }
        setTimeout(() => saveMessage.classList.add('hidden'), 3500);
    }
}

// Settings
const promptTemplateInput = document.getElementById('promptTemplate');
const enableLikeCheckbox = document.getElementById('enableLike');
const enableCommentCheckbox = document.getElementById('enableComment');
const skipAlreadyCommentedCheckbox = document.getElementById('skipAlreadyCommented');
const windowModeSelect = document.getElementById('windowMode');
const likeToCommentMinInput = document.getElementById('likeToCommentMin');
const likeToCommentMaxInput = document.getElementById('likeToCommentMax');
const delayMinInput = document.getElementById('delayMin');
const delayMaxInput = document.getElementById('delayMax');

// Buttons
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const saveMessage = document.getElementById('saveMessage');

// Default Settings
const DEFAULT_SETTINGS = {
    aiProvider: 'gemini',
    openaiApiKey: '',
    claudeApiKey: '',
    grokApiKey: '',
    groqApiKey: '',
    deepseekApiKey: '',
    geminiApiKey: '',
    openaiModel: 'gpt-5.1',
    claudeModel: 'claude-sonnet-4-5',
    grokModel: 'grok-4.1',
    groqModel: 'llama-3.3-70b-versatile',
    deepseekModel: 'deepseek-chat',
    geminiModel: 'gemini-2.5-flash',
    customEndpointUrl: '',
    customApiKey: '',
    customModel: '',
    promptTemplate: 'You are a helpful community member. Reply to this post in a friendly and supportive way. Keep it short and genuine.',
    enableLike: true,
    enableComment: true,
    skipAlreadyCommented: true,
    windowMode: 'normal',
    likeToCommentMin: 5,
    likeToCommentMax: 15,
    delayMin: 3,
    delayMax: 200
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    fillDatalists();
    await loadSettings();
    setupEventListeners();
    toggleProviderSections();
});

// Fill datalist suggestions
function fillDatalists() {
    Object.entries(MODEL_SUGGESTIONS).forEach(([p, models]) => {
        const dl = document.getElementById(p + 'Models');
        if (!dl) return;
        dl.innerHTML = models.map(m => `<option value="${m}"></option>`).join('');
    });
}

// Event Listeners
function setupEventListeners() {
    validateKeyBtn.addEventListener('click', validateLicenseKey);
    saveBtn.addEventListener('click', saveSettings);
    resetBtn.addEventListener('click', resetSettings);

    // Provider selection is persisted IMMEDIATELY on click (no need to press Save)
    aiProviderRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            toggleProviderSections();
            chrome.storage.local.set({ aiProvider: radio.value }, () => {
                showMessage('success', '✓ Provider set to ' + radio.value.toUpperCase() + ' — saved');
                setTimeout(() => saveMessage.classList.add('hidden'), 2500);
            });
        });
    });

    // Auto-fetch latest model buttons
    ['openai', 'claude', 'grok', 'groq', 'deepseek', 'gemini'].forEach(p => {
        const btn = document.getElementById('auto' + p.charAt(0).toUpperCase() + p.slice(1) + 'Model');
        if (btn) btn.addEventListener('click', () => fetchLatestModel(p));
    });

    // API Key visibility toggles
    document.getElementById('toggleOpenaiKey')?.addEventListener('click', () => togglePasswordVisibility('openaiApiKey', 'toggleOpenaiKey'));
    document.getElementById('toggleClaudeKey')?.addEventListener('click', () => togglePasswordVisibility('claudeApiKey', 'toggleClaudeKey'));
    document.getElementById('toggleGrokKey')?.addEventListener('click', () => togglePasswordVisibility('grokApiKey', 'toggleGrokKey'));
    document.getElementById('toggleGroqKey')?.addEventListener('click', () => togglePasswordVisibility('groqApiKey', 'toggleGroqKey'));
    document.getElementById('toggleDeepseekKey')?.addEventListener('click', () => togglePasswordVisibility('deepseekApiKey', 'toggleDeepseekKey'));
    document.getElementById('toggleGeminiKey')?.addEventListener('click', () => togglePasswordVisibility('geminiApiKey', 'toggleGeminiKey'));
    document.getElementById('toggleCustomKey')?.addEventListener('click', () => togglePasswordVisibility('customApiKey', 'toggleCustomKey'));

    // API keys & models are auto-persisted as soon as the user leaves the field,
    // so nothing is lost even if Save is never clicked (or Save fails validation).
    // Every auto-save shows a toast so the user KNOWS it landed.
    PROVIDERS.forEach(p => {
        if (keyInputs[p]) {
            keyInputs[p].addEventListener('change', () => {
                const patch = {};
                patch[p + 'ApiKey'] = keyInputs[p].value.trim();
                chrome.storage.local.set(patch, () => {
                    showMessage('success', '\u2713 ' + p.toUpperCase() + ' API key saved');
                    setTimeout(() => saveMessage.classList.add('hidden'), 2500);
                });
            });
        }
        if (modelInputs[p]) {
            modelInputs[p].addEventListener('change', () => {
                const patch = {};
                patch[p + 'Model'] = modelInputs[p].value.trim();
                chrome.storage.local.set(patch, () => {
                    showMessage('success', '\u2713 ' + p.toUpperCase() + ' model saved');
                    setTimeout(() => saveMessage.classList.add('hidden'), 2500);
                });
            });
        }
    });

    // License key input also auto-persists on blur (validate still needed to activate)
    licenseKeyInput.addEventListener('change', () => {
        const val = licenseKeyInput.value.trim();
        if (val) {
            chrome.storage.local.set({ licenseKey: val }, () => {
                showMessage('success', '\u2713 License key saved \u2014 click Validate to activate');
                setTimeout(() => saveMessage.classList.add('hidden'), 3000);
            });
        }
    });
}

// Toggle Password Visibility
function togglePasswordVisibility(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);

    if (input.type === 'password') {
        input.type = 'text';
        button.classList.add('revealed');
    } else {
        input.type = 'password';
        button.classList.remove('revealed');
    }
}

// Toggle Provider Sections
function toggleProviderSections() {
    const selectedProvider = document.querySelector('input[name="aiProvider"]:checked').value;

    PROVIDERS.forEach(p => {
        if (sections[p]) sections[p].classList.add('hidden');
    });

    if (sections[selectedProvider]) sections[selectedProvider].classList.remove('hidden');

    // Auto-fill model with latest if empty and key already entered
    if (selectedProvider !== 'custom' && modelInputs[selectedProvider]
        && !modelInputs[selectedProvider].value.trim()
        && keyInputs[selectedProvider] && keyInputs[selectedProvider].value.trim()) {
        fetchLatestModel(selectedProvider);
    }
}

// Validate License Key
// Real device ID: unique per installation, persisted across sessions.
// (chrome.runtime.id is the SAME for every install — useless as a device lock)
async function getDeviceId() {
    const stored = await chrome.storage.local.get('deviceId');
    if (stored.deviceId) return stored.deviceId;

    const id = (crypto.randomUUID ? crypto.randomUUID() : 'dev-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10));
    await chrome.storage.local.set({ deviceId: id });
    return id;
}

async function validateLicenseKey() {
    const key = licenseKeyInput.value.trim();

    if (!key) {
        showKeyStatus('Please enter a license key', 'error');
        return;
    }

    validateKeyBtn.disabled = true;
    validateKeyBtn.textContent = 'Validating...';

    try {
        const deviceId = await getDeviceId();

        const response = await fetch('https://auto-yap-api.vercel.app/api/exchange-key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: key, device_id: deviceId })
        });

        const result = await response.json();

        if (result.success) {
            showKeyStatus('✓ License key is valid!', 'success');

            await chrome.storage.local.set({
                licenseKey: key,
                licenseToken: result.token,
                tokenExpiry: Date.now() + result.expires_in * 1000
            });
        } else {
            showKeyStatus(`✗ Invalid license key: ${result.error || 'Unknown error'}`, 'error');
        }
    } catch (error) {
        showKeyStatus(`✗ Validation failed: ${error.message}`, 'error');
    } finally {
        validateKeyBtn.disabled = false;
        validateKeyBtn.innerHTML = '<span class="btn-icon"><svg viewBox="0 0 24 24"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z"/></svg></span> Validate';
    }
}

function showKeyStatus(message, type) {
    keyStatus.textContent = message;
    keyStatus.className = `status-message ${type}`;
}

// Load Settings
async function loadSettings() {
    const keys = ['licenseKey', 'aiProvider', 'promptTemplate', 'enableLike', 'enableComment',
        'skipAlreadyCommented', 'windowMode', 'likeToCommentMin', 'likeToCommentMax',
        'delayMin', 'delayMax', 'customEndpointUrl', 'customApiKey', 'customModel'];
    PROVIDERS.forEach(p => {
        if (p !== 'custom') {
            keys.push(p + 'ApiKey');
            keys.push(p + 'Model');
        }
    });
    const settings = await chrome.storage.local.get(keys);

    licenseKeyInput.value = settings.licenseKey || '';

    // Show license status if a token is already stored
    const lic = await chrome.storage.local.get(['licenseToken', 'tokenExpiry']);
    if (lic.licenseToken && settings.licenseKey) {
        const expired = lic.tokenExpiry && Date.now() > lic.tokenExpiry;
        showKeyStatus(expired
            ? '\u2713 License active \u2014 token will auto-refresh on next run'
            : '\u2713 License active', 'success');
    }

    const aiProvider = settings.aiProvider || DEFAULT_SETTINGS.aiProvider;
    const radio = document.querySelector(`input[name="aiProvider"][value="${aiProvider}"]`);
    if (radio) radio.checked = true;

    PROVIDERS.forEach(p => {
        if (keyInputs[p]) keyInputs[p].value = settings[p + 'ApiKey'] || '';
        if (modelInputs[p]) modelInputs[p].value = settings[p + 'Model'] || DEFAULT_SETTINGS[p + 'Model'] || '';
    });
    customEndpointUrlInput.value = settings.customEndpointUrl || '';
    customModelInput.value = settings.customModel || '';

    promptTemplateInput.value = settings.promptTemplate || DEFAULT_SETTINGS.promptTemplate;
    enableLikeCheckbox.checked = settings.enableLike !== undefined ? settings.enableLike : DEFAULT_SETTINGS.enableLike;
    enableCommentCheckbox.checked = settings.enableComment !== undefined ? settings.enableComment : DEFAULT_SETTINGS.enableComment;
    skipAlreadyCommentedCheckbox.checked = settings.skipAlreadyCommented !== undefined ? settings.skipAlreadyCommented : DEFAULT_SETTINGS.skipAlreadyCommented;
    windowModeSelect.value = settings.windowMode || DEFAULT_SETTINGS.windowMode;
    likeToCommentMinInput.value = settings.likeToCommentMin || DEFAULT_SETTINGS.likeToCommentMin;
    likeToCommentMaxInput.value = settings.likeToCommentMax || DEFAULT_SETTINGS.likeToCommentMax;
    delayMinInput.value = settings.delayMin || DEFAULT_SETTINGS.delayMin;
    delayMaxInput.value = settings.delayMax || DEFAULT_SETTINGS.delayMax;
}

// Save Settings (with auto-validate)
const SAVE_BTN_HTML = '<svg viewBox="0 0 24 24"><path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4Zm-5 16a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm3-10H7V5h8v4Z"/></svg> Save Settings';
async function saveSettings() {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    try {
        await doSaveSettings();
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = SAVE_BTN_HTML;
    }
}

async function doSaveSettings() {
    const selectedProvider = document.querySelector('input[name="aiProvider"]:checked').value;

    const settings = {
        aiProvider: selectedProvider,
        customEndpointUrl: customEndpointUrlInput.value.trim(),
        customApiKey: customApiKeyInput.value.trim(),
        customModel: customModelInput.value.trim(),
        promptTemplate: promptTemplateInput.value.trim(),
        enableLike: enableLikeCheckbox.checked,
        enableComment: enableCommentCheckbox.checked,
        skipAlreadyCommented: skipAlreadyCommentedCheckbox.checked,
        windowMode: windowModeSelect.value,
        likeToCommentMin: parseInt(likeToCommentMinInput.value),
        likeToCommentMax: parseInt(likeToCommentMaxInput.value),
        delayMin: parseInt(delayMinInput.value),
        delayMax: parseInt(delayMaxInput.value)
    };

    PROVIDERS.forEach(p => {
        if (p !== 'custom' && keyInputs[p]) {
            settings[p + 'ApiKey'] = keyInputs[p].value.trim();
            if (modelInputs[p]) settings[p + 'Model'] = modelInputs[p].value.trim();
        }
    });

    // Always persist the license key so the popup can auto-refresh its token later
    const licenseVal = licenseKeyInput.value.trim();
    if (licenseVal) settings.licenseKey = licenseVal;

    // Validate selected provider config
    const PROVIDER_NAMES = {
        openai: 'OpenAI', claude: 'Claude', grok: 'Grok', groq: 'Groq',
        deepseek: 'DeepSeek', gemini: 'Gemini', custom: 'Custom Endpoint'
    };

    if (selectedProvider !== 'custom' && !settings[selectedProvider + 'ApiKey']) {
        showMessage('error', `❌ ${PROVIDER_NAMES[selectedProvider]} API key is required`);
        return;
    }
    if (selectedProvider !== 'custom' && !settings[selectedProvider + 'Model']) {
        showMessage('error', `❌ Model name for ${PROVIDER_NAMES[selectedProvider]} is required`);
        return;
    }
    if (selectedProvider === 'custom') {
        if (!settings.customEndpointUrl) {
            showMessage('error', '❌ Custom endpoint URL is required');
            return;
        }
        try {
            new URL(settings.customEndpointUrl);
        } catch {
            showMessage('error', '❌ Endpoint URL is not a valid URL (must start with http:// or https://)');
            return;
        }
        if (!settings.customModel) {
            showMessage('error', '❌ Custom model name is required');
            return;
        }
    }

    try {
        await chrome.storage.local.set(settings);

        // Auto-validate license if present
        const licenseKey = licenseKeyInput.value.trim();
        if (licenseKey) {
            const { licenseToken } = await chrome.storage.local.get(['licenseToken']);

            if (!licenseToken) {
                showMessage('success', '⏳ Settings saved! Validating license...');
                await new Promise(resolve => setTimeout(resolve, 500));
                await validateLicenseKey();
                return;
            }
        }

        showMessage('success', '✅ Settings saved successfully!');
        setTimeout(() => saveMessage.classList.add('hidden'), 3000);
    } catch (error) {
        showMessage('error', `❌ Failed to save: ${error.message}`);
    }
}

// Reset Settings
async function resetSettings() {
    if (!confirm('Reset all settings to default? This will not affect your license key.')) {
        return;
    }

    const currentLicense = await chrome.storage.local.get(['licenseKey', 'licenseToken', 'tokenExpiry']);

    await chrome.storage.local.set({ ...DEFAULT_SETTINGS, ...currentLicense });
    await loadSettings();
    toggleProviderSections();
    showMessage('success', '✅ Settings reset to default!');
    setTimeout(() => saveMessage.classList.add('hidden'), 3000);
}

// Show Message
let _hideTimer = null;
function showMessage(type, message) {
    if (_hideTimer) clearTimeout(_hideTimer);
    saveMessage.textContent = message;
    saveMessage.className = `save-message ${type}`;
    saveMessage.style.display = 'block';
    saveMessage.style.opacity = '1';
    _hideTimer = setTimeout(() => {
        saveMessage.style.opacity = '0';
        setTimeout(() => {
            saveMessage.style.display = 'none';
            saveMessage.className = 'save-message hidden';
        }, 400);
    }, 3000);
}
