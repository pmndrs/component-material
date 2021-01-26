import React, { useMemo, useRef } from 'react'
import { FRAG, VERT } from './constants'
import createMaterial from './create-material'
import { ChildProps, ExtensionShaderObject, ExtensionShadersObject, Uniforms } from './types/internal'
import { ComponentMaterialProps, GenericMaterial } from './types/index'

function editShader(shader: string, extensions: ExtensionShaderObject) {
  Object.entries(extensions).forEach(([key, { value, replaceChunk }]) => {
    if (value && shader.includes(key)) {
      shader = shader.replace(
        `#include <${key}>`,
        `
          ${replaceChunk ? '' : `#include <${key}>`}
          ${value}
        `
      )
    }
  })
  return shader
}

function editShaderHead(shader: string, head: string) {
  if (head && typeof head === 'string') {
    shader = `
      ${head}
      ${shader}
    `
  }
  return shader
}

function addUniforms(shader: string, uniforms: Uniforms) {
  return `${Object.entries(uniforms)
    .map(([key, { type }]) => `uniform ${type} ${key};`)
    .join(' ')}
    ${shader}
  `
}

function addVarying(shader: string, varying: Uniforms) {
  return `${Object.entries(varying)
    .map(([key, { type }]) => `varying ${type} ${key};`)
    .join(' ')}
    ${shader}
  `
}

export const ComponentMaterial = React.forwardRef<GenericMaterial, ComponentMaterialProps>(function ComponentMaterial(
  { children, varyings = {}, uniforms = {}, from, ...props },
  ref
) {
  const uniformsRef = useRef(uniforms)
  const varyingsRef = useRef(varyings)

  const _uniforms = useMemo(
    () =>
      Object.entries(uniforms).reduce((acc: any, [key, { value }]) => {
        acc[key] = value
        return acc
      }, {}),
    [uniforms]
  )

  const shaders = useMemo<ExtensionShadersObject>(
    () =>
      React.Children.toArray(children).reduce(
        (acc: any, child: any) => {
          const shader = child?.props?.children

          if (typeof shader === 'string') {
            const replaceChunk = child?.props?.replaceChunk || false
            const { chunkName, shaderType }: ChildProps = child.type

            if ([VERT, FRAG].includes(shaderType)) {
              if (chunkName === 'Head') {
                acc[shaderType].head = acc[shaderType].head.concat(`
                  ${shader}
                `)
              } else {
                if (!acc[shaderType][chunkName]) {
                  acc[shaderType][chunkName] = {
                    value: '',
                    replaceChunk: false,
                  }
                }

                acc[shaderType][chunkName].replaceChunk = replaceChunk
                acc[shaderType][chunkName].value = acc[shaderType][chunkName].value.concat(`
                    ${shader}
                  `)
              }
            } else {
              acc.common = acc.common.concat(`
                ${shader}
              `)
            }
          }

          return acc
        },
        {
          vert: {
            head: '',
          },
          frag: {
            head: '',
          },
          common: '',
        }
      ),
    [children]
  )

  const material = useMemo(() => {
    const { vert, frag, common } = shaders
    const { head: vertHead, ...vertBody } = vert
    const { head: fragHead, ...fragBody } = frag

    const _material = createMaterial(from, uniformsRef.current, shader => {
      shader.fragmentShader = editShaderHead(shader.fragmentShader, fragHead)
      shader.vertexShader = editShaderHead(shader.vertexShader, vertHead)
      shader.fragmentShader = editShaderHead(shader.fragmentShader, common)
      shader.vertexShader = editShaderHead(shader.vertexShader, common)
      shader.fragmentShader = addUniforms(shader.fragmentShader, uniformsRef.current)
      shader.vertexShader = addUniforms(shader.vertexShader, uniformsRef.current)
      shader.fragmentShader = addVarying(shader.fragmentShader, varyingsRef.current)
      shader.vertexShader = addVarying(shader.vertexShader, varyingsRef.current)
      shader.fragmentShader = editShader(shader.fragmentShader, fragBody)
      shader.vertexShader = editShader(shader.vertexShader, vertBody)
    })
    return new _material()
  }, [shaders, from])

  return <primitive ref={ref} object={material} attach="material" {...props} {..._uniforms} />
})
