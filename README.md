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
	// 1️⃣ declare uniforms with the correct type
        uniforms={{
            r: { value: 1, type: "float" },
            g: { value: 0.5, type: "float" },
            b: { value: 0, type: "float" }
        }} 
      >
      <frag.body>{`
        // 2️⃣ Access the uniforms in your shader
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
By default ComponentMaterial extends three's MeshPhysicalMaterial.

If you want to extend a different material just use the `materialType` prop passing the desired material constructor.

```jsx
   <ComponentMaterial materialType={THREE.MeshPhongMaterial} >...</ComponentMaterial>
```
 
 
- ##### `uniforms`

Uniforms used inside shaders can be defined via the `uniforms` prop as follows

```jsx
  	<ComponentMaterial
  		...
    	uniforms={{
            myUniform1: { value: 0, type: "float" },
            myUniform2: { value: [0, 1], type: "vec2" }
    	}}
	>...</ComponentMaterial>
```

This will also create setters and getters for the uniforms, allowing you to mutate them using props and effectively making the material reactive:

```
function MyMaterial({ myColorProp }) {
   return (
   	<ComponentMaterial 
		uniforms={{ color: { value: myColorProp, type: "vec3" }}} 
		color={myColorProp} // color uniform will have the value of myColorProp
	>...</ComponentMaterial>
   )
}
```

**Note**
- The correspondences between glsl and javascript types can be seen [here](https://threejs.org/docs/#api/en/core/Uniform)
- Uniforms cannot be defined twice in the same shader. So be careful not to define the same uniforms inside the `head` tag.

- ##### `varying`

Varying variables can be defined directly inside the shader `head` tag or they can be declared as prop:

```jsx
  	<ComponentMaterial
  		...
    	varying={{
            myVarying1: { type: "float" },
            myVarying2: { type: "vec2" }
    	}}
	>...</ComponentMaterial>
```

**Note:** 
- As uniforms, varyings cannot be defined twice in the same shader, this will give a glsl error. So be careful not to define the same varyings inside the `head` tag.

#### Features

- Autocomplete: Typescript lets us add a bunch useful in-editor hints
![component-material autocomplete](https://raw.githubusercontent.com/emmelleppi/component-material/master/readme/autocomplete.jpeg)
