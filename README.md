![](https://raw.githubusercontent.com/emmelleppi/component-material/master/logo.jpg)

[![Version](https://img.shields.io/npm/v/component-material?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/component-material)
[![Downloads](https://img.shields.io/npm/dt/component-material.svg?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/component-material)
[![Discord Shield](https://img.shields.io/discord/740090768164651008?style=flat&colorA=000000&colorB=000000&label=discord&logo=discord&logoColor=ffffff)](https://discord.gg/ZZjjNvJ)

# Component Material

ComponentMaterial is a React utility that helps you compose and modify materials in [react-three-fiber](https://github.com/pmndrs/react-three-fiber) and threejs.

### Examples

<p align="center">
  <a href="https://codesandbox.io/embed/component-material-distortion-example-p4cly?fontsize=14&hidenavigation=1&theme=dark"><img width="274" height="150" src="https://raw.githubusercontent.com/emmelleppi/component-material/master/readme/distortion.jpg" /></a>
  <a href="https://codesandbox.io/embed/component-material-voronoi-example-cuq2n?fontsize=14&hidenavigation=1&theme=dark"><img width="274"  height="150" src="https://raw.githubusercontent.com/emmelleppi/component-material/master/readme/voronoi.jpg" /></a>
</p>

## Quick start

```bash
yarn add component-material
```

```jsx
import { ComponentMaterial, frag, vert } from 'component-material'

function CustomMaterial(props) {
  return (
    <ComponentMaterial
      {...props}
      // 1️⃣ declare uniforms with the correct type
      uniforms={{
        r: { value: 1, type: 'float' },
        g: { value: 0.5, type: 'float' },
        b: { value: 0, type: 'float' },
      }}>
      <frag.body
        // 2️⃣ Access the uniforms in your shader
        children={`gl_FragColor = vec4(r, g, b, 1.0);`}
      />
    </ComponentMaterial>
  )
}

function Sphere() {
  return (
    <mesh>
      <sphereBufferMaterial />
      <CustomMaterial />
    </mesh>
```

## Features

- Chunks Autocomplete: Typescript lets us add a bunch useful in-editor hints
  ![component-material autocomplete](https://raw.githubusercontent.com/emmelleppi/component-material/master/readme/autocomplete.jpg)
- Syntax Highlighting with either tagged glsl templates [glsl-literal](https://marketplace.visualstudio.com/items?itemName=boyswan.glsl-literal) or [comment-tagged-templates](https://marketplace.visualstudio.com/items?itemName=bierner.comment-tagged-templates).
- Glslify via [babel-plugin-glsl](https://github.com/onnovisser/babel-plugin-glsl)
  ![glslify](https://raw.githubusercontent.com/pmndrs/component-material/master/readme/glslify.jpg)

## `<ComponentMaterial/>`

#### `from`

By default ComponentMaterial extends three's MeshPhysicalMaterial.

If you want to extend a different material just use the `from` prop passing the desired material constructor.

```jsx
<ComponentMaterial from={THREE.MeshPhongMaterial} />
```

#### `uniforms`

Uniforms used inside shaders can be defined via the `uniforms` prop as follows

```jsx
<ComponentMaterial
  uniforms={{
    myUniform1: { value: 0, type: 'float' },
    myUniform2: { value: [0, 1], type: 'vec2' },
  }}
/>
```

This will also create setters and getters for the uniforms, allowing you to mutate them using props and effectively making the material reactive:

```jsx
function CustomMaterial({ color }) {
  return (
    <ComponentMaterial
      uniforms={{ color: { value: color, type: 'vec3' } }}
      color={color} // color uniform will have the value of myColorProp
    />
```

**Note**

- The correspondences between glsl and javascript types can be seen [here](https://threejs.org/docs/#api/en/core/Uniform)
- Uniforms cannot be defined twice in the same shader. So be careful not to define the same uniforms inside the `head` tag.

#### `varyings`

Varying variables can be defined directly inside the shader `head` tag or they can be declared as prop:

```jsx
<ComponentMaterial
  varyings={{
    myVarying1: { type: 'float' },
    myVarying2: { type: 'vec2' },
  }}
/>
```

This is equivalent to adding this code to both your vertex and fragment shaders heads:

```glsl
float myVarying1;
vec2 myVarying2;
```

**Note:**

- Varyings don't have an initial value, only a type definition
- As uniforms, varyings cannot be defined twice in the same shader, this will give a glsl error. So be careful not to define the same varyings inside the `head` tag.

## `<frag />` & `<vert />`

The `frag` and `vert` tags have the function of injecting the shader text, passed as children, into the preconfigured shader of the threejs material.
Let's see what it means with an example:

```jsx
<ComponentMaterial uniforms={{ time: { value: 0, type: 'float' } }}>
  <frag.head
    children={`
    float quadraticInOut(float t) {
      float p = 2.0 * t * t;
      return t < 0.5 ? p : -p + (4.0 * t) - 1.0;
    }`}
  />
  <frag.body
    children={`
    gl_FragColor.a = gl_FragColor.a * quadraticInOut((sin(time) + 1.0) / 2.0);`}
  />
</ComponentMaterial>
```

In the code above the `<frag.head>` component adds an easing function `quadraticInOut` to the fragment shader of the material, prepending it before the `main` function of the shader.

The `<frag.body>` component instead adds a line of code that modify the `gl_FragColor` alpha value, appending it after the last operation of the main function.

In particular, if we take as an example the fragment shader of the `MeshPhysicalMaterial`, `<frag.head>` prepends the code before [this shader line](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderLib/meshphysical_frag.glsl.js#L2), `<frag.body>` instead posts the code after [this shader line](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderLib/meshphysical_frag.glsl.js#L124) (the `dithering_fragment` chunk).

The same goes for the `<vert>` component, which however acts on the vertex shader. In particular, `<vert.head>` prepends the code to [this shader line](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderLib/meshphysical_vert.glsl.js#L2), while `<vert.body>` appends the code to [this shader line](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderLib/meshphysical_vert.glsl.js#L60) (the `project_vertex` chunk).

It is possible to inject the code after a particular chunk just by doing

```jsx
<frag.my_chunk
  children={`
    my custom shader
  `}
/>
```

where `my_chunk` must be replaced with the name of the chunk concerned.

If we wanted to insert some code just after the `emissivemap_fragment` chunk ([here the reference for the MeshPhysicalMaterial](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderLib/meshphysical_frag.glsl.js#L99)) then just use the following code

```jsx
<frag.emissivemap_fragment
  children={`
    my custom shader
  `}
/>
```

#### `replaceChunk`

The `replaceChunk` prop is a boolean that allows you to completely replace the chosen chunk, so instead of append the custom shader code after the chunk it will be replaced directly.

Taking the previous example:

```jsx
<frag.emissivemap_fragment
  replaceChunk
  children={`
    my custom shader which will replace all the chunk related to emissivemap_fragment
  `}
/>
```

## `<common>`

The `<common>` tag is useful in case vertex shader and fragment shader share some functions.

Taking the previous example, if both the fragment shader and the vertex shader share the easing function `quadraticInOut`, instead of writing

```jsx
<vert.head
  children={`
    float quadraticInOut(float t) {
      float p = 2.0 * t * t;
      return t < 0.5 ? p : -p + (4.0 * t) - 1.0;
    }
  `}
/>
<frag.head
  children={`
    float quadraticInOut(float t) {
      float p = 2.0 * t * t;
      return t < 0.5 ? p : -p + (4.0 * t) - 1.0;
    }
  `}
/>
```

we will write

```jsx
<common
  children={`
    float quadraticInOut(float t) {
      float p = 2.0 * t * t;
      return t < 0.5 ? p : -p + (4.0 * t) - 1.0;
    }
  `}
/>
```
