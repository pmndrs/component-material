import { ComponentMaterial } from './component-material'
import { frag, vert, common } from './proxies'

export type MT = {
  (): typeof ComponentMaterial
  Vert: typeof vert
  Frag: typeof frag
  Common: typeof common
}

const M = ComponentMaterial

Object.defineProperties(M, {
  Vert: {
    get: () => vert,
  },
  Frag: {
    get: () => frag,
  },
  Common: {
    get: () => common,
  },
})

export default M
