# Project Design

## Overview
An Obsidian community plugin that provides an interactive Eisenhower Matrix for task prioritization. Tasks are organized into four quadrants based on urgency and importance, with drag-and-drop, due dates, and mobile-responsive design.

## Architecture
```
Plugin (main.ts) ── owns data, CRUD operations, persistence
    │
    └── View (view.ts) ── renders UI, handles all user interactions
            │
            └── Types (types.ts) ── interfaces, enums, constants

styles.css ── grid layout, colors, responsive breakpoints
```

Unidirectional data flow: User action → View calls Plugin CRUD → Plugin saves to `data.json` → View re-renders from data.

## Components

### EisenhowerMatrixPlugin (`src/main.ts`)
- Purpose: Plugin lifecycle, data ownership, task CRUD operations
- Dependencies: `obsidian` (Plugin, WorkspaceLeaf)
- Key interfaces: `onload()`, `onunload()`, `activateView()`, `addTask()`, `deleteTask()`, `moveTask()`, `getTasksForQuadrant()`

### EisenhowerMatrixView (`src/view.ts`)
- Purpose: Renders the 2x2 matrix UI, handles all user interactions
- Dependencies: `obsidian` (ItemView), Plugin instance, Types
- Key interfaces: `renderMatrix()`, desktop drag (HTML5 API), mobile touch drag (250ms long-press), inline add/delete forms

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
- Initial implementation: full plugin with 4-quadrant matrix, task CRUD, drag-and-drop (desktop + mobile), responsive CSS
