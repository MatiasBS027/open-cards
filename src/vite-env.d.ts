/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />
/// <reference types="vite-plugin-pwa/client" />

import type { DetailedHTMLProps, HTMLAttributes } from 'react'

declare global {
  const __APP_VERSION__: string
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & {
          value?: string
          'virtual-keyboard-mode'?: string
        },
        HTMLElement
      >
    }
  }
}

export {}
