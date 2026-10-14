import type { ReleaseUpdate } from '../../update/checkUpdate'

type Props = {
  update: ReleaseUpdate
  onDismiss: () => void
}

export function UpdateBanner({ update, onDismiss }: Props) {
  const downloadHref = update.apkUrl ?? update.htmlUrl

  return (
    <aside className="update-banner" role="status">
      <p className="update-banner-text">
        Hay una actualización disponible: <strong>{update.tagName}</strong>
        {update.name && update.name !== update.tagName ? (
          <>
            {' '}
            · {update.name}
          </>
        ) : null}
        . Instalá el APK nuevo desde GitHub Releases.
      </p>
      <div className="row gap wrap">
        <a className="button primary" href={downloadHref} target="_blank" rel="noreferrer">
          Descargar actualización
        </a>
        <a className="button ghost" href={update.htmlUrl} target="_blank" rel="noreferrer">
          Ver cambios
        </a>
        <button type="button" className="ghost" onClick={onDismiss}>
          Más tarde
        </button>
      </div>
    </aside>
  )
}
