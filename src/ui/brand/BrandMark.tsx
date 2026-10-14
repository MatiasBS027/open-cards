import { Link } from 'react-router-dom'
import { SplitText } from '../motion/SplitText'

type Props = {
  title?: string
  to?: string | null
  size?: number
  animated?: boolean
}

export function BrandMark({
  title = 'Open Cards',
  to = '/',
  size = 36,
  animated = false,
}: Props) {
  const text = animated ? (
    <SplitText text={title} tag="span" className="brand-mark-text" />
  ) : (
    <span className="brand-mark-text">{title}</span>
  )

  const mark = (
    <span className="brand-mark">
      <img
        className="brand-mark-icon"
        src={`${import.meta.env.BASE_URL}icon.svg`}
        alt=""
        width={size}
        height={size}
        decoding="async"
      />
      {text}
    </span>
  )

  if (!to) return mark

  return (
    <Link className="brand-mark-link" to={to} aria-label={title}>
      {mark}
    </Link>
  )
}
