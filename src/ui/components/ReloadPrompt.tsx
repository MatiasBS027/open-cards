import { useRegisterSW } from 'virtual:pwa-register/react'

export function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        void registration.update()
      }
    },
  })

  if (!needRefresh) return null

  return (
    <div className="toast pwa-update" role="status">
      <span>Hay una versión nueva disponible.</span>
      <button
        type="button"
        onClick={() => {
          void updateServiceWorker(true)
        }}
      >
        Actualizar
      </button>
      <button
        type="button"
        className="ghost"
        onClick={() => setNeedRefresh(false)}
      >
        Más tarde
      </button>
    </div>
  )
}
