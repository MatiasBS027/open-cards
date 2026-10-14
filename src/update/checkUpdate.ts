import {
  APP_VERSION,
  GITHUB_RELEASES_API,
  GITHUB_RELEASES_LATEST,
} from '../config'
import { isNewerSemver } from '../domain/semver'

export type ReleaseUpdate = {
  tagName: string
  version: string
  name: string
  body: string
  htmlUrl: string
  apkUrl: string | null
}

type GithubReleaseAsset = {
  name: string
  browser_download_url: string
  content_type?: string
}

type GithubRelease = {
  tag_name: string
  name: string | null
  body: string | null
  html_url: string
  assets: GithubReleaseAsset[]
}

function pickApkUrl(assets: GithubReleaseAsset[]): string | null {
  const apk = assets.find((a) => a.name.toLowerCase().endsWith('.apk'))
  return apk?.browser_download_url ?? null
}

export async function fetchLatestRelease(
  fetchImpl: typeof fetch = fetch,
): Promise<ReleaseUpdate | null> {
  const res = await fetchImpl(GITHUB_RELEASES_API, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`No se pudo consultar actualizaciones (${res.status}).`)
  }
  const data = (await res.json()) as GithubRelease
  const version = data.tag_name.replace(/^v/i, '')
  return {
    tagName: data.tag_name,
    version,
    name: data.name?.trim() || data.tag_name,
    body: data.body?.trim() ?? '',
    htmlUrl: data.html_url || GITHUB_RELEASES_LATEST,
    apkUrl: pickApkUrl(data.assets ?? []),
  }
}

export async function checkForAppUpdate(
  currentVersion: string = APP_VERSION,
  fetchImpl: typeof fetch = fetch,
): Promise<ReleaseUpdate | null> {
  const latest = await fetchLatestRelease(fetchImpl)
  if (!latest) return null
  if (!isNewerSemver(latest.version, currentVersion)) return null
  return latest
}
