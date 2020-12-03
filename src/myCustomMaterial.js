import { MeshPhysicalMaterial } from "three";
import { extend } from "react-three-fiber";
import glsl from "glslify";
import createMaterial from "./createMaterial";
// workaround for codesandbox, since it doesn't bundle imports from gsls files
require("glsl-noise/simplex/3d.glsl");

const MyCustomMaterial = createMaterial(
  MeshPhysicalMaterial,
  {
    myFactor: 0,
    myTime: 0,
  },
  (shader) => {
    shader.vertexShader = glsl`
      // ✅ Add vertex shader uniforms here
      uniform float myFactor;
      varying vec2 vUv;
      uniform float myTime;

      #pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      "#include <project_vertex>",
      glsl`
        #include <project_vertex>

        vUv = uv;
        float noise = pow(snoise(position * 0.1 + myTime), 2.);
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position + noise * myFactor,1.);
      `
    );

    shader.fragmentShader = glsl`
      // ✅ Add fragment shader uniforms here
      uniform float myFactor;
      varying vec2 vUv;
      
      ${shader.fragmentShader}
    `;

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <dithering_fragment>",
      glsl`
        #include <dithering_fragment>
      `
    );
  }
);

extend({ MyCustomMaterial });
