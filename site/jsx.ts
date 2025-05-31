import { Ref, type MaybeRef } from "ref.api.90s.dev/ref.js"

export const jsx = createElement
export const jsxs = createElement

function createElement(tag: string, attrs: Record<string, MaybeRef<any>>) {

  const children = attrs["children"]
  delete attrs["children"]

  const el = document.createElement(tag)

  for (const [k, v] of Object.entries(attrs)) {
    if (v instanceof Ref) {
      (el as any)[k] = v.val
      v.watch(val => (el as any)[k] = val)
    }
    else {
      (el as any)[k] = v
    }
  }

  for (const child of children ?? []) {
    el.append(child)
  }

  return el

}
