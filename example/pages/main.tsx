import 'react-app-polyfill/ie11';
import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from 'react-three-fiber';
import { Sphere } from '@react-three/drei';
import { useTweaks } from 'use-tweaks';
import * as THREE from "three"
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

import { ComponentMaterial, frag } from '../../src/index';
import hdr from "../rooftop_night_1k.hdr"

function Env() {
  const { gl, scene } = useThree()
  const result = useLoader(RGBELoader, hdr)

  useEffect(() => {
    const gen = new THREE.PMREMGenerator(gl)
    const texture = gen.fromEquirectangular(result).texture 
    scene.environment = texture
    result.dispose()
    gen.dispose()
    return () => {
      scene.environment = scene.background = null
    }
  }, [gl, result, scene])

  return null
}

function Scene() {
  const material = useRef();

  const {
    red,
    green,
    blue,
    metalness,
    roughness,
  } = useTweaks({
    red: { value: 0.5, min: 0, max: 1 },
    green: { value: 0.5, min: 0, max: 1 },
    blue: { value: 0.5, min: 0, max: 1 },
    metalness: { value: 0.5, min: 0, max: 1 },
    roughness: { value: 0.5, min: 0, max: 1 },
  });

  useFrame(({ clock }) => {
    if (material.current) {
      material.current.time = clock.getElapsedTime()*2;
    }
  });

  return (
    <Sphere args={[4, 512, 512]}>
      <ComponentMaterial
        ref={material}
        metalness={metalness}
        roughness={roughness}
        uniforms={{
          time: { value: 0, type: "float" },
          red: { value: red, type: "float" },
          green: { value: green, type: "float" },
          blue: { value: blue, type: "float" },
        }}
      >
        <frag.head>{`
          float quadraticInOut(float t) {
            float p = 2.0 * t * t;
            return t < 0.5 ? p : -p + (4.0 * t) - 1.0;
          }
        `}</frag.head>
        <frag.body>{`
          gl_FragColor = vec4(gl_FragColor.rgb * vec3(red, green, blue), quadraticInOut((sin(time)+1.0)/2.0));  
        `}</frag.body>
      </ComponentMaterial>
    </Sphere>
  );
}

function App() {
  return (
    <>
      <Canvas camera={{ position: [0, 0, 10] }}>
        <ambientLight intensity={0.2} />
        <spotLight position={[10, 10, 10]} radius={Math.PI / 3} intensity={4} />
        <Scene />
        <Suspense fallback={null}>
          <Env />
        </Suspense>
      </Canvas>
    </>
  );
}

export default App;
