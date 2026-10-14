import type { Block } from './types'

export function canonicalizeBlocks(blocks: Block[]): string {
  return JSON.stringify(blocks)
}

export function blockHasContent(block: Block): boolean {
  return block.content.trim().length > 0
}

export function sideHasContent(blocks: Block[]): boolean {
  return blocks.some(blockHasContent)
}

export function isCardContentValid(front: Block[], back: Block[]): boolean {
  return sideHasContent(front) && sideHasContent(back)
}

export function emptyTextBlock(): Block {
  return { type: 'text', content: '' }
}
