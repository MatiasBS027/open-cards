import { useEffect, type ReactNode } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { db, ensureSettings } from './storage/db'
import { ReloadPrompt } from './ui/components/ReloadPrompt'
import { CardEditPage } from './ui/pages/CardEditPage'
import { DeckPage } from './ui/pages/DeckPage'
import { HomePage } from './ui/pages/HomePage'
import { ImportPage } from './ui/pages/ImportPage'
import { MathLabPage } from './ui/pages/MathLabPage'
import { StudyPage } from './ui/pages/StudyPage'
import { useTheme } from './ui/theme'

function ThemeBoot({ children }: { children: ReactNode }) {
  useTheme()
  return children
}

export default function App() {
  useEffect(() => {
    void (async () => {
      const settings = await ensureSettings()
      if (!settings.storagePersistAsked && navigator.storage?.persist) {
        try {
          await navigator.storage.persist()
        } catch {
          // ignore unsupported persist()
        }
        await db.settings.update('app', { storagePersistAsked: true })
      }
    })()
  }, [])

  return (
    <HashRouter>
      <ThemeBoot>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/decks/:deckId" element={<DeckPage />} />
          <Route
            path="/decks/:deckId/cards/:cardId"
            element={<CardEditPage />}
          />
          <Route path="/decks/:deckId/study" element={<StudyPage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/math-lab" element={<MathLabPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ReloadPrompt />
      </ThemeBoot>
    </HashRouter>
  )
}
