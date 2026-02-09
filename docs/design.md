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

.github/workflows/ci.yml ── CI pipeline (test + build)
```

Unidirectional data flow: User action → View calls Plugin CRUD → Plugin saves to `data.json` → View re-renders from data.

## Components

### EisenhowerMatrixPlugin (`src/main.ts`)
- Purpose: Plugin lifecycle, data ownership, task CRUD operations
- Dependencies: `obsidian` (Plugin, WorkspaceLeaf)
- Key interfaces: `onload()`, `onunload()`, `activateView()`, `addTask()`, `editTask()`, `deleteTask()`, `moveTask()`, `getTasksForQuadrant()`

### EisenhowerMatrixView (`src/view.ts`)
- Purpose: Renders the 2x2 matrix UI, handles all user interactions
- Dependencies: `obsidian` (ItemView), Plugin instance, Types
- Key interfaces: `renderMatrix()`, desktop drag (HTML5 API), mobile touch drag (250ms long-press), inline add/delete/edit forms
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

## Recent Changes
- Fixed mobile layout (comprehensive): single scroll container strategy — `.em-container` fills the Obsidian leaf and scrolls, all inner elements use natural content height (`flex: none`). Added `box-sizing: border-box`, `scrollIntoView()` on input focus for keyboard, hidden redundant title, tighter spacing. Playwright mobile UI tests (32 tests, iPhone SE + 16 Pro viewports)
- Added inline task editing — click to edit title and due date in-place
- Added post-build vault sync (esbuild plugin reads vault paths from `.env.local`, copies build artifacts, never touches `data.json`)
- Added automated test suite (Jest + ts-jest) with 33 unit tests and GitHub Actions CI pipeline
- Extracted `formatDueDate()` and `isDueDatePast()` as standalone exports from view module
- Initial implementation: full plugin with 4-quadrant matrix, task CRUD, drag-and-drop (desktop + mobile), responsive CSS
