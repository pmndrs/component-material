import React, { useMemo, useRef } from "react";
import { MeshPhysicalMaterial } from "three";
import glsl from "glslify";
import createMaterial from "./create-material";

// INIT workaround for codesandbox, since it doesn't bundle imports from gsls files
require("glsl-noise/simplex/3d.glsl");
require("glsl-noise/simplex/2d.glsl");
require("glsl-noise/simplex/3d.glsl");
require("glsl-noise/simplex/4d.glsl");
require("glsl-noise/classic/2d.glsl");
require("glsl-noise/classic/3d.glsl");
require("glsl-noise/classic/4d.glsl");
require("glsl-noise/periodic/2d.glsl");
require("glsl-noise/periodic/3d.glsl");
require("glsl-noise/periodic/4d.glsl");
require("glsl-easings/back-in-out.glsl");
require("glsl-easings/back-in.glsl");
require("glsl-easings/back-out.glsl");
require("glsl-easings/bounce-in-out.glsl");
require("glsl-easings/bounce-in.glsl");
require("glsl-easings/bounce-out.glsl");
require("glsl-easings/circular-in-out.glsl");
require("glsl-easings/circular-in.glsl");
require("glsl-easings/circular-out.glsl");
require("glsl-easings/cubic-in-out.glsl");
require("glsl-easings/cubic-in.glsl");
require("glsl-easings/cubic-out.glsl");
require("glsl-easings/elastic-in-out.glsl");
require("glsl-easings/elastic-in.glsl");
require("glsl-easings/elastic-out.glsl");
require("glsl-easings/exponential-in-out.glsl");
require("glsl-easings/exponential-in.glsl");
require("glsl-easings/exponential-out.glsl");
require("glsl-easings/linear.glsl");
require("glsl-easings/quadratic-in-out.glsl");
require("glsl-easings/quadratic-in.glsl");
require("glsl-easings/quadratic-out.glsl");
require("glsl-easings/quartic-in-out.glsl");
require("glsl-easings/quartic-in.glsl");
require("glsl-easings/quartic-out.glsl");
require("glsl-easings/quintic-in-out.glsl");
require("glsl-easings/quintic-in.glsl");
require("glsl-easings/quintic-out.glsl");
require("glsl-easings/sine-in-out.glsl");
require("glsl-easings/sine-in.glsl");
require("glsl-easings/sine-out.glsl");
// END workaround for codesandbox

const VERT = "vert";
const FRAG = "frag";
const TOOL = "tool";
const DEFAULT_VERT_CHUNK = "project_vertex";
const DEFAULT_FRAG_CHUNK = "dithering_fragment";
const DEFAULT_STATE = {
  vert: {
    head: "",
  },
  frag: {
    head: "",
  },
  tool: "",
};
function getVarType(variable) {
  return "float";
}

