import { type DevServer, type FileTree } from "immaculata"

export function processSite(data: FileTree, server: DevServer) {
  const names1 = parse(data, '/c2005')
  const names2 = parse(data, '/c2013')
  const names3 = parse(data, '/c2025')

  server.files = new Map([
    ['/index.html', <div style="display: grid; grid-auto-flow: column">
      <Table names={names1} others={new Set([...names3, ...names2])} />
      <Table names={names2} others={new Set([...names1, ...names3])} />
      <Table names={names3} others={new Set([...names1, ...names2])} />
    </div>]
  ])
}

function Table(data: { names: string[], others: Set<string> }) {
  return <div>
    {data.names.map(name => {
      return <div style={data.others.has(name) ? 'color:blue' : 'color:crimson'}>{name}</div>
    })}
  </div>
}

function parse(data: FileTree, file: string) {
  return data.files.get(file)!.content.toString().trim().split(/\r?\n/).map(normalize)
}

function normalize(str: string) {
  // return str
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}
