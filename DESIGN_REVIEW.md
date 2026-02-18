# Design Review — Eisenhower Matrix Plugin (Follow-up)

**Reviewer:** Senior Product Designer
**Date:** 2026-02-16
**Previous review:** 2026-02-14
**Screenshots:** `screenshots/design-review/followup-*.png`

---

## Summary of Changes Since Initial Review

The initial review on 2026-02-14 identified five priority fixes and several systemic issues. Here is what was addressed:

### Fixed (verified in screenshots)

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 1 | Quadrant color opacity too high (0.25/0.38/0.35) | **Fixed** | Body now 0.06, header 0.15, border 0.15. The transformation is dramatic. Compare `desktop-empty.png` (old: saturated color wash) to `followup-desktop-empty.png` (new: subtle tint). The matrix now reads as a calm workspace. This was the highest-leverage change and it landed well. |
| 2 | Subtitles ("Urgent & Important") duplicated axis labels | **Fixed** | Subtitles are gone. Headers now show only the action word + task count. Clean, no information lost. |
| 3 | Drag handles always visible | **Fixed** | Default opacity dropped to 0.15, shows 0.3 on hover. On mobile (`<=600px`), `display: none` hides them entirely. Task rows are visually cleaner in every screenshot. |
| 4 | Task card borders adding visual noise | **Fixed** | `border: none` on `.em-task`. Cards rely on white-on-tinted-background contrast. Works well — each task reads as a clean rectangle without the extra line. |
| 5 | "Eisenhower Matrix" title and version footer | **Fixed** | Both removed from `renderMatrix()`. The full viewport height is now used for the matrix itself. Compare old overloaded screenshot (title eating 40px) to the new one. |

### Also fixed (not in original priority list)

- **+ button color**: Changed from solid purple `var(--interactive-accent)` background to transparent with a quadrant-colored `1.5px` border. The button now belongs to its quadrant visually. Significant improvement.
- **Type scale**: Collapsed from seven sizes to effectively three (0.95em action, 0.85em body, 0.7em meta). The form buttons now use 0.85em. The hierarchy is crisper.
- **Overflow fade hint**: Added a `::after` pseudo-element on `.em-task-list` with a sticky gradient. Provides a "scroll for more" signal when tasks overflow. Good implementation using `position: sticky` rather than JS-based scroll detection.
- **Mobile drag handle**: Hidden entirely with `display: none` in the `<=600px` media query, as recommended.
- **Mobile delete button**: Opacity reduced from 0.6 to 0.3. Less visually intrusive while still discoverable.
- **Empty state text**: Changed from "No tasks yet" to "Tap + to add a task" — more actionable, directs the user.
- **Dark mode Q3 (orange) boost**: Added specific `.theme-dark .em-quadrant-q3` override bumping opacity from 0.06 to 0.10 for background and 0.20 for header/border. Smart — orange reads weaker on dark backgrounds than red or blue, so it needs a slight boost to maintain equal visual weight across quadrants.
- **Grid gap**: Increased from 8px to 12px. More breathing room between quadrants.
- **Spacing improvements**: Header padding increased to `10px 14px`, task card padding to `8px 10px`, task list padding to `8px`. All subtle, all correct.

---

## Current State Assessment

The plugin has made a significant leap. The before/after comparison tells the story: the old design was a saturated dashboard that competed with the content; the new design is a quiet tool that puts tasks first. The direction is right.

**Overall grade: B+** (up from C+ at initial review)

What follows are the remaining issues — the things that prevent this from reaching A-tier.

---

## Remaining Issues

### 1. The form "Add" button is still purple

**Ref:** `followup-desktop-form-open.png`

The + circle button was correctly changed to inherit quadrant color with a transparent background. But when the add form opens, the "Add" submit button is still `background: var(--interactive-accent)` — solid purple. Inside the Q1 red quadrant, the purple "Add" button is visually incongruous. The "Cancel" button uses `var(--background-modifier-border)` which is neutral gray — that is fine. But "Add" should follow the same quadrant-color principle as the + button.

**Fix:** Change `.em-form-submit` from `background: var(--interactive-accent)` to use the quadrant's color. Two approaches:
- (a) Set a CSS custom property on each quadrant (e.g., `.em-quadrant-q1 { --em-quadrant-accent: #ef4444; }`) and use `background: var(--em-quadrant-accent)` on `.em-form-submit`. This is clean and extensible.
- (b) Keep the submit button neutral — make it a ghost button like the + button with a quadrant-colored border. This is more conservative and consistent with the existing de-emphasis pattern.

Option (b) is more in keeping with the minimalist direction. The form should be quiet; the user's title is the hero of the form, not the button.

**Severity:** Medium. It is the only remaining instance of the purple accent problem the initial review identified.

---

### 2. The date row is still always visible in the add form

**Ref:** `followup-desktop-form-open.png`

The initial review recommended hiding the date row by default and revealing it with an "Add date" link. This was not implemented. The form still shows the title input, a "Due:" label with a date picker, and two buttons — four rows of UI for what is usually a one-field interaction.

