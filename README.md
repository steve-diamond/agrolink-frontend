# Agrolink Frontend

This repository contains the frontend codebase for Agrolink, organized for both web and mobile platforms.

## Structure

- `web/` — React/Next.js web application
  - `components/` — Shared and UI components
  - `lib/` — Utility libraries and context
  - `pages/` — Main web pages (dashboard, login, register, etc.)
  - `public/` — Static assets (images, icons, manifest, etc.)
  - `services/` — API and business logic
  - `styles/` — Global and component styles
- `mobile/` — React Native mobile application (legacy, see `web/mobile/` for new location)
- `web/mobile/` — React Native mobile application (migrated)
  - `assets/` — Images and static assets
  - `components/` — Mobile UI components
  - `screens/` — Main app screens (Login, Register, Dashboard, etc.)
  - `services/` — API and business logic

## Migration Notes
- All legacy frontend code from the old monolithic Next.js app has been migrated to the new structure.
- Mobile code is now under `web/mobile/` for unified management.
- Remove the old `mobile/` folder after verifying the migration.

## Getting Started
- For web: see `web/README.md` (or run `npm install` in `web/`)
- For mobile: see `web/mobile/README.md` (or run `npm install` in `web/mobile/`)

---
For more details, see the documentation in the `docs/` folder.
