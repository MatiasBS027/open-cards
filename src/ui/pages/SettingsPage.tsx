import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { APP_VERSION, GITHUB_RELEASES_LATEST } from '../../config'
import type { ThemePreference } from '../../domain/types'
import { downloadJson, exportAll } from '../../importExport/exportLibrary'
import { ensureSettings, updateProfile } from '../../storage/db'
import { checkForAppUpdate } from '../../update/checkUpdate'
import { PersonIcon } from '../components/PersonIcon'
import { fileToAvatarDataUrl } from '../profileAvatar'
import { useTheme } from '../theme'

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [exporting, setExporting] = useState(false)
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [profileError, setProfileError] = useState('')
  const [updateStatus, setUpdateStatus] = useState('')
  const [checkingUpdate, setCheckingUpdate] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const reloadProfile = async () => {
    const settings = await ensureSettings()
    setName(settings.profileName)
    setAvatarUrl(settings.profileAvatarDataUrl)
  }

  useEffect(() => {
    document.title = 'Ajustes · Open Cards'
    void reloadProfile()
    return () => {
      document.title = 'Open Cards'
    }
  }, [])

  const openProfileEditor = () => {
    setDraftName(name)
    setProfileError('')
    setEditingProfile(true)
  }

  const saveProfile = async () => {
    await updateProfile({ profileName: draftName.trim() })
    setEditingProfile(false)
    await reloadProfile()
  }

  const onPickPhoto = async (file: File | null) => {
    if (!file) return
    setProfileError('')
    try {
      const dataUrl = await fileToAvatarDataUrl(file)
      await updateProfile({ profileAvatarDataUrl: dataUrl })
      await reloadProfile()
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'No se pudo usar la imagen.')
    }
  }

  const clearPhoto = async () => {
    await updateProfile({ profileAvatarDataUrl: null })
    await reloadProfile()
  }

  const displayName = name.trim() || 'Tu perfil'

  const onCheckUpdate = async () => {
    setCheckingUpdate(true)
    setUpdateStatus('')
    try {
      const update = await checkForAppUpdate()
      if (!update) {
        setUpdateStatus(`Ya estás en la última versión (${APP_VERSION}).`)
        return
      }
      const href = update.apkUrl ?? update.htmlUrl
      setUpdateStatus(
        `Hay una actualización: ${update.tagName}. Abrí Descargar APK o Releases.`,
      )
      window.open(href, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setUpdateStatus(
        err instanceof Error ? err.message : 'No se pudo comprobar la actualización.',
      )
    } finally {
      setCheckingUpdate(false)
    }
  }

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

      {!editingProfile ? (
        <button
          type="button"
          className="settings-profile-card"
          onClick={openProfileEditor}
        >
          <span className="settings-avatar-wrap">
            {avatarUrl ? (
              <img
                className="settings-avatar"
                src={avatarUrl}
                alt=""
                width={48}
                height={48}
                decoding="async"
              />
            ) : (
              <span className="settings-avatar settings-avatar-placeholder">
                <PersonIcon size={26} />
              </span>
            )}
          </span>
          <span className="settings-profile-text">
            <strong>{displayName}</strong>
            <span className="muted">Editar nombre y foto</span>
          </span>
          <span className="settings-chevron" aria-hidden>
            ›
          </span>
        </button>
      ) : (
        <section className="panel stack settings-profile-editor">
          <h2>Tu perfil</h2>
          <p className="muted">
            Solo se guarda en este dispositivo. No está ligado a GitHub ni a ninguna
            cuenta.
          </p>
          <div className="settings-avatar-edit">
            {avatarUrl ? (
              <img
                className="settings-avatar settings-avatar-lg"
                src={avatarUrl}
                alt=""
                width={72}
                height={72}
              />
            ) : (
              <span className="settings-avatar settings-avatar-lg settings-avatar-placeholder">
                <PersonIcon size={36} />
              </span>
            )}
            <div className="row gap wrap">
              <button
                type="button"
                className="button-quiet"
                onClick={() => fileRef.current?.click()}
              >
                Elegir foto
              </button>
              {avatarUrl ? (
                <button type="button" className="button-quiet" onClick={() => void clearPhoto()}>
                  Quitar foto
                </button>
              ) : null}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="file-picker-input"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null
                e.target.value = ''
                void onPickPhoto(file)
              }}
            />
          </div>
          <label className="field">
            <span>Nombre</span>
            <input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Cómo te llamas aquí"
              maxLength={80}
              autoFocus
            />
          </label>
          {profileError ? <p className="math-error">{profileError}</p> : null}
          <div className="row gap wrap">
            <button type="button" onClick={() => void saveProfile()}>
              Guardar
            </button>
            <button
              type="button"
              className="ghost"
              onClick={() => setEditingProfile(false)}
            >
              Cancelar
            </button>
          </div>
        </section>
      )}

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
                <span className="muted">{APP_VERSION} · local-first</span>
              </span>
            </span>
          </div>
          <button
            type="button"
            className="settings-row"
            disabled={checkingUpdate}
            onClick={() => void onCheckUpdate()}
          >
            <span className="settings-row-main">
              <span className="settings-icon settings-icon-teal" aria-hidden>
                ↻
              </span>
              <span>
                <strong>Buscar actualización</strong>
                <span className="muted">
                  {updateStatus || 'Consulta GitHub Releases'}
                </span>
              </span>
            </span>
            <span className="settings-chevron" aria-hidden>
              ›
            </span>
          </button>
          <a
            className="settings-row"
            href={GITHUB_RELEASES_LATEST}
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
