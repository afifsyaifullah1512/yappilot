# Changelog - YapPilot

## Version 2.0.0 (Rebrand)

### 🎉 Rebrand: X Auto Engage → YapPilot
- Renamed extension to **YapPilot** — "Your X engagement, on autopilot"
- All functionality unchanged from v1.3.4
- License key format (XAE-...) kept for compatibility with existing keys

---
## Version 1.3.1 (2025-12-12)

### 🐛 Bug Fixes
- **Fixed browser crash after 30+ posts** - Implemented aggressive memory cleanup every 5 posts
- **Fixed content loading issues** - Added content verification with retry logic (up to 5 retries)
- **Fixed success/failed log detection** - Improved modal detection with double-check and longer wait times
- **Fixed tab refresh timing** - Refresh now triggers correctly every 5 posts regardless of success/failure/skip

### ✨ Improvements
- **Memory Management**: Aggressive cleanup of timers, intervals, and event listeners before each navigation
- **Content Loading**: Increased wait time from 5s to 8s with verification that content is actually loaded
- **Modal Detection**: Wait time increased from 4s to 6.5s with retry logic for closing animations
- **Refresh Logic**: Now triggers in 3 places (after success, after error, at start of processing) for 100% consistency

### 🔧 Technical Changes
- Added forced console logging for refresh triggers to ensure visibility
- Improved side panel detection (threshold changed from >500px to >=400px)
- Memory cleanup now runs before every navigation and tab refresh
- Content verification ensures article has minimum 50 characters before proceeding

### 📊 Performance
- Extension can now handle 50+ posts without crashes or slowdowns
- Memory usage significantly reduced through aggressive cleanup
- More reliable automation with better error handling

---

## Version 1.3.0 (Previous)
- Initial release with AI-powered engagement
- Support for GROQ, Gemini, and OpenRouter
- Like and comment automation
- Skip already commented posts feature
