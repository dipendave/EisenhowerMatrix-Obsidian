# Eisenhower Matrix for Obsidian

Prioritize your tasks by urgency and importance, right inside Obsidian.

![Obsidian](https://img.shields.io/badge/Obsidian-0.15.0+-purple)
![License](https://img.shields.io/badge/License-MIT-green)

![Desktop view of the Eisenhower Matrix plugin](screenshots/desktop-populated.png)

## Features

| Feature | Description |
|---------|-------------|
| **4-quadrant matrix** | Do, Schedule, Delegate, Eliminate — the classic Eisenhower layout |
| **Drag and drop** | Move tasks between quadrants on desktop. Long-press to drag on mobile |
| **Due dates** | Relative formatting (Today, Tomorrow, 3 days ago) with overdue highlighting |
| **Inline editing** | Click any task to edit its title or due date in place |
| **Task count badges** | Each quadrant header shows the number of tasks at a glance |
| **Undo on delete** | Accidentally deleted a task? A 5-second toast lets you undo instantly |
| **Overflow scrolling** | Quadrants scroll individually when you have lots of tasks — with a fade hint |
| **Mobile friendly** | Responsive stacked layout that works on phones and tablets |
| **Theme aware** | Adapts to your light or dark Obsidian theme |

### Dark mode

<img src="screenshots/desktop-dark.png" alt="Dark mode view" width="640">

### Mobile layout

<img src="screenshots/mobile-populated.png" alt="Mobile view" width="300">

### Overflow scrolling

<img src="screenshots/desktop-overloaded.png" alt="Overflow scrolling with many tasks" width="640">

## Installation

1. Open **Settings > Community plugins** in Obsidian
2. Turn off **Restricted mode** if prompted
3. Click **Browse** and search for **Eisenhower Matrix**
4. Click **Install**, then **Enable**

## Usage

Open the matrix from the ribbon icon or the command palette (**Open Eisenhower Matrix**).

- **Add a task** — tap the **+** button in any quadrant
- **Edit a task** — click on it to change the title or due date
- **Move a task** — drag it to a different quadrant (long-press on mobile)
- **Delete a task** — click the **x** button (undo within 5 seconds)

## Development

```bash
npm install
npm run dev          # watch mode
npm run build        # production build
npm test             # unit tests (Jest)
npm run test:mobile  # mobile layout tests (Playwright)
npm run screenshots  # regenerate README screenshots
```

## License

[MIT](LICENSE)
