import 'react-app-polyfill/ie11';
import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from 'react-three-fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import { useTweaks } from 'use-tweaks';
import * as THREE from "three"
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

import { ComponentMaterial, frag, vert } from '../../src/index';
import hdr from "../studio_small_04_1k.hdr"

import voronoi from '../voronoi'

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

type Uniforms = {
  time: any,
  red: any,
  green: any,
  blue: any
}

function Scene(): JSX.Element {
  const material = useRef();
  const sphere = useRef()

  const {
    amplitude,
    frequency,
    jitter,
    metalness,
    roughness,
  } = useTweaks({
    metalness: { value: 1, min: 0, max: 1 },
    roughness: { value: 0.43, min: 0, max: 1 },
    amplitude: { value: .54, min: -5, max: 5 },
    frequency: { value: .41, min: 0, max: 2 },
    jitter: { value: 1.24, min: 0, max: 2 },
  });

  useFrame(({ clock }) => {
    if (material.current) {
      material.current.time = clock.getElapsedTime();
    }
  });

  const RADIUS = 4

  return (
    <Sphere args={[4, 512, 512]} ref={sphere}>
      <ComponentMaterial<Uniforms>
        ref={material}
        roughness={roughness}
        metalness={metalness}
        uniforms={{
          radius: { value: RADIUS, type: "float" },
          time: { value: 0, type: "float" },
          jitter: { value: jitter, type: "float" },
          amplitude: { value: amplitude, type: "float" },
          frequency: { value: frequency, type: "float" },
        }}

        color="red"

      >
        <vert.head>
          {/*glsl*/`
            varying vec3 vTransformed;
          
            ${voronoi}

            vec3 distortFunct(vec3 transformed, float factor) {
              vec2 f = worley(transformed.xyz * frequency + time * 0.1, jitter, false) * amplitude * factor;
              return normalize(transformed) * (f.x + radius);
            }

            vec3 orthogonal(vec3 v) {
              return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0)
              : vec3(0.0, -v.z, v.y));
            }
            
            vec3 distortNormal(vec3 position, vec3 distortedPosition, vec3 normal){
              vec3 tangent1 = orthogonal(normal);
              vec3 tangent2 = normalize(cross(normal, tangent1));
              vec3 nearby1 = position + tangent1 * 0.1;
              vec3 nearby2 = position + tangent2 * 0.1;
              vec3 distorted1 = distortFunct(nearby1, 1.0);
              vec3 distorted2 = distortFunct(nearby2, 1.0);
              return normalize(cross(distorted1 - distortedPosition, distorted2 - distortedPosition));
            }
          `}
        </vert.head>
        <vert.body>
          {/*glsl*/`
            float updateTime = time / 10.0;
            
            transformed = distortFunct(transformed, 1.0);

            vec3 distortedNormal = distortNormal(position, transformed, normal);

            vTransformed = transformed;
            
            vNormal = normal + distortedNormal;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed,1.);
            
          `}
        </vert.body>
        <frag.head>
            {/*glsl*/`
              ${voronoi}

              varying vec3 vTransformed;
              
              vec3 distortFunct(vec3 transformed, float factor) {
                vec2 f = worley(transformed.xyz * frequency + time * 0.1, jitter, false) * amplitude * factor;
                return normalize(transformed) * (f.x + radius);
              }
            `}
            
        </frag.head>
      </ComponentMaterial>
    </Sphere>
  );
}

function App() {
  return (
    <>
      <Canvas camera={{ position: [0, 0, 10] }}>
      <color args={["#000"]} attach="background" />
        
        <directionalLight position={[0, 0, 10]} intensity={0.4} />
        <spotLight position={[8, 8, -8]} radius={Math.PI} color="purple" intensity={1} />
        <spotLight position={[0, 8, 4]} radius={Math.PI} color="purple" intensity={.4} />
        <Scene />
        
      </Canvas>
    </>
  );
}

export default App;
