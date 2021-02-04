import { ComponentMaterial } from './component-material'
import { frag, vert, common } from './proxies'

export * from './types/index'

export type MT = typeof ComponentMaterial & {
  Vert: typeof vert
  Frag: typeof frag
  Common: typeof common
}

const M = ComponentMaterial

Object.defineProperties(ComponentMaterial, {
  Vert: {
    get: (): typeof vert => vert,
  },
  Frag: {
    get: (): typeof frag => frag,
  },
  Common: {
    get: (): typeof common => common,
  },
})

export default M as MT
