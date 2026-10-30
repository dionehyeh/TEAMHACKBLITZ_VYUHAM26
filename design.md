---
name: "Minto Design System"
description: "Tactile web3 infrastructure design system featuring clean minimalism, mechanical hardware aesthetics, and high-contrast mint-green action points."
colors:
  primary: "#74D96F"
  primary-bright: "#9DFF9B"
  primary-deep: "#56BE51"
  primary-hover: "#62CE5C"
  accent-coral: "#F09363"
  accent-coral-deep: "#ED6B2D"
  accent-blue: "#75A0C9"
  accent-blue-light: "#85B1D4"
  neutral-text-primary: "#262626"
  neutral-text-secondary: "#666666"
  neutral-text-tertiary: "#9E9E9E"
  neutral-stroke: "#BEBEBE"
  neutral-stroke-light: "#D0D0D0"
  surface-canvas: "#FFFFFF"
  surface-card: "#EDEDED"
  surface-card-subtle: "#F5F5F5"
  surface-hardware: "#FAFAFA"
  surface-dark: "#1F1F1F"
typography:
  display:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "-0.005em"
  label:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "20px"
  xl: "32px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-text-primary}"
    rounded: "{rounded.full}"
    padding: "14px 28px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.neutral-text-primary}"
    rounded: "{rounded.full}"
    padding: "14px 28px"
  button-secondary-hover:
    backgroundColor: "{colors.neutral-stroke-light}"
  card-hero:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.xl}"
    padding: "48px"
---

# Minto Design System

## Overview

The **Minto** design language bridges cutting-edge Web3 infrastructure with tactile, nostalgic industrial hardware design. It rejects the dark, neon-soaked cyberpunk cliches in favor of an airy, high-clarity **Tactile Minimalist** aesthetic:

- **Canvas & Tone**: Pure, luminous white canvas (`#FFFFFF`) balanced with soothing architectural gray card containers (`#EDEDED`).
- **Signature Action Accent**: Fresh organic Spring Mint (`#74D96F`) and high-luminance Mint Highlight (`#9DFF9B`), communicating instant throughput, speed, and vitality.
- **Neo-Analogue Hardware Metaphor**: Clean mechanical keyboard switchgear, tactile keycaps with extrusion shadows, precision rotary encoders, and retro LED status/VU telemetry strips.
- **High Typography Contrast**: Bold, tightly kerned deep carbon (`#262626`) headlines paired with neutral slate (`#666666`) technical descriptions.

---

## Colors

### Color Extraction & Palette Matrix

All colors have been mathematically sampled and grouped from the interface mockup:

| Token | Hex | RGB | HSL | Role & Usage |
|---|---|---|---|---|
| `colors.primary` | `#74D96F` | `116, 217, 111` | `117°, 60%, 64%` | **Primary CTA Button** ("Connect Wallet"), active status points, brand mark. |
| `colors.primary-bright` | `#9DFF9B` | `157, 255, 155` | `119°, 100%, 80%` | **Tactile Keycap Face** ("Learn More"), illuminated active indicators, top-light highlight. |
| `colors.primary-deep` | `#56BE51` | `86, 190, 81` | `117°, 45%, 53%` | **Isometric Keycap Extrusion / Depth**, button active state, border accents. |
| `colors.accent-coral` | `#F09363` | `240, 147, 99` | `20°, 83%, 66%` | **Floating Tile 3D Side**, secondary telemetry alerts, warm token indicator. |
| `colors.accent-coral-deep` | `#ED6B2D` | `237, 107, 45` | `19°, 84%, 55%` | **Knob Position Tick**, VU meter peak LED, urgent hardware indicators. |
| `colors.accent-blue` | `#75A0C9` | `117, 160, 201` | `209°, 45%, 62%` | **Interactive Selection Frame**, bounding box anchors, precision alignment guidelines. |
| `colors.accent-blue-light` | `#85B1D4` | `133, 177, 212` | `207°, 50%, 68%` | **Selection Corner Handles**, focus rings, hover guideline accents. |
| `colors.neutral-text-primary` | `#262626` | `38, 38, 38` | `0°, 0%, 15%` | **Headlines**, logo wordmark ("Minto"), mechanical chassis line art, keycap legends. |
| `colors.neutral-text-secondary` | `#666666` | `102, 102, 102` | `0°, 0%, 40%` | **Subtitle Descriptions**, secondary key labels, inactive telemetry notations. |
| `colors.neutral-stroke` | `#BEBEBE` | `190, 190, 190` | `0°, 0%, 75%` | **Hardware Outlines**, keycap dividers, inactive key shadows, coiled USB-C cable. |
| `colors.surface-canvas` | `#FFFFFF` | `255, 255, 255` | `0°, 0%, 100%` | **Global Page Canvas**, keycap top faces, clean negative space. |
| `colors.surface-card` | `#EDEDED` | `237, 237, 237` | `0°, 0%, 93%` | **Hero Graphic Backdrop Card**, secondary button background, recessed chassis trays. |
| `colors.surface-dark` | `#1F1F1F` | `31, 31, 31` | `0°, 0%, 12%` | **Status Bezel / LED Panel**, telemetry display strip screen background. |

### Semantic Role Assignment

```css
:root {
  /* Brand & Actions */
  --color-brand-primary: #74D96F;
  --color-brand-primary-bright: #9DFF9B;
  --color-brand-primary-deep: #56BE51;
  --color-brand-coral: #F09363;
  --color-brand-orange: #ED6B2D;
  --color-brand-blue: #75A0C9;

  /* Neutrals & Typography */
  --text-main: #262626;
  --text-muted: #666666;
  --border-hardware: #BEBEBE;
  --border-subtle: #EDEDED;

  /* Surfaces */
  --bg-canvas: #FFFFFF;
  --bg-card: #EDEDED;
  --bg-display: #1F1F1F;
}
```

### Accessibility & Contrast Compliance

- **Primary Action Contrast**: Black text (`#262626`) on Primary Mint (`#74D96F`) yields a contrast ratio of **9.8:1**, far exceeding the **WCAG AAA** standard (7.0:1) for normal text.
- **Secondary Action Contrast**: Black text (`#262626`) on Secondary Gray (`#EDEDED`) yields a contrast ratio of **11.2:1** (**WCAG AAA** compliant).
- **Headline Contrast**: `#262626` on `#FFFFFF` yields **15.4:1** (**WCAG AAA** compliant).
- **Body Copy Contrast**: `#666666` on `#FFFFFF` yields **5.7:1** (**WCAG AA** compliant).

---

## Typography

The typography is built around a modern, neo-grotesque sans-serif typeface (such as **Inter**, **Geist**, or system UI fonts), tuned for geometric precision and technical rhythm.

### Typographic Hierarchy

1. **Display / Hero Headline**
   - **Size**: `3.75rem` (60px) – `4.5rem` (72px)
   - **Weight**: `800` (ExtraBold)
   - **Line Height**: `1.08`
   - **Letter Spacing**: `-0.03em`
   - **Color**: `#262626`
   - **Specimen**: `"One click. Zero friction."`

2. **Headline / Section Titles**
   - **Size**: `2.25rem` (36px) – `2.75rem` (44px)
   - **Weight**: `700` (Bold)
   - **Line Height**: `1.15`
   - **Letter Spacing**: `-0.02em`
   - **Color**: `#262626`

3. **Subtitle / Lead Paragraph**
   - **Size**: `1.125rem` (18px) – `1.25rem` (20px)
   - **Weight**: `400` (Regular) / `500` (Medium)
   - **Line Height**: `1.55`
   - **Letter Spacing**: `-0.01em`
   - **Color**: `#666666`
   - **Specimen**: `"Instant wallet connections, real-time status, and infrastructure built for scale."`

4. **Action / Button Labels**
   - **Size**: `0.9375rem` (15px) – `1rem` (16px)
   - **Weight**: `600` (SemiBold)
   - **Line Height**: `1.0`
   - **Letter Spacing**: `-0.005em`
   - **Color**: `#262626`

5. **Hardware Legends & Mono Badges**
   - **Font**: Monospace / Geometric Sans
   - **Size**: `0.75rem` (12px) – `0.875rem` (14px)
   - **Weight**: `600` / `700`
   - **Transform**: Uppercase
   - **Letter Spacing**: `0.05em`
   - **Specimen**: `"S T A R T"`, `"CONNECT"`, `"LEARN MORE"`

---

## Layout

### Spatial Philosophy

The layout prioritizes asymmetry, whitespace balance, and framed technical focal points:

- **Two-Column Asymmetrical Hero**:
  - **Left Column (45% - 50% width)**: Content stack comprising brand mark, bold value proposition headline, descriptive body, and paired CTA buttons.
  - **Right Column (50% - 55% width)**: Framed container with large radius (`32px` - `40px`) in `#EDEDED`, displaying the 3D isometric hardware asset.
- **Max Container Width**: `1280px` centered with responsive horizontal gutters (`24px` mobile, `48px` tablet, `64px` desktop).
- **Vertical Flow**: Generous spacing (`64px` - `96px` sections) ensuring that the hardware illustration and copy breathe.

### Grid & Spacing System

- Base unit: **8px**
- Spacing scale:
  - `space-xs`: `4px` (micro-alignments, tag padding)
  - `space-sm`: `8px` (button icon gaps, label margins)
  - `space-md`: `16px` (CTA button gaps, input padding)
  - `space-lg`: `24px` (stack element spacing)
  - `space-xl`: `32px` (headline-to-body margin)
  - `space-2xl`: `48px` (hero card padding)
  - `space-3xl`: `64px` - `96px` (section separators)

