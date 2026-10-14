export function normalizeTagName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase()
}
