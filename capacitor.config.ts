import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Native Android wrap of the same Vite/React app.
 * Web builds for GitHub Pages keep VITE_BASE=/open-cards/;
 * Capacitor builds must use VITE_BASE=/ (see `pnpm build:android`).
 */
const config: CapacitorConfig = {
  appId: 'app.opencards.local',
  appName: 'Open Cards',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
  },
}

export default config
