# Changelog

All notable changes to this project will be documented in this file.

---

## [2026-02-13 16:00] - Fix Version Inconsistencies + README Screenshot Refresh

**Fixed:**
- Synced `package.json` version from 1.0.0 to 1.0.3 to match `manifest.json`
- Updated `scripts/bump-version.mjs` to also bump `package.json` version on auto-bump
- Updated pre-commit hook to stage `package.json` alongside `manifest.json` and `versions.json`

**Added:**
- Populated fixture state in `tests/fixtures/matrix.html` with 10 realistic tasks across all 4 quadrants (for hero screenshot)
- `scripts/capture-readme-screenshots.mjs` — Playwright script that captures 4 retina screenshots (desktop light, desktop dark, desktop overloaded, mobile)
- `npm run screenshots` script

**Changed:**
- Rewrote `README.md` with new hero screenshot, 3 new feature rows (task count badges, undo on delete, overflow scrolling), dark mode / mobile / overflow screenshot sections, updated dev commands
- Deleted stale `screenshots/desktop.png` and `screenshots/iphone.jpeg`

**Files:**
- `package.json`
- `scripts/bump-version.mjs`
- `.git/hooks/pre-commit`
- `tests/fixtures/matrix.html`
- `scripts/capture-readme-screenshots.mjs`
- `README.md`
- `screenshots/desktop-populated.png`
- `screenshots/desktop-dark.png`
- `screenshots/desktop-overloaded.png`
- `screenshots/mobile-populated.png`

---

## [2026-02-14 02:00] - Remove "Add date" toggle, always show date picker

**Changed:**
- Removed the "Add date" toggle button from the add-task form — date picker is now always visible
- Simpler form: title input, date row, and buttons — no hidden state to discover

**Removed:**
- `em-add-date-toggle` CSS class and hover styles
- `resetDateToggle()` helper and toggle click listener in view.ts

**Files:**
- `src/view.ts`
- `styles.css`
- `tests/fixtures/matrix.html`

---

## [2026-02-14 01:30] - Design Overhaul: Minimalist Visual Refresh

**Changed:**
- Reduced quadrant color opacity (body 0.25→0.06, header 0.38→0.15, border 0.35→0.15) for a calmer interface
- Removed quadrant subtitles, title header, and version footer
- Add buttons inherit quadrant color (transparent bg + colored border) instead of purple accent
- Collapsed type scale from 7 sizes to 3: action (0.95em), body (0.85em), meta (0.7em)
- Increased spacing: grid gap 8→12px, header/task/list padding increased
- Drag handles hidden by default, shown on hover; hidden entirely on mobile
- Task card borders removed, form border-top removed
- Date row in add form hidden behind "Add date" toggle for faster quick-capture
- Mobile delete button opacity 0.6→0.3; empty quadrants collapsed to header-only
- Added overflow fade gradient hint on scrollable desktop task lists

**Files:**
- `styles.css`
- `src/view.ts`
- `tests/fixtures/matrix.html`
- `tests/mobile.spec.ts`

---

## [2026-02-14 00:30] - Task Count Badges, Quadrant Overflow Fix, Delete Undo Toast

**Added:**
- Task count badges in quadrant headers — shows count (e.g., "DO 3") when tasks exist, hidden when empty
- Delete undo toast — 5-second Notice with "Undo" link that restores the deleted task
- `restoreTask()` method on plugin for undoing deletions
- Desktop Playwright project and overflow scroll test
- Overloaded-state fixture (8 tasks in Q1) for Playwright testing

**Fixed:**
- Quadrant content clipping on desktop when many tasks — added `min-height: 0` to `.em-quadrant` so CSS grid children can shrink and `.em-task-list` scrolls properly
- Mobile-only Playwright tests now skip on desktop project (added `isMobile` guards)

**Files:**
- `src/view.ts`
- `src/main.ts`
- `styles.css`
- `tests/__mocks__/obsidian.ts`
- `tests/main.test.ts`
- `tests/fixtures/matrix.html`
- `tests/mobile.spec.ts`
- `playwright.config.ts`

---

## [2026-02-13 23:50] - Fix CI peer dependency failures

**Fixed:**
- CI `npm ci` failing due to peer dependency conflicts from `eslint-plugin-obsidianmd` (eslint ^10 vs plugins expecting ^9, typescript 4.7.4 vs >=4.8.4)
- Added `.npmrc` with `legacy-peer-deps=true` so CI resolves deps the same way as local
- Regenerated `package-lock.json` with clean dependency tree

**Files:**
- `.npmrc`
- `package-lock.json`

---

## [2026-02-13 13:00] - Plus Icon, Version Footer, Auto-Bump

**Added:**
- Version number displayed as faint footer text (`v1.0.1`) in the matrix view, read from manifest.json
- Pre-commit hook script (`scripts/bump-version.mjs`) that auto-bumps the patch version when source files are committed

