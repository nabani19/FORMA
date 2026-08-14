# NutriScan Design System — Unified Implementation Guidelines

## 0. Design Intent (one sentence)
Give developers a token-driven, state-complete, accessibility-first UI system for NutriScan's mobile app so every button, link, list, input, card, and nav element ships consistent, accessible, and visually polished without local exceptions.

---

## 1. Context and Goals

- **Product**: NutriScan — AI Food Scanner & Nutrition Coach
- **Reference sources**: 
  - FITpro Design System (token architecture, state definitions, accessibility framework)
  - AI Food Scanner Design Brief (color palette, component specs, user journeys)
  - AI Fitness App by Adom Shafi on Dribbble (dashboard patterns, spacing scale)
  - Rift — AI Fitness & Wellness Mobile App (typography scale, motion tokens)
- **Product surface**: Mobile & Web App UI (iOS & Android)
- **Audience**: Developers and technical teams implementing the NutriScan client
- **Component density in scope**: links (~160), buttons (~120), lists (~20), inputs (~15), cards (~12), navigation (1)
- **Goal**: Every component below must be implementable from this document alone — no visual judgment calls left to the engineer.

---

## 2. Design Tokens and Foundations

### 2.1 Typography
| Token | Value |
|---|---|
| `font.family.heading` | `Montserrat` |
| `font.family.body` | `Open Sans` |
| `font.family.stack.heading` | `Montserrat, Helvetica Neue, Helvetica, Arial, sans-serif` |
| `font.family.stack.body` | `Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif` |
| `font.size.base` | 14px |
| `font.weight.base` | 400 |
| `font.lineHeight.base` | 22.4px (1.6×) |

**Type scale** — must be used exactly as listed; no intermediate sizes:
| Token | Size | Weight | Line Height | Font Family | Intended use |
|---|---|---|---|---|---|
| `font.size.xs` | 11px | 400 | 15.4px | Open Sans | Timestamps, meta captions, badges |
| `font.size.sm` | 12px | 400 | 16.8px | Open Sans | Secondary labels, helper text, placeholders |
| `font.size.md` | 14px | 400 | 22.4px | Open Sans | Body text (default) |
| `font.size.lg` | 16px | 600 | 24px | Open Sans | Emphasized body, nutritional values |
| `font.size.xl` | 18px | 600 | 27px | Montserrat | Card titles, section headers |
| `font.size.2xl` | 22px | 600 | 30.8px | Montserrat | Screen subtitles |
| `font.size.3xl` | 28px | 700 | 36.4px | Montserrat | Screen titles |
| `font.size.4xl` | 36px | 700 | 43.2px | Montserrat | Hero numbers (calorie totals, streak counts) |

### 2.2 Color (semantic tokens)

| Token | Value | Usage |
|---|---|---|
| `color.primary` | `#4CAF50` | Primary actions, success states, active nav, focus rings |
| `color.primary.hover` | `#43A047` | Primary button hover, active link |
| `color.primary.pressed` | `#388E3C` | Primary button pressed state |
| `color.secondary` | `#2196F3` | Secondary actions, informational elements, links |
| `color.secondary.hover` | `#1E88E5` | Secondary button hover |
| `color.accent` | `#FF9800` | Call-to-action highlights, warnings, badges |
| `color.accent.hover` | `#F57C00` | Accent button hover |
| `color.destructive` | `#E53935` | Delete, remove, error actions |
| `color.destructive.hover` | `#C62828` | Destructive button hover |
| `color.text.primary` | `#424242` | Primary text on light surfaces |
| `color.text.secondary` | `#757575` | Secondary text, icons, placeholders |
| `color.text.tertiary` | `#2196F3` | Links, active/selected state text |
| `color.text.inverse` | `#FFFFFF` | Text on dark/colored surfaces |
| `color.text.disabled` | `#9E9E9E` | Disabled text |
| `color.surface.base` | `#FFFFFF` | App background, card backgrounds |
| `color.surface.muted` | `#F5F5F5` | Input backgrounds, list row hover, subtle sections |
| `color.surface.strong` | `#E0E0E0` | Borders, dividers, disabled backgrounds |
| `color.surface.dark` | `#424242` | Dark mode surfaces, overlay backgrounds |
| `color.border.default` | `#E0E0E0` | Default borders |
| `color.border.focus` | `#4CAF50` | Focused input borders |
| `color.border.error` | `#E53935` | Error state borders |

### 2.3 Spacing
| Token | Value | Usage |
|---|---|---|
| `space.1` | 4px | Hairline gaps, icon padding |
| `space.2` | 8px | Tight internal padding, icon-to-label gap |
| `space.3` | 12px | Default internal padding, card padding |
| `space.4` | 16px | Section padding, list row padding |
| `space.5` | 20px | Card external margin, section gaps |
| `space.6` | 24px | Screen edge padding, large gaps |
| `space.7` | 32px | Major section separators |
| `space.8` | 48px | Hero spacing, onboarding gaps |

### 2.4 Radius, Shadow, Motion
| Token | Value |
|---|---|
| `radius.xs` | 4px — small tags, badges |
| `radius.sm` | 8px — standard cards, inputs, buttons |
| `radius.md` | 12px — large cards, modals |
| `radius.lg` | 50px — pill buttons, chips |
| `radius.xl` | 100px — circular avatars, icon buttons |
| `shadow.1` | `0px 1px 3px rgba(0, 0, 0, 0.08)` — subtle cards |
| `shadow.2` | `0px 2px 8px rgba(0, 0, 0, 0.12)` — elevated cards |
| `shadow.3` | `0px 4px 16px rgba(0, 0, 0, 0.16)` — modals, bottom sheets |