---

## Elevation & Depth

Rather than relying on generic fuzzy Gaussian shadows, Minto uses **Tactile Layered Depth** rooted in mechanical illustration and clear tonal contrast:

1. **Surface Separation (Tonal Elevation)**:
   - Level 0: Global Canvas (`#FFFFFF`)
   - Level 1: Inset Surface Card (`#EDEDED`)
   - Level 2: Hardware Chassis & Keycaps (`#FFFFFF` with `#BEBEBE` / `#262626` contour lines)
   - Level 3: Floating Interactive Asset with blue selection bounds (`#75A0C9`)

2. **Isometric 3D Extrusion Shadows**:
   - Keycaps feature a dual-tone isometric bevel:
     - Top illuminated surface: `#9DFF9B` (primary key) or `#FFFFFF` (standard keys)
     - Extruded shadow face: `#56BE51` (primary key depth) or `#BEBEBE` (standard key depth)
     - Offset angle: 30° isometric downward projection.

3. **Subtle Button Lift**:
   - `box-shadow: 0 4px 14px -2px rgba(116, 217, 111, 0.35)` on primary button hover to impart tactile feedback.

---

## Shapes

Minto combines organic capsule curves with architectural pill enclosures:

- **Capsule / Pill (`rounded-full: 9999px`)**:
  - Primary button ("Connect Wallet")
  - Secondary button ("Watch Demo")
  - Status chips and filter pills
- **Architectural Container Radius (`rounded-xl: 32px - 40px`)**:
  - Right-hand hero background surface card
  - Feature showcase panels
- **Tactile Keycap Radius (`rounded-md: 10px - 14px`)**:
  - Isometric keyboard keys
  - App icon squircle tiles
- **Selection Anchors (`rounded-xs: 2px - 4px`)**:
  - Precise 6px × 6px technical resize handles on selection bounding boxes

---

## Components

### 1. Primary CTA Button ("Connect Wallet")

```css
.btn-minto-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #74D96F;
  color: #262626;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 600;
  padding: 14px 28px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: transform 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
}

.btn-minto-primary:hover {
  background-color: #62CE5C;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px -4px rgba(116, 217, 111, 0.45);
}

.btn-minto-primary:active {
  transform: translateY(1px);
  background-color: #56BE51;
}
```

### 2. Secondary CTA Button ("Watch Demo")

```css
.btn-minto-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #EDEDED;
  color: #262626;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 600;
  padding: 14px 28px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.15s ease;
}

.btn-minto-secondary:hover {
  background-color: #E2E2E2;
  transform: translateY(-1px);
}

.btn-minto-secondary:active {
  background-color: #D6D6D6;
  transform: translateY(0);
}
```

### 3. Hero Visual Container

```css
.hero-visual-card {
  background-color: #EDEDED;
  border-radius: 36px;
  padding: 48px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 480px;
}
```

### 4. Interactive Selection Frame & Asset

```css
.selection-frame {
  border: 1.5px solid #75A0C9;
  position: relative;
}

.selection-handle {
  width: 6px;
  height: 6px;
  background-color: #FFFFFF;
  border: 1.5px solid #75A0C9;
  position: absolute;
}
```

### 5. Status / Telemetry LED Strip

- **Bezel Background**: `#1F1F1F`
- **Inactive Segments**: `rgba(255, 255, 255, 0.08)`
- **Normal Telemetry**: `#74D96F` / `#9DFF9B`
- **Warning / Medium Load**: `#F09363`
- **Peak / Alert Load**: `#ED6B2D`

---

## Do's and Don'ts

### Do
- **Do** maintain crisp, clean white background space (`#FFFFFF`) to let the mint-green and hardware accents shine.
- **Do** use dark carbon `#262626` for text on top of `#74D96F` buttons to guarantee maximum readability and punch.
- **Do** frame complex illustrations and interactive showcases inside soft `#EDEDED` rounded cards.
- **Do** use full pill radii (`9999px`) on call-to-action buttons.
- **Do** pair the energetic spring mint with tactile mechanical elements (isometric keycaps, dials, LED bars).

### Don't
- **Don't** use white text on the `#74D96F` mint button; it degrades contrast and breaks the brand identity.
- **Don't** substitute dark heavy drop shadows for clean tonal layering and isometric bevels.
- **Don't** clutter the canvas with dark gradients or saturated neon backgrounds.
- **Don't** use sharp rectangular corners for action buttons; keep all buttons pill-shaped.
- **Don't** use generic saturated reds or primary blues; use the curated coral `#F09363` and blueprint blue `#75A0C9`.
