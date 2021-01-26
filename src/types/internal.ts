export type ProxyProps<Child extends string | string[]> = {
  children: Child
}
export type ProxyComponent = <Child extends string[] | string>(props: ProxyProps<Child>) => JSX.Element
export type ExtensionsType = {
  value?: string
  replaceChunk: boolean
}
export type GLProp = {
  value?:
    | number
    | string
    | boolean
    | THREE.Texture
    | THREE.Vector2
    | THREE.Vector3
    | THREE.Vector4
    | Array<number>
    | Float32Array
    | THREE.Color
    | THREE.Quaternion
    | THREE.Matrix3
    | THREE.Matrix4
    | Int32Array
    | THREE.CubeTexture
  type: string
}
export type Uniforms = { [key: string]: GLProp }
export type Varyings = {
  [key: string]: Omit<GLProp, 'value'>
}
export type ChildProps = {
  chunkName: string
  shaderType: string
}
export type ExtensionShaderObject = {
  [key: string]: ExtensionsType
}
export type ExtensionShadersObject = {
  vert: ExtensionShaderObject & { head: string }
  frag: ExtensionShaderObject & { head: string }
  common: string
}
