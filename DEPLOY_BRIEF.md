# Deployment Brief For The Archived PFO Map

## 1. What this repository contains

This repository is meant to distribute the exact map version from the delivered archive.

Project type:
- static HTML page
- no backend required for deployment
- no build step
- no database
- no environment variables

## 2. Canonical files

Main published file:
- `index.html`

Matching source copy:
- `public/pfo-light-industry.html`

Reference archive variant:
- `public/pfo-light-industry-map.html`

Optional local preview server:
- `server.js`

## 3. What the page shows

The page is an interactive map of the light industry situation in the Volga Federal District.

Included data groups in this archived version:
- employment
- shipment
- productivity
- specialization

This repository should publish this exact version, not a different extended or alternate map build.

## 4. Deployment requirements

A regular static host is enough.

Required behavior:
1. Use `index.html` as the entry point.
2. Serve it as a UTF-8 HTML document.
3. Keep the repository files as-is.

No install or build commands are needed.

## 5. Local preview

Two simple ways to check the map locally:
1. Open `index.html` directly in a browser.
2. Run `node server.js` and open `http://localhost:3000/`.

## 6. Post-deploy verification

After upload, verify that:
1. the page title is `Ситуация в лёгкой промышленности ПФО`
2. the map renders correctly
3. the selector changes indicators
4. regional details update on click
5. PNG export works

## 7. Publishing note

If someone opens or downloads this repository, they should receive the archived map version represented by the current `index.html`.
