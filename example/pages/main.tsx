import 'react-app-polyfill/ie11'
import * as React from 'react'
import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from 'react-three-fiber'
import { Environment, Sphere } from '@react-three/drei'
import { useTweaks } from 'use-tweaks'

import M, { GenericMaterial } from '../../dist'

function Scene() {
  const material = useRef<GenericMaterial>(null!)

  const { metalness, roughness } = useTweaks({
    metalness: { value: 0.5, min: 0, max: 1 },
    roughness: { value: 0.5, min: 0, max: 1 },
  })

  useFrame(({ clock }) => {
    if (material.current) {
      material.current.time = clock.getElapsedTime() * 2
    }
  })

  return (
    <Sphere args={[4, 512, 512]}>
      <M
        ref={material}
        metalness={metalness}
        roughness={roughness}
        transparent
        uniforms={{
          time: { value: 0, type: 'float' },
        }}>
        <M.Common>{/*glsl*/ `
          float quadraticInOut(float t) {
            float p = 2.0 * t * t;
            return t < 0.5 ? p : -p + (4.0 * t) - 1.0;
          }
        `}</M.Common>
        <M.Frag.Body>{/*glsl*/ `
          gl_FragColor = vec4(gl_FragColor.rgb, quadraticInOut((sin(time)+1.0)/2.0));  
        `}</M.Frag.Body>
      </M>
    </Sphere>
  )
}

function App() {
  return (
    <>
      <Canvas camera={{ position: [0, 0, 10] }}>
        <color args={[0, 0, 0]} attach="background" />
        <ambientLight intensity={0.2} />
        <directionalLight position={[3, 3, -3]} intensity={4} />
        <directionalLight position={[-10, 10, -10]} intensity={1} />
        <Scene />
        <Suspense fallback={null}>
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </>
  )
}

export default App
