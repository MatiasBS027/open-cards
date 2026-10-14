# Changelog

All notable changes to Open Cards are documented here.

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
- Settings page (GitHub profile, theme, import/export, APK/repo links).
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
