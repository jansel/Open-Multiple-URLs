import console from 'node:console'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { zipSync } from 'fflate'

const { name, version } = JSON.parse(await readFile('package.json', 'utf8'))
const manifest = JSON.parse(await readFile('dist-chrome/manifest.json', 'utf8'))
if (manifest.version !== version || manifest.action.default_popup) {
  throw new Error('Build a current tab-based release before packaging.')
}
const files = {}
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await collect(path)
    else files[relative('dist-chrome', path).replaceAll('\\', '/')] = await readFile(path)
  }
}
await collect('dist-chrome')
files['LICENSE'] = await readFile('LICENSE')
await mkdir('dist-package', { recursive: true })
const output = `dist-package/${name}-${version}-chrome.zip`
await writeFile(output, zipSync(files, { level: 9, mtime: new Date(2026, 0, 1) }))
console.log(`Created ${output}`)
