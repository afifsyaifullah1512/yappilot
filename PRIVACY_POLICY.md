# Privacy Policy for YapPilot

**Last Updated:** August 17, 2026

## Overview
YapPilot ("the Extension") is a browser extension that automates engagement on X/Twitter posts with AI-powered replies.

## Data Collection
YapPilot does not sell personal data or use it for advertising. The Extension stores configuration and activity data locally. It transmits limited data only when required to provide features selected by the user, as described below.

### Local Storage Only
All data is stored locally in your browser using Chrome's storage API:
- **Post URLs**: URLs you provide for automation
- **Settings**: Your preferences (AI provider, API keys, delays, etc.)
- **Success/Failed Lists**: Records of processed posts
- **License Data**: Your license key and validation token

### API Keys
- Your AI API keys are stored in Chrome local storage
- API keys are NEVER transmitted to our servers
- API keys are used only to communicate directly with the AI provider selected by you

## Third-Party Services
The Extension communicates with the following third-party services:

### License Validation
- **Service**: auto-yap-api.vercel.app
- **Purpose**: Validate your license token
- **Data Sent**: License key or validation token and a locally generated device identifier
- **Purpose**: Validate access and enforce license limits

### AI Providers (Your Choice)
- **OpenAI** (api.openai.com)
- **Anthropic Claude** (api.anthropic.com)
- **xAI Grok** (api.x.ai)
- **Groq** (api.groq.com)
- **DeepSeek** (api.deepseek.com)
- **Google Gemini** (generativelanguage.googleapis.com)
- **A custom endpoint configured by the user**, when supported

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
- Post content is transmitted only to the AI provider selected by the user to generate a reply
- License data is transmitted only to the YapPilot license service
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
- Support: https://github.com/afifsyaifullah1512/yappilot/issues

## Consent
By using YapPilot, you consent to this privacy policy.
