// YapPilot v2.0.0 - Settings Script

// DOM Elements
const licenseKeyInput = document.getElementById('licenseKey');
const validateKeyBtn = document.getElementById('validateKeyBtn');
const keyStatus = document.getElementById('keyStatus');

// AI Provider
const aiProviderRadios = document.getElementsByName('aiProvider');
const groqKeySection = document.getElementById('groqKeySection');
const geminiKeySection = document.getElementById('geminiKeySection');
const openrouterKeySection = document.getElementById('openrouterKeySection');
const groqApiKeyInput = document.getElementById('groqApiKey');
const geminiApiKeyInput = document.getElementById('geminiApiKey');
const openrouterApiKeyInput = document.getElementById('openrouterApiKey');
const openrouterModelSelect = document.getElementById('openrouterModel');

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
    aiProvider: 'groq',
    groqApiKey: '',
    geminiApiKey: '',
    openrouterApiKey: '',
    openrouterModel: 'meta-llama/llama-4-maverick',
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
    await loadSettings();
    setupEventListeners();
    toggleProviderSections();
});

// Event Listeners
function setupEventListeners() {
    validateKeyBtn.addEventListener('click', validateLicenseKey);
    saveBtn.addEventListener('click', saveSettings);
    resetBtn.addEventListener('click', resetSettings);

    aiProviderRadios.forEach(radio => {
        radio.addEventListener('change', toggleProviderSections);
    });

    // API Key visibility toggles
    document.getElementById('toggleGroqKey')?.addEventListener('click', () => togglePasswordVisibility('groqApiKey', 'toggleGroqKey'));
    document.getElementById('toggleGeminiKey')?.addEventListener('click', () => togglePasswordVisibility('geminiApiKey', 'toggleGeminiKey'));
    document.getElementById('toggleOpenRouterKey')?.addEventListener('click', () => togglePasswordVisibility('openrouterApiKey', 'toggleOpenRouterKey'));
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

    groqKeySection.classList.add('hidden');
    geminiKeySection.classList.add('hidden');
    openrouterKeySection.classList.add('hidden');

    if (selectedProvider === 'groq') {
        groqKeySection.classList.remove('hidden');
    } else if (selectedProvider === 'gemini') {
        geminiKeySection.classList.remove('hidden');
    } else if (selectedProvider === 'openrouter') {
        openrouterKeySection.classList.remove('hidden');
    }
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
    const settings = await chrome.storage.local.get([
        'licenseKey', 'aiProvider', 'groqApiKey', 'geminiApiKey', 'openrouterApiKey',
        'openrouterModel', 'promptTemplate', 'enableLike', 'enableComment',
        'skipAlreadyCommented', 'windowMode', 'likeToCommentMin', 'likeToCommentMax',
        'delayMin', 'delayMax'
    ]);

    licenseKeyInput.value = settings.licenseKey || '';

    const aiProvider = settings.aiProvider || DEFAULT_SETTINGS.aiProvider;
    document.querySelector(`input[name="aiProvider"][value="${aiProvider}"]`).checked = true;

    groqApiKeyInput.value = settings.groqApiKey || '';
    geminiApiKeyInput.value = settings.geminiApiKey || '';
    openrouterApiKeyInput.value = settings.openrouterApiKey || '';
    openrouterModelSelect.value = settings.openrouterModel || DEFAULT_SETTINGS.openrouterModel;

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
        groqApiKey: groqApiKeyInput.value.trim(),
        geminiApiKey: geminiApiKeyInput.value.trim(),
        openrouterApiKey: openrouterApiKeyInput.value.trim(),
        openrouterModel: openrouterModelSelect.value,
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

    // Validate API key
    if (selectedProvider === 'groq' && !settings.groqApiKey) {
        showMessage('error', '❌ GROQ API key is required');
        return;
    } else if (selectedProvider === 'gemini' && !settings.geminiApiKey) {
        showMessage('error', '❌ Gemini API key is required');
        return;
    } else if (selectedProvider === 'openrouter' && !settings.openrouterApiKey) {
        showMessage('error', '❌ OpenRouter API key is required');
        return;
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
