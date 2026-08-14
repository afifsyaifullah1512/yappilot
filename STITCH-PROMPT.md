# Stitch Prompt — YapPilot (Rebrand · Anti-AI-Slop Edition)

**URL:** https://stitch.withgoogle.com · Mode **Web** · Login Google
**Cara pakai:** paste MASTER PROMPT utuh. Kalau meleset, generate per-screen (copy blok SCREEN-nya). Follow-up: "make screen 1 a narrow 420px vertical side panel."

═══════════════════════════════════════════════
## MASTER PROMPT
═══════════════════════════════════════════════

Design the UI for "YapPilot" — a Chrome extension that puts X/Twitter engagement on autopilot (auto-like + AI-generated replies). This is a brand relaunch, so it has to look like a real, opinionated product shipped by a great design team — the caliber of Linear, Raycast, Vercel, and Superhuman. It must NOT look like a template or an auto-generated dashboard.

BRAND
- Name: YapPilot. Idea: a flight co-pilot for social engagement — calm, precise, in command. Not a spam bot.
- Logo: a single confident paper-plane / flight glyph, geometric and sharp, set in a rounded tile. Tagline: "Your X engagement, on autopilot."
- Voice in the UI: terse, technical, human. Labels like "READY", "IN FLIGHT", "3 QUEUED" instead of vague marketing copy.

DESIGN FOUNDATION (apply on every screen)
- Mood: deep, quiet, high-craft dark UI. Near-black canvas #0A0A0B (a real neutral graphite, NOT navy-purple). One ambient light source: a single soft cool-blue glow bleeding from the top edge only — subtle, like a screen in a dark room. No rainbow gradients.
- Surfaces: raised panels in #141416 with a 1px border of #232327 and a razor-thin 1px inner top-highlight. Elevation comes from tight, dark, believable shadows — not big blurry blooms. Corner radius 12px, consistent everywhere.
- Accent: ONE signature color — an electric sky-blue #4C8DFF — used only on the single most important action per screen and on live/active status. Success = a muted green #3FB950. Danger = a muted red #F85149 (GitHub-dark palette energy). Everything else is graphite and grey. Restraint is the whole point.
- Type: Inter. Tight tracking on headings. A real hierarchy: 18px semibold titles, 13px body in #9B9BA3, 11px UPPERCASE micro-labels with +0.08em tracking in #6E6E76. Monospace (JetBrains Mono / SF Mono) for URLs, tokens, model names, counts.
- Icons: one consistent thin-line (1.5px stroke) set, inherited stroke color. Absolutely no emoji anywhere in the chrome.
- Density: information-dense but breathing. Left-aligned reading flow, not everything centered. Generous line-height in logs. Numbers in tabular figures.
- Detail that sells it: 1px divider lines at 6% white, focus rings that are a crisp 2px accent outline (not a fuzzy glow), a tiny live pulse dot only when running, log rows that fade in.

⛔ AVOID THESE AI-SLOP TELLS (critical):
- No purple-to-blue diagonal gradient backgrounds. No neon everything. No glassmorphism blur stacked on glassmorphism.
- No giant centered hero headline. No three-emoji feature cards. No pill buttons floating in empty space.
- No candy-colored icons. No drop-shadow on every single element. No "gradient text" on body copy.
- Don't color more than one button per screen. Grey is a feature, not a fallback.
- Make deliberate alignment and spacing decisions — asymmetry where it aids scanning, not centered-everything symmetry.

DELIVER 4 SCREENS, same visual language:

SCREEN 1 — CONTROL PANEL (narrow ~420px vertical side panel)
- Top bar: paper-plane logo tile at left, "YapPilot" wordmark, and a small monospace "v2.0" tag at far right. A hairline divider under it.
- Queue card: micro-label "POST QUEUE" with a mono count "· 12 URLS" beside it; three small ghost icon-buttons at the right (saved, failed, success). Below, a monospace multiline input listing x.com/.../status/... URLs, one per line, left-aligned.
- Command row: a full-width primary "Start" button in the signature blue with a small play glyph — this is the ONE hero. Next to a compact "Stop" (ghost/outline, shown disabled) and a square gear icon button. Not three equal colorful buttons.
- Flight status card (visible when running): a live pulse dot + "IN FLIGHT" + the active model name in mono; a slim single-color progress bar (no gradient); "12 / 50" in tabular mono; a small provider switch dropdown + text "Switch" link.
- Activity log: header "ACTIVITY" with a quiet "Clear" text button. A dense, scrollable, timestamped feed — each row = mono time + a 1-char colored status glyph + message. Info = grey, success = muted green, error = muted red. Empty state: the plane glyph at low opacity + "Idle. Add URLs to begin." — no exclamation, no emoji.

