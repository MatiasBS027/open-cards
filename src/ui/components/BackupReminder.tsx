import { downloadJson, exportAll } from '../../importExport/exportLibrary'

type Props = {
  onDismiss: () => void
  onExported: () => void
}

export function BackupReminder({ onDismiss, onExported }: Props) {
  return (
    <aside className="backup-banner" role="status">
      <p className="backup-banner-text">
        Han pasado 14 días o más con cambios sin exportar. Conviene un respaldo
        JSON de tu biblioteca.
      </p>
      <div className="row gap wrap">
        <button
          type="button"
          className="primary"
          onClick={() =>
            void exportAll()
              .then((data) => {
                downloadJson('open-cards-biblioteca.json', data)
                onExported()
              })
              .catch((err: Error) => alert(err.message))
          }
        >
          Exportar ahora
        </button>
        <button type="button" className="ghost" onClick={onDismiss}>
          Más tarde
        </button>
      </div>
    </aside>
  )
}
