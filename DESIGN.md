---
version: alpha
name: Theme Selection
description: A bright, modern marketplace system for template discovery with playful accents and clean product presentation.
colors:
  primary: "#6E66ED"
  primary-2: "#FCAD32"
  secondary: "#323243"
  tertiary: "#F9F9FB"
  neutral: "#FFFFFF"
  surface: "#F9F9FB"
  on-surface: "#323243"
  muted: "#6E6E85"
  border: "#E5E7EB"
  accent: "#FCAD32"
  success: "#21C56E"
  error: "#FF4D4F"
typography:
  headline-display:
    fontFamily: Outfit
    fontSize: 42px
    fontWeight: 600
    lineHeight: 60px
    letterSpacing: 0.25px
  headline-lg:
    fontFamily: Outfit
    fontSize: 36px
    fontWeight: 600
    lineHeight: 46px
    letterSpacing: 0.25px
  headline-md:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: 600
    lineHeight: 46px
    letterSpacing: 0.25px
  headline-sm:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: 600
    lineHeight: 38px
    letterSpacing: 0.25px
  body-lg:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: 300
    lineHeight: 27px
    letterSpacing: 0.25px
  body-md:
    fontFamily: Outfit
    fontSize: 16px
    fontWeight: 300
    lineHeight: 24px
    letterSpacing: 0.25px
  body-sm:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: 300
    lineHeight: 21px
    letterSpacing: 0.25px
  label-lg:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: 400
    lineHeight: 27px
    letterSpacing: 0.25px
  label-md:
    fontFamily: Outfit
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0.25px
  label-sm:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: 400
    lineHeight: 21px
    letterSpacing: 0.25px
  overline:
    fontFamily: Outfit
    fontSize: 12px
    fontWeight: 600
    lineHeight: 16px
    letterSpacing: 0.08em
  nav:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
    letterSpacing: 0.02em
rounded:
  none: 0px
  sm: 4px
  md: 6px
  lg: 8px
  xl: 12px
  full: 9999px
spacing:
  xs: 4px
  sm: 12px
  md: 20px
  lg: 28px
  xl: 40px
  gutter: 24px
  section: 80px
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#1F1F2E"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: 11px 24px
    height: 47px
    width: 259px
    note: "Amber (#FCAD32) must pair with near-black text (#1F1F2E) — white text on amber fails WCAG contrast."
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    padding: 11px 24px
    height: 47px
    width: 259px
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.none}"
    padding: 0px
  card:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 16px
  input:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 11px 16px
    height: 47px
  chip:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.primary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 6px 12px
---

# Theme Selection

## Overview
Theme Selection feels like a cheerful, polished marketplace for developers and product teams. The visual tone is light and spacious, with strong white space, colorful accent moments, and a slightly playful personality balanced by clean structure. It reads as professional and modern rather than corporate or dense.

## Colors
- **Primary (#6E66ED):** A vivid violet used for brand links, secondary actions, and emphasis in the navigation and product badges.
- **Accent (#FCAD32):** A warm amber that acts as the signature call-to-action color for featured offers and primary buttons.
- **Secondary (#323243):** A deep graphite for main text, navigation, and strong contrast on light surfaces.
- **Tertiary (#F9F9FB):** A very light cool gray used as the page and card background to keep the interface soft and airy.
- **Neutral (#FFFFFF):** Pure white for surfaces, cards, and input fields where maximum clarity is needed.
- **On-surface (#323243):** The default readable text color on light backgrounds.
- **Muted (#6E6E85):** A softened gray-violet for supporting copy, metadata, and less prominent UI labels.
- **Border (#E5E7EB):** A quiet neutral border that separates cards and inputs without adding visual heaviness.
- **Success (#21C56E):** A lively green for positive or success states when needed.
- **Error (#FF4D4F):** A clear red for errors and destructive feedback.

## Typography
Outfit is the dominant typeface across the site, giving the UI a rounded, contemporary, slightly friendly character. Headlines use semi-bold weights with compact letter spacing and generous line heights; body text uses regular (400) weight for readability — light (300) is reserved for large display sizes only. Navigation and labels lean on medium to semi-bold weights for clarity, while small-caps style overline text can use increased letter spacing for promotional tags and micro-navigation.

## Layout
The page uses a wide, centered container with generous horizontal breathing room and a clear hero-to-catalog progression. Spacing follows a steady rhythm based on 4px, 12px, 20px, 28px, and 40px increments, with larger section gaps to preserve the spacious marketplace feel. Cards, search fields, and feature blocks are padded conservatively so content stays prominent without crowding, and the overall system favors a fluid desktop grid with strong alignment rather than dense modular packing.

## Elevation & Depth
Depth is subtle and mostly achieved through soft shadows, thin borders, and layering of colorful artwork rather than heavy elevation. Cards use light borders and minimal shadow so the interface stays crisp and modern. Hero illustrations and featured product tiles rely on tonal contrast and overlap to create hierarchy without making the UI feel bulky.

## Shapes
The shape language is soft but restrained. Interactive controls and cards use small radii in the 6px to 8px range, which keeps the system approachable while still looking precise. Full pills are reserved for chips, offer badges, and tag-like elements, reinforcing the friendly ecommerce feel.

## Components
Buttons are the clearest example of the system’s hierarchy. `button-primary` is an amber filled button with near-black text (#1F1F2E — white on amber fails contrast), a 6px radius, and compact vertical padding; it is used for strongest conversion actions. `button-secondary` keeps the same sizing but switches to transparent background with violet text and border for lower-emphasis actions. `button-tertiary` is text-only and should be used sparingly for inline links or subtle navigation actions. Button states should stay simple: a color shift, not a dramatic animation.

Cards use white or near-white backgrounds, a 1px neutral border, and modest padding. `card` should frame product previews, feature modules, and content summaries without competing with the content inside. Keep shadows minimal or absent unless a card needs to rise above a busy background.

Inputs are understated and functional. `input` should remain white, softly bordered, and about 47px tall, with enough padding for a search icon or inline affordance. Focus states should rely on border or accent color changes rather than heavy glow. The search field in the hero is a good benchmark for spacing and proportion.

Chips and badges should be pill-shaped and compact. `chip` works well for category tags, bundle labels, and status markers using a light tinted background with violet text. Use these sparingly so the interface stays clean.

Navigation items should feel lightweight and readable, using the nav typography token with moderate weight and minimal decoration. Active or emphasized items may use the primary violet or the accent amber, but the nav should avoid loud fills. Icons should be simple, monochrome or brand-colored, and sized to support the label rather than dominate it.

## Do's and Don'ts
- Do keep the interface bright, spacious, and easy to scan.
- Do use Outfit consistently for headlines, body copy, labels, and navigation.
- Do reserve the amber accent for primary conversion moments and featured promotions.
- Do use violet as the primary brand-supporting color for links and secondary emphasis.
- Do keep shadows soft and borders thin so the UI feels modern and airy.
- Don't introduce heavy dark surfaces or high-contrast gradients outside of the hero art.
- Don't over-round cards or buttons; the system depends on subtle radii, not a bubbly aesthetic.
- Don't make secondary actions compete visually with the amber primary button.