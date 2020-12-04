import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "react-three-fiber";
import { Sphere, Environment } from "@react-three/drei";

import { ComponentMaterial, Frag, Noise, Vert } from "./component-material";
import "./styles.css";

function Scene() {
  const material = useRef();

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    material.current.green = (1 + Math.sin(time)) / 2;
    material.current.time = time;
  });

  return (
    <Sphere args={[1, 256, 256]}>
      <ComponentMaterial
        ref={material}
        metalness={1}
        roughness={0}
        uniforms={{
          time: 0,
          radius: 1,
          red: 1,
          green: 0,
          blue: 0,
          radiusVariationAmplitude: 1,
          radiusNoiseFrequency: 1,
        }}
      >
        <Noise.snoise3 />
        <Vert.head>{`
          float fsnoise(float val1, float val2, float val3){
            return snoise3(vec3(val1,val2,val3));
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
        `}</Vert.head>
        <Vert.body>{`
          float updateTime = time / 10.0;
          transformed = distortFunct(transformed, 1.0);
          vec3 distortedNormal = distortNormal(position, transformed, normal);
          vNormal = normal + distortedNormal;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed,1.);
        `}</Vert.body>
        <Frag.head>{`
          float _easing(float x){
            return x*x*x;
          }
        `}</Frag.head>
        <Frag.body>{`
          gl_FragColor = vec4(gl_FragColor.rgb * vec3(red, _easing(green), blue), gl_FragColor.a);  
        `}</Frag.body>
      </ComponentMaterial>
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
      </Canvas>
    </>
  );
}

export default App;
