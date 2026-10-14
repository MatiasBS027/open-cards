import { describe, expect, it, vi } from 'vitest'
import { checkForAppUpdate, fetchLatestRelease } from './checkUpdate'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('checkUpdate', () => {
  it('parses latest release and picks APK asset', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse({
        tag_name: 'v0.2.0',
        name: 'Open Cards 0.2.0',
        body: 'Changelog…',
        html_url: 'https://github.com/MatiasBS027/open-cards/releases/tag/v0.2.0',
        assets: [
          {
            name: 'open-cards-0.2.0.apk',
            browser_download_url:
              'https://github.com/MatiasBS027/open-cards/releases/download/v0.2.0/open-cards-0.2.0.apk',
          },
        ],
      }),
    )
    const release = await fetchLatestRelease(fetchImpl)
    expect(release?.version).toBe('0.2.0')
    expect(release?.apkUrl).toContain('.apk')
  })

  it('returns update only when newer than current', async () => {
    const payload = {
      tag_name: 'v0.1.4',
      name: null,
      body: null,
      html_url: 'https://example.com',
      assets: [],
    }
    const fetchImpl = vi.fn().mockImplementation(() =>
      Promise.resolve(jsonResponse(payload)),
    )
    expect(await checkForAppUpdate('0.1.4', fetchImpl)).toBeNull()
    expect(await checkForAppUpdate('0.1.3', fetchImpl)).toMatchObject({
      version: '0.1.4',
    })
  })
})
