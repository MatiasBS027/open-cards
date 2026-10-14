import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import schema from '../../schema/open-cards.v1.schema.json'
import { IMPORT_MAX_BYTES, IMPORT_MAX_CARDS_PER_DECK } from '../config'
import { isCardContentValid } from '../domain/blocks'
import { normalizeImportedState } from '../domain/state'
import type { Block } from '../domain/types'
import { isLatexRenderable } from '../math/katexValidate'
import type { ExportLibrary, ImportDeckDraft } from './types'

const ajv = new Ajv2020({ allErrors: true, strict: false })
addFormats(ajv)
const validateSchema = ajv.compile(schema)

export function checkImportSize(byteLength: number): string | null {
  if (byteLength > IMPORT_MAX_BYTES) {
    return `El archivo supera el límite de ${IMPORT_MAX_BYTES / (1024 * 1024)} MB.`
  }
  return null
}

export function parseImportJson(
  text: string,
): { ok: true; data: ExportLibrary } | { ok: false; error: string } {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, error: 'JSON mal formado.' }
  }
  if (!validateSchema(data)) {
    const detail = validateSchema.errors?.[0]
      ? `${validateSchema.errors[0].instancePath || '/'} ${validateSchema.errors[0].message}`
      : 'esquema inválido'
    return { ok: false, error: `El archivo no cumple el esquema v1 (${detail}).` }
  }
  return { ok: true, data: data as unknown as ExportLibrary }
}

function collectLatexIssues(blocks: Block[]): string[] {
  const issues: string[] = []
  for (const block of blocks) {
    if (block.type === 'math' && block.content.trim() && !isLatexRenderable(block.content)) {
      issues.push(`Fórmula no renderizable: ${block.content.slice(0, 40)}`)
    }
    if (block.type === 'text') {
      const matches = block.content.match(/(?<!\\)\$(.+?)(?<!\\)\$/g)
      if (matches) {
        for (const m of matches) {
          const latex = m.slice(1, -1)
          if (latex && !isLatexRenderable(latex)) {
            issues.push(`Fórmula en línea no renderizable: ${latex.slice(0, 40)}`)
          }
        }
      }
    }
  }
  return issues
}

export function toImportDraft(deck: ExportLibrary['decks'][number]): ImportDeckDraft {
  const warnings: string[] = []
  const errors: string[] = []

  if (deck.cards.length > IMPORT_MAX_CARDS_PER_DECK) {
    errors.push(
      `El mazo tiene más de ${IMPORT_MAX_CARDS_PER_DECK} tarjetas.`,
    )
  }

  const cards = deck.cards.map((card, index) => {
    const front = card.front
    const back = card.back
    if (!isCardContentValid(front, back)) {
      errors.push(`Tarjeta ${index + 1}: frente o reverso sin contenido.`)
    }
    errors.push(...collectLatexIssues(front).map((e) => `Tarjeta ${index + 1} (frente): ${e}`))
    errors.push(...collectLatexIssues(back).map((e) => `Tarjeta ${index + 1} (reverso): ${e}`))
    return {
      front,
      back,
      state: normalizeImportedState(card.state),
    }
  })

  if (!deck.name?.trim()) {
    errors.push('El mazo necesita un nombre.')
  }

  return {
    name: deck.name ?? '',
    description: deck.description ?? '',
    tags: deck.tags ?? [],
    cards,
    warnings,
    errors,
  }
}

export function draftIsConfirmable(draft: ImportDeckDraft): boolean {
  return draft.errors.length === 0 && draft.cards.every((c) => isCardContentValid(c.front, c.back))
}
