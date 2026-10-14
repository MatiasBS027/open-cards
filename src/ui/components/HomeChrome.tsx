import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { shouldShowBackupReminder } from '../../domain/backup'
import { ensureSettings } from '../../storage/db'
import {
  pushNotification,
  unreadNotificationCount,
} from '../../storage/notifications'
import { BrandMark } from '../brand/BrandMark'
import { BellIcon } from './BellIcon'
import { PersonIcon } from './PersonIcon'

const BACKUP_NOTIF_ID = 'backup-reminder'

type Props = {
  showBrand?: boolean
}

export function HomeChrome({ showBrand = true }: Props) {
  const [unread, setUnread] = useState(0)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const settings = await ensureSettings()
      setAvatarUrl(settings.profileAvatarDataUrl)
      if (shouldShowBackupReminder(settings)) {
        await pushNotification({
          id: BACKUP_NOTIF_ID,
          kind: 'backup',
          title: 'Respaldo pendiente',
          body: 'Hay cambios sin exportar desde hace 14 días o más. Exporta tu biblioteca desde Ajustes.',
        })
      }
      setUnread(await unreadNotificationCount())
    })()
  }, [])

  return (
    <header className="page-header home-chrome">
      <div className="page-header-main">
        {showBrand ? (
          <h1 className="brand-heading">
            <BrandMark to={null} animated />
          </h1>
        ) : null}
      </div>
      <div className="page-header-actions home-chrome-actions">
        <Link
          className="chrome-icon-btn"
          to="/notifications"
          aria-label={
            unread > 0
              ? `Notificaciones, ${unread} sin leer`
              : 'Notificaciones'
          }
        >
          <BellIcon />
          {unread > 0 ? (
            <span className="chrome-badge">{unread > 9 ? '9+' : unread}</span>
          ) : null}
        </Link>
        <Link
          className="chrome-icon-btn chrome-avatar-btn"
          to="/settings"
          aria-label="Ajustes"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" width={28} height={28} decoding="async" />
          ) : (
            <PersonIcon size={20} />
          )}
        </Link>
      </div>
    </header>
  )
}
