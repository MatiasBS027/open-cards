import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { AppNotification } from '../../domain/types'
import {
  clearNotifications,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../storage/notifications'

export function NotificationsPage() {
  const [items, setItems] = useState<AppNotification[]>([])

  const reload = async () => {
    setItems(await listNotifications())
  }

  useEffect(() => {
    void reload()
  }, [])

  return (
    <div className="page settings-page">
      <header className="page-header">
        <div className="page-header-main">
          <Link className="muted" to="/">
            ← Mazos
          </Link>
          <h1>Notificaciones</h1>
        </div>
        <div className="page-header-actions">
          {items.length > 0 ? (
            <>
              <button
                type="button"
                className="button-quiet"
                onClick={() => void markAllNotificationsRead().then(reload)}
              >
                Marcar leídas
              </button>
              <button
                type="button"
                className="button-quiet danger"
                onClick={() => void clearNotifications().then(reload)}
              >
                Vaciar
              </button>
            </>
          ) : null}
        </div>
      </header>

      {items.length === 0 ? (
        <p className="muted">No hay notificaciones por ahora.</p>
      ) : (
        <ul className="notif-list">
          {items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                className={`notif-item${n.read ? '' : ' is-unread'}`}
                onClick={() => void markNotificationRead(n.id).then(reload)}
              >
                <strong>{n.title}</strong>
                <span className="muted">{n.body}</span>
                <span className="notif-meta muted">
                  {new Date(n.createdAt).toLocaleString('es')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
