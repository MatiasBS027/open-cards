type Props = {
  message: string
  onUndo: () => void
  onDismiss: () => void
}

export function UndoToast({ message, onUndo, onDismiss }: Props) {
  return (
    <div className="toast" role="status">
      <span>{message}</span>
      <button type="button" onClick={onUndo}>
        Deshacer
      </button>
      <button type="button" className="ghost" onClick={onDismiss}>
        Cerrar
      </button>
    </div>
  )
}