Most quick task captures are title-only. The date picker adds visual weight and cognitive overhead to the 80% case.

**Fix:** Hide `.em-form-date-row` by default. Add a small text link ("Add due date") below the input that toggles its visibility. The form shrinks from four rows to two (input + button row) for the common case. Users who need dates can opt in with one tap.

Alternatively, if implementation complexity is a concern: at minimum, rearrange the form so the button row comes immediately after the input, and the date row sits between the input and buttons. This way the primary action (type + submit) flows top-to-bottom without the date interruption.

**Severity:** Medium. It is a friction issue, not a visual one. But in a tool designed for quick triage, every extra field matters.

---

### 3. The empty state on desktop wastes space

**Ref:** `followup-desktop-empty.png`

Four large quadrants each showing "Tap + to add a task" in italic gray text, with vast empty colored space below. The empty state is honest (it tells you what to do) but it is not efficient. The matrix looks like a placeholder screenshot, not a functional tool waiting for input.

The quadrant backgrounds at 0.06 opacity are subtle enough that the empty space reads as blank wall — which is correct for a populated state (breathing room below tasks) but odd when there is nothing else in the quadrant.

**Fix (light touch):** Vertically center the empty state text within the quadrant, instead of positioning it at the top. This makes the empty quadrant feel intentionally designed rather than accidentally vacant.

**Fix (stronger):** In the empty state, reduce the minimum quadrant height so the four quadrants sit more compactly, with a note below the matrix like "Add tasks with the + button in each quadrant." This reclaims vertical space and avoids the "four blank canvases" look.

**Severity:** Low. The empty state is a first-run experience that users pass through quickly. But first impressions anchor perception.

---

### 4. The overflow fade gradient obscures the last task card

**Ref:** `followup-desktop-overloaded.png`

The `::after` pseudo-element that provides the "scroll for more" signal is a 30px gradient that sits on top of the last visible task. It uses `var(--background-primary-alt)` which does not match the quadrant background. In Q1 (red tint), the fade goes to a slightly gray-white, creating a visible band that looks like a rendering glitch rather than a deliberate affordance.

Additionally, the gradient is always present — even when the task list is not overflowing. On the populated screenshot (`followup-desktop-populated.png`), Q1 has 3 tasks that fit without scrolling, but the bottom of the list area still shows a slight gradient wash. This is subtle but noticeable.

**Fix:**
- Change the gradient target from `var(--background-primary-alt)` to match the quadrant body background. This requires per-quadrant CSS or a custom property: `.em-quadrant-q1 .em-task-list::after { background: linear-gradient(transparent, rgba(239, 68, 68, 0.06)); }`.
- Only show the fade when the list is actually overflowing. The cleanest approach: use a small JS observer (IntersectionObserver on a sentinel element at the bottom of the task list) to add/remove a `.em-task-list-overflowing` class. Only show the `::after` when that class is present.

**Severity:** Medium. The fade-to-wrong-color is a visual polish issue, but it undermines the subtlety gains from the opacity reduction.

---

### 5. Dark mode Q3 (Delegate/orange) still reads heavier than the other quadrants

**Ref:** `followup-desktop-dark.png`

The dark mode override bumps Q3 from 0.06 to 0.10 body and from 0.15 to 0.20 header/border. The intent was to compensate for orange reading weaker on dark backgrounds. But in practice, the override may have overcorrected: Q3 now reads as the most prominent quadrant in dark mode. It draws the eye before Q1 (Do), which should be the visual anchor.

This is a judgment call, not a clear error. The difference is subtle. But perceptually: Q1 (red at 0.06) on a dark background reads as a faint wine tint. Q3 (orange at 0.10) reads as a warm amber glow. The amber glow is more visible to the human eye because orange-yellow wavelengths stimulate both L and M cones.

**Fix:** Try `0.08` instead of `0.10` for Q3 body, and `0.18` instead of `0.20` for header/border. Split the difference. Alternatively, test whether `0.06` (same as the others) actually works fine in practice — the orange header text is already a strong enough signal.

**Severity:** Low. This is perceptual fine-tuning. Most users will never notice.

---

### 6. The + button is slightly too large on mobile

**Ref:** `followup-mobile-populated.png`, `followup-mobile-empty.png`

On mobile, the + button grows to 44x44px (correct for touch targets) but the circle border makes it visually dominant in the header. It is nearly the same height as the action name text. The button is correct functionally but visually heavy — it reads as a decorative element rather than a quiet affordance.

**Fix:** Keep the 44x44px touch target but reduce the visible circle. Use a 28px visible circle inside a 44px invisible tap area: `width: 44px; height: 44px;` on the button, but set the border on an inner element or use `background-size`/`border-radius` on a smaller visual footprint. Alternatively, reduce the border opacity from 0.4 to 0.25 on mobile — same target, less visual weight.

**Severity:** Low. Functional correctness (44px target) is more important than visual weight here.

---

### 7. Task card left border is missing (minor polish opportunity)

On desktop populated view, the task cards are flat white rectangles. They are clean, which is correct. But they float on the quadrant background with only background contrast for differentiation. In Q4 (gray), where the background is very faint and the card background is white, the cards barely register as distinct objects.

