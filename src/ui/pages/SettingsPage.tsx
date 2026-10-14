import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ThemePreference } from '../../domain/types'
import { downloadJson, exportAll } from '../../importExport/exportLibrary'
import { useTheme } from '../theme'

const GITHUB_USER = 'MatiasBS027'
const GITHUB_URL = `https://github.com/${GITHUB_USER}`
const AVATAR_URL = `https://github.com/${GITHUB_USER}.png?size=96`

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    document.title = 'Ajustes · Open Cards'
    return () => {
      document.title = 'Open Cards'
    }
  }, [])

  return (
    <div className="page settings-page">
      <header className="page-header">
        <div className="page-header-main">
          <Link className="muted" to="/">
            ← Mazos
          </Link>
          <h1>Ajustes</h1>
        </div>
      </header>

      <a
        className="settings-profile-card"
        href={GITHUB_URL}
        target="_blank"
        rel="noreferrer"
      >
        <img
          className="settings-avatar"
          src={AVATAR_URL}
          alt=""
          width={48}
          height={48}
          decoding="async"
        />
        <span className="settings-profile-text">
          <strong>@{GITHUB_USER}</strong>
          <span className="muted">Perfil en GitHub</span>
        </span>
        <span className="settings-chevron" aria-hidden>
          ›
        </span>
      </a>

      <section className="settings-group" aria-label="Apariencia">
        <h2 className="settings-group-title">Apariencia</h2>
        <div className="settings-card">
          <label className="settings-row settings-row-select">
            <span className="settings-row-main">
              <span className="settings-icon settings-icon-purple" aria-hidden>
                ◐
              </span>
              <span>
                <strong>Tema</strong>
                <span className="muted">Claro, oscuro o sistema</span>
              </span>
            </span>
            <select
              aria-label="Tema"
              value={theme}
              onChange={(e) => void setTheme(e.target.value as ThemePreference)}
            >
              <option value="system">Sistema</option>
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
            </select>
          </label>
        </div>
      </section>

      <section className="settings-group" aria-label="Datos">
        <h2 className="settings-group-title">Datos</h2>
        <div className="settings-card">
          <Link className="settings-row" to="/import">
            <span className="settings-row-main">
              <span className="settings-icon settings-icon-blue" aria-hidden>
                ↓
              </span>
              <span>
                <strong>Importar</strong>
                <span className="muted">JSON de mazos o biblioteca</span>
              </span>
            </span>
            <span className="settings-chevron" aria-hidden>
              ›
            </span>
          </Link>
          <button
            type="button"
            className="settings-row"
            disabled={exporting}
            onClick={() => {
              setExporting(true)
              void exportAll()
                .then((data) => downloadJson('open-cards-biblioteca.json', data))
                .catch((err: Error) => alert(err.message))
                .finally(() => setExporting(false))
            }}
          >
            <span className="settings-row-main">
              <span className="settings-icon settings-icon-green" aria-hidden>
                ↑
              </span>
              <span>
                <strong>Exportar biblioteca</strong>
                <span className="muted">Respaldo JSON completo</span>
              </span>
            </span>
            <span className="settings-chevron" aria-hidden>
              ›
            </span>
          </button>
        </div>
      </section>

      <section className="settings-group" aria-label="Acerca de">
        <h2 className="settings-group-title">Acerca de</h2>
        <div className="settings-card">
          <div className="settings-row static">
            <span className="settings-row-main">
              <span className="settings-icon settings-icon-yellow" aria-hidden>
                i
              </span>
              <span>
                <strong>Versión</strong>
                <span className="muted">0.1.2 · local-first</span>
              </span>
            </span>
          </div>
          <a
            className="settings-row"
            href="https://github.com/MatiasBS027/open-cards/releases/latest"
            target="_blank"
            rel="noreferrer"
          >
            <span className="settings-row-main">
              <span className="settings-icon settings-icon-teal" aria-hidden>
                ⬇
              </span>
              <span>
                <strong>Descargar APK</strong>
                <span className="muted">GitHub Releases</span>
              </span>
            </span>
            <span className="settings-chevron" aria-hidden>
              ›
            </span>
          </a>
          <a
            className="settings-row"
            href="https://github.com/MatiasBS027/open-cards"
            target="_blank"
            rel="noreferrer"
          >
            <span className="settings-row-main">
              <span className="settings-icon settings-icon-ink" aria-hidden>
                ⌂
              </span>
              <span>
                <strong>Código fuente</strong>
                <span className="muted">github.com/MatiasBS027/open-cards</span>
              </span>
            </span>
            <span className="settings-chevron" aria-hidden>
              ›
            </span>
          </a>
        </div>
      </section>
    </div>
  )
}
