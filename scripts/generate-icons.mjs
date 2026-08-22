import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = join(root, 'scripts', 'icons')
const outDir = join(root, 'public', 'icons')

mkdirSync(outDir, { recursive: true })

async function render(src, out, size) {
  await sharp(join(srcDir, src)).resize(size, size).png().toFile(join(outDir, out))
  console.log(`✓ ${out} (${size}×${size})`)
}

await render('icon.svg', 'icon-192.png', 192)
await render('icon.svg', 'icon-512.png', 512)
await render('maskable.svg', 'maskable-512.png', 512)
await render('icon.svg', 'apple-touch-icon.png', 180)

console.log('Iconos generados.')
