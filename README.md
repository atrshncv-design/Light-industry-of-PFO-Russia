# PFO Light Industry Map

This repository contains the current map application from the delivered archive.

## What is in this repository
- Next.js wrapper application in the repository root
- full-screen map entry in `src/app/page.tsx`
- canonical published map file in `public/pfo-map.html`
- supporting assets such as `public/pfo-logo.svg` and `public/pfo-robots.txt`
- source data and helper scripts in `download/`

## Canonical version
- The canonical application lives in the repository root.
- The canonical map file for publication is `public/pfo-map.html`.
- This repository is intended to download and publish this exact map version from the archive.

## Local run
```bash
npm install
npm run dev
```

## Notes
- Local-only archive artifacts such as `.env`, `upload/`, `worklog.md`, and the nested `Light-industry-of-PFO-Russia/` repository are intentionally excluded from this repository.
- If someone opens or downloads this repository, they should receive this map version, not a different archive snapshot.
