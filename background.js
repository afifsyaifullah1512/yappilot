// Disable console logs to prevent memory leak
console.log = () => { };
console.error = () => { };
console.warn = () => { };

// ============================================================================
// YAPPILOT - BACKGROUND SERVICE WORKER
// Version: 1.3.1
// ============================================================================

// State Management
let automationState = {
    isRunning: false,
    urls: [],
    currentIndex: 0,
    workingTabId: null,
    workingWindowId: null,
    settings: null,
    delayTimeout: null,
    delayStartTime: null,
    totalDelayTime: 0,
    keepAliveInterval: null
};

// Keep-alive mechanism
function startKeepAlive() {
    if (automationState.keepAliveInterval) return;
    automationState.keepAliveInterval = setInterval(() => {
        if (automationState.isRunning) {
            console.log('[Keep-Alive] Service worker ping');
            chrome.runtime.getPlatformInfo(() => { });
        }
    }, 20000);
}

function stopKeepAlive() {
    if (automationState.keepAliveInterval) {
        clearInterval(automationState.keepAliveInterval);
        automationState.keepAliveInterval = null;
    }
}

// Message Handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'START_AUTOMATION') {
        startAutomation(message.urls);
    } else if (message.type === 'STOP_AUTOMATION') {
        stopAutomation();
    } else if (message.type === 'SWITCH_AI_PROVIDER') {
        switchAIProvider(message.provider, message.apiKey, message.model);
    }
});

// Start Automation
async function startAutomation(urls) {
    if (automationState.isRunning) {
        sendLog('error', 'Automation already running');
        return;
    }

    // Load settings
    const settings = await chrome.storage.local.get([
        'groqApiKey', 'geminiApiKey', 'openrouterApiKey', 'openrouterModel',
        'aiProvider', 'promptTemplate', 'enableLike', 'enableComment',
        'delayMin', 'delayMax', 'likeToCommentMin', 'likeToCommentMax',
        'windowMode', 'skipAlreadyCommented'
    ]);

    if (!settings.groqApiKey && !settings.geminiApiKey && !settings.openrouterApiKey) {
        sendLog('error', 'Please configure at least one AI provider in settings');
        return;
    }

    automationState.isRunning = true;
    automationState.urls = urls;
    automationState.currentIndex = 0;
    automationState.settings = {
        groqApiKey: settings.groqApiKey || '',
        geminiApiKey: settings.geminiApiKey || '',
        openrouterApiKey: settings.openrouterApiKey || '',
        openrouterModel: settings.openrouterModel || 'meta-llama/llama-4-maverick',
        aiProvider: settings.aiProvider || 'groq',
        promptTemplate: settings.promptTemplate || 'You are a helpful community member. Reply to this post in a friendly and supportive way. Keep it short and genuine.',
        enableLike: settings.enableLike !== false,
        enableComment: settings.enableComment !== false,
        delayMin: settings.delayMin || 10,
        delayMax: settings.delayMax || 20,
        likeToCommentMin: settings.likeToCommentMin || 5,
        likeToCommentMax: settings.likeToCommentMax || 15,
        windowMode: settings.windowMode || 'normal',
        skipAlreadyCommented: settings.skipAlreadyCommented || false
    };

    await chrome.storage.local.set({ isRunning: true });

    // Start keep-alive
    startKeepAlive();

    const aiModel = automationState.settings.aiProvider === 'openrouter'
        ? automationState.settings.openrouterModel
        : automationState.settings.aiProvider.toUpperCase();
    sendLog('success', `🚀 Starting automation with ${urls.length} posts using ${aiModel}`);
    sendStatus('Running');

    const firstUrl = urls[0];
    if (automationState.settings.windowMode === 'normal') {
        await createWorkingTab(firstUrl);
    } else {
        await createWorkingWindow(firstUrl);
    }

    await showStopButton();
    await showActivityLog();

    processNextUrl(true);
}

// Stop Automation
async function stopAutomation() {
    automationState.isRunning = false;

    if (automationState.delayTimeout) {
        clearTimeout(automationState.delayTimeout);
        automationState.delayTimeout = null;
    }

    stopKeepAlive();

    sendLog('info', 'Automation stopped');
    sendStatus('Stopped');

    await hideStopButton();
    await hideActivityLog();

    if (automationState.workingWindowId) {
        try {
            await chrome.windows.remove(automationState.workingWindowId);
            console.log('[Automation] Closed window');
        } catch (e) {
            console.log('[Automation] Window already closed');
        }
        automationState.workingWindowId = null;
    }

    automationState.workingTabId = null;
    await chrome.storage.local.set({ isRunning: false });
}