**Fixed:**
- Add button "+" was not centered — replaced text character with Obsidian's `setIcon("plus")` SVG icon
- Added `padding: 0` to add button to remove default browser padding

**Files:**
- `src/view.ts`
- `styles.css`
- `scripts/bump-version.mjs`

---

## [2026-02-13 12:00] - Fix All ObsidianReviewBot Required Issues

**Fixed:**
- Use sentence case for all UI text ("Eisenhower Matrix" → "Eisenhower matrix")
- Mark all unhandled promises with `void` operator (ribbon icon, command, click/submit/drop/touch handlers)
- Command ID no longer includes plugin ID (`open-eisenhower-matrix` → `open-view`)
- Command name no longer includes plugin name (`Open Eisenhower Matrix` → `Open matrix`)
- Removed `onunload()` leaf detach — prevents resetting leaf position on reload
- Replaced deprecated `substr()` with `substring()` in ID generation
- Replaced `innerHTML` with `textContent` for drag handle (☰) and delete button (×)
- Removed `async` from `onOpen`/`onClose` (no `await` expression) — returns `Promise.resolve()` instead
- Made `drop` and `touchend` handlers synchronous, using `void` for fire-and-forget saves
- Moved inline `style.position/pointerEvents/zIndex` on touch clone to CSS class, dynamic props use `setCssStyles()`

**Files:**
- `src/main.ts`
- `src/view.ts`
- `styles.css`

---

## [2026-02-12 14:30] - Make Quadrant Colors Pop

**Changed:**
- Increased quadrant color opacity for more vivid, distinct backgrounds in both light and dark mode
- Body background: 0.08 → 0.25, header background: 0.15 → 0.38, borders: 0.2 → 0.35
- Applied uniformly to all four quadrants (Q1 red, Q2 blue, Q3 orange, Q4 gray)

**Files:**
- `styles.css`

---

## [2026-02-12 13:00] - Improved README

**Changed:**
- Rewrote README with desktop screenshot hero image, feature table, collapsible mobile screenshot, and clearer usage instructions

**Files:**
- `README.md`
- `screenshots/desktop.png`
- `screenshots/iphone.jpeg`

---

## [2026-02-12 12:00] - Community Plugin Release Preparation

**Added:**
- MIT LICENSE file
- GitHub Actions release workflow (`.github/workflows/release.yml`) — creates a draft GitHub Release with `main.js`, `manifest.json`, and `styles.css` on tag push
- Installation section in README.md

**Changed:**
- Added `authorUrl` to `manifest.json`

**Files:**
- `LICENSE`
- `manifest.json`
- `.github/workflows/release.yml`
- `README.md`

---

## [2026-02-09 00:10] - Bottom Padding for Obsidian Nav Bar

**Fixed:**
- Eliminate quadrant (last in stack) was hidden behind Obsidian's bottom navigation icons on mobile
- Added 60px bottom padding to container on mobile so all quadrants are fully accessible when scrolled to bottom

**Files:**
- `styles.css`

---

## [2026-02-08 23:50] - Mobile Compact Layout & Keyboard Scroll Fix

**Fixed:**
- Keyboard opening on iOS hid the input field — form now scrolls into view when input is focused (300ms delay for keyboard animation)
- Redundant "Eisenhower Matrix" title on mobile (Obsidian already shows it in the nav bar) — now hidden on `<600px`
- Tightened mobile spacing: reduced container/header/form padding, smaller grid gap, compact empty states

**Changed:**
- Added `scrollIntoView()` on focus for add form and edit form inputs
- Added `-webkit-overflow-scrolling: touch` for smooth iOS scrolling

**Files:**
- `src/view.ts`
- `styles.css`

---

## [2026-02-08 23:30] - Comprehensive Mobile Layout Fix

**Fixed:**
- Mobile content invisible or clipped when interacting with the matrix
- Root cause: `height: auto` on `.em-container` caused it to grow beyond Obsidian's fixed-height leaf (which has `overflow: hidden`), so content beyond the boundary was clipped with no scroll
- Also: `flex: 1` and `min-height: 0` on `.em-matrix-wrapper`, `.em-grid`, and `.em-task-list` constrained content height instead of letting it flow naturally
- Also: missing `box-sizing: border-box` on container meant padding extended it beyond the leaf

**Mobile layout strategy (new):**
- `.em-container` fills the Obsidian leaf (`height: 100%`, `box-sizing: border-box`) and is the **only** scroll container (`overflow-y: auto`)
- All inner elements (wrapper, grid, task list) use `flex: none; min-height: auto; overflow: visible` — natural content height, no constraints
- Quadrants stack vertically, each sized by its content; container scrolls when total exceeds screen

