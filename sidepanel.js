// Side Panel JavaScript - Log Viewer

let currentFilter = 'all';
let logs = [];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadLogs();
    setupEventListeners();
    startLogListener();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('exportBtn').addEventListener('click', exportLogs);
    document.getElementById('clearBtn').addEventListener('click', clearLogs);
    document.getElementById('filterSelect').addEventListener('change', (e) => {
        currentFilter = e.target.value;
        renderLogs();
    });
}

// Load logs from storage
async function loadLogs() {
    const result = await chrome.storage.local.get(['activityLogs']);
    logs = result.activityLogs || [];
    renderLogs();
    updateStats();
}

// Listen for new logs
function startLogListener() {
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.activityLogs) {
            logs = changes.activityLogs.newValue || [];
            renderLogs();
            updateStats();
        }
    });

    // Listen for failed posts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'FAILED_POST') {
            chrome.storage.local.get(['failedPosts'], (result) => {
                const failedPosts = result.failedPosts || [];
                failedPosts.push({
                    url: message.url,
                    reason: message.reason,
                    timestamp: new Date().toISOString()
                });
                chrome.storage.local.set({ failedPosts });
                console.log('[Failed Post] Added:', message.url);
            });
        }
    });
}

// Render logs
function renderLogs() {
    const container = document.getElementById('logContainer');

    // Filter logs
    let filteredLogs = logs;
    if (currentFilter !== 'all') {
        filteredLogs = logs.filter(log => log.status.toLowerCase() === currentFilter);
    }

    // Show empty state if no logs
    if (filteredLogs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <p>${currentFilter === 'all' ? 'Belum ada aktivitas' : 'Tidak ada log untuk filter ini'}</p>
                <small>Log akan muncul saat automation berjalan</small>
            </div>
        `;
        return;
    }

    // Render log items (newest first)
    const reversedLogs = [...filteredLogs].reverse();
    container.innerHTML = reversedLogs.map(log => createLogItem(log)).join('');
}

// Create log item HTML
function createLogItem(log) {
    const statusClass = log.status.toLowerCase();
    const statusIcon = {
        'success': '✅',
        'failed': '❌',
        'skipped': '⏭️'
    }[statusClass] || '📝';

    const statusText = {
        'success': 'Berhasil',
        'failed': 'Gagal',
        'skipped': 'Dilewati'
    }[statusClass] || log.status;

    return `
        <div class="log-item ${statusClass}">
            <div class="log-header">
                <div class="log-time">🕐 ${log.waktu}</div>
                <div class="log-status ${statusClass}">
                    ${statusIcon} ${statusText}
                </div>
            </div>
            <div class="log-author">👤 ${log.author || 'Unknown'}</div>
            <div class="log-message">💬 ${log.pesan}</div>
            ${log.urlPost ? `<a href="${log.urlPost}" target="_blank" class="log-url">🔗 Lihat Post</a>` : ''}
        </div>
    `;
}

// Update statistics
function updateStats() {
    const stats = {
        success: logs.filter(log => log.status === 'success').length,
        failed: logs.filter(log => log.status === 'failed').length,
        skipped: logs.filter(log => log.status === 'skipped').length
    };

    document.getElementById('successCount').textContent = stats.success;
    document.getElementById('failedCount').textContent = stats.failed;
    document.getElementById('skippedCount').textContent = stats.skipped;
}

// Export logs
function exportLogs() {
    if (logs.length === 0) {
        alert('Tidak ada log untuk di-export');
        return;
    }

    // Ask format
    const format = confirm('Klik OK untuk CSV, Cancel untuk JSON');

    if (format) {
        exportCSV();
    } else {
        exportJSON();
    }
}

// Export as CSV
function exportCSV() {
    const headers = ['Waktu', 'Author', 'Status', 'Pesan', 'URL Post'];
    const rows = logs.map(log => [
        log.waktu,
        log.author || '',
        log.status,
        log.pesan,
        log.urlPost || ''
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    downloadFile(csvContent, 'x-auto-engage-log.csv', 'text/csv');
}

// Export as JSON
function exportJSON() {
    const jsonContent = JSON.stringify(logs, null, 2);
    downloadFile(jsonContent, 'x-auto-engage-log.json', 'application/json');
}

// Download file
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Clear logs
async function clearLogs() {
    if (!confirm('Hapus semua log? Tindakan ini tidak bisa dibatalkan.')) {
        return;
    }

    logs = [];
    await chrome.storage.local.set({ activityLogs: [] });
    renderLogs();
    updateStats();
}
