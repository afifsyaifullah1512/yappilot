---
name: YapPilot Orbital
colors:
  surface: '#10131a'
  surface-dim: '#10131a'
  surface-bright: '#363940'
  surface-container-lowest: '#0b0e14'
  surface-container-low: '#191c22'
  surface-container: '#1d2026'
  surface-container-high: '#272a31'
  surface-container-highest: '#32353c'
  on-surface: '#e1e2eb'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#e1e2eb'
  inverse-on-surface: '#2e3037'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb3ad'
  on-tertiary: '#68000a'
  tertiary-container: '#ff5451'
  on-tertiary-container: '#5c0008'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#10131a'
  on-background: '#e1e2eb'
  surface-variant: '#32353c'
typography:
  h1:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono:
    fontFamily: jetbrainsMono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  panel-width: 420px
  edge-margin: 16px
  stack-gap: 12px
  item-padding: 8px 12px
---

## Brand & Style

The design system is engineered for a high-performance, futuristic Chrome extension interface. It targets power users who value speed, precision, and a "command center" aesthetic.

The style is a refined blend of **Modern Corporate** and **Glassmorphism**. It leverages deep obsidian surfaces, subtle translucency, and high-frequency accents to create a sense of depth and technical sophistication. The UI should feel like a premium heads-up display (HUD) that sits seamlessly over the browser content without feeling heavy or intrusive.

## Colors

The palette is anchored in a deep charcoal-navy (`#0B0E14`) to provide a low-strain reading environment. 

- **Primary (Electric Blue):** Used for primary actions, focus states, and active indicators.
- **Success/Danger:** Reserved for status badges and destructive actions.
- **Glass Surfaces:** Backgrounds use a semi-transparent hex-alpha to allow browser content to subtly bleed through, creating the "orbital" effect.
- **Borders:** Instead of solid grays, use low-opacity white overlays to define edges, mimicking light hitting a glass pane.

## Typography

This design system uses **Inter** for all functional UI elements to ensure maximum legibility at small sizes. **JetBrains Mono** is introduced for technical data strings or keyboard shortcuts.

- **Scale:** Given the 420px width constraint, typography is tightly scaled. Headers rarely exceed 20px.
- **Contrast:** Use white (`#FFFFFF`) for primary text and a muted gray-blue (`#94A3B8`) for secondary descriptions.
- **Tracking:** Headings use slight negative letter-spacing for a "tight" professional look, while labels use expanded tracking for readability.

## Layout & Spacing

The layout is a **fixed-width vertical panel** (420px). It utilizes a single-column flow with nested horizontal components.

- **The 4px Grid:** All margins, paddings, and gaps must be multiples of 4px.
- **Safe Zones:** Keep a consistent 16px padding from the panel edges for all primary content.
- **Stacking:** Vertical sections should be separated by 12px or 16px gaps to maintain distinct functional blocks.

## Elevation & Depth

Depth is achieved through **Backdrop Blurs** and **Inner Glows** rather than traditional heavy drop shadows.

1.  **Base Layer:** Solid `#0B0E14`.
2.  **Surface Layer (Cards/Inputs):** `rgba(255, 255, 255, 0.03)` with a `blur(12px)`.
3.  **Borders:** 1px solid `rgba(255, 255, 255, 0.08)`. For active states, use the primary electric blue at 50% opacity.
4.  **Shadows:** Use a single, very soft ambient shadow: `0 8px 32px rgba(0, 0, 0, 0.4)`.

## Shapes

The shape language is modern and approachable.
- **Containers & Cards:** 12px (Standard) or 16px (Large).
- **Buttons & Inputs:** 8px to maintain a crisp, functional feel within the larger containers.
- **Status Pills:** Fully rounded (pill-shaped).

## Components

### Buttons
- **Primary:** Solid Electric Blue with white text. Apply a subtle top-down gradient (lightest at top) to add a "molded" feel.
- **Ghost:** Transparent background with the 1px white-opacity border. High-light on hover.

### Inputs
- Background: `rgba(0, 0, 0, 0.2)`. 
- Border: 1px solid `rgba(255, 255, 255, 0.1)`.
- Focus: 1px solid Primary Blue with a 2px blue outer glow (30% opacity).

### Cards
- Use for grouping related data. 
- Background: Surface Glass. 
- Border: `border_subtle_hex`.

### Status Badges
- Compact pills using `label-caps` typography.
- Background: 10% opacity of the status color (Blue, Green, or Red).
- Text: 100% opacity of the status color.

### Keyboard Shortcuts (KBD)
- Small, dark containers with `mono` font. 
- Background: `#1E293B`, 4px roundedness, 1px bottom-border for "key" depth.