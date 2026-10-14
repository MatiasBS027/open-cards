import {
  useEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { gsap } from 'gsap'

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  duration?: number
  delay?: number
  blur?: boolean
  y?: number
}

/** Mount fade/slide for list items. Skips motion when reduced-motion is on. */
export function FadeContent({
  children,
  duration = 0.35,
  delay = 0,
  blur = false,
  y = 10,
  className = '',
  style,
  ...props
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      gsap.set(el, { autoAlpha: 1, y: 0, filter: 'none' })
      return
    }

    gsap.fromTo(
      el,
      {
        autoAlpha: 0,
        y,
        filter: blur ? 'blur(6px)' : 'blur(0px)',
      },
      {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        duration,
        delay,
        ease: 'power2.out',
        clearProps: 'filter',
      },
    )

    return () => {
      gsap.killTweensOf(el)
    }
  }, [blur, delay, duration, y])

  return (
    <div
      ref={ref}
      className={className}
      style={{ visibility: 'hidden', ...style }}
      {...props}
    >
      {children}
    </div>
  )
}
