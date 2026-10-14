/**
 * Rasterize public/icon.svg into PWA PNGs and Android launcher icons.
 * Run: node scripts/generate-icons.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(root, '..')
const svgPath = path.join(projectRoot, 'public', 'icon.svg')
const svg = fs.readFileSync(svgPath)

const transparent = { r: 0, g: 0, b: 0, alpha: 0 }
const lightGray = { r: 246, g: 248, b: 250, alpha: 1 }

async function writePng(outPath, size, background, paddingRatio = 0) {
  const canvas = size
  const content = Math.round(size * (1 - paddingRatio))
  const pad = Math.round((canvas - content) / 2)
  const resized = await sharp(svg, { density: 384 })
    .resize(content, content, { fit: 'contain', background })
    .png()
    .toBuffer()
  await sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background,
    },
  })
    .composite([{ input: resized, top: pad, left: pad }])
    .png()
    .toFile(outPath)
  console.log('wrote', path.relative(projectRoot, outPath))
}

await writePng(path.join(projectRoot, 'public', 'pwa-192.png'), 192, transparent)
await writePng(path.join(projectRoot, 'public', 'pwa-512.png'), 512, transparent)

const assetsDir = path.join(projectRoot, 'assets')
fs.mkdirSync(assetsDir, { recursive: true })
await writePng(path.join(assetsDir, 'icon.png'), 1024, lightGray, 0.12)
await writePng(path.join(assetsDir, 'splash.png'), 2732, lightGray, 0.45)

const androidDensities = [
  ['mipmap-mdpi', 48],
  ['mipmap-hdpi', 72],
  ['mipmap-xhdpi', 96],
  ['mipmap-xxhdpi', 144],
  ['mipmap-xxxhdpi', 192],
]

const androidRes = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res')
if (fs.existsSync(androidRes)) {
  for (const [folder, size] of androidDensities) {
    const dir = path.join(androidRes, folder)
    fs.mkdirSync(dir, { recursive: true })
    // Adaptive-icon style: content inset so the mark stays visible when masked.
    await writePng(path.join(dir, 'ic_launcher.png'), size, lightGray, 0.14)
    await writePng(path.join(dir, 'ic_launcher_round.png'), size, lightGray, 0.18)
    await writePng(path.join(dir, 'ic_launcher_foreground.png'), size, transparent, 0.18)
  }
  const values = path.join(androidRes, 'values', 'ic_launcher_background.xml')
  fs.mkdirSync(path.dirname(values), { recursive: true })
  fs.writeFileSync(
    values,
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#f6f8fa</color>
</resources>
`,
  )
  console.log('wrote android launcher icons')
}
