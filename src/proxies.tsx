import React from "react"
import {
  DEFAULT_FRAG_CHUNK,
  DEFAULT_VERT_CHUNK,
  FRAG,
  VERT,
} from './constants';
import { ProxyProps } from './types';

import { fragmentChunks, vertexChunks, commonChunks } from './generated';

function NullFunction() {
  return null;
}

type ShaderProxyHelper<T extends string> = {
  [key in T]: any;
} & {
  body: any;
};

// -- VERTEX PROXY --
const vertHandler = {
  get: function(_: any, name: string) {
    const Component = function({ children }: ProxyProps) {
      return children;
    };
    Object.defineProperty(Component, 'chunkName', { writable: true });
    Object.defineProperty(Component, 'shaderType', { writable: true });
    Component.chunkName = name === 'body' ? DEFAULT_VERT_CHUNK : name;
    Component.shaderType = VERT;
    return Component;
  },
};
export const vert: ShaderProxyHelper<vertexChunks | commonChunks> = new Proxy(
  NullFunction,
  vertHandler
);

// -- FRAGMENT PROXY --
const fragHandler = {
  get: function(_: any, name: string) {
    const Component = function({ children }: ProxyProps) {
      return children;
    };
    Object.defineProperty(Component, 'chunkName', { writable: true });
    Object.defineProperty(Component, 'shaderType', { writable: true });
    Component.chunkName = name === 'body' ? DEFAULT_FRAG_CHUNK : name;
    Component.shaderType = FRAG;
    return Component;
  },
};

export const frag: ShaderProxyHelper<fragmentChunks | commonChunks> = new Proxy(
  NullFunction,
  fragHandler
);

export function common({ children }: ProxyProps) {
  return <>{children}</>
}

// TODO
// // -- NOISE PROXY --
// const noise = {
//   snoise2: "glsl-noise/simplex/2d",
//   snoise3: "glsl-noise/simplex/3d",
//   snoise4: "glsl-noise/simplex/4d",
//   cnoise2: "glsl-noise/classic/2d",
//   cnoise3: "glsl-noise/classic/3d",
//   cnoise4: "glsl-noise/classic/4d",
//   pnoise2: "glsl-noise/periodic/2d",
//   pnoise3: "glsl-noise/periodic/3d",
//   pnoise4: "glsl-noise/periodic/4d",
// };
// const noiseHandler = {
//   get: function (_, name) {
//     const path = noise[name];
//     if (path) {
//       const pragma = `#pragma glslify: ${name} = require(${path})`;
//       const Component = () => null;
//       Object.defineProperty(Component, "shaderType", { writable: true });
//       Object.defineProperty(Component, "toolShader", { writable: true });
//       Component.shaderType = TOOL;
//       Component.toolShader = pragma;
//       return Component;
//     }
//     return null;
//   },
// };
// export const Noise = new Proxy(() => null, noiseHandler);

// // -- EASING PROXY --
// const easing = {
//   backInOut: "glsl-easings/back-in-out",
//   backIn: "glsl-easings/back-in",
//   backOut: "glsl-easings/back-out",
//   bounceInOut: "glsl-easings/bounce-in-out",
//   bounceIn: "glsl-easings/bounce-in",
//   bounceOut: "glsl-easings/bounce-out",
//   circularInOut: "glsl-easings/circular-in-out",
//   circularIn: "glsl-easings/circular-in",
//   circularOut: "glsl-easings/circular-out",
//   cubicInOut: "glsl-easings/cubic-in-out",
//   cubicIn: "glsl-easings/cubic-in",
//   cubicOut: "glsl-easings/cubic-out",
//   elasticInOut: "glsl-easings/elastic-in-out",
//   elasticIn: "glsl-easings/elastic-in",
//   elasticOut: "glsl-easings/elastic-out",
//   exponentialInOut: "glsl-easings/exponential-in-out",
//   exponentialIn: "glsl-easings/exponential-in",
//   exponentialOut: "glsl-easings/exponential-out",
//   linear: "glsl-easings/linear",
//   quadraticInOut: "glsl-easings/quadratic-in-out",
//   quadraticIn: "glsl-easings/quadratic-in",
//   quadraticOut: "glsl-easings/quadratic-out",
//   quarticInOut: "glsl-easings/quartic-in-out",
//   quarticIn: "glsl-easings/quartic-in",
//   quarticOut: "glsl-easings/quartic-out",
//   quinticInOut: "glsl-easings/quintic-in-out",
//   quinticIn: "glsl-easings/quintic-in",
//   quinticOut: "glsl-easings/quintic-out",
//   sineInOut: "glsl-easings/sine-in-out",
//   sineIn: "glsl-easings/sine-in",
//   sineOut: "glsl-easings/sine-out",
// };
// const easingHandler = {
//   get: function (_, name) {
//     const path = easing[name];
//     if (path) {
//       const pragma = `#pragma glslify: ${name} = require(${path})`;
//       const Component = () => null;
//       Object.defineProperty(Component, "shaderType", { writable: true });
//       Object.defineProperty(Component, "toolShader", { writable: true });
//       Component.shaderType = TOOL;
//       Component.toolShader = pragma;
//       return Component;
//     }
//     return null;
//   },
// };
// export const Ease = new Proxy(() => null, easingHandler);