// Switch AI Provider
async function switchAIProvider(provider, apiKey, model) {
    if (!automationState.isRunning) return;

    automationState.settings.aiProvider = provider;

    if (provider === 'groq') {
        automationState.settings.groqApiKey = apiKey;
    } else if (provider === 'gemini') {
        automationState.settings.geminiApiKey = apiKey;
    } else if (provider === 'openrouter') {
        automationState.settings.openrouterApiKey = apiKey;
        automationState.settings.openrouterModel = model || 'meta-llama/llama-4-maverick';
    }

    await chrome.storage.local.set({
        aiProvider: provider,
        groqApiKey: automationState.settings.groqApiKey,
        geminiApiKey: automationState.settings.geminiApiKey,
        openrouterApiKey: automationState.settings.openrouterApiKey,
        openrouterModel: automationState.settings.openrouterModel
    });

    const modelName = provider === 'openrouter' ? model : provider.toUpperCase();
    sendLog('success', `✅ Switched to ${modelName}`);
}

// Remove processed URL
async function removeProcessedUrl(url) {
    try {
        const { savedUrls } = await chrome.storage.local.get(['savedUrls']);
        if (!savedUrls) return;

        const urlsArray = savedUrls.split('\n').map(u => u.trim()).filter(u => u);
        const updatedUrls = urlsArray.filter(u => u !== url);

        await chrome.storage.local.set({ savedUrls: updatedUrls.join('\n') });
        console.log(`[Remove URL] ${url}`);
    } catch (error) {
        console.error('[Remove URL] Error:', error);
    }
}

// Create Working Tab
async function createWorkingTab(initialUrl = 'https://x.com') {
    if (automationState.workingTabId) {
        try {
            await chrome.tabs.get(automationState.workingTabId);
            return;
        } catch (e) {
            // Tab doesn't exist
        }
    }

    const tab = await chrome.tabs.create({ url: initialUrl, active: true });
    automationState.workingTabId = tab.id;
    await waitForTabLoad(tab.id);
    await new Promise(resolve => setTimeout(resolve, 7000));
    console.log('[Automation] Created tab:', tab.id);
}

// Create Working Window
async function createWorkingWindow(initialUrl = 'https://x.com') {
    if (automationState.workingTabId) {
        try {
            await chrome.tabs.get(automationState.workingTabId);
            return;
        } catch (e) {
            // Tab doesn't exist
        }
    }

    const windowMode = automationState.settings.windowMode;

    const windowConfig = windowMode === 'always-on-top'
        ? {
            url: initialUrl,
            type: 'popup',
            focused: true,
            width: 800,
            height: 600,
            top: 100,
            left: 100
        }
        : {
            url: initialUrl,
            type: 'normal',
            focused: true,
            state: 'maximized'
        };

    const window = await chrome.windows.create(windowConfig);

    automationState.workingTabId = window.tabs[0].id;
    automationState.workingWindowId = window.id;

    await waitForTabLoad(automationState.workingTabId);
    await new Promise(resolve => setTimeout(resolve, 7000));
    console.log('[Automation] Window ready:', window.id);
}

