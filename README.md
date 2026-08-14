# ✈️ YapPilot

> Your X engagement, on autopilot. Automate likes and AI-powered replies on X/Twitter posts.

Chrome extension untuk automasi engagement di X/Twitter dengan AI-powered replies.

## Features

- 🤖 AI-powered comment generation (GROQ)
- ❤️ Auto-like posts
- 💬 Auto-comment dengan contextual replies
- 📊 Progress tracking & activity logs
- ⚙️ Customizable delays & settings
- 🔐 License key system dengan JWT token

## Installation

1. Download extension files
2. Buka Chrome → `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Pilih folder extension ini

## Setup

1. **Get License Key** - Hubungi admin untuk license key
2. **Settings** → Masukkan license key → "Validate Key"
3. **Settings** → Masukkan GROQ API key (get from https://console.groq.com)
4. **Popup** → Paste post URLs → "Start"

## Files Structure

```
auto-yap/
├── manifest.json       # Extension config
├── popup.html/js/css   # Main UI
├── settings.html/js/css # Settings page
├── failed.html/js      # Failed posts tracker
├── background.js       # Automation engine
├── content.js          # X.com page interaction
└── icons/              # Extension icons
```

## Security

- JWT token-based authentication
- License keys validated via secure API
- Tokens expire after 24 hours
- Rate limiting (100 validations/day)

## Support

Created by **Yapper Indo**

For support, contact admin.

---

**Version:** 1.0.0
**Last Updated:** 2025-11-28
