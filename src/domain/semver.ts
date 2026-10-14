/** Compare dotted semver cores (ignores leading `v` and `-suffix`). */
export function compareSemver(a: string, b: string): number {
  const norm = (v: string) =>
    v
      .trim()
      .replace(/^v/i, '')
      .split('-')[0]!
      .split('.')
      .map((p) => Number.parseInt(p, 10) || 0)
  const aa = norm(a)
  const bb = norm(b)
  const len = Math.max(aa.length, bb.length, 3)
  for (let i = 0; i < len; i++) {
    const x = aa[i] ?? 0
    const y = bb[i] ?? 0
    if (x > y) return 1
    if (x < y) return -1
  }
  return 0
}

export function isNewerSemver(latest: string, current: string): boolean {
  return compareSemver(latest, current) > 0
}