// Process Next URL
async function processNextUrl(skipNavigation = false) {
    if (!automationState.isRunning) return;

    if (automationState.currentIndex >= automationState.urls.length) {
        sendLog('success', `✅ SELESAI! Completed all ${automationState.urls.length} posts!`);
        sendLog('info', '🎉 Automation finished successfully');
        sendStatus('Complete');
        sendProgress(automationState.urls.length, automationState.urls.length);
        automationState.isRunning = false;

        stopKeepAlive();

        await hideStopButton();
        await hideActivityLog();

        if (automationState.workingWindowId) {
            try {
                await chrome.windows.remove(automationState.workingWindowId);
                console.log('[Automation] Window closed after completion');
            } catch (e) {
                console.log('[Automation] Window already closed');
            }
            automationState.workingWindowId = null;
        }

        automationState.workingTabId = null;
        await chrome.storage.local.set({ isRunning: false });
        return;
    }

    const currentUrl = automationState.urls[automationState.currentIndex];
    const postNumber = automationState.currentIndex + 1;

    sendLog('info', `[${postNumber}/${automationState.urls.length}] Processing: ${currentUrl}`);
    sendProgress(automationState.currentIndex, automationState.urls.length);

    // Check if we need to refresh tab (for skipped posts that didn't go through main flow)
    if (!skipNavigation && automationState.currentIndex > 0 && automationState.currentIndex % 5 === 0 && automationState.currentIndex < automationState.urls.length) {
        // Force log to appear (bypass disabled console.log)
        const originalLog = console.log;
        console.log = Function.prototype.call.bind(console.info);
        console.log(`[REFRESH TRIGGER AT START] currentIndex: ${automationState.currentIndex}`);
        console.log = originalLog;

        sendLog('info', `[Memory] Refreshing tab after ${automationState.currentIndex} posts...`);

        // Aggressive memory cleanup before closing tab
        try {
            await chrome.scripting.executeScript({
                target: { tabId: automationState.workingTabId },
                func: () => {
                    // Clear all timers and intervals
                    const highestId = setTimeout(() => { }, 0);
                    for (let i = 0; i < highestId; i++) {
                        clearTimeout(i);
                        clearInterval(i);
                    }
                    // Force garbage collection
                    if (window.gc) window.gc();
                }
            });
        } catch (e) {
            console.log('[Memory] Cleanup script failed:', e);
        }

        await chrome.tabs.remove(automationState.workingTabId);
        await sleep(1000);
        // Load currentUrl directly
        const newTab = await chrome.tabs.create({ windowId: automationState.workingWindowId, url: currentUrl, active: true });
        automationState.workingTabId = newTab.id;
        await waitForTabLoad(automationState.workingTabId);
        await sleep(2000);
        sendLog('success', `[Memory] Tab refreshed, loading post...`);

        // Skip navigation since we already loaded the URL
        skipNavigation = true;
    }


    // Declare result variables at function scope to prevent undefined errors
    let likeResult = { success: false };
    let replyResult = { success: false };

    try {
        // Navigate using location.replace to prevent history accumulation
        if (!skipNavigation) {
            if (!automationState.isRunning) return;

            // Aggressive memory cleanup before navigation
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: automationState.workingTabId },
                    func: () => {
                        // Clear all timers and intervals
                        const highestId = setTimeout(() => { }, 0);
                        for (let i = 0; i < highestId; i++) {
                            clearTimeout(i);
                            clearInterval(i);
                        }
                        // Remove event listeners by cloning nodes
                        const oldBody = document.body;
                        const newBody = oldBody.cloneNode(false);
                        while (oldBody.firstChild) {
                            newBody.appendChild(oldBody.firstChild);
                        }
                        // Force garbage collection
                        if (window.gc) window.gc();
                    }
                });
            } catch (e) {
                console.log('[Memory] Pre-navigation cleanup failed:', e);
            }

            // Use location.replace instead of chrome.tabs.update
            await chrome.scripting.executeScript({
                target: { tabId: automationState.workingTabId },
                func: (url) => { location.replace(url); },
                args: [currentUrl]
            });

            await waitForTabLoad(automationState.workingTabId);
            await showStopButton();
            await showActivityLog();
        }

        if (!automationState.isRunning) return;
        // Increased wait time from 5s to 8s for better content loading
        await sleep(8000);

        // CHECK CONTENT FIRST - Fail fast if post deleted/unavailable
        sendLog('info', `[${postNumber}/${automationState.urls.length}] Checking post...`);
        const contentResult = await executeContentScript(automationState.workingTabId, 'GET_POST_CONTENT');

        if (!automationState.isRunning) return;
        if (!contentResult.success) {
            const errorMsg = 'Post not found or deleted';
            sendLog('error', `[${postNumber}/${automationState.urls.length}] ${errorMsg}`);
            sendFailedPost(currentUrl, errorMsg);
            throw new Error(errorMsg);
        }

        // Check if already commented (if enabled) - NOW WORKING with ZIP function
        if (automationState.settings.skipAlreadyCommented) {
            sendLog('info', `[${postNumber}/${automationState.urls.length}] Checking if already commented...`);
            const checkResult = await executeContentScript(automationState.workingTabId, 'CHECK_ALREADY_REPLIED');

            if (checkResult.success && checkResult.alreadyReplied) {
                sendLog('info', `[${postNumber}/${automationState.urls.length}] ⏭️ Already commented, skipping...`);
                automationState.currentIndex++;
                await removeProcessedUrl(currentUrl);
                sendProgress(automationState.currentIndex, automationState.urls.length);

                // Refresh will be handled by main flow after increment
                processNextUrl();
                return;
            }
        }


        // Like
        if (automationState.settings.enableLike) {
            if (!automationState.isRunning) return;
            sendLog('info', `[${postNumber}/${automationState.urls.length}] Liking post...`);
            likeResult = await executeContentScript(automationState.workingTabId, 'LIKE_POST');

            if (!automationState.isRunning) return;
            if (likeResult.success) {
                sendLog('success', `[${postNumber}/${automationState.urls.length}] ✓ Liked`);
            } else {
                sendLog('error', `[${postNumber}/${automationState.urls.length}] Failed to like: ${likeResult.error}`);
            }

            // Delay before comment
            if (automationState.settings.enableComment) {
                if (!automationState.isRunning) return;
                const delay = randomDelay(automationState.settings.likeToCommentMin, automationState.settings.likeToCommentMax);
                sendLog('info', `[${postNumber}/${automationState.urls.length}] Waiting ${delay}s before commenting...`);
                await sleep(delay * 1000);
            }
        }

        // Comment
        if (automationState.settings.enableComment) {
            if (!automationState.isRunning) return;

            // Focus window before commenting (auto-focus mode only)
            if (automationState.settings.windowMode === 'auto-focus' && automationState.workingWindowId) {
                try {
                    await chrome.windows.update(automationState.workingWindowId, { focused: true });
                    console.log('[Automation] Focused window for commenting');
                    await sleep(2000);
                } catch (e) {
                    console.log('[Automation] Failed to focus window:', e);
                }
            }

            sendLog('info', `[${postNumber}/${automationState.urls.length}] Generating AI reply...`);
            const reply = await generateReply(contentResult.content);

            if (!automationState.isRunning) return;
            if (!reply || reply.trim().length < 10) {
                const errorMsg = reply ? 'AI reply too short (minimum 10 characters)' : 'Failed to generate reply';
                sendLog('error', `[${postNumber}/${automationState.urls.length}] ${errorMsg}`);
                sendFailedPost(currentUrl, errorMsg);
                throw new Error(errorMsg);
            }

            sendLog('info', `[${postNumber}/${automationState.urls.length}] Reply: "${reply.substring(0, 50)}..."`);

            if (!automationState.isRunning) return;
            sendLog('info', `[${postNumber}/${automationState.urls.length}] Posting reply...`);
            replyResult = await executeContentScript(automationState.workingTabId, 'POST_REPLY', { reply });

            if (!automationState.isRunning) return;
            if (replyResult.success) {
                sendLog('success', `[${postNumber}/${automationState.urls.length}] ✓ Reply posted`);

                // Unfocus window after comment (auto-focus mode only)
                if (automationState.settings.windowMode === 'auto-focus' && automationState.workingWindowId) {
                    try {
                        const allWindows = await chrome.windows.getAll();
                        const otherWindow = allWindows.find(w => w.id !== automationState.workingWindowId && w.type === 'normal');
                        if (otherWindow) {
                            await chrome.windows.update(otherWindow.id, { focused: true });
                            console.log('[Automation] Unfocused automation window');
                        }
                    } catch (e) {
                        console.log('[Automation] Failed to unfocus window:', e);
                    }
                }
            } else {
                const errorMsg = `Failed to post reply: ${replyResult.error}`;
                sendLog('error', `[${postNumber}/${automationState.urls.length}] ${errorMsg}`);
                sendFailedPost(currentUrl, errorMsg);
            }
        }

        // Track successful post - use ACTUAL results not settings
        // Extract author from URL (e.g., https://x.com/username/status/...)
        const authorMatch = currentUrl.match(/x\.com\/([^\/]+)\//);
        const author = authorMatch ? authorMatch[1] : 'Unknown';
        let actualLiked = false;
        let actualCommented = false;

        // Check if like was actually successful
        if (automationState.settings.enableLike && typeof likeResult !== 'undefined' && likeResult.success) {
            actualLiked = true;
        }

        // Check if comment was actually successful
        if (automationState.settings.enableComment && typeof replyResult !== 'undefined' && replyResult.success) {
            actualCommented = true;
        }

        // DEBUG: Log values

        // Only save if at least one action was successful
        if (actualLiked || actualCommented) {
            sendSuccessPost(currentUrl, author, actualLiked, actualCommented);
            sendLog('success', `[${postNumber}/${automationState.urls.length}] ✅ Saved to Success List`);
        } else {
        }

        // Next post
        automationState.currentIndex++;
        await removeProcessedUrl(currentUrl);
        sendProgress(automationState.currentIndex, automationState.urls.length);

        // Refresh tab every 5 posts to clear SPA memory (check AFTER increment)
        if (automationState.currentIndex > 0 && automationState.currentIndex % 5 === 0 && automationState.currentIndex < automationState.urls.length) {
            // Force log to appear (bypass disabled console.log)
            const originalLog = console.log;
            console.log = Function.prototype.call.bind(console.info);
            console.log(`[REFRESH TRIGGER] currentIndex: ${automationState.currentIndex}`);
            console.log = originalLog;

            sendLog('info', `[Memory] Refreshing tab after ${automationState.currentIndex} posts...`);

            // Aggressive memory cleanup before closing tab
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: automationState.workingTabId },
                    func: () => {
                        // Clear all timers and intervals
                        const highestId = setTimeout(() => { }, 0);
                        for (let i = 0; i < highestId; i++) {
                            clearTimeout(i);
                            clearInterval(i);
                        }
                        // Force garbage collection
                        if (window.gc) window.gc();
                    }
                });
            } catch (e) {
                console.log('[Memory] Cleanup script failed:', e);
            }

            await chrome.tabs.remove(automationState.workingTabId);
            await sleep(1000);
            // Get next URL to load
            const nextUrl = automationState.urls[automationState.currentIndex];
            const newTab = await chrome.tabs.create({ windowId: automationState.workingWindowId, url: nextUrl, active: true });
            automationState.workingTabId = newTab.id;
            await waitForTabLoad(automationState.workingTabId);
            await sleep(2000);
            sendLog('success', `[Memory] Tab refreshed, loading next post...`);
        }

        if (automationState.currentIndex < automationState.urls.length) {
            if (!automationState.isRunning) return;
            const delay = randomDelay(automationState.settings.delayMin, automationState.settings.delayMax);
            sendLog('info', `Waiting ${delay} seconds before next post...`);

            automationState.delayTimeout = setTimeout(() => {
                automationState.delayTimeout = null;
                processNextUrl();
            }, delay * 1000);
        } else {
            processNextUrl();
        }

    } catch (error) {
        sendLog('error', `[${postNumber}/${automationState.urls.length}] Error: ${error.message}`);
        automationState.currentIndex++;
        await removeProcessedUrl(currentUrl);

        // Check if we need to refresh tab after error (same as success flow)
        if (automationState.currentIndex > 0 && automationState.currentIndex % 5 === 0 && automationState.currentIndex < automationState.urls.length) {
            // Force log to appear
            const originalLog = console.log;
            console.log = Function.prototype.call.bind(console.info);
            console.log(`[REFRESH TRIGGER AFTER ERROR] currentIndex: ${automationState.currentIndex}`);
            console.log = originalLog;

            sendLog('info', `[Memory] Refreshing tab after ${automationState.currentIndex} posts (including errors)...`);

            // Aggressive memory cleanup
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: automationState.workingTabId },
                    func: () => {
                        const highestId = setTimeout(() => { }, 0);
                        for (let i = 0; i < highestId; i++) {
                            clearTimeout(i);
                            clearInterval(i);
                        }
                        if (window.gc) window.gc();
                    }
                });
            } catch (e) {
                console.log('[Memory] Cleanup script failed:', e);
            }

            await chrome.tabs.remove(automationState.workingTabId);
            await sleep(1000);
            const nextUrl = automationState.urls[automationState.currentIndex];
            const newTab = await chrome.tabs.create({ windowId: automationState.workingWindowId, url: nextUrl, active: true });
            automationState.workingTabId = newTab.id;
            await waitForTabLoad(automationState.workingTabId);
            await sleep(2000);
            sendLog('success', `[Memory] Tab refreshed after error, loading next post...`);
        }

        // IMMEDIATELY process next URL on error (NO DELAY)
        if (automationState.currentIndex < automationState.urls.length) {
            sendLog('info', '⏭️ Skipping to next post...');
            processNextUrl();
        } else {
            processNextUrl();
        }
    }
}

