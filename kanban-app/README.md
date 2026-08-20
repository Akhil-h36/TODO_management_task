# Kanban Board

A drag-and-drop Kanban task board (To Do / In Progress / Completed) built with React + Vite. Built as a take-home assignment; the mockup this was built from is a hand-designed "notepad card" concept — the goal was to carry that design faithfully into working React, not just satisfy the functional checklist.

**Live demo:** _add your deployed URL here_

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build     # production build to dist/
npm run preview   # serve the production build locally
```

No environment variables, API keys, or external services are required — see [Data storage](#data-storage) below.

## Features

- Three columns (To Do / In Progress / Completed), each showing a live task count.
- Create, view, edit, and delete tasks, each with a title, description, priority (high/medium/low), and due date.
- Drag and drop between columns with a physics-based ghost card (tilt reacts to drag direction, eases back to rest).
- Search across title + description, and filter by priority — both combine and apply per-column.
- Overdue tasks (past due date, not in Completed) are flagged visually.
- All state survives a page refresh (see below).

## Architecture

```
src/
  context/TaskContext.jsx   # single source of truth: tasks + search/filter state
  hooks/useDraggableCard.js # pointer-based drag physics, decoupled from React state
  components/
    Header.jsx              # title, search box, "New Task"
    FilterChips.jsx         # priority filter pills
    Board.jsx                # derives per-column visible tasks from context
    Column.jsx                # one column: list + inline "add task"
    TaskCard.jsx              # one card: drag handle, delete, opens the modal
    TaskModal.jsx              # the "big paper" view/edit/create modal
  utils/                      # pure helpers: date formatting, overdue check, id generation
  data/seedTasks.js            # first-run sample data only
```

**State management:** React Context + `useReducer`, no external state library — the domain is small (one array of tasks) and didn't justify Redux/Zustand. All mutations go through four actions (`ADD_TASK`, `UPDATE_TASK`, `DELETE_TASK`, `MOVE_TASK`) in [TaskContext.jsx](src/context/TaskContext.jsx), so persistence and validation have one choke point instead of being scattered across components.

**Drag and drop:** implemented as a custom pointer-event hook ([useDraggableCard.js](src/hooks/useDraggableCard.js)) rather than the HTML5 Drag and Drop API or a library like `dnd-kit`/`react-beautiful-dnd`. The mockup calls for a specific tactile feel (a cloned "ghost" card that leans into the drag direction and settles with a spring-like animation on drop) that's awkward to get with native DnD's event model. The trade-off: this hook manipulates the dragged card's DOM node directly during the gesture (clone, position, rotate) and only touches React state once, on drop — it's an intentional escape hatch from the render loop for a 60fps interaction, not a pattern used elsewhere in the app. For a larger board (hundreds of tasks, virtualization, multi-select drag) I'd reach for `dnd-kit` instead; here it added a dependency to fight the existing bespoke motion design.

A task that's just been dropped gets a `justMoved` flag (tracked in `Board.jsx`) so only that card plays the "settle" animation, not the whole column.

## Data storage

**Decision: browser `localStorage`, no backend.**

Tasks are held in memory via `useReducer` and mirrored to `localStorage` on every change (see the `useEffect` in [TaskContext.jsx](src/context/TaskContext.jsx)). On load, the app reads from `localStorage` first and only falls back to the bundled sample tasks ([data/seedTasks.js](src/data/seedTasks.js)) if nothing is stored yet (e.g. first visit, or storage was cleared).

Why this over a real backend/database for a submission like this one:

- **Nothing to configure.** Whoever opens the repo runs two commands and it works — no API keys, no `.env` file, no database to provision or seed, no security rules to review. That matters specifically because this gets handed over as a repo link rather than run on infrastructure I control.
- **It's real persistence, not a mock.** Data survives refreshes and browser restarts; this isn't hardcoded sample data being redrawn every load.
- **Scope match.** The brief asks for a frontend task board, not a client-server system. A bolted-on backend (Firebase, a REST API) would mostly demonstrate infra plumbing rather than the frontend/UX work the assignment is actually evaluating.

Known limits, by design: storage is per-browser (no cross-device sync), there's no multi-user concept, and no auth. All reasonable for a single-user demo board.

**If this needed to grow into a real product**, the persistence layer is already isolated behind the four reducer actions in `TaskContext`, so swapping `localStorage` for real API calls means changing the *inside* of those four functions (e.g. `fetch('/api/tasks', { method: 'POST', ... })`) — no component above `Board` would need to change. Two paths I'd consider, in order of how much this would need to actually scale:
1. A small REST API (Express + Postgres/SQLite, or a BaaS like Supabase) fronted by the same reducer shape, with optimistic updates and rollback-on-error.
2. If real-time multi-user collaboration mattered (two people editing the same board), a sync engine (Firestore, Supabase Realtime, or a CRDT-based store like Yjs) rather than a plain REST API.

## Notable implementation details

- **IDs** use `crypto.randomUUID()` (with a fallback) rather than auto-incrementing integers, since that's what a real API-backed version would hand back anyway.
- **Card tilt** is derived deterministically from the task id (`utils/helpers.js: tiltFor`), not randomized on every render — otherwise cards would visibly "jitter" their rotation on unrelated re-renders (e.g. typing in the search box).
- **Overdue detection** excludes Completed tasks and compares against the local midnight boundary, not a raw timestamp diff.
- **Validation**: title and due date are required — leaving either empty and hitting save shows an inline "Enter details" message under that field instead of saving. Description is optional (defaults to "No description." in the read view); priority always has a value since its control is a dropdown, not free text.
- **Priority and due date use custom controls** (`components/ui/Dropdown.jsx`, `components/ui/DatePicker.jsx`), not the native `<select>`/`<input type="date">`. The native versions render as the OS/browser's own popup, which can't be restyled consistently across browsers — building small self-contained controls kept them visually consistent with the rest of the paper/neumorphic design instead.
- **Deleting a task always confirms first** via `ConfirmDialog.jsx`, from both the card's inline delete icon and the detail modal's trash icon. It renders through a React portal to `document.body` rather than inline, since a plain `position: fixed` element nested inside a rotated `.card` would otherwise be repositioned relative to that rotated ancestor instead of the viewport.

## Deploying

This is a static Vite build (`npm run build` → `dist/`), so it deploys to Vercel, Netlify, or GitHub Pages with zero server-side config. Because storage is `localStorage`, a live deployed link works correctly for a reviewer trying it out — each visitor gets their own local data, with no shared backend to provision.
