# Deployment Brief For The Current PFO Map

## 1. What this repository contains

This repository is meant to distribute the exact map version from the delivered archive.

Project type:
- Next.js application with a static map page
- no custom backend required for deployment
- map itself stored as a static HTML file

## 2. Canonical files

Main application entry:
- `src/app/page.tsx`

Canonical published map file:
- `public/pfo-map.html`

Supporting assets:
- `public/pfo-logo.svg`
- `public/pfo-robots.txt`
- `download/`

## 3. What the page shows

The page is an interactive map of the light industry situation in the Volga Federal District.

This repository should publish this exact version, not a different archived or nested map build.

## 4. Deployment requirements

Required behavior:
1. Use the repository root as the application source.
2. Publish the current Next.js app.
3. Keep `public/pfo-map.html` as the canonical map asset.

## 5. Local preview

To check the map locally:
1. Run `npm install`
2. Run `npm run dev`
3. Open the local app and confirm that `public/pfo-map.html` is loaded

## 6. Publishing note

If someone opens or downloads this repository, they should receive the current archive-based map version represented by the repository root and `public/pfo-map.html`.