A 2-3px left border in the quadrant color on each task card would add a thin semantic signal — "this task belongs to this quadrant" — without adding visual noise. This is the pattern used by Things 3 for project color coding and by GitHub for issue labels.

**Fix:** Add `.em-quadrant-q1 .em-task { border-left: 3px solid rgba(239, 68, 68, 0.3); }` (and equivalents for Q2-Q4). This adds a color signal that is visible but not dominant. It also helps when tasks are dragged between quadrants — the color tag changes, reinforcing the move.

**Severity:** Low. This is a polish suggestion, not a problem fix. The current borderless design works. This would make it work slightly better.

---

## Systemic Issues — Updated

### From the initial review:

1. **Color saturation** — **Resolved.** The opacity reduction transformed the interface. The quadrant colors now whisper rather than shout.

2. **Information double-encoding** — **Resolved.** Subtitles removed. Color + position + axis labels are the encoding. No redundancy.

3. **Always-visible affordances** — **Mostly resolved.** Drag handle hidden until hover/hidden on mobile. Delete button reduced on mobile. The date row in the add form remains always-visible (see issue #2 above).

4. **Typography without discipline** — **Resolved.** Three-size type scale implemented. The hierarchy reads cleanly.

5. **Accent color conflict** — **Mostly resolved.** The + button now uses quadrant color. The form submit button still uses purple (see issue #1 above).

### New observations:

6. **No visual differentiation between quadrants beyond color.** All four quadrants are structurally identical. This is correct for simplicity, but it means the matrix relies entirely on position + color for meaning. If a user is colorblind (8% of males), the quadrants are distinguished only by position and the action word. The action words (Do, Schedule, Delegate, Eliminate) are strong, so this mostly works. But consider: would a subtle icon next to each action word help? A small warning icon for Do, a calendar for Schedule, a share icon for Delegate, a trash icon for Eliminate. This would add a redundant encoding channel without adding clutter.

7. **No feedback for successful task creation.** After submitting the add form, the form hides and the task appears in the list. But there is no animation or visual signal that confirms success. The task simply exists in the next render. A brief highlight (200ms background flash on the new task card) would close the feedback loop. Small, but it is the difference between "did that work?" and "done."

---

## Design Direction — Next Steps

The big wins are done. What remains is polish — the gap between "good" and "refined." In priority order:

### High priority (visual consistency)
1. **Fix form submit button color** — Replace purple with quadrant color or neutral ghost button. Last remnant of the accent color conflict.
2. **Fix overflow fade gradient color** — Match the gradient to the quadrant background, not `--background-primary-alt`. Only show when overflowing.

### Medium priority (interaction quality)
3. **Collapse date row in add form** — Hide by default, reveal on "Add due date" link. Reduces form from 4 rows to 2 for the common case.
4. **Add task creation feedback** — Brief highlight animation on newly created task card.

### Low priority (perceptual polish)
5. **Fine-tune dark mode Q3 opacity** — Test 0.08 vs 0.10 for body.
6. **Center empty state text vertically** — Small spatial improvement for first-run experience.
7. **Consider task card left-border color tag** — Adds a thin semantic signal per card.
8. **Consider quadrant header icons** — Adds accessibility redundancy for colorblind users.

---

## Comparison: Before and After

| Aspect | Before (2026-02-14) | After (2026-02-16) |
|--------|---------------------|---------------------|
| Quadrant backgrounds | 25% opacity color wash — loud, dashboard-like | 6% opacity tint — subtle, calm |
| Headers | Action + subtitle + purple button — 3 competing elements | Action + count + quadrant-colored button — unified |
| Task cards | Bordered, always-visible drag handle, 7 font sizes | Borderless, hover-reveal handle, 3 font sizes |
| Title/footer | "Eisenhower Matrix" title + version number consuming 60px | Removed — full space for the matrix |
| Mobile drag handle | Always visible (added clutter) | Hidden entirely |
| Empty state text | "No tasks yet" (passive) | "Tap + to add a task" (actionable) |
| Dark mode | Saturated color blocks dominating the view | Subtle tints that adapt naturally |
| Overall impression | Colorful dashboard competing for attention | Quiet workspace that lets tasks speak |

---

## Final Assessment

The initial review identified the plugin as a well-functioning tool trapped inside an over-designed surface. The changes made in the last two days have largely freed it. The color reduction alone was transformative — it is the kind of change where you see the before screenshot and cannot believe you ever shipped it. (This is a compliment. It means the designer recognized the problem and committed to the fix.)

What remains are second-order issues: the purple form button, the always-visible date row, the mismatched overflow gradient. None of these break the experience. All of them prevent it from reaching the "this feels like a native Obsidian feature" bar.

The path to A-tier is clear and short. Fix the form submit button color (#1), fix the overflow gradient (#4), and collapse the date row (#2). Three changes, all contained, all low-risk. After that, the plugin will feel like it belongs in Obsidian's own sidebar — which is the highest compliment for a plugin.

---

*"Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away." — Antoine de Saint-Exupery*
