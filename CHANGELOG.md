# Changelog

All notable changes to this project will be documented in this file.

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