// Execute Content Script
async function executeContentScript(tabId, action, data = {}) {
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId },
            func: contentScriptHandler,
            args: [action, data]
        });
        return results[0].result;
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function contentScriptHandler(action, data) {
    if (action === 'LIKE_POST') return window.xAutoEngage_likePost();
    else if (action === 'GET_POST_CONTENT') return window.xAutoEngage_getPostContent();
    else if (action === 'POST_REPLY') return window.xAutoEngage_postReply(data.reply);
    else if (action === 'CHECK_ALREADY_REPLIED') return window.xAutoEngage_checkAlreadyReplied();
    return { success: false, error: 'Unknown action' };
}

// Show/Hide Widgets
async function showStopButton() {
    if (automationState.workingTabId) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: automationState.workingTabId },
                func: () => { if (window.xAutoEngage_showStopButton) window.xAutoEngage_showStopButton(); }
            });
        } catch (error) {
            console.error('Failed to show stop button:', error);
        }
    }
}

async function hideStopButton() {
    if (automationState.workingTabId) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: automationState.workingTabId },
                func: () => { if (window.xAutoEngage_hideStopButton) window.xAutoEngage_hideStopButton(); }
            });
        } catch (error) {
            // Tab closed - expected
        }
    }
}

async function showActivityLog() {
    if (automationState.workingTabId) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: automationState.workingTabId },
                func: () => { if (window.xAutoEngage_showActivityLog) window.xAutoEngage_showActivityLog(); }
            });
        } catch (error) {
            console.error('Failed to show activity log:', error);
        }
    }
}

