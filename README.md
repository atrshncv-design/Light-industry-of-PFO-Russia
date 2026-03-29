# PFO Light Industry Map

This repository contains the exact static HTML version of the PFO light industry map from the delivered archive.

## Canonical files
- `index.html` is the main file to publish and open.
- `public/pfo-light-industry.html` matches `index.html` and is kept as the source copy.
- `public/pfo-light-industry-map.html` is the original archive variant kept for reference.
- `server.js` is a tiny optional local static server for previewing the map in a browser.

## Local preview
- Quick open: open `index.html` directly in a browser.
- Local server: run `node server.js` and open `http://localhost:3000/`.

## Notes
- The repository is intended to download and publish this exact map version.
- No build step, database, or environment variables are required.
