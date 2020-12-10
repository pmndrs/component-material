import { ComponentMaterial } from './component-material'
import { frag, vert, common } from './proxies'

type MT = typeof ComponentMaterial & {
  vert: typeof vert
  frag: typeof frag
  common: typeof common
}

// @ts-ignore
const M: MT = ComponentMaterial

M.vert = vert
M.frag = frag
M.common = common

export default M
