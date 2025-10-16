# Fortheweebs Runtime

[![CI](https://github.com/polotuspossumus-coder/Fortheweebs/actions/workflows/ci.yml/badge.svg)](https://github.com/polotuspossumus-coder/Fortheweebs/actions/workflows/ci.yml)

Minimal instructions

Install dependencies:

```powershell
npm install
```

Run linting and tests:

```powershell
npm run lint
npm test
```

Update snapshots:

```powershell
npm test -- -u
```

If you want to build or package the Electron app:

```powershell
npm run build
npm run package
```

See `CONTRIBUTING.md` for a short PR checklist.

Demo
----

There's a small interactive demo for the `LineageMap` component included. It lets you toggle multi-select and aria-live announcements, view a selection history, and reset the visual selection.

Run the demo locally with Vite (PowerShell):

```powershell
npm run dev:demo
```

Open the demo in the browser at http://localhost:5173/demo-lineage.html (or http://localhost:5173/). Controls available in the demo:

- Multi-select: toggle between selecting multiple nodes or single-select mode.
- Announce selections: toggles whether selection changes are announced via the component's aria-live region.
- Reset button (or press `r`): clears the demo's reported selection and visual highlights.

Programmatic API:

The `LineageMap` component exposes an imperative API via `ref`. Example:

```jsx
import { LineageMap } from './components/LineageMap';
const ref = React.createRef();
<LineageMap ref={ref} ... />
// later
ref.current.clearSelection();
```
