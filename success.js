// DOM Elements
const backBtn = document.getElementById('backBtn');
const exportBtn = document.getElementById('exportBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const successCount = document.getElementById('successCount');
const successList = document.getElementById('successList');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadSuccessPosts();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    backBtn.addEventListener('click', () => {
        window.location.href = 'popup.html';
    });

    exportBtn.addEventListener('click', exportSuccessPosts);
    clearAllBtn.addEventListener('click', clearAll);
}

// Load Success Posts
async function loadSuccessPosts() {
    const { successPosts } = await chrome.storage.local.get(['successPosts']);

    if (!successPosts || successPosts.length === 0) {
        successList.innerHTML = '<div class="empty-state">No successful posts yet</div>';
        successCount.textContent = '0';
        return;
    }

    successCount.textContent = successPosts.length;
    successList.innerHTML = '';

    successPosts.forEach((post, index) => {
        const item = document.createElement('div');
        item.className = 'failed-item'; // Reuse failed-item styling

        // Build status text
        let status = '';
        if (post.liked && post.commented) {
            status = '✅ Liked & Commented';
        } else if (post.liked) {
            status = '❤️ Liked';
        } else if (post.commented) {
            status = '💬 Commented';
        } else {
            status = '✅ Processed';
        }

        item.innerHTML = `
      <div class="failed-url">${post.url}</div>
      <div class="failed-error" style="color: #10b981;">${status}</div>
      <div class="failed-time">👤 ${post.author || 'Unknown'} • ${post.timestamp || 'No timestamp'}</div>
    `;
        successList.appendChild(item);
    });
}

// Export Success Posts
async function exportSuccessPosts() {
    const { successPosts } = await chrome.storage.local.get(['successPosts']);

    if (!successPosts || successPosts.length === 0) {
        alert('No successful posts to export');
        return;
    }

    // Create text content with URL + Status
    let textContent = '=== SUCCESS POSTS LIST ===\n\n';
    successPosts.forEach((post, index) => {
        textContent += `${index + 1}. URL: ${post.url}\n`;
        textContent += `   Author: ${post.author || 'Unknown'}\n`;
        textContent += `   Liked: ${post.liked ? 'Yes' : 'No'}\n`;
        textContent += `   Commented: ${post.commented ? 'Yes' : 'No'}\n`;
        textContent += `   Time: ${post.timestamp || 'Unknown'}\n\n`;
    });

    // Download as text file
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `success-posts-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Clear All
async function clearAll() {
    if (!confirm('Clear all successful posts?')) return;

    await chrome.storage.local.set({ successPosts: [] });
    await loadSuccessPosts();
}
