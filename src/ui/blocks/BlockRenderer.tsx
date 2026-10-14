import type { Block } from '../../domain/types'
import { InlineText } from '../math/InlineText'
import { Katex } from '../math/Katex'

type Props = {
  blocks: Block[]
}

export function BlockRenderer({ blocks }: Props) {
  return (
    <div className="blocks">
      {blocks.map((block, i) => {
        if (block.type === 'text') {
          return (
            <p key={i} className="block-text">
              <InlineText content={block.content} />
            </p>
          )
        }
        if (block.type === 'math') {
          return (
            <div key={i} className="block-math">
              <Katex latex={block.content} display />
            </div>
          )
        }
        return (
          <pre key={i} className="block-code">
            <code>{block.content}</code>
          </pre>
        )
      })}
    </div>
  )
}
