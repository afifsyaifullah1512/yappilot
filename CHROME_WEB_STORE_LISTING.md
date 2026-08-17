# YapPilot — Chrome Web Store Listing

## Product name
YapPilot

## Short description
AI-assisted X engagement with contextual replies, configurable delays, and activity tracking.

## Detailed description
YapPilot helps you manage engagement workflows on X with more control and less repetitive work.

Add post URLs, choose an AI provider, configure your reply instructions, and let YapPilot assist with likes and contextual replies. Adjustable delays and clear activity logs keep every run transparent.

KEY FEATURES

• Generate contextual replies based on each post
• Choose OpenAI, Claude, Grok, Groq, DeepSeek, Gemini, or a supported custom endpoint
• Bring your own API key and preferred model
• Enable likes, replies, or both
• Configure randomized delays between actions
• Skip posts already processed by YapPilot
• Review successful and failed posts
• Follow live progress from the side panel
• Store settings and activity records locally in Chrome
• Reject repetitive or malformed AI output before posting

HOW IT WORKS

1. Open YapPilot Settings.
2. Select an AI provider and enter your own API key.
3. Customize the reply prompt and automation preferences.
4. Add X post URLs.
5. Review your settings and start the run.

YapPilot is intended as an assistance tool. Users remain responsible for the content they post and for complying with X rules, applicable laws, and their AI provider’s terms.

PRIVACY

API keys, settings, and activity records are stored in Chrome local storage. Post content is sent only to the AI provider selected by the user for reply generation. License information is sent only to YapPilot’s license-validation service. YapPilot does not sell personal data or use it for advertising.

## Category
Productivity

## Language
English

## Single purpose statement
YapPilot assists users with configurable engagement workflows on X by processing user-supplied post URLs, optionally liking posts, and generating contextual AI replies through a provider chosen by the user.

## Permission justifications

### storage
Stores user settings, user-supplied post URLs, API keys, license state, and success/failure records locally in Chrome.

### tabs
Opens and manages X tabs required to process the post URLs explicitly supplied by the user.

### activeTab
Allows YapPilot to interact with the active X page when the user initiates an automation run.

### scripting
Injects the extension’s content script into supported X pages so it can read visible post content and perform the actions configured by the user.

### sidePanel
Displays a persistent activity log and automation controls beside the X page.

### Host permission: x.com and twitter.com
Required to read visible post content and perform user-configured engagement actions on X.

### Host permission: auto-yap-api.vercel.app
Required only for license validation.

### AI provider host permissions
Required to send visible post content and the user’s prompt directly to the AI provider selected by the user. The user supplies their own API key.

### localhost and 127.0.0.1
Supports user-configured local AI endpoints during local/private use. No localhost request is made unless the user configures that provider.

## Data-use disclosures
- Personally identifiable information: No
- Health information: No
- Financial/payment information: No
- Authentication information: Yes — user-supplied AI API keys and license data
- Personal communications: Yes — reply text prepared for posting on X
- Location: No
- Web history: Yes — user-supplied X post URLs and visible post content required for the feature
- User activity: Yes — success/failure records for extension actions
- Website content: Yes — visible X post content needed to generate a contextual reply

Data is used only for the extension’s stated single purpose, is not sold, is not used for advertising, and is not used for creditworthiness or lending.

## Suggested support URL
https://github.com/afifsyaifullah1512/yappilot/issues

## Privacy policy
Publish `PRIVACY_POLICY.md` at a publicly accessible HTTPS URL before submission. A raw repository URL may work, but GitHub Pages is preferable.

## Assets
- Store icon: `store-assets/store-icon-128.png`
- Small promo tile: `store-assets/small-promo-440x280.png`
- Screenshots: `store-assets/screenshot-*.png`
