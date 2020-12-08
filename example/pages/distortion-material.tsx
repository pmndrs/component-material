import 'react-app-polyfill/ie11';
import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from 'react-three-fiber';
import { Sphere, Environment } from '@react-three/drei';
import { useTweaks } from 'use-tweaks';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

import distortion from '../simplex3d';
import { ComponentMaterial, frag, vert } from '../../src/index';
import hdr from '../rooftop_night_1k.hdr';

function Env() {
  const { gl, scene } = useThree();
  const result = useLoader(RGBELoader, hdr);

  useEffect(() => {
    const gen = new THREE.PMREMGenerator(gl);
    const texture = gen.fromEquirectangular(result).texture;
    scene.environment = texture;
    result.dispose();
    gen.dispose();
    return () => {
      scene.environment = scene.background = null;
    };
  }, [gl, result, scene]);

  return null;
}

function Scene() {
  const material = useRef();

  const {
    red,
    green,
    blue,
    metalness,
    clearcoat,
    roughness,
    radiusVariationAmplitude,
    radiusNoiseFrequency,
  } = useTweaks({
    red: { value: 0.5, min: 0, max: 1 },
    green: { value: 0.5, min: 0, max: 1 },
    blue: { value: 0.5, min: 0, max: 1 },
    metalness: { value: 0.5, min: 0, max: 1 },
    clearcoat: { value: 0.5, min: 0, max: 1 },
    roughness: { value: 0.5, min: 0, max: 1 },
    radiusVariationAmplitude: { value: 1, min: 0, max: 5 },
    radiusNoiseFrequency: { value: 1, min: 0, max: 2 },
  });

  useFrame(({ clock }) => {
    if (material.current) {
      material.current.time = clock.getElapsedTime();
    }
  });
  const RADIUS = 4;
  return (
    <Sphere args={[RADIUS, 512, 512]}>
      <ComponentMaterial
        ref={material}
        clearcoat={clearcoat}
        metalness={metalness}
        roughness={roughness}
        uniforms={{
          radius: { value: RADIUS, type: 'float' },
          time: { value: 0, type: 'float' },
          red: { value: red, type: 'float' },
          green: { value: green, type: 'float' },
          blue: { value: blue, type: 'float' },
          radiusVariationAmplitude: {
            value: radiusVariationAmplitude,
            type: 'float',
          },
          radiusNoiseFrequency: { value: radiusNoiseFrequency, type: 'float' },
        }}
      >
        <vert.head>{`
          ${distortion}
          float fsnoise(float val1, float val2, float val3){
            return snoise(vec3(val1,val2,val3));
          }

          vec3 distortFunct(vec3 transformed, float factor) {
            float radiusVariation = -fsnoise(
              transformed.x * radiusNoiseFrequency + time,
              transformed.y * radiusNoiseFrequency + time,
              transformed.z * radiusNoiseFrequency + time 
            ) * radiusVariationAmplitude * factor;
            return normalize(transformed) * (radiusVariation + radius);
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
        `}</vert.head>
        <vert.body>{`
          float updateTime = time / 10.0;
          transformed = distortFunct(transformed, 1.0);
          vec3 distortedNormal = distortNormal(position, transformed, normal);
          vNormal = normal + distortedNormal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed,1.);
        `}</vert.body>
        <frag.body>{`
          gl_FragColor = vec4(gl_FragColor.rgb * vec3(red, green, blue), gl_FragColor.a);  
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