**Added:**
- 4 new Playwright tests: container fills leaf (not overflows it), inner elements use natural height, container is scrollable when forms are open (32 total)

**Files:**
- `styles.css`
- `tests/mobile.spec.ts`

---

## [2026-02-08 22:45] - Mobile Layout Fix & Playwright Tests

**Fixed:**
- Quadrants collapsing to thin colored bars on mobile — root cause was `overflow: hidden` on `.em-container` and `.em-matrix-wrapper` clipping content in Obsidian's constrained workspace leaf
- On mobile (`<600px`): container now uses `height: auto` + `overflow-y: auto`, wrapper uses `overflow-y: visible`, quadrants have `min-height: 80px`

**Added:**
- Playwright mobile UI tests (24 tests across iPhone SE + iPhone 16 Pro viewports)
- Tests cover: quadrant visibility, header visibility, tap target sizes, overflow behavior, form accessibility in constrained containers
- HTML test fixture reproducing the plugin's DOM structure with Obsidian-like constraints

**Files:**
- `styles.css`
- `playwright.config.ts`
- `tests/mobile.spec.ts`
- `tests/fixtures/matrix.html`
- `package.json`

---

## [2026-02-08 22:20] - Task Editing

**Changed:**
- Added `editTask()` method to plugin for updating task title and due date
- Added inline edit mode — click a task to edit its title and due date in-place
- Save with Enter or Save button, cancel with Escape or Cancel button
- Added 5 new unit tests for editTask logic (38 total)

**Files:**
- `src/main.ts`
- `src/view.ts`
- `styles.css`
- `tests/main.test.ts`

---

## [2026-02-08 22:10] - README, Vault Auto-Sync & Dev Workflow

**Changed:**
- Added README.md with feature overview and dev instructions
- Added post-build vault sync via esbuild plugin — copies main.js, manifest.json, styles.css to vault plugin dirs after every build (data.json is never touched)
- Vault paths stored in `.env.local` (gitignored) to keep personal paths out of the repo

**Files:**
- `README.md`
- `esbuild.config.mjs`
- `.env.local`
- `.gitignore`

---

## [2026-02-08 22:00] - Automated Tests & CI Pipeline

**Changed:**
- Added Jest unit testing framework with ts-jest and manual obsidian mock
- Extracted `formatDueDate()` and `isDueDatePast()` from view class into standalone exported functions for testability
- Created 33 unit tests covering plugin CRUD logic, date utilities, and type constants
- Added GitHub Actions CI workflow that runs tests and build on every push/PR
- Added `npm test` script to package.json

**Files:**
- `jest.config.js`
- `tests/__mocks__/obsidian.ts`
- `tests/main.test.ts`
- `tests/view.test.ts`
- `tests/types.test.ts`
- `src/view.ts`
- `package.json`
- `.github/workflows/ci.yml`

---

## [2026-02-08 20:56] - Initial Plugin Implementation

**Changed:**
- Created Obsidian plugin scaffold (manifest.json, package.json, tsconfig.json, esbuild.config.mjs)
- Implemented data model with Task interface, Quadrant enum, and QuadrantMeta constants
- Built plugin core with view registration, ribbon icon, command palette integration, and task CRUD operations
- Implemented full Eisenhower Matrix view with 2x2 CSS Grid, color-coded quadrants (Do/Schedule/Delegate/Eliminate)
- Added inline task creation with title input and date picker
- Added task deletion
- Implemented HTML5 desktop drag-and-drop between quadrants
- Implemented mobile touch drag-and-drop with 250ms long-press detection and visual clone
- Created responsive CSS with breakpoints at 768px, 600px, and 400px
- Added dark/light theme support using Obsidian CSS variables
- Due dates with relative formatting (Today, Tomorrow, etc.) and overdue highlighting

**Files:**
- `src/types.ts`
- `src/main.ts`
- `src/view.ts`
- `styles.css`
- `manifest.json`
- `package.json`
- `tsconfig.json`
- `esbuild.config.mjs`
- `versions.json`
- `.gitignore`

---

## [2026-02-13 21:37] - Add Playwright design-review screenshot script

**Added:**
- Created `tests/design-screenshots.mjs` to capture design-review screenshots of the matrix fixture
- Captures 6 screenshots: desktop empty, overloaded, overloaded Q1 (element), form-open, mobile empty, mobile overloaded
- Desktop at 1280x720, mobile at iPhone SE (375x667)
- Output directory: `screenshots/design-review/`

**Files:**
- `tests/design-screenshots.mjs`
- `screenshots/design-review/desktop-empty.png`
- `screenshots/design-review/desktop-overloaded.png`
- `screenshots/design-review/desktop-overloaded-q1.png`
- `screenshots/design-review/desktop-form-open.png`
- `screenshots/design-review/mobile-empty.png`
- `screenshots/design-review/mobile-overloaded.png`

---
