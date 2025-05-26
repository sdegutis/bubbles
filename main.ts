import { DevServer, FileTree, Pipeline } from "immaculata"
import { stripTypeScriptTypes } from "module"

const site = new FileTree('site', import.meta.dirname)
const server = new DevServer(8181)

async function run() {
  const files = Pipeline.from(site.files)

  files.with(/\.ts$/).do(f => {
    f.path = f.path.replace(/\.ts$/, '.js')
    f.text = stripTypeScriptTypes(f.text)
  })

  server.files = files.results()
}

run()
site.watch().on('filesUpdated', run)
