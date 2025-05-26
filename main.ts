/// <reference types="immaculata/jsx-strings.js" />
/// <reference types="immaculata/jsx-strings-html.js" />

import { DevServer, FileTree } from "immaculata"
import { compileJsx, mapImport, tryAltExts, useTree } from "immaculata/hooks.js"
import { registerHooks } from "module"
import ts from 'typescript'
import { fileURLToPath } from "url"

const src = new FileTree('src', import.meta.dirname)
const data = new FileTree('data', import.meta.dirname)
const server = new DevServer(8181)

registerHooks(mapImport('react/jsx-runtime', 'immaculata/jsx-strings.js'))
registerHooks(useTree(src))
registerHooks(tryAltExts)
registerHooks(compileJsx((str, url) =>
  ts.transpileModule(str, {
    fileName: fileURLToPath(url),
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
      sourceMap: true,
      inlineSourceMap: true,
      inlineSources: true,
    }
  }).outputText
))

const run = async () => {
  const mod = await import('./src/build.js')
  mod.processSite(data, server)
}

run()
src.watch().on('filesUpdated', run)

declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: HtmlElements['div'] & { style?: string }
    }
  }
}
