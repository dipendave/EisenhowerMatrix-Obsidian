# Project Design

## Overview
An Obsidian community plugin that provides an interactive Eisenhower Matrix for task prioritization. Tasks are organized into four quadrants based on urgency and importance, with drag-and-drop, due dates, and mobile-responsive design.

## Architecture
```
Plugin (main.ts) ── owns data, CRUD operations, persistence
    │
    └── View (view.ts) ── renders UI, handles all user interactions
            │               exports formatDueDate(), isDueDatePast()
            │
            └── Types (types.ts) ── interfaces, enums, constants

styles.css ── grid layout, colors, responsive breakpoints

tests/
    __mocks__/obsidian.ts ── manual mock for obsidian module
    main.test.ts ── plugin CRUD tests
    view.test.ts ── date utility tests
    types.test.ts ── constants validation

.npmrc ── npm config (legacy-peer-deps for eslint plugin compat)
.github/workflows/ci.yml ── CI pipeline (test + build)
```

Unidirectional data flow: User action → View calls Plugin CRUD → Plugin saves to `data.json` → View re-renders from data.

## Components

### EisenhowerMatrixPlugin (`src/main.ts`)
- Purpose: Plugin lifecycle, data ownership, task CRUD operations
- Dependencies: `obsidian` (Plugin, WorkspaceLeaf)
- Key interfaces: `onload()`, `activateView()`, `addTask()`, `editTask()`, `deleteTask()`, `restoreTask()`, `moveTask()`, `getTasksForQuadrant()`

### EisenhowerMatrixView (`src/view.ts`)
- Purpose: Renders the 2x2 matrix UI, handles all user interactions
- Dependencies: `obsidian` (ItemView), Plugin instance, Types
- Key interfaces: `renderMatrix()`, desktop drag (HTML5 API), mobile touch drag (250ms long-press), inline add/delete/edit forms, delete undo toast (5s Notice with restore)
- Exported utilities: `formatDueDate(dateStr)`, `isDueDatePast(dateStr)` — extracted for testability

### Types (`src/types.ts`)
- Purpose: Shared data model and constants
- Key interfaces: `Task`, `EisenhowerMatrixData`, `Quadrant` enum, `QUADRANT_META`

## Data Flow
1. Plugin loads `data.json` on startup → flat `Task[]` array
2. View reads tasks via `plugin.getTasksForQuadrant()` and renders
3. User adds/deletes/moves task → View calls Plugin CRUD method
4. Plugin updates in-memory data and calls `saveData()` to persist
5. View calls `renderMatrix()` to re-render from updated data

## Key Design Decisions

- **Flat task array** instead of per-quadrant arrays — simpler drag-and-drop (just change `task.quadrant`), single source of truth
- **Full re-render on mutation** — simple and correct; performance is fine for typical task counts (<100)
- **Dual drag-and-drop** — HTML5 Drag API for desktop, touch events with long-press for mobile (avoids scroll conflicts)
- **`isDesktopOnly: false`** — enables mobile Obsidian support
- **Obsidian CSS variables** — theme-compatible colors that work in both light and dark mode
- **Data schema versioning** — `version` field in persisted data for future migrations
- **3-size type scale** — action (0.95em/700), body (0.85em/400), meta (0.7em/400/60% opacity). No other sizes.
- **Subtle color system** — RGBA quadrant colors at 6% body / 15% header opacity. Color whispers, doesn't shout. Buttons inherit quadrant color.
- **Progressive disclosure** — drag handles hidden until hover, mobile empty quadrants collapsed to header-only

## Recent Changes
- Fixed version inconsistencies: package.json synced to 1.0.3, bump script and pre-commit hook now include package.json
- Added Playwright-based screenshot capture script (`scripts/capture-readme-screenshots.mjs`) for automated README screenshots (4 retina shots: desktop light/dark, overloaded, mobile)
- Added populated fixture state in `tests/fixtures/matrix.html` with 10 realistic tasks across all quadrants
- Rewrote README with new screenshots showcasing dark mode, mobile layout, overflow scrolling, and 3 new feature rows
- Removed "Add date" toggle — date picker always visible in add-task form for faster task creation
- Design overhaul: reduced quadrant color opacity (0.06/0.15), removed subtitles/title/footer, quadrant-colored buttons, 3-size type scale, hidden drag handles, no task borders, collapsed mobile empties, overflow fade hint, increased spacing
- Task count badges in quadrant headers (hidden when 0), delete undo toast (5s Notice with Undo link), fixed desktop quadrant overflow clipping (`min-height: 0`), added desktop Playwright project
- Added version footer (reads from manifest.json) and pre-commit hook for auto-bumping patch version on source changes
- Add buttons use Obsidian's `setIcon("plus")` SVG for proper centering
- Addressed all ObsidianReviewBot required issues: sentence case UI text, void-operator for unhandled promises, removed plugin ID from command ID, removed plugin name from command name, removed onunload leaf detach, replaced deprecated substr, replaced innerHTML with textContent, moved inline styles to CSS class, made async event handlers synchronous with void
- Increased quadrant color opacity for vivid backgrounds (body 0.08→0.25, header 0.15→0.38, border 0.2→0.35) — same values work in both light and dark mode
- Fixed mobile layout (comprehensive): single scroll container strategy — `.em-container` fills the Obsidian leaf and scrolls, all inner elements use natural content height (`flex: none`). Added `box-sizing: border-box`, `scrollIntoView()` on input focus for keyboard, hidden redundant title, tighter spacing. Playwright mobile UI tests (32 tests, iPhone SE + 16 Pro viewports)
- Added inline task editing — click to edit title and due date in-place
- Added post-build vault sync (esbuild plugin reads vault paths from `.env.local`, copies build artifacts, never touches `data.json`)
- Added automated test suite (Jest + ts-jest) with 33 unit tests and GitHub Actions CI pipeline
- Extracted `formatDueDate()` and `isDueDatePast()` as standalone exports from view module
- Initial implementation: full plugin with 4-quadrant matrix, task CRUD, drag-and-drop (desktop + mobile), responsive CSS
