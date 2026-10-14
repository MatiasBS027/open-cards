import { useEffect, useState } from 'react'
import type { ThemePreference } from '../domain/types'
import { ensureSettings } from '../storage/db'
import { setTheme as persistTheme } from '../storage/repositories'

function systemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(preference: ThemePreference): void {
  const dark =
    preference === 'dark' || (preference === 'system' && systemDark())
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemePreference>('system')

  useEffect(() => {
    void ensureSettings().then((s) => {
      setThemeState(s.theme)
      applyTheme(s.theme)
    })
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      void ensureSettings().then((s) => applyTheme(s.theme))
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const setTheme = async (next: ThemePreference) => {
    setThemeState(next)
    applyTheme(next)
    await persistTheme(next)
  }

  return { theme, setTheme }
}
