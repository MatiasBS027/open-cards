/** Injected from package.json via Vite `define` (see vite.config.ts). */
export const APP_VERSION = __APP_VERSION__
export const GITHUB_REPO = 'MatiasBS027/open-cards'
export const GITHUB_RELEASES_LATEST = `https://github.com/${GITHUB_REPO}/releases/latest`
export const GITHUB_RELEASES_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`

export const IMPORT_MAX_BYTES = 5 * 1024 * 1024
export const IMPORT_MAX_CARDS_PER_DECK = 1000
export const UNDO_MS = 8000
export const BACKUP_REMINDER_DAYS = 14

export const CODE_LANGUAGES = [
  'plaintext',
  'python',
  'javascript',
  'typescript',
  'java',
  'php',
  'sql',
  'postgresql',
] as const

export type CodeLanguage = (typeof CODE_LANGUAGES)[number]
