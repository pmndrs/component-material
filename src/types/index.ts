import { MaterialProps } from 'react-three-fiber'
import { Material } from 'three'

import { Uniforms } from './internal'

export interface MaterialConstructor {
  new (...args: any[]): GenericMaterial
}
export type ComponentMaterialProps = MaterialProps & {
  varyings: Uniforms
  uniforms: Uniforms
  from?: MaterialConstructor
}
export interface GenericMaterial extends Material {
  [key: string]: any
}
export type ComponentMaterial = (props: ComponentMaterialProps) => GenericMaterial
