import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { SplitText as GSAPSplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(GSAPSplitText, useGSAP)

type Props = {
  text: string
  className?: string
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  delay?: number
  duration?: number
}

/** Word-level slice entrance for titles. Falls back to static text if reduced-motion. */
export function SplitText({
  text,
  className = '',
  tag = 'h1',
  delay = 40,
  duration = 0.45,
}: Props) {
  const ref = useRef<HTMLElement>(null)
  const done = useRef(false)

  useGSAP(
    () => {
      const el = ref.current
      if (!el || done.current) return

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) return

      const split = new GSAPSplitText(el, {
        type: 'words',
        wordsClass: 'split-word',
      })

      gsap.fromTo(
        split.words,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger: delay / 1000,
          ease: 'power2.out',
          onComplete: () => {
            done.current = true
          },
        },
      )

      return () => {
        split.revert()
      }
    },
    { dependencies: [text, delay, duration], scope: ref },
  )

  useEffect(() => {
    done.current = false
  }, [text])

  const Tag = tag
  return (
    <Tag ref={ref as never} className={`split-parent ${className}`.trim()}>
      {text}
    </Tag>
  )
}
