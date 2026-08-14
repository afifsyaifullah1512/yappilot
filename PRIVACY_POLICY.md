# Privacy Policy for YapPilot

**Last Updated:** December 9, 2024

## Overview
YapPilot ("the Extension") is a browser extension that automates engagement on X/Twitter posts with AI-powered replies.

## Data Collection
The Extension does NOT collect, store, or transmit any personal data to external servers.

### Local Storage Only
All data is stored locally in your browser using Chrome's storage API:
- **Post URLs**: URLs you provide for automation
- **Settings**: Your preferences (AI provider, API keys, delays, etc.)
- **Success/Failed Lists**: Records of processed posts
- **License Token**: Your license key for validation

### API Keys
- Your AI API keys (Groq, Gemini, OpenRouter) are stored ONLY in your local browser storage
- API keys are NEVER transmitted to our servers
- API keys are used ONLY to communicate directly with the respective AI providers

## Third-Party Services
The Extension communicates with the following third-party services:

### License Validation
- **Service**: auto-yap-api.vercel.app
- **Purpose**: Validate your license token
- **Data Sent**: License token only
- **Data Stored**: None

### AI Providers (Your Choice)
- **Groq API** (api.groq.com)
- **Google Gemini API** (generativelanguage.googleapis.com)
- **OpenRouter API** (openrouter.ai)

**Purpose**: Generate AI replies to posts  
**Data Sent**: Post content you're replying to  
**Your API Key**: Used for authentication  
**Privacy**: Governed by respective provider's privacy policy

## Permissions Explained
The Extension requests the following permissions:

- **tabs**: To create and manage automation tabs
- **storage**: To save your settings and processed posts locally
- **activeTab**: To interact with X/Twitter pages
- **scripting**: To inject automation scripts into X/Twitter pages
- **sidePanel**: To display the extension's side panel UI

### Host Permissions
- **x.com/twitter.com**: To automate engagement on X/Twitter
- **auto-yap-api.vercel.app**: For license validation only

## Data Security
- All data is stored locally in your browser
- No data is transmitted to our servers except license validation
- You can delete all data by uninstalling the extension

## Your Rights
You have the right to:
- Delete all stored data (via extension settings or uninstall)
- Revoke permissions (by disabling/uninstalling the extension)
- Request information about your data (contact us)

## Changes to This Policy
We may update this privacy policy. Changes will be posted with a new "Last Updated" date.

## Contact
For questions about this privacy policy:
- Email: [Your Email]
- GitHub: [Your GitHub]

## Consent
By using YapPilot, you consent to this privacy policy.
