declare namespace JSX {

  type jsxAllowedAttr<T, A extends keyof T & string> = A extends 'children' ? never : A

  type jsxify<T> = {
    [A in keyof T & string as jsxAllowedAttr<T, A>]?: import('ref.api.90s.dev/ref.ts').MaybeRef<T[A]>
  } & { children?: any }

  interface ElementChildrenAttribute {
    children: {}
  }

  type Element = HTMLElement

  type ElementType =
    | string
    | ((data: any) => any)

  type HtmlElements = {
    [K in keyof HTMLElementTagNameMap]: jsxify<HTMLElementTagNameMap[K]>
  }

  interface IntrinsicElements extends HtmlElements {
    meta: HtmlElements['meta'] & {
      charset?: 'utf-8'
    }
  }

}
