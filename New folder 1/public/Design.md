# NutriScan Design System — Unified Implementation Guidelines

## 0. Design Intent (one sentence)
Give developers a token-driven, state-complete, accessibility-first UI system for NutriScan's mobile app so every button, link, list, input, card, and nav element ships consistent, accessible, and visually polished without local exceptions.

---

## 1. Context and Goals

- **Product**: NutriScan — AI Food Scanner & Nutrition Coach
- **Product surface**: Mobile & Web App UI (iOS & Android)
- **Goal**: Every component below must be implementable from this document alone — no visual judgment calls left to the engineer.

---

## 2. Design Tokens and Foundations

### 2.1 Typography
| Token | Value |
|---|---|
| `font.family.heading` | `Montserrat` |
| `font.family.body` | `Open Sans` |
| `font.size.base` | 14px |
| `font.weight.base` | 400 |

### 2.2 Color Tokens
| Token | Value | Usage |
|---|---|---|
| `color.primary` | `#4CAF50` | Primary actions, success states |
| `color.secondary` | `#2196F3` | Secondary actions, info links |
| `color.accent` | `#FF9800` | Call-to-action highlights, warnings |
| `color.destructive` | `#E53935` | Delete, remove, error actions |
| `color.text.primary` | `#424242` | Primary text on light surfaces |
| `color.text.secondary` | `#757575` | Secondary text, icons |
| `color.surface.base` | `#FFFFFF` | App background, card backgrounds |
| `color.surface.muted` | `#F5F5F5` | Input backgrounds |
| `color.border.default` | `#E0E0E0` | Default borders |

### 2.3 Spacing Scale
Multiples of 8px (`space.1`=4px, `space.2`=8px, `space.3`=12px, `space.4`=16px, `space.5`=20px, `space.6`=24px, `space.7`=32px, `space.8`=48px).
