# Changelog

All notable changes to Open Cards are documented here.

## [v0.1.6](https://github.com/MatiasBS027/open-cards/releases/tag/v0.1.6) — 2026-10-14

### Fixed

- Deck card grid: preview-only by default (no overlapping Editar/Duplicar/Eliminar). **Editar tarjetas** toggles the manage/reorder chrome.
- Release signing Gradle config (`keyAlias` Groovy clash) so the signed APK workflow can finish.

### Changed

- APK Releases are signed with a stable keystore stored only as GitHub Actions secrets (not in git). Artifact name: `open-cards-vX.Y.Z.apk`.
- One-time uninstall needed when upgrading from unsigned/debug CI APKs (v0.1.0–v0.1.5) because the signing key changed.

## [v0.1.5](https://github.com/MatiasBS027/open-cards/releases/tag/v0.1.5) — 2026-10-14

### Added

- In-app update check against GitHub Releases (home banner + Settings → Buscar actualización). Opens the APK / release page; dismiss remembers the version.
- Docs sync for local profile, OC logo, APK-first notes, and update flow (SPEC v2.3).
- SPEC §20 notes next-iteration SpotiFLAC-inspired update ideas (changelog dialog, ETag cache, in-app APK install, ABI pick, soft force-update).

## [v0.1.4](https://github.com/MatiasBS027/open-cards/releases/tag/v0.1.4) — 2026-10-14

### Changed

- Local profile (name + photo) in Settings — not tied to GitHub.
- Home chrome uses a person icon by default (Spotiflac-style); custom photo when set.
- Bell / settings controls aligned with Primer radii and muted icons.

## [v0.1.3](https://github.com/MatiasBS027/open-cards/releases/tag/v0.1.3) — 2026-10-14

### Fixed

- OC logo uses typographic monogram (clear C) matching Figma.

## [v0.1.2](https://github.com/MatiasBS027/open-cards/releases/tag/v0.1.2) — 2026-10-14

### Added

- OC monogram logo (geometric O + blue C) for app, PWA, and Android icons.
- Settings page (local profile placeholder later refined in v0.1.4, theme, import/export, APK/repo links).
- Notifications inbox + home bell; backup reminder also lands there.

### Fixed

- Flashcard grid overflow on phone: clip content that does not fit.

### Changed

- Home chrome: avatar → settings; removed Math lab / import-export from header.

## [v0.1.1](https://github.com/MatiasBS027/open-cards/releases/tag/v0.1.1) — 2026-10-14

### Added

- Backup reminder after 14 days with unsaved export changes (EXP-03).
- Library search for decks and cards; tag filter (AND) on the home page (SRC-*).
- Duplicate deck; duplicate / move card between decks (DUP/MOV).
- Docs sync: SPEC v2.2, AGENTS Capacitor notes, CHANGELOG; APK-first wording; pnpm-only commands (no npm / package-lock).

## [v0.1.0](https://github.com/MatiasBS027/open-cards/releases/tag/v0.1.0) — 2026-10-14

### Added

- GitHub Primer–style UI (gray canvas, white surfaces).
- Brand mark: white fanned cards with gray strokes (Figma-aligned).
- Capacitor Android wrap and APK release workflow (`v*` tags).
- Explicit **Usar JSON** on import paste (no blur auto-advance).

### Fixed

- Deck card drag-and-drop snap-back (`assignPositions` after reorder).
- While editing a deck, hide header **Editar mazo** and the study controls block.

### Docs

- README with demo, APK download, Brave vs Chrome note.
