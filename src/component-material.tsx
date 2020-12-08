import React, { useMemo, useRef } from 'react';
import { MeshPhysicalMaterial } from 'three';
import { DEFAULT_STATE, FRAG, TOOL, VERT } from './constants';
import createMaterial from './create-material';
import {
  ChildProps,
  ComponentMaterialProps,
  ExtensionShaderObject,
  ExtensionShadersObject,
  Uniforms,
} from './types';

function editShader(shader: string, extensions: ExtensionShaderObject) {
  Object.entries(extensions).forEach(([key, { value, replaceChunk }]) => {
    if (value && shader.includes(key)) {
      shader = shader.replace(
        `#include <${key}>`,
        `
          ${replaceChunk ? '' : `#include <${key}>`}
          ${value}
        `
      );
    }
  });
  return shader;
}

function editShaderHead(shader: string, head: string) {
  if (head && typeof head === 'string') {
    shader = `
      ${head}
      ${shader}
    `;
  }
  return shader;
}

function addUniforms(shader: string, uniforms: Uniforms) {
  return `${Object.entries(uniforms)
    .map(([key, { type }]) => `uniform ${type} ${key};`)
    .join(' ')}
    ${shader}
  `;
}

function addVarying(shader: string, varying: Uniforms) {
  return `${Object.entries(varying)
    .map(([key, { type }]) => `varying ${type} ${key};`)
    .join(' ')}
    ${shader}
  `;
}

export const ComponentMaterial = React.forwardRef(function ComponentMaterial(
  {
    children,
    varyings = {},
    uniforms = {},
    // @ts-ignore
    from = MeshPhysicalMaterial,
    ...props
  }: ComponentMaterialProps,
  ref
): any {
  const uniformsRef = useRef(uniforms);
  const varyingsRef = useRef(varyings);

  const _uniforms = useMemo(
    () =>
      Object.entries(uniforms).reduce((acc: any, [key, { value }]) => {
        acc[key] = value;
        return acc;
      }, {}),
    [uniforms]
  );

  const shaders = useMemo<ExtensionShadersObject>(
    () =>
      React.Children.toArray(children).reduce((acc: any, child: any) => {
        const shader = child?.props?.children;
        const replaceChunk = child?.props?.replaceChunk || false;
        const { toolShader, chunkName, shaderType }: ChildProps = child.type;

        if (typeof shader === 'string' && [VERT, FRAG].includes(shaderType)) {
          if (chunkName === 'head') {
            acc[shaderType].head = acc[shaderType].head.concat(`
              ${shader}
            `);
          } else {
            if (!acc[shaderType][chunkName]) {
              acc[shaderType][chunkName] = {
                value: '',
                replaceChunk: false,
              };
            }
            acc[shaderType][chunkName].replaceChunk = replaceChunk;
            acc[shaderType][chunkName].value = acc[shaderType][chunkName].value
              .concat(`
                ${shader}
              `);
          }
        }
        if (shaderType === TOOL) {
          acc[shaderType] = acc[shaderType].concat(`
            ${toolShader}
          `);
        }
        return acc;
      }, DEFAULT_STATE),
    [children]
  );

  const material = useMemo(() => {
    const { vert, frag, tool } = shaders;
    const { head: vertHead, ...vertBody } = vert;
    const { head: fragHead, ...fragBody } = frag;

    const _material = createMaterial(from, uniformsRef.current, (shader) => {
      shader.fragmentShader = editShaderHead(shader.fragmentShader, fragHead);
      shader.vertexShader = editShaderHead(shader.vertexShader, vertHead);
      shader.fragmentShader = editShaderHead(shader.fragmentShader, tool);
      shader.vertexShader = editShaderHead(shader.vertexShader, tool);
      shader.fragmentShader = addUniforms(
        shader.fragmentShader,
        uniformsRef.current
      );
      shader.vertexShader = addUniforms(
        shader.vertexShader,
        uniformsRef.current
      );
      shader.fragmentShader = addVarying(
        shader.fragmentShader,
        varyingsRef.current
      );
      shader.vertexShader = addVarying(
        shader.vertexShader,
        varyingsRef.current
      );
      shader.fragmentShader = editShader(shader.fragmentShader, fragBody);
      shader.vertexShader = editShader(shader.vertexShader, vertBody);
    });
    return new _material();
  }, [shaders, from]);

  return (
    <primitive
      ref={ref}
      object={material}
      attach="material"
      {...props}
      {..._uniforms}
    />
  );
});
