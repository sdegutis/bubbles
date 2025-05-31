import { DevServer, FileTree, generateFiles, Pipeline, transformImports } from "immaculata"
import ts from 'typescript'

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

  files.with(/\.tsx?$/).do(f => {
    const result = transform(f.text, f.path)!
    f.path = f.path.replace(/\.tsx?$/, '.js')

    const mapPath = f.path + '.map'
    const sourceMapPart = '\n//# sourceMappingURL=' + mapPath
    f.text = result.outputText! + sourceMapPart

    files.add(mapPath, JSON.stringify(result.sourceMapText!))
  })

  return files.results()
}

function transform(text: string, path: string) {
  return ts.transpileModule(text, {
    fileName: path,
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
      sourceMap: true,
    },
    transformers: {
      after: [transformImports(import.meta.dirname, {
        'matter-js': 'https://cdn.jsdelivr.net/npm/matter-js@0.20.0/+esm',
        'react/jsx-runtime': '/jsx.js',
      })]
    }
  })
}
