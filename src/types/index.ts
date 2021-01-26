import { MaterialProps } from 'react-three-fiber'
import { Material } from 'three'

import { Uniforms, Varyings } from './internal'

export interface MaterialConstructor {
  new (...args: any[]): GenericMaterial
}
export type ComponentMaterialProps = MaterialProps & {
  varyings?: Varyings
  uniforms?: Uniforms
  from?: MaterialConstructor
}
export interface GenericMaterial extends Material {
  [key: string]: any
}
export type ComponentMaterial = (props: ComponentMaterialProps) => GenericMaterial
