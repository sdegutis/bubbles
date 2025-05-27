import { DevServer, FileTree, generateFiles, Pipeline } from "immaculata"
import { stripTypeScriptTypes } from "module"

const site = new FileTree('site', import.meta.dirname)

if (process.argv[2] === 'dev') {
  const server = new DevServer(8181, { hmrPath: '/reload' })
  server.files = run()
  site.watch().on('filesUpdated', () => {
    server.files = run()
    server.reload()
  })
}
else {
  generateFiles(run())
}

function run() {
  const files = Pipeline.from(site.files)

  files.with(/\.ts$/).do(f => {
    f.path = f.path.replace(/\.ts$/, '.js')
    f.text = stripTypeScriptTypes(f.text)
  })

  return files.results()
}
