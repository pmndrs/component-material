import * as THREE from "three";
import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "react-three-fiber";
import { OrbitControls, Sphere, Environment } from "@react-three/drei";

import { ExtendableMaterial } from "./extendable-material";
import "./styles.css";

function Scene() {
  const material = useRef();

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    material.current.green = (1 + Math.sin(time)) / 2;
  });

  return (
    <Sphere args={[1, 32, 32]}>
      <ExtendableMaterial
        ref={material}
        metalness={1}
        roughness={0}
        uniforms={{
          red: 1,
          green: 0,
          blue: 0,
        }}
      >
        <ExtendableMaterial.FragHead>{`
        float aaa(float x){
          return x*x*x;
        }
        `}</ExtendableMaterial.FragHead>
        <ExtendableMaterial.Frag>{`
          gl_FragColor = vec4(gl_FragColor.rgb * vec3(red, (green), blue), gl_FragColor.a);  
        `}</ExtendableMaterial.Frag>
      </ExtendableMaterial>
    </Sphere>
  );
}

function App() {
  return (
    <>
      <Canvas camera={{ position: [0, 0, 10] }}>
        <ambientLight intensity={0.2} />
        <Scene />
        <Suspense fallback={null}>
          <Environment files="rooftop_night_1k.hdr" />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </>
  );
}

export default App;
