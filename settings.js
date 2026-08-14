// YapPilot v2.0.0 - Settings Script

// DOM Elements
const licenseKeyInput = document.getElementById('licenseKey');
const validateKeyBtn = document.getElementById('validateKeyBtn');
const keyStatus = document.getElementById('keyStatus');

// AI Provider
const aiProviderRadios = document.getElementsByName('aiProvider');

const PROVIDERS = ['openai', 'claude', 'grok', 'deepseek', 'gemini', 'custom'];

const keyInputs = {
    openai: document.getElementById('openaiApiKey'),
    claude: document.getElementById('claudeApiKey'),
    grok: document.getElementById('grokApiKey'),
    deepseek: document.getElementById('deepseekApiKey'),
    gemini: document.getElementById('geminiApiKey'),
    custom: document.getElementById('customApiKey')
};
const modelInputs = {
    openai: document.getElementById('openaiModel'),
    claude: document.getElementById('claudeModel'),
    grok: document.getElementById('grokModel'),
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
    deepseek: ['deepseek-chat', 'deepseek-reasoner'],
    gemini: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash-lite', 'gemini-2.0-flash']
};

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
    deepseekApiKey: '',
    geminiApiKey: '',
    openaiModel: 'gpt-5.1',
    claudeModel: 'claude-sonnet-4-5',
    grokModel: 'grok-4.1',
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

    aiProviderRadios.forEach(radio => {
        radio.addEventListener('change', toggleProviderSections);
    });

    // API Key visibility toggles
    document.getElementById('toggleOpenaiKey')?.addEventListener('click', () => togglePasswordVisibility('openaiApiKey', 'toggleOpenaiKey'));
    document.getElementById('toggleClaudeKey')?.addEventListener('click', () => togglePasswordVisibility('claudeApiKey', 'toggleClaudeKey'));
    document.getElementById('toggleGrokKey')?.addEventListener('click', () => togglePasswordVisibility('grokApiKey', 'toggleGrokKey'));
    document.getElementById('toggleDeepseekKey')?.addEventListener('click', () => togglePasswordVisibility('deepseekApiKey', 'toggleDeepseekKey'));
    document.getElementById('toggleGeminiKey')?.addEventListener('click', () => togglePasswordVisibility('geminiApiKey', 'toggleGeminiKey'));
    document.getElementById('toggleCustomKey')?.addEventListener('click', () => togglePasswordVisibility('customApiKey', 'toggleCustomKey'));
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
}

// Validate License Key
async function validateLicenseKey() {
    const key = licenseKeyInput.value.trim();

    if (!key) {
        showKeyStatus('Please enter a license key', 'error');
        return;
    }

    validateKeyBtn.disabled = true;
    validateKeyBtn.textContent = 'Validating...';

    try {
        const deviceId = chrome.runtime.id;

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
async function saveSettings() {
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

    // Validate selected provider config
    const PROVIDER_NAMES = {
        openai: 'OpenAI', claude: 'Claude', grok: 'Grok',
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
function showMessage(type, message) {
    saveMessage.textContent = message;
    saveMessage.className = `save-message ${type}`;
}
