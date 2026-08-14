// Disable console logs to prevent memory leak
console.log = () => { };
console.error = () => { };
console.warn = () => { };

// YapPilot - Content Script
// This script runs on x.com/twitter.com pages

// Initialize
(function () {
    'use strict';

    // Floating Stop Button
    let stopButton = null;

    // Create Floating Stop Button
    window.xAutoEngage_showStopButton = function () {
        // Remove existing button if any
        if (stopButton) {
            stopButton.remove();
        }

        // Create button container
        stopButton = document.createElement('div');
        stopButton.id = 'xAutoEngage-stopButton';
        stopButton.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 999999;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            padding: 16px 32px;
            border-radius: 50px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 8px 24px rgba(239, 68, 68, 0.5);
            display: flex;
            align-items: center;
            gap: 12px;
            transition: all 0.3s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            user-select: none;
        `;

        // Create button content
        const icon = document.createElement('span');
        icon.style.fontSize = '24px';
        icon.textContent = '⏹';

        const text = document.createElement('span');
        text.textContent = 'STOP AUTOMATION';

        stopButton.appendChild(icon);
        stopButton.appendChild(text);

        // Add hover effects with proper event listeners
        stopButton.addEventListener('mouseenter', () => {
            stopButton.style.transform = 'scale(1.05) translateY(-2px)';
            stopButton.style.boxShadow = '0 12px 32px rgba(239, 68, 68, 0.6)';
        });

        stopButton.addEventListener('mouseleave', () => {
            stopButton.style.transform = 'scale(1) translateY(0)';
            stopButton.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.5)';
        });

        // Add click handler
        stopButton.addEventListener('click', () => {
            console.log('[YapPilot] Stop button clicked');
            chrome.runtime.sendMessage({ type: 'STOP_AUTOMATION' });

            // Hide activity log
            if (window.xAutoEngage_hideActivityLog) {
                window.xAutoEngage_hideActivityLog();
            }

            // Remove stop button
            stopButton.remove();
            stopButton = null;
        });

        document.body.appendChild(stopButton);
        console.log('[YapPilot] Stop button shown');
    };

    // Hide Stop Button
    window.xAutoEngage_hideStopButton = function () {
        if (stopButton) {
            stopButton.remove();
            stopButton = null;
            console.log('[YapPilot] Stop button hidden');
        }
    };

    // Floating Activity Log
    let activityLog = null;

    // Show Activity Log
    window.xAutoEngage_showActivityLog = function () {
        if (activityLog) return; // Already shown

        activityLog = document.createElement('div');
        activityLog.id = 'xAutoEngage-activityLog';
        activityLog.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 30px;
            width: 350px;
            max-height: 400px;
            z-index: 999998;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(20px);
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 12px 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;

        const headerTitle = document.createElement('span');
        headerTitle.style.cssText = 'color: white; font-weight: 600; font-size: 14px;';
        headerTitle.textContent = '📋 Activity Log';

        const clearBtn = document.createElement('button');
        clearBtn.id = 'xAutoEngage-clearLog';
        clearBtn.style.cssText = `
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.6);
            cursor: pointer;
            font-size: 12px;
            padding: 4px 8px;
        `;
        clearBtn.textContent = 'Clear';

        header.appendChild(headerTitle);
        header.appendChild(clearBtn);

        // Log container
        const logContainer = document.createElement('div');
        logContainer.id = 'xAutoEngage-logContainer';
        logContainer.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 12px;
            max-height: 350px;
        `;
        logContainer.innerHTML = '<div style="color: rgba(255,255,255,0.5); text-align: center; padding: 20px; font-size: 12px;">No activity yet</div>';

        activityLog.appendChild(header);
        activityLog.appendChild(logContainer);
        document.body.appendChild(activityLog);

        // Clear button handler
        clearBtn.addEventListener('click', () => {
            logContainer.innerHTML = '<div style="color: rgba(255,255,255,0.5); text-align: center; padding: 20px; font-size: 12px;">No activity yet</div>';
        });

        console.log('[YapPilot] Activity log shown');
    };

    // Hide Activity Log
    window.xAutoEngage_hideActivityLog = function () {
        if (activityLog) {
            activityLog.remove();
            activityLog = null;
            console.log('[YapPilot] Activity log hidden');
        }
    };

    // Add Log Entry
    window.xAutoEngage_addLog = function (type, message) {
        if (!activityLog) return;

        const logContainer = document.getElementById('xAutoEngage-logContainer');
        if (!logContainer) return;

        // Remove empty state
        if (logContainer.querySelector('div[style*="No activity"]')) {
            logContainer.innerHTML = '';
        }

        const timestamp = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.style.cssText = `
            padding: 8px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            font-size: 12px;
        `;

        let color = '#60a5fa'; // info
        let icon = 'ℹ️';
        if (type === 'success') {
            color = '#10b981';
            icon = '✓';
        } else if (type === 'error') {
            color = '#ef4444';
            icon = '✗';
        }

        const entryContent = document.createElement('div');
        entryContent.style.cssText = 'display: flex; gap: 8px; align-items: start;';

        const iconSpan = document.createElement('span');
        iconSpan.style.cssText = `color: ${color}; font-size: 14px;`;
        iconSpan.textContent = icon;

        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = 'flex: 1;';

        const timeDiv = document.createElement('div');
        timeDiv.style.cssText = 'color: rgba(255,255,255,0.5); font-size: 10px; margin-bottom: 2px;';
        timeDiv.textContent = timestamp;

        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `color: ${color}; line-height: 1.4;`;
        messageDiv.textContent = message;

        contentDiv.appendChild(timeDiv);
        contentDiv.appendChild(messageDiv);
        entryContent.appendChild(iconSpan);
        entryContent.appendChild(contentDiv);
        entry.appendChild(entryContent);

        logContainer.insertBefore(entry, logContainer.firstChild);

        // Limit to 20 entries
        while (logContainer.children.length > 20) {
            logContainer.removeChild(logContainer.lastChild);
        }

        // Auto scroll to top
        logContainer.scrollTop = 0;
    };

    // Like Post Function
    window.xAutoEngage_likePost = async function () {
        try {
            console.log('[YapPilot] Starting like process...');

            // Wait for page to fully load with content verification
            await sleep(2000);

            // Verify content is loaded
            let retries = 0;
            let contentLoaded = false;
            while (retries < 5 && !contentLoaded) {
                const article = document.querySelector('article[data-testid="tweet"]');
                if (article && article.textContent.trim().length > 50) {
                    contentLoaded = true;
                } else {
                    console.log('[YapPilot] Waiting for content to load...');
                    await sleep(1000);
                    retries++;
                }
            }

            if (!contentLoaded) {
                console.error('[YapPilot] Content failed to load after retries');
                return { success: false, error: 'Content not loaded' };
            }

            // First, find the main post article (not timeline posts)
            const mainArticle = document.querySelector('article[data-testid="tweet"]') ||
                document.querySelector('article[tabindex="-1"]') ||
                document.querySelector('main article');

            if (!mainArticle) {
                console.error('[YapPilot] Main article not found');
                return { success: false, error: 'Main post article not found' };
            }

            console.log('[YapPilot] Found main article');

            // Find like button within the main article
            const likeSelectors = [
                'button[data-testid="like"]',
                'button[data-testid="unlike"]', // Already liked
                '[data-testid="like"]',
                '[data-testid="unlike"]',
                'button[aria-label*="Suka"]', // Indonesian
                'button[aria-label*="Like"]', // English
                'button[aria-label*="like"]',
            ];

            let likeButton = null;
            let foundSelector = '';

            // Try each selector within main article
            for (const selector of likeSelectors) {
                const element = mainArticle.querySelector(selector);
                console.log(`[YapPilot] Trying selector in main article: ${selector}, found: ${element ? 'YES' : 'NO'}`);

                if (element) {
                    likeButton = element;
                    foundSelector = selector;
                    console.log(`[YapPilot] Found like button with: ${selector}`);
                    break;
                }
            }

            if (!likeButton) {
                console.error('[YapPilot] Like button not found in main article');
                return { success: false, error: 'Like button not found' };
            }

            // Check if already liked
            const ariaLabel = likeButton.getAttribute('aria-label') || '';
            const testId = likeButton.getAttribute('data-testid') || '';

            console.log(`[YapPilot] Button aria-label: ${ariaLabel}, data-testid: ${testId}`);

            if (ariaLabel.toLowerCase().includes('unlike') ||
                ariaLabel.includes('Batal menyukai') || // Indonesian "Unlike"
                testId === 'unlike') {
                console.log('[YapPilot] Post already liked');
                return { success: true, message: 'Already liked' };
            }

            // Scroll button into view
            likeButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await sleep(300);

            // Click like button
            console.log('[YapPilot] Clicking like button...');
            likeButton.click();

            // Wait a bit for animation
            await sleep(800);

            console.log('[YapPilot] Like successful!');
            return { success: true, message: 'Liked successfully' };
        } catch (error) {
            console.error('[YapPilot] Like error:', error);
            return { success: false, error: error.message };
        }
    };

    // Get Post Content Function
    window.xAutoEngage_getPostContent = function () {
        try {
            console.log('[YapPilot] Getting post content...');

            // Find the main post article
            const mainArticle = document.querySelector('article[data-testid="tweet"]') ||
                document.querySelector('article[tabindex="-1"]') ||
                document.querySelector('main article');

            if (!mainArticle) {
                console.error('[YapPilot] Main article not found');
                return { success: false, error: 'Main post article not found' };
            }

            // Selectors for post content within main article
            const contentSelectors = [
                '[data-testid="tweetText"]',
                'div[lang]', // Tweet text usually has lang attribute
                'div[dir="auto"]'
            ];

            let content = '';
            for (const selector of contentSelectors) {
                const element = mainArticle.querySelector(selector);
                if (element && element.textContent.trim()) {
                    content = element.textContent.trim();
                    console.log(`[YapPilot] Found content with: ${selector}`);
                    break;
                }
            }

            if (!content) {
                console.error('[YapPilot] Post content not found');
                return { success: false, error: 'Post content not found' };
            }

            console.log(`[YapPilot] Content: ${content.substring(0, 100)}...`);
            return { success: true, content };
        } catch (error) {
            console.error('[YapPilot] Get content error:', error);
            return { success: false, error: error.message };
        }
    };

    // Post Reply Function (FROM v1.2.2 - WORKING VERSION WITH MODAL)
    window.xAutoEngage_postReply = async function (replyText) {
        try {
            console.log('[YapPilot] Starting reply process...');

            // Find reply button to open reply box
            const replyButtonSelectors = [
                '[data-testid="reply"]',
                'button[data-testid="reply"]',
                'div[data-testid="reply"]',
                '[aria-label*="Reply"]',
                '[aria-label*="reply"]',
                'div[role="button"][aria-label*="Reply"]',
                'div[role="button"][aria-label*="reply"]'
            ];

            let replyButton = null;
            for (const selector of replyButtonSelectors) {
                const elements = document.querySelectorAll(selector);
                console.log(`[YapPilot] Trying reply selector: ${selector}, found: ${elements.length}`);
                if (elements.length > 0) {
                    replyButton = elements[0];
                    console.log(`[YapPilot] Found reply button with: ${selector}`);
                    break;
                }
            }

            if (!replyButton) {
                console.error('[YapPilot] Reply button not found');
                return { success: false, error: 'Reply button not found' };
            }

            // Scroll into view
            replyButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await sleep(300);

            // EXTREME WINDOW FOCUS - Force X tab active BEFORE opening modal
            console.log('[YapPilot] FORCING X TAB ACTIVE...');
            window.focus();
            await sleep(500);
            window.focus();
            await sleep(500);
            window.focus();
            await sleep(500);

            // Click reply button
            console.log('[YapPilot] Clicking reply button...');
            replyButton.click();
            await sleep(2500); // Wait for modal to fully open

            // Find reply textarea - MUST BE INSIDE MODAL DIALOG
            console.log('[YapPilot] Looking for reply textarea in modal...');

            // First, find the modal dialog with retry logic for slow connections
            let modal = null;
            let retries = 0;
            const maxRetries = 3;

            while (!modal && retries < maxRetries) {
                modal = document.querySelector('[role="dialog"]') ||
                    document.querySelector('[aria-modal="true"]') ||
                    document.querySelector('div[data-testid="modal"]');

                if (!modal) {
                    console.log(`[YapPilot] Modal not found, retry ${retries + 1}/${maxRetries}...`);
                    await sleep(2000); // Wait 2s before retry
                    retries++;
                }
            }

            if (!modal) {
                console.error('[YapPilot] Reply modal not found after retries');
                return { success: false, error: 'Reply modal not found - slow connection or page issue' };
            }

            console.log('[YapPilot] Found modal dialog');

            // Find textarea INSIDE the modal
            const textareaSelectors = [
                '[data-testid="tweetTextarea_0"]',
                'div[role="textbox"][contenteditable="true"]',
                '.public-DraftEditor-content',
                '[contenteditable="true"]',
                'div[contenteditable="true"][role="textbox"]'
            ];

            let textarea = null;
            for (const selector of textareaSelectors) {
                // Search ONLY inside modal
                const elements = modal.querySelectorAll(selector);
                console.log(`[YapPilot] Trying textarea selector in modal: ${selector}, found: ${elements.length}`);

                if (elements.length > 0) {
                    textarea = elements[0]; // First one in modal
                    console.log(`[YapPilot] Found textarea in modal with: ${selector}`);
                    break;
                }
            }

            if (!textarea) {
                console.error('[YapPilot] Reply textarea not found in modal');
                return { success: false, error: 'Reply textarea not found in modal' };
            }

            // Focus and type reply - FORCE FOCUS EVEN WITH DEVTOOLS OPEN
            console.log('[YapPilot] Typing reply...');

            // Force window focus first
            window.focus();
            await sleep(200);

            // Focus textarea multiple times to ensure it works
            textarea.focus();
            await sleep(200);
            textarea.click(); // Click to ensure focus
            await sleep(200);
            textarea.focus(); // Focus again
            await sleep(300);

            // Verify textarea has focus
            if (document.activeElement !== textarea) {
                console.warn('[YapPilot] Textarea not focused, forcing focus...');
                textarea.focus();
                textarea.click();
                await sleep(500);
            }

            // Type text character by character for more natural behavior
            for (const char of replyText) {
                // Create input event
                const inputEvent = new InputEvent('input', {
                    bubbles: true,
                    cancelable: true,
                    data: char
                });

                // Insert text
                document.execCommand('insertText', false, char);
                textarea.dispatchEvent(inputEvent);

                // Random tiny delay between characters
                await sleep(Math.random() * 50 + 20);
            }

            await sleep(800);

            console.log('[YapPilot] Text typed, looking for post button...');

            // Find and click post button
            const postButtonSelectors = [
                '[data-testid="tweetButton"]',
                '[data-testid="tweetButtonInline"]',
                'button[data-testid="tweetButton"]',
                'div[data-testid="tweetButton"]',
                'div[role="button"][data-testid*="tweet"]',
                '[aria-label*="Post"]',
                '[aria-label*="Reply"]'
            ];

            let postButton = null;
            for (const selector of postButtonSelectors) {
                const buttons = document.querySelectorAll(selector);
                console.log(`[YapPilot] Trying post button selector: ${selector}, found: ${buttons.length}`);

                // Get the last one (usually the one in the reply modal)
                if (buttons.length > 0) {
                    postButton = buttons[buttons.length - 1];
                    console.log(`[YapPilot] Found post button with: ${selector}`);
                    break;
                }
            }

            if (!postButton) {
                console.error('[YapPilot] Post button not found');
                return { success: false, error: 'Post button not found' };
            }

            // Click post button
            console.log('[YapPilot] Clicking post button...');
            postButton.click();

            // Wait longer for posting and modal close animation (increased from 3s to 5s)
            await sleep(5000);

            // VERIFY reply posted - check if modal closed AND reply appears in DOM
            console.log('[YapPilot] Verifying reply posted...');
            await sleep(1500);

            // Check 1: Modal should be closed
            const modalStillExists = document.querySelector('[role="dialog"]') ||
                document.querySelector('[aria-modal="true"]');

            if (modalStillExists) {
                const rect = modalStillExists.getBoundingClientRect();
                // Check if modal is actually visible (not just in closing animation)
                if (rect.width > 0 && rect.height > 0) {
                    // Wait a bit more for animation
                    await sleep(2000);

                    // Check again
                    const modalStillVisible = document.querySelector('[role="dialog"]');
                    if (modalStillVisible) {
                        const rect2 = modalStillVisible.getBoundingClientRect();
                        if (rect2.width > 0 && rect2.height > 0) {
                            console.error('[YapPilot] Reply posting FAILED - modal still open!');
                            return { success: false, error: 'Reply posting failed - modal did not close' };
                        }
                    }
                }
            }

            console.log('[YapPilot] Reply posted successfully!');
            return { success: true, message: 'Reply posted successfully' };
        } catch (error) {
            console.error('[YapPilot] Reply error:', error);
            return { success: false, error: error.message };
        }
    };

    // Get Post Author Function
    window.xAutoEngage_getPostAuthor = function () {
        try {
            console.log('[YapPilot] Getting post author...');

            // Find the main post article
            const mainArticle = document.querySelector('article[data-testid="tweet"]') ||
                document.querySelector('article[tabindex="-1"]') ||
                document.querySelector('main article');

            if (!mainArticle) {
                return { success: false, author: 'Unknown' };
            }

            // Find author name
            const authorSelectors = [
                '[data-testid="User-Name"]',
                'a[role="link"][href*="/"]',
                'div[dir="ltr"] span'
            ];

            for (const selector of authorSelectors) {
                const element = mainArticle.querySelector(selector);
                if (element && element.textContent.trim()) {
                    const author = element.textContent.trim().split('\n')[0];
                    console.log(`[YapPilot] Found author: ${author}`);
                    return { success: true, author };
                }
            }

            return { success: false, author: 'Unknown' };
        } catch (error) {
            console.error('[YapPilot] Get author error:', error);
            return { success: false, author: 'Unknown' };
        }
    };

    // Check if Already Commented Function
    window.xAutoEngage_checkAlreadyCommented = async function () {
        try {
            console.log('[YapPilot] Checking if already commented...');

            // Wait for page to load
            await sleep(1000);

            // Get current user's username from the page
            // Usually found in the sidebar or header
            const currentUserSelectors = [
                '[data-testid="SideNav_AccountSwitcher_Button"] [dir="ltr"]',
                '[data-testid="UserName"]',
                'a[aria-label*="Profile"]'
            ];

            let currentUsername = null;
            for (const selector of currentUserSelectors) {
                const element = document.querySelector(selector);
                if (element) {
                    const text = element.textContent.trim();
                    // Extract @username
                    const match = text.match(/@(\w+)/);
                    if (match) {
                        currentUsername = match[1];
                        console.log(`[YapPilot] Current user: @${currentUsername}`);
                        break;
                    }
                }
            }

            if (!currentUsername) {
                console.log('[YapPilot] Could not determine current username');
                return { success: true, alreadyCommented: false };
            }

            // Find all reply/comment sections
            const replyArticles = document.querySelectorAll('article[data-testid="tweet"]');
            console.log(`[YapPilot] Found ${replyArticles.length} articles (including main post)`);

            // Check each reply (skip first one which is the main post)
            for (let i = 1; i < replyArticles.length; i++) {
                const article = replyArticles[i];

                // Check if this reply is from current user
                const userNameElement = article.querySelector('[data-testid="User-Name"]');
                if (userNameElement) {
                    const replyText = userNameElement.textContent;
                    if (replyText.includes(`@${currentUsername}`)) {
                        console.log('[YapPilot] Found own comment!');
                        return { success: true, alreadyCommented: true };
                    }
                }
            }

            console.log('[YapPilot] No own comments found');
            return { success: true, alreadyCommented: false };
        } catch (error) {
            console.error('[YapPilot] Check commented error:', error);
            // On error, assume not commented to avoid skipping posts
            return { success: true, alreadyCommented: false };
        }
    };

    // Utility sleep function
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Check if already replied to this post
    window.xAutoEngage_checkAlreadyReplied = function () {
        try {
            console.log('[YapPilot] Checking if already replied...');

            // Find all reply items in the page
            const replyItems = document.querySelectorAll('article[data-testid="tweet"]');

            // Get current user's username from page
            const userMenuButton = document.querySelector('[data-testid="SideNav_AccountSwitcher_Button"]');
            let currentUsername = '';
            if (userMenuButton) {
                const usernameElement = userMenuButton.querySelector('[dir="ltr"]');
                if (usernameElement) {
                    currentUsername = usernameElement.textContent.trim().replace('@', '');
                }
            }

            if (!currentUsername) {
                console.log('[YapPilot] Could not detect current username');
                return { success: true, alreadyReplied: false };
            }

            console.log('[YapPilot] Current username:', currentUsername);

            // Check each reply to see if it's from current user
            for (const item of replyItems) {
                const authorElement = item.querySelector('[data-testid="User-Name"] a[role="link"]');
                if (authorElement) {
                    const href = authorElement.getAttribute('href');
                    if (href && href.includes(`/${currentUsername}`)) {
                        console.log('[YapPilot] Found own reply!');
                        return { success: true, alreadyReplied: true };
                    }
                }
            }

            console.log('[YapPilot] No own reply found');
            return { success: true, alreadyReplied: false };
        } catch (error) {
            console.error('[YapPilot] Check already replied error:', error);
            return { success: false, error: error.message };
        }
    };

    console.log('YapPilot content script loaded');
})();
