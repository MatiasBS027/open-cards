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
