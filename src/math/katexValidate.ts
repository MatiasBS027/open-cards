import katex from 'katex'

export function isLatexRenderable(latex: string): boolean {
  const trimmed = latex.trim()
  if (!trimmed) return false
  try {
    katex.renderToString(trimmed, {
      throwOnError: true,
      trust: false,
      strict: 'ignore',
    })
    return true
  } catch {
    return false
  }
}

export function renderLatexToHtml(latex: string, displayMode: boolean): string {
  return katex.renderToString(latex, {
    throwOnError: true,
    trust: false,
    strict: 'ignore',
    displayMode,
  })
}

export function tryRenderLatex(
  latex: string,
  displayMode: boolean,
): { ok: true; html: string } | { ok: false; error: string } {
  try {
    return {
      ok: true,
      html: renderLatexToHtml(latex, displayMode),
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Fórmula no válida',
    }
  }
}
