// DOM Elements
const backBtn = document.getElementById('backBtn');
const exportBtn = document.getElementById('exportBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const retryAllBtn = document.getElementById('retryAllBtn');
const failedCount = document.getElementById('failedCount');
const failedList = document.getElementById('failedList');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadFailedPosts();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    backBtn.addEventListener('click', () => {
        window.location.href = 'popup.html';
    });

    exportBtn.addEventListener('click', exportFailedPosts);
    clearAllBtn.addEventListener('click', clearAll);
    retryAllBtn.addEventListener('click', retryAll);
}

// Load Failed Posts
async function loadFailedPosts() {
    const { failedPosts } = await chrome.storage.local.get(['failedPosts']);

    if (!failedPosts || failedPosts.length === 0) {
        failedList.innerHTML = '<div class="empty-state">No failed posts</div>';
        failedCount.textContent = '0';
        return;
    }

    failedCount.textContent = failedPosts.length;
    failedList.innerHTML = '';

    failedPosts.forEach((post, index) => {
        const item = document.createElement('div');
        item.className = 'failed-item';
        item.innerHTML = `
      <div class="failed-url">${post.url}</div>
      <div class="failed-error">❌ ${post.reason || post.error || 'Unknown error'}</div>
      <div class="failed-time">${post.timestamp || 'No timestamp'}</div>
    `;
        failedList.appendChild(item);
    });
}

// Export Failed Posts
async function exportFailedPosts() {
    const { failedPosts } = await chrome.storage.local.get(['failedPosts']);

    if (!failedPosts || failedPosts.length === 0) {
        alert('No failed posts to export');
        return;
    }

    // Create text content with URL + Error
    let textContent = '=== FAILED POSTS LIST ===\n\n';
    failedPosts.forEach((post, index) => {
        textContent += `${index + 1}. URL: ${post.url}\n`;
        textContent += `   Error: ${post.reason || post.error || 'Unknown'}\n`;
        textContent += `   Time: ${post.timestamp || 'Unknown'}\n\n`;
    });

    // Download as text file
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `failed-posts-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Clear All
async function clearAll() {
    if (!confirm('Clear all failed posts?')) return;

    await chrome.storage.local.set({ failedPosts: [] });
    await loadFailedPosts();
}

// Retry All
async function retryAll() {
    const { failedPosts } = await chrome.storage.local.get(['failedPosts']);

    if (!failedPosts || failedPosts.length === 0) {
        alert('No failed posts to retry');
        return;
    }

    // Extract URLs
    const urls = failedPosts.map(post => post.url);

    // Save to savedUrls
    await chrome.storage.local.set({ savedUrls: urls.join('\n') });

    // Clear failed posts
    await chrome.storage.local.set({ failedPosts: [] });

    // Go back to main popup
    window.location.href = 'popup.html';
}
