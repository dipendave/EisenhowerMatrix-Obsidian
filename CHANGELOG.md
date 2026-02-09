# Changelog

All notable changes to this project will be documented in this file.

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
