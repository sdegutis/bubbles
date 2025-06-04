import type { FileTree } from "immaculata/filetree.js"
import { Pipeline } from "immaculata/pipeline.js"
import { transformExternalModuleNames } from "immaculata/transforms.js"
import ts from 'typescript'

export function run(site: FileTree) {
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
      after: [transformExternalModuleNames({
        'matter-js': 'https://cdn.jsdelivr.net/npm/matter-js@0.20.0/+esm',
        'ref.api.90s.dev': 'https://ref.api.90s.dev',
        'react/jsx-runtime': '/jsx.js',
      })]
    }
  })
}