async function hideActivityLog() {
    if (automationState.workingTabId) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: automationState.workingTabId },
                func: () => { if (window.xAutoEngage_hideActivityLog) window.xAutoEngage_hideActivityLog(); }
            });
        } catch (error) {
            // Tab closed - expected
        }
    }
}

async function sendLogToPage(type, message) {
    if (automationState.workingTabId) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: automationState.workingTabId },
                func: (logType, logMessage) => {
                    if (window.xAutoEngage_addLog) window.xAutoEngage_addLog(logType, logMessage);
                },
                args: [type, message]
            });
        } catch (error) {
            // Tab closed - expected
        }
    }
}

// Logging & Progress
function sendLog(type, message) {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);

    chrome.runtime.sendMessage({
        type: 'LOG_UPDATE',
        log: { type, message, timestamp }
    }).catch(() => { });

    sendLogToPage(type, message);
}

function sendStatus(status) {
    chrome.runtime.sendMessage({
        type: 'STATUS_UPDATE',
        status
    }).catch(() => { });
}

function sendProgress(current, total) {
    chrome.runtime.sendMessage({
        type: 'PROGRESS_UPDATE',
        current,
        total
    }).catch(() => { });
}

function sendFailedPost(url, reason) {
    chrome.runtime.sendMessage({
        type: 'FAILED_POST',
        url,
        reason
    }).catch(() => { });
}

