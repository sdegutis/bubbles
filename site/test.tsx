import { $ } from "ref.api.90s.dev/ref.js"

const bla = $(0)

document.body.append(<div onclick={function () {
  bla.value++
  console.log(this)
}} className="hi hey">
  <b>yes <i innerHTML={bla.adapt(n => n.toString())}></i></b>
  <p>this is cool</p>
</div>)
