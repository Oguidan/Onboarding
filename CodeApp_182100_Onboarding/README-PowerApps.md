# Power Apps "Whole App" (Canvas) - React + TypeScript + Fluent UI

This project is a Vite React + TypeScript starter configured to be used as a "whole application" inside Power Apps Canvas using the new feature that allows embedding web apps.

IMPORTANT: For this demo and onboarding/offboarding collaborator app, the data source is mock/fake data only. The app does NOT call Dataverse or any production API. This makes it simple to run locally or embed for demonstrations.

What I added

- Fluent UI v9 (`@fluentui/react-components`) and icons
- Minimal TypeScript shim for Power Apps context (`src/types/powerapps.d.ts`)
- Example component using Fluent UI Button in `src/App.tsx`

Development

1. Install deps

```bash
npm install
```

2. Run dev server

```bash
npm run dev
```

Open: http://localhost:3000/

Building for production

```bash
npm run build
```

This runs `tsc -b && vite build` and produces a `dist` folder with static assets.

Packaging for Power Apps

Power Apps Canvas expects a hosted web app. You can host the `dist` output on any static host (Azure Storage Static Website, CDN, GitHub Pages), or package the files into a ZIP if the platform integration requires upload.

Example: create a zip of the `dist` folder:

```bash
# from project root
npm run build
cd dist
zip -r ../app-dist.zip .
```

Embedding in Power Apps (high-level)

- Host the app on HTTPS.
- In Power Apps Canvas, use the "Embed" or "Web resource" feature to point at your hosted app URL.
- Optionally, pass parameters through query string or postMessage.

Demo / providing a user identity

- Query string: you can open the app in a browser with `?userId=agal-user-1` to see mocked data for that user.
- postMessage: the Canvas or embedding container can post a message to the iframe with the shape:

```js
window.frames[0].postMessage(JSON.stringify({ type: 'powerapps-context', payload: { userId: 'agal-user-1' } }), '*')
```

The app listens for `powerapps-context` messages and will load the mocked data for the provided `userId`.

Notes and next steps

- If you want stronger typing for Power Apps runtime, we can add a fuller set of types or integrate PCF tooling.
- I can add a small postMessage bridge to facilitate communications between Power Apps and the embedded app.
- If you want the repo to produce a deployable Azure Static Web App or Azure Storage pipeline, I can add GitHub Actions workflows.