SCREEN 2 — SETTINGS (wider single column, stacked cards, left-aligned headers)
- License card: header "LICENSE" + a small outline "REQUIRED" tag. A mono input "XAE-XXXX-XXXX-XXXX-XXXX", a blue "Validate" button, an inline status line, and quiet helper text referencing the Discord /create-key command.
- AI Provider card: three horizontal selectable rows (not floating cards) — GROQ · "Fast & free", Gemini · "Google", OpenRouter · "Multi-model". The selected row gets a 2px accent left-border and a check; others stay flat grey. Below: a masked API-key field with a line-icon eye toggle; a "get key" text link. OpenRouter selected reveals a model dropdown grouped Free / Premium / Specialized.
- Prompt Template card: a monospace-friendly textarea with a subtle character-count.
- Automation card: three clean toggle switches in a list with divider lines (Auto-like, Auto-reply, Skip already-replied) — the track turns accent blue when on, no glow. Then a tidy 2-col grid: Window Mode dropdown, Like→Comment min/max, Post Delay min/max, each with a small "SEC" unit tag.
- Footer: a single green "Save" button aligned right, a quiet "Reset" text button beside it, and a small mono credit "Yapper Indo · v2.0.0".

SCREEN 3 — FAILED POSTS
- Header row: back arrow + "Failed" title, and the count as a big mono number on the RIGHT (not a centered hero card) — restrained, muted red. A thin row of text buttons: Export · Retry all · Clear. Then a list: each row a flat panel with a mono URL (truncated middle), a muted-red one-line reason, and a small grey timestamp. Empty: "No failures. Clean run." left-aligned.

SCREEN 4 — SUCCESS POSTS
- Same skeleton, muted-green count number top-right. Text buttons: Export · Clear. Each list row: mono URL, "@author" in grey, two tiny outline tags "Liked" / "Replied", and a timestamp. Consistent with Screen 3 exactly.

CONSISTENCY: identical top bar, canvas, panel style, type scale, and the single-accent rule across all four. Screen 1 is the narrow side panel; 2-4 are wider but same language. The whole thing should feel engineered, quiet, and expensive — like a tool a developer would trust.

═══════════════════════════════════════════════
## FOLLOW-UPS (kalau perlu koreksi)
═══════════════════════════════════════════════
- "Too much glow/gradient — flatten it, keep only one soft blue light from the top edge."
- "Reduce to a single accent color; make everything else graphite."
- "Tighten spacing, increase information density, left-align headers."
- "Make screen 1 strictly 420px wide, vertical."
- Arah alternatif kalau mau beda: "cockpit HUD: thin cyan reticle lines + gauge readouts" · "developer terminal: mono everywhere, green-on-black feed."

═══════════════════════════════════════════════
## CATATAN INTEGRASI (jangan ganti ID ini pas export)
═══════════════════════════════════════════════
Main: urls, saveUrlsBtn, startBtn, stopBtn, settingsBtn, viewFailedBtn, viewSuccessBtn, aiSwitcher, aiProviderSwitch, switchAIBtn, currentModelDisplay, progressSection, progressText, statusText, progressFill, logContainer, clearLogBtn
Settings: licenseKey, validateKeyBtn, keyStatus, aiProvider(radio), groqApiKey, geminiApiKey, openrouterApiKey, openrouterModel, groqKeySection, geminiKeySection, openrouterKeySection, toggleGroqKey, toggleGeminiKey, toggleOpenRouterKey, promptTemplate, enableLike, enableComment, skipAlreadyCommented, windowMode, likeToCommentMin, likeToCommentMax, delayMin, delayMax, saveBtn, resetBtn, saveMessage
Failed: backBtn, exportBtn, retryAllBtn, clearAllBtn, failedCount, failedList
Success: backBtn, exportBtn, clearAllBtn, successCount, successList

Kirim HTML/CSS hasil Stitch ke gw kalau ID-nya beda — gw re-map biar fungsi tetap jalan.
