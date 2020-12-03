import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MeshPhysicalMaterial } from "three";

import createMaterial from "./createMaterial";

const Context = createContext();

const DEFAULT_FRAG_CHUNK = "dithering_fragment";
const DEFAULT_VERT_CHUNK = "project_vertex";

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
      ${shader}
      ${head}
    `;
  }
  return shader;
}

function addUniforms(shader, uniforms) {
  return `${Object.keys(uniforms)
    .map((key) => `uniform float ${key};`)
    .join(" ")}
    ${shader}
  `;
}

export const ExtendableMaterial = React.forwardRef(function ExtendableMaterial(
  { children, uniforms = {}, materialType = MeshPhysicalMaterial, ...props },
  ref
) {
  const [fragment, setFragment] = useState({});
  const [vertex, setVertex] = useState({});
  const [fragmentHead, setFragmentHead] = useState();
  const [vertexHead, setVertexHead] = useState();

  console.log("UPDATE", { fragment, fragmentHead });

  const material = useMemo(() => {
    const _material = createMaterial(materialType, uniforms, (shader) => {
      shader.fragmentShader = editShaderHead(
        shader.fragmentShader,
        fragmentHead
      );
      shader.vertexShader = editShaderHead(shader.vertexShader, vertexHead);
      shader.fragmentShader = addUniforms(shader.fragmentShader, uniforms);
      shader.vertexShader = addUniforms(shader.vertexShader, uniforms);
      shader.fragmentShader = editShader(shader.fragmentShader, fragment);
      shader.vertexShader = editShader(shader.vertexShader, vertex);
    });
    return new _material();
  }, [fragment, materialType, vertex, uniforms, fragmentHead, vertexHead]);

  return (
    <Context.Provider
      value={{
        setFragment,
        setFragmentHead,
        setVertex,
        setVertexHead,
      }}
    >
      <primitive
        ref={ref}
        object={material}
        attach="material"
        {...props}
        {...uniforms}
      />
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

ExtendableMaterial.Frag = function Fragment({
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
};

ExtendableMaterial.Vert = function Vertex({
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
};

ExtendableMaterial.FragHead = function FragmentHead({ children }) {
  const { setFragmentHead } = useContext(Context);
  useEffect(() => {
    if (children && typeof children === "string") {
      setFragmentHead(children);
    }
  }, [setFragmentHead, children]);
  return null;
};

ExtendableMaterial.VertHead = function VertexHead({ children }) {
  const { setVertexHead } = useContext(Context);
  useEffect(() => {
    if (children && typeof children === "string") {
      setVertexHead(children);
    }
  }, [setVertexHead, children]);
  return null;
};
