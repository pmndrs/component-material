import { ComponentMaterial } from './component-material'
import { frag, vert, common } from './proxies'

type MT = typeof ComponentMaterial & {
  Vert: typeof vert
  Frag: typeof frag
  Common: typeof common
}

// @ts-ignore
const M: MT = ComponentMaterial

M.Vert = vert
M.Frag = frag
M.Common = common

export default M
