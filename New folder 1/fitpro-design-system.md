# FITpro Design System — Implementation Guidelines

## 0. Design Intent (one sentence)
Give developers token-driven, state-complete UI rules for FITpro's mobile app surface so every button, link, list, input, and nav element ships accessible and visually consistent without local exceptions.

---

## 1. Context and Goals

- **Product**: FITpro — AI Workout & Budget Diet Planner
- **Reference source**: Fitness & Nutrition Mobile App UI (Behance) — token set adopted as the current source of truth for this revision
- **Product surface**: Mobile app UI (not e-commerce — corrected from the source brief's low-confidence label; there is no cart/checkout flow in this product, so storefront patterns are explicitly out of scope)
- **Audience**: Developers and technical teams implementing the FITpro client
- **Component density in scope**: links (161), buttons (119), lists (19), inputs (12), navigation (1)
- **Goal**: Every component below must be implementable from this document alone — no visual judgment calls left to the engineer.

---

## 2. Design Tokens and Foundations

### 2.1 Typography
| Token | Value |
|---|---|
| `font.family.primary` | `acumin-pro` |
| `font.family.stack` | `acumin-pro, Acumin Pro, Helvetica Neue, Helvetica, Arial, sans-serif` |
| `font.size.base` | 12px |
| `font.weight.base` | 400 |
| `font.lineHeight.base` | 15.6px |

**Type scale** — must be used exactly as listed; no intermediate sizes:
| Token | Size | Intended use |
|---|---|---|
| `font.size.xs` | 9px | Timestamps, meta captions |
| `font.size.sm` | 11px | Secondary labels, helper text |
| `font.size.md` | 12px | Body text (default) |
| `font.size.lg` | 13px | Emphasized body / list item titles |
| `font.size.xl` | 14px | Card titles |
| `font.size.2xl` | 15px | Section headers |
| `font.size.3xl` | 16px | Screen titles |
| `font.size.4xl` | 20px | Hero / display numbers (e.g. calorie totals) |

### 2.2 Color (semantic tokens only — raw hex must never appear in component code)
| Token | Value | Usage |
|---|---|---|
| `color.text.primary` | `#191919` | Primary text on light/muted surfaces |
| `color.text.secondary` | `#ffffff` | Text on dark/base surfaces |
| `color.text.tertiary` | `#0057ff` | Links, active/selected state text |
| `color.text.inverse` | `#707070` | Disabled/placeholder text |
| `color.surface.base` | `#000000` | App background |
| `color.surface.muted` | `#e8e8e8` | Cards, list rows, input backgrounds |

**Contrast note (must):** `color.text.inverse` (#707070) on `color.surface.muted` (#e8e8e8) is **2.9:1** — fails AA for body text. It must be restricted to non-essential decorative text only (e.g. disabled-state labels ≥18px/bold, which need 3:1 and still pass at 2.9:1... it does not). Practical rule: **never use `color.text.inverse` for any text under 14px or any text conveying required information.** Use `color.text.primary` at reduced opacity (≥60%) with a verified contrast check instead, or add a `color.text.disabled` token pinned to a value that clears 4.5:1 against its surface before shipping.

### 2.3 Spacing
`space.1=1px, space.2=2px, space.3=2.75px, space.4=3px, space.5=4px, space.6=5px, space.7=7px, space.8=7.5px`

These are **micro-adjustment tokens**, not layout tokens — they must be used for icon/glyph alignment and hairline gaps only. Any layout gap must use a multiple of `space.7` (7px) as the base unit (7 / 14 / 21 / 28px) to avoid the sub-pixel drift these fractional values introduce at scale. Teams should not invent new spacing values between these; if a design calls for something the scale doesn't cover, round to the nearest token rather than shipping a one-off.

### 2.4 Radius, Shadow, Motion
| Token | Value |
|---|---|
| `radius.xs` | 6px — standard cards, inputs |
| `radius.sm` | 50px — pill buttons |
| `radius.md` | 100px — circular avatars, icon buttons |
| `shadow.1` | `rgba(25,25,25,0.16) 0px 3px 6px 0px` — raised cards |
| `motion.duration.instant` | 200ms — micro-interactions (press, toggle) |
| `motion.duration.fast` | 300ms — panel/sheet transitions |

---

## 3. Component-Level Rules

### 3.1 Buttons (119 instances in scope)
**Anatomy**: container → optional leading icon → label → optional trailing icon.
**Variants**: primary (filled, `color.text.tertiary` as background), secondary (outline, 1px `color.text.tertiary` border), destructive (reserved semantic red, not in current palette — must be added before any destructive action ships), icon-only (circular, `radius.md`).

**States (all seven required, no exceptions):**
| State | Rule |
|---|---|
| Default | Background per variant; label uses `color.text.secondary` on filled, `color.text.tertiary` on outline. |
| Hover | Background darkens 8%; pointer only — must not fire on touch. |
| Focus-visible | 2px solid outline in `color.text.tertiary`, 2px offset from container edge. Must be visible against `color.surface.base` and `color.surface.muted` alike — verify both. |
| Active/pressed | Scale transform to 0.97, `motion.duration.instant`. Must trigger identically on pointer and touch. |
| Disabled | Opacity 40%, no shadow, `pointer-events: none`. Must still be announced to screen readers as disabled, not omitted. |
| Loading | Label replaced by spinner at fixed button width (no layout shift); button must remain focusable but non-actionable. |
| Error | 1px border in error color (pending palette addition) + inline error text below, not color alone — must not rely on color as the sole error signal (WCAG 1.4.1). |

**Keyboard**: `Tab` to focus, `Enter`/`Space` to activate. **Pointer**: single click/tap activates on release, not press-down (allows cancel-by-drag-off). **Touch**: minimum 44×44px hit target regardless of visual size — a pill button rendered at 32px height must still have a 44px tappable area via padding.

**Edge cases**: label text must truncate with ellipsis past 1 line, never wrap to 2 lines inside a button; icon-only buttons must always carry an `aria-label`.

### 3.2 Links (161 instances — the highest-density component; get this one exactly right)
**Anatomy**: inline text or standalone text, `color.text.tertiary`, no default underline (underline on focus/hover only, per current visual style) — **exception**: inline links within paragraph body text must be underlined by default, since color alone (blue-on-white) is not sufficient distinction from surrounding text for colorblind users (WCAG 1.4.1). This is a must, not a style preference.

**States**:
| State | Rule |
|---|---|
| Default | `color.text.tertiary`, underline if inline-in-paragraph |
| Hover | Underline appears (standalone links) or darkens (inline links) |
| Focus-visible | 2px outline offset 2px, same rule as buttons |
| Active | No transform; underline persists |
| Disabled | Rare for links — if a link is not actionable, it must not be styled as a link (remove color/underline entirely, render as plain text) |

**Keyboard**: `Tab` sequence must follow visual/DOM reading order; `Enter` activates. **Touch**: minimum 44×44px tappable region even for small inline links — pad the hit area invisibly if the text itself is smaller. **Edge case**: links wrapping across lines must not have a visible gap in the underline between lines.

### 3.3 Lists (19 instances)
**Anatomy**: list container → row item (leading visual optional, title, secondary text, trailing action/chevron optional).
**States**: default, hover (pointer devices only — subtle `color.surface.muted` background shift), focus-visible (2px outline on the row, not just inner text), active/pressed (background darkens), disabled (opacity 40%, non-interactive), loading (skeleton rows matching final row height — must not use a spinner that changes list height), error (inline row-level error message, not a toast, when a row's data fails to load).

**Empty state (must specify — lists must never render blank)**: title + one-line explanation + primary action if applicable (e.g. "No workouts logged yet — Log your first workout").
**Long content**: row titles truncate at 1 line with ellipsis; secondary text may wrap to 2 lines max, then truncate.
**Keyboard**: arrow keys should move focus between rows within a list (should, not must — acceptable to fall back to standard Tab order if arrow-key nav isn't implemented, but Tab order must still be logical). **Touch**: full row is the tap target, not just the title text.

### 3.4 Inputs (12 instances)
**Anatomy**: label → input field → helper/error text → optional leading/trailing icon.
**States**:
| State | Rule |
|---|---|
| Default | 1px border `color.text.inverse`, background `color.surface.muted`, radius `radius.xs` |
| Hover | Border darkens to `color.text.primary` |
| Focus-visible | Border switches to `color.text.tertiary`, 2px, plus the same 2px offset outline as other components — do not rely on border-color change alone as the only focus signal |
| Active (typing) | Same as focus |
| Disabled | Opacity 40%, background flattened, `aria-disabled="true"` |
| Loading | Trailing inline spinner replacing trailing icon; label and value remain visible |
| Error | Border in error color + icon + text message below field; must be announced via `aria-describedby`, not visual-only |

**Keyboard**: full field must be reachable and editable via keyboard alone, including any inline "clear" button (Tab-reachable, `Enter`/`Space` to clear). **Pointer/touch**: tapping anywhere in the field (not just the text baseline) must focus it; minimum touch height 44px even if visual height is smaller.
**Edge cases**: placeholder text must never be the only label (labels are always persistent, not placeholder-only) — this is required for AA 1.3.1 (info and relationships) and for users who rely on autofill.

### 3.5 Navigation (1 instance — low count means this is a single global pattern, treat it as maximally stable)
**Anatomy**: tab bar or bottom nav — icon + label per destination, active-state indicator.
**States**: default, focus-visible (visible ring on the tab, not just color shift), active/selected (icon + label switch to `color.text.tertiary`, indicator bar/dot appears), disabled (rare — a nav destination should not be disabled; if a section is unavailable, remove it rather than disabling the tab).
**Keyboard**: arrow-key or Tab traversal across destinations must be possible for any keyboard-connected device (tablets with keyboards, accessibility switches). **Touch**: each destination must be an independent 44×44px minimum target with no dead zones between adjacent tabs.
**Edge case**: if a destination has a live badge/count, it must be exposed to assistive tech via `aria-label` (e.g. "Meals, 3 unread"), not conveyed by the badge's visual presence alone.

---

## 4. Accessibility Requirements — Testable Acceptance Criteria

| Criterion | Pass condition | Test method |
|---|---|---|
| Text contrast | ≥4.5:1 for body/label text, ≥3:1 for large text (≥18px or ≥14px bold) | Automated contrast checker on every text/surface token pair actually used |
| Focus visibility | Every interactive element shows a 2px outline with 2px offset on keyboard focus | Tab through every screen; zero elements should be reachable without a visible indicator |
| Touch target size | ≥44×44px regardless of visual size | Inspect computed hit-area, not visual bounding box |
| Color-independence | No state or meaning conveyed by color alone (errors, links, active nav) | Grayscale screenshot test — meaning must still be legible |
| Disabled state exposure | `aria-disabled` or native `disabled` present on every disabled control | Screen reader pass (VoiceOver/TalkBack) on each component variant |
| Empty/loading state parity | Every list/data component has a defined empty state and non-layout-shifting loading state | Manual QA against Section 3.3/3.4 specs |
| Label persistence | No input relies on placeholder-as-label | Static audit of all 12 input instances |

---

## 5. Content and Tone Standards

Tone: concise, confident, implementation-focused — no filler adjectives in UI copy.

- **Good**: "Log workout" / "Add ingredient" / "No meals logged yet"
- **Bad (ambiguous, must not ship)**: "Click here" / "Submit" (submit what?) / "Oops!" (as an error message with no next step)
- Error messages must state what happened and what to do: "Couldn't save this meal — check your connection and try again," not "Something went wrong."

---

## 6. Anti-Patterns and Prohibited Implementations

- **Must not** use raw hex codes in component markup — always the semantic token.
- **Must not** style a non-interactive element to look like a link or button (creates false affordance).
- **Must not** use `color.text.inverse` for any text carrying required information (see §2.2).
- **Must not** introduce one-off spacing values outside the `space.*` scale.
- **Must not** rely on placeholder text as the only input label.
- **Must not** convey error, active, or disabled state through color alone.
- **Must not** ship a list, input, or nav component without all seven states defined in Section 3.
- Teams **should** prefer an existing token combination over a new one, even if the existing one is a slightly imperfect visual fit — local exceptions compound into inconsistency faster than they solve one-off problems.

---

## 7. Migration Notes

- Any component currently using `#0057ff`, `#e8e8e8`, `#191919`, `#707000`(sic — verify, no such token exists) etc. as literals must be refactored to the corresponding semantic token before next release.
- The missing **error/destructive color token** flagged in Section 3.1 and 3.4 is a blocking gap — no destructive action (delete workout, remove meal) should ship until this token exists and is contrast-verified.

---

## 8. QA Checklist

- [ ] All color usage in component code references semantic tokens, zero raw hex.
- [ ] All 119 button instances expose default/hover/focus-visible/active/disabled/loading/error states.
- [ ] All 161 link instances: inline links are underlined by default; standalone links pass color-independence check.
- [ ] All 19 list instances have a defined empty state and non-shifting loading skeleton.
- [ ] All 12 input instances use persistent labels, not placeholder-only.
- [ ] The single nav instance is keyboard-traversable and each destination clears 44×44px.
- [ ] Contrast checked for every text/surface pairing actually shipped, including `color.text.inverse`.
- [ ] No destructive action ships without a resolved error/destructive color token.
- [ ] Screen reader pass completed on one representative instance of each component type.
- [ ] Grayscale screenshot review confirms no state is color-only.
