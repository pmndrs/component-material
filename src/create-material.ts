import { MeshPhysicalMaterial, Shader } from 'three'

import { getKeyValue, setKeyValue } from './helpers/objects'
import { MaterialConstructor, Uniforms } from './types'

function createMaterial(
  baseMaterial: MaterialConstructor = MeshPhysicalMaterial,
  uniforms: Uniforms = {},
  onBeforeCompile?: (shader: Shader) => void
) {
  return class ComponentMaterial extends baseMaterial {
    [key: string]: any

    constructor(parameters = {}) {
      const entries = Object.keys(uniforms)
      super(parameters)
      this.setValues(parameters)

      entries.forEach(key => {
        setKeyValue(this, `_${key}`, { value: uniforms[key] })
        Object.defineProperty(this, key, {
          get: () => this[`_${key}`].value,
          set: v => (this[`_${key}`].value = v),
        })
      })
    }

    onBeforeCompile(shader: Shader) {
      const handler = {
        get: function(target: Shader, key: keyof Shader) {
          return getKeyValue(target, key)
        },
        set: function(target: Shader, key: keyof Shader, value: any) {
          setKeyValue(target, key, value)
          // Accoring to ProxyHandler, the set function should return a boolean.
          return true
        },
      }

      const entries = Object.keys(uniforms)
      entries.forEach(key => {
        shader.uniforms[key] = this[`_${key}`]
      })

      const proxiedShader = new Proxy(shader, handler)

      if (onBeforeCompile) {
        onBeforeCompile(proxiedShader)
      }
    }
  }
}

export default createMaterial