// Send Success Post
function sendSuccessPost(url, author, liked, commented) {
    chrome.storage.local.get(['successPosts'], (result) => {
        const successPosts = result.successPosts || [];
        successPosts.push({
            url,
            author,
            liked,
            commented,
            timestamp: new Date().toLocaleString()
        });
        chrome.storage.local.set({ successPosts });
        console.log('[Success Post] Added:', url);
    });
}

// AI Generation
async function generateReply(postContent) {
    const provider = automationState.settings.aiProvider;
    const prompt = automationState.settings.promptTemplate;

    try {
        if (provider === 'groq') {
            return await generateWithGroq(postContent, prompt);
        } else if (provider === 'gemini') {
            return await generateWithGemini(postContent, prompt);
        } else if (provider === 'openrouter') {
            return await generateWithOpenRouter(postContent, prompt);
        }
    } catch (error) {
        console.error('[AI Generation] Error:', error);
        return null;
    }
}

async function generateWithGroq(postContent, prompt) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${automationState.settings.groqApiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: postContent }
            ],
            temperature: 0.7,
            max_tokens: 280
        })
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
}

async function generateWithGemini(postContent, prompt) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${automationState.settings.geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: `${prompt}\n\nPost: ${postContent}` }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 280
            }
        })
    });

    const data = await response.json();
    return data.candidates[0].content.parts[0].text.trim();
}

async function generateWithOpenRouter(postContent, prompt) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${automationState.settings.openrouterApiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: automationState.settings.openrouterModel,
            messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: postContent }
            ],
            temperature: 0.7,
            max_tokens: 280
        })
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
}

// Utility Functions
function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForTabLoad(tabId) {
    return new Promise((resolve) => {
        chrome.tabs.onUpdated.addListener(function listener(updatedTabId, info) {
            if (updatedTabId === tabId && info.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(listener);
                resolve();
            }
        });
    });
}
