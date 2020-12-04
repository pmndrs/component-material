import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MeshPhysicalMaterial } from "three";
import glsl from "glslify";
import createMaterial from "./createMaterial";

const Context = createContext();
const DEFAULT_FRAG_CHUNK = "dithering_fragment";
const DEFAULT_VERT_CHUNK = "project_vertex";

function getVarType(variable) {
  return "float"
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
  { children, varying={},uniforms = {}, materialType = MeshPhysicalMaterial, ...props },
  ref
) {
  const [fragment, setFragment] = useState({});
  const [vertex, setVertex] = useState({});
  const [fragmentHead, setFragmentHead] = useState();
  const [vertexHead, setVertexHead] = useState();

  const material = useMemo(() => {
    const _material = createMaterial(materialType, uniforms, (shader) => {
      shader.fragmentShader = editShaderHead(
        shader.fragmentShader,
        fragmentHead
      );
      shader.vertexShader = editShaderHead(shader.vertexShader, vertexHead);
      shader.fragmentShader = addUniforms(shader.fragmentShader, uniforms);
      shader.vertexShader = addUniforms(shader.vertexShader, uniforms);
      shader.fragmentShader = addVarying(shader.fragmentShader, varying);
      shader.vertexShader = addVarying(shader.vertexShader, varying);
      shader.fragmentShader = editShader(shader.fragmentShader, fragment);
      shader.vertexShader = editShader(shader.vertexShader, vertex);
    });
    return new _material();
  }, [
    fragment,
    materialType,
    vertex,
    uniforms,
    fragmentHead,
    vertexHead,
  ]);

  return (
    <Context.Provider
      value={{
        setFragment,
        setFragmentHead,
        setVertex,
        setVertexHead,
      }}
    >
      {material && (
        <primitive
          ref={ref}
          object={material}
          attach="material"
          {...props}
          {...uniforms}
        />
      )}
      {children}
    </Context.Provider>
  );
});

function GenericChunk({ shader, chunkName, setShader, discartChunk }) {
  useEffect(() => {
    if (shader && typeof shader === "string" && chunkName) {
      setShader((s) => ({
        ...s,
        [chunkName]: { value: shader, discartChunk },
      }));
    }
  }, [shader, setShader, chunkName, discartChunk]);
  return null;
}

function FragmentChunk({
  children,
  discartChunk = false,
  chunkName = DEFAULT_FRAG_CHUNK,
}) {
  const { setFragment } = useContext(Context);
  return (
    <GenericChunk
      shader={children}
      setShader={setFragment}
      chunkName={chunkName}
      discartChunk={discartChunk}
    />
  );
}

function VertexChunk({
  children,
  discartChunk = false,
  chunkName = DEFAULT_VERT_CHUNK,
}) {
  const { setVertex } = useContext(Context);
  return (
    <GenericChunk
      shader={children}
      setShader={setVertex}
      chunkName={chunkName}
      discartChunk={discartChunk}
    />
  );
}

function FragmentHead({ children }) {
  const { setFragmentHead } = useContext(Context);
  useEffect(() => {
    if (children && typeof children === "string") {
      setFragmentHead(s => typeof s === "string" ? s.concat(children) : children);
    }
  }, [setFragmentHead, children]);
  return null;
}

function VertexHead({ children }) {
  const { setVertexHead } = useContext(Context);
  useEffect(() => {
    if (children && typeof children === "string") {
      setVertexHead(s => typeof s === "string" ? s.concat(children) : children);
    }
  }, [setVertexHead, children]);
  return null;
}


// -- VERTEX PROXY --
const vertHandler = {
  get: function (_, name) {
    if (name === "head") {
      return ({ children }) => <VertexHead>{children}</VertexHead>;
    } else if (name === "body") {
      return ({ children, chunkName, ...props }) => (
        <VertexChunk {...props}>{children}</VertexChunk>
      );
    } else {
      return ({ children, ...props }) => (
        <VertexChunk {...props} chunkName={name}>
          {children}
        </VertexChunk>
      );
    }
  },
};
export const Vert = new Proxy(() => null, vertHandler);

// -- FRAGMENT PROXY --
const fragHandler = {
  get: function (_, name) {
    if (name === "head") {
      return ({ children }) => <FragmentHead>{children}</FragmentHead>;
    } else if (name === "body") {
      return ({ children, chunkName, ...props }) => (
        <FragmentChunk {...props}>{children}</FragmentChunk>
      );
    } else {
      return ({ children, ...props }) => (
        <FragmentChunk {...props} chunkName={name}>
          {children}
        </FragmentChunk>
      );
    }
  },
};
export const Frag = new Proxy(() => null, fragHandler);

// -- NOISE PROXY --
const noise = {
  snoise2: glsl("#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)"),
  snoise3: glsl("#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)"),
  snoise4: glsl("#pragma glslify: snoise4 = require(glsl-noise/simplex/4d)"),
  cnoise2: glsl("#pragma glslify: cnoise2 = require(glsl-noise/classic/2d)"),
  cnoise3: glsl("#pragma glslify: cnoise3 = require(glsl-noise/classic/3d)"),
  cnoise4: glsl("#pragma glslify: cnoise4 = require(glsl-noise/classic/4d)"),
  pnoise2: glsl("#pragma glslify: pnoise2 = require(glsl-noise/periodic/2d)"),
  pnoise3: glsl("#pragma glslify: pnoise3 = require(glsl-noise/periodic/3d)"),
  pnoise4: glsl("#pragma glslify: pnoise4 = require(glsl-noise/periodic/4d)"),
}
const noiseHandler = {
  get: function (_, name) {
    const path = noise[name]
    if (path) {
      return () =>  (
        <>
          <VertexHead>{path}</VertexHead>
          <FragmentHead>{path}</FragmentHead>
        </>
      )
    }
  },
};
export const Noise = new Proxy(() => null, noiseHandler);
