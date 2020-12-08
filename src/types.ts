import { MaterialProps } from 'react-three-fiber';
import { Material } from 'three';

export type ProxyProps = {
  children: string[];
};
export type ExtensionsType = {
  value?: string;
  replaceChunk: boolean;
};
export type Uniform = {
  value:
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
    | THREE.CubeTexture;
  type: string;
};
export type Uniforms = { [key: string]: Uniform };
export interface GenericMaterial extends Material {
  [key: string]: any;
}
export type ComponentMaterialProps = MaterialProps & {
  varying: Uniforms;
  uniforms: Uniforms;
  materialType: GenericMaterial;
};
export type ChildProps = {
  chunkName: string;
  shaderType: string;
  toolShader?: string;
};
export type ExtensionShaderObject = {
  [key: string]: ExtensionsType;
};
export type ExtensionShadersObject = {
  vert: ExtensionShaderObject & { head: string };
  frag: ExtensionShaderObject & { head: string };
  tool: string;
};
