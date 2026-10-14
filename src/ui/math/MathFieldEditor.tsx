import { useEffect, useRef } from 'react'
import 'mathlive'

type Props = {
  value: string
  onChange: (latex: string) => void
  label?: string
}

export function MathFieldEditor({ value, onChange, label }: Props) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handler = () => {
      const latex = (el as HTMLElement & { value: string }).value
      onChange(latex)
    }
    el.addEventListener('input', handler)
    return () => el.removeEventListener('input', handler)
  }, [onChange])

  useEffect(() => {
    const el = ref.current as (HTMLElement & { value: string }) | null
    if (el && el.value !== value) {
      el.value = value
    }
  }, [value])

  return (
    <label className="field">
      {label ? <span>{label}</span> : null}
      <math-field
        ref={ref as never}
        className="math-field"
        virtual-keyboard-mode="manual"
      >
        {value}
      </math-field>
    </label>
  )
}
