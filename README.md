# Medication Calculator

A simple medication dosage calculator built with React, Vite, TypeScript, Tailwind CSS, and shadcn/ui.

## Getting started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages

Every push and pull request runs the production build. Pushes to `main` publish the built `dist` directory to GitHub Pages.

Before the first deployment, open **Settings > Pages > Build and deployment** and set **Source** to **GitHub Actions**. Do not publish the repository root or the `main` branch directly: that serves Vite's source `index.html`, which requests `/src/main.tsx` and results in a 404.

For this project repository, the site URL is `https://danielkagemann.github.io/medication-calc/`. Push to `main` after changing the Pages source to trigger a fresh deployment.
