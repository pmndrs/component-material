// @ts-nocheck
import { MeshPhysicalMaterial, Material, ShaderMaterial } from 'three';

function createMaterial(
  baseMaterial: Material = MeshPhysicalMaterial,
  uniforms?: any,
  onBeforeCompile?: (shader: ShaderMaterial) => void
) {
  return class extends baseMaterial {
    constructor(parameters = {}) {
      const entries = Object.entries(uniforms);
      super(parameters);
      this.setValues(parameters);

      entries.forEach(([name]) => {
        this[`_${name}`] = { value: entries[name] };

        Object.defineProperty(this, name, {
          get: () => this[`_${name}`].value,
          set: v => (this[`_${name}`].value = v),
        });
      });
    }

    onBeforeCompile(shader) {
      const handler = {
        get: function(target, name) {
          return target[name];
        },
        set: function(obj, prop, value) {
          obj[prop] = value;
          return obj;
        },
      };

      const entries = Object.entries(uniforms);
      entries.forEach(([name]) => {
        shader.uniforms[name] = this[`_${name}`];
      });

      const proxiedShader = new Proxy(shader, handler);

      onBeforeCompile(proxiedShader);
    }
  };
}

export default createMaterial;
