![](https://raw.githubusercontent.com/emmelleppi/component-material/master/logo.jpg)

# Component Material

ComponentMaterial is a utility library for React that helps you write and modify materials in react-three-fiber and threejs.

### Quick start
```bash
yarn add component-material
```

```jsx
import { ComponentMaterial, frag, vert } from "component-material"

function MyMaterial(props) {

  return (
      <ComponentMaterial 
        {...props}
        uniforms={{
        	r: { value: 1, type: "float" },
            g: { value: 0.5, type: "float" },
            b: { value: 0, type: "float" }
        }} 
      >
      <frag.body>{`
        gl_FragColor = vec4(r, g, b, 1.0);
      `}</frag.body>
    </ComponentMaterial>
  )
}
```

1. declare your uniforms
2. write your fragment and vertex shader by hooking into existing shader chunks

### API
#### `<ComponentMaterial/>`

- ##### `materialType`
By default ComponentMaterial implements the MeshPhysicalMaterial of three.js.

If you want to implement a different material just use the `materialType` prop passing the desired material class.

```jsx
	<ComponentMaterial ... materialType={THREE.MeshPhongMaterial} >...</ComponentMaterial>
```
 
 
- ##### `uniforms`

Uniforms used inside shaders must be defined via the `uniforms` prop as follows

```jsx
  	<ComponentMaterial
  		...
    	uniforms={{
        	my-uniform-1: { value: 0, type: "float" },
            my-uniform-2: { value: [0, 1], type: "vec2" },
    	}}
	>...</ComponentMaterial>
```

The correspondences between glsl and javascript types can be seen [here](https://threejs.org/docs/#api/en/core/Uniform)

**Note:** the variables cannot be defined twice in the same shader. So be careful not to define uniforms inside the `head` tag.

- ##### `varying`

Varying variables can be defined directly inside the shader `head` tag or they can be passed as prop in the following way

```jsx
  	<ComponentMaterial
  		...
    	varying={{
        	my-varying-1: { type: "float" },
            my-varying-2: { type: "vec2" },
    	}}
	>...</ComponentMaterial>
```

**Note:** the variables cannot be defined twice in the same shader. Therefore it is not possible to define them in the `head` tag and at the same time via props.

#### Features

- Autocomplete: Typescript lets us add a bunch useful in-editor hints
![component-material autocomplete](https://raw.githubusercontent.com/emmelleppi/component-material/master/readme/autocomplete.jpeg)