function editShader(shader, extensions) {
  Object.entries(extensions).forEach(([key, { value, discartChunk }]) => {
    if (value && shader.includes(key)) {
      shader = shader.replace(
        `#include <${key}>`,
        `
          ${discartChunk ? "" : `#include <${key}>`}
          ${value}
        `
      );
    }
  });
  return shader;
}

function editShaderHead(shader, head) {
  if (head && typeof head === "string") {
    shader = `
      ${head}
      ${shader}
    `;
  }
  return shader;
}

function addUniforms(shader, uniforms) {
  return `${Object.entries(uniforms)
    .map(([key, value]) => `uniform ${getVarType(value)} ${key};`)
    .join(" ")}
    ${shader}
  `;
}

function addVarying(shader, varying) {
  return `${Object.entries(varying)
    .map(([key, value]) => `varying ${getVarType(value)} ${key};`)
    .join(" ")}
    ${shader}
  `;
}

export const ComponentMaterial = React.forwardRef(function ComponentMaterial(
  {
    children,
    varying = {},
    uniforms = {},
    materialType = MeshPhysicalMaterial,
    ...props
  },
  ref
) {
  const uniformsRef = useRef(uniforms);
  const varyingRef = useRef(varying);
  const shaders = useMemo(
    () =>
      React.Children.toArray(children).reduce((acc, child) => {
        const shader = child?.props?.children;
        const { toolShader, chunkName, shaderType } = child.type;

        if (typeof shader === "string" && [VERT, FRAG].includes(shaderType)) {
          if (chunkName === "head") {
            acc[shaderType].head = acc[shaderType].head.concat(`
              ${shader}
            `);
          } else {
            if (!acc[shaderType][chunkName]) {
              acc[shaderType][chunkName] = {
                value: "",
                discartChunk: false,
              };
            }
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

    const _material = createMaterial(
      materialType,
      uniformsRef.current,
      (shader) => {
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
          varyingRef.current
        );
        shader.vertexShader = addVarying(
          shader.vertexShader,
          varyingRef.current
        );
        shader.fragmentShader = editShader(shader.fragmentShader, fragBody);
        shader.vertexShader = editShader(shader.vertexShader, vertBody);
        shader.fragmentShader = glsl`${shader.fragmentShader}`;
        shader.vertexShader = glsl`${shader.vertexShader}`;
      }
    );
    return new _material();
  }, [shaders, materialType]);

  return (
    <primitive
      ref={ref}
      object={material}
      attach="material"
      {...props}
      {...uniforms}
    />
  );
});

// -- VERTEX PROXY --
const vertHandler = {
  get: function (_, name) {
    const Component = React.memo(({ children }) => children);
    Object.defineProperty(Component, "chunkName", { writable: true });
    Object.defineProperty(Component, "shaderType", { writable: true });
    Component.chunkName = name === "body" ? DEFAULT_VERT_CHUNK : name;
    Component.shaderType = VERT;
    return Component;
  },
};
export const Vert = new Proxy(
  React.memo(() => null),
  vertHandler
);

// -- FRAGMENT PROXY --
const fragHandler = {
  get: function (_, name) {
    const Component = ({ children }) => children;
    Object.defineProperty(Component, "chunkName", { writable: true });
    Object.defineProperty(Component, "shaderType", { writable: true });
    Component.chunkName = name === "body" ? DEFAULT_FRAG_CHUNK : name;
    Component.shaderType = FRAG;
    return Component;
  },
};
export const Frag = new Proxy(() => null, fragHandler);

// -- NOISE PROXY --
const noise = {
  snoise2: "glsl-noise/simplex/2d",
  snoise3: "glsl-noise/simplex/3d",
  snoise4: "glsl-noise/simplex/4d",
  cnoise2: "glsl-noise/classic/2d",
  cnoise3: "glsl-noise/classic/3d",
  cnoise4: "glsl-noise/classic/4d",
  pnoise2: "glsl-noise/periodic/2d",
  pnoise3: "glsl-noise/periodic/3d",
  pnoise4: "glsl-noise/periodic/4d",
};
const noiseHandler = {
  get: function (_, name) {
    const path = noise[name];
    if (path) {
      const pragma = `#pragma glslify: ${name} = require(${path})`;
      const Component = () => null;
      Object.defineProperty(Component, "shaderType", { writable: true });
      Object.defineProperty(Component, "toolShader", { writable: true });
      Component.shaderType = TOOL;
      Component.toolShader = pragma;
      return Component;
    }
    return null;
  },
};
export const Noise = new Proxy(() => null, noiseHandler);

// -- EASING PROXY --
const easing = {
  backInOut: "glsl-easings/back-in-out",
  backIn: "glsl-easings/back-in",
  backOut: "glsl-easings/back-out",
  bounceInOut: "glsl-easings/bounce-in-out",
  bounceIn: "glsl-easings/bounce-in",
  bounceOut: "glsl-easings/bounce-out",
  circularInOut: "glsl-easings/circular-in-out",
  circularIn: "glsl-easings/circular-in",
  circularOut: "glsl-easings/circular-out",
  cubicInOut: "glsl-easings/cubic-in-out",
  cubicIn: "glsl-easings/cubic-in",
  cubicOut: "glsl-easings/cubic-out",
  elasticInOut: "glsl-easings/elastic-in-out",
  elasticIn: "glsl-easings/elastic-in",
  elasticOut: "glsl-easings/elastic-out",
  exponentialInOut: "glsl-easings/exponential-in-out",
  exponentialIn: "glsl-easings/exponential-in",
  exponentialOut: "glsl-easings/exponential-out",
  linear: "glsl-easings/linear",
  quadraticInOut: "glsl-easings/quadratic-in-out",
  quadraticIn: "glsl-easings/quadratic-in",
  quadraticOut: "glsl-easings/quadratic-out",
  quarticInOut: "glsl-easings/quartic-in-out",
  quarticIn: "glsl-easings/quartic-in",
  quarticOut: "glsl-easings/quartic-out",
  quinticInOut: "glsl-easings/quintic-in-out",
  quinticIn: "glsl-easings/quintic-in",
  quinticOut: "glsl-easings/quintic-out",
  sineInOut: "glsl-easings/sine-in-out",
  sineIn: "glsl-easings/sine-in",
  sineOut: "glsl-easings/sine-out",
};
const easingHandler = {
  get: function (_, name) {
    const path = easing[name];
    if (path) {
      const pragma = `#pragma glslify: ${name} = require(${path})`;
      const Component = () => null;
      Object.defineProperty(Component, "shaderType", { writable: true });
      Object.defineProperty(Component, "toolShader", { writable: true });
      Component.shaderType = TOOL;
      Component.toolShader = pragma;
      return Component;
    }
    return null;
  },
};
export const Ease = new Proxy(() => null, easingHandler);
