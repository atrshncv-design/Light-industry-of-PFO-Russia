# Deployment Brief For The Current PFO Map

## 1. What this repository contains

This repository is meant to distribute the exact map version from the latest delivered archive.

Project type:
- static HTML page
- no backend required for deployment
- no build step
- no database
- no environment variables

## 2. Canonical files

Main published file:
- `index.html`

Related archive page:
- `public/pfo-light-industry.html`

Reference archive variant:
- `public/pfo-light-industry-map.html`

## 3. What the page shows

The page is an interactive map of the light industry situation in the Volga Federal District.

Included data groups in this version:
- employment for `2024`
- shipment for `2024`
- shipment for `2025`
- shipment subcategories for `2024`
- shipment subcategories for `2025`
- productivity for `2024`
- specialization for `2024`
- per-capita production for `2024`

This repository should publish this exact version, not a different archived or simplified map build.

## 4. Deployment requirements

A regular static host is enough.

Required behavior:
1. Use `index.html` as the entry point.
2. Serve it as a UTF-8 HTML document.
3. Keep the repository files as-is.

No install or build commands are needed.

## 5. Local preview

To check the map locally:
1. Open `index.html` directly in a browser.

## 6. Post-deploy verification

After upload, verify that:
1. the page title is `Ситуация в лёгкой промышленности ПФО`
2. the map renders correctly
3. the selector changes indicators
4. the `2024` and `2025` shipment views are available
5. regional details update on click
6. PNG export works

## 7. Publishing note

If someone opens or downloads this repository, they should receive the current archive-based map version represented by `index.html`, which should be treated as the canonical published file.
