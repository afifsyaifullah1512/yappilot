// Utility Functions

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { sleep, randomDelay, waitForTabLoad };
}
