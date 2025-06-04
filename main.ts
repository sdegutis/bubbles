import { DevServer } from "immaculata/dev-server.js"
import { generateFiles } from "immaculata/file-generator.js"
import { FileTree } from "immaculata/filetree.js"
import { tryAltExts, useTree } from "immaculata/hooks.js"
import { registerHooks } from "node:module"

const site = new FileTree('site', import.meta.dirname)

registerHooks(useTree(site))
registerHooks(tryAltExts)

if (process.argv[2] === 'dev') {
  const server = new DevServer(8181, { hmrPath: '/reload' })
  server.files = await processSite()
  site.watch().on('filesUpdated', async () => {
    server.files = await processSite()
    server.reload()
  })
}
else {
  generateFiles(await processSite())
}

async function processSite() {
  const mod = await import('./site/process.js')
  return mod.run(site)
}
