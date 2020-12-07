# Component Material


ComponentMaterial is a utility library for React that helps you write and modify materials in react-three-fiber and threejs.

### Quick start
```bash
yarn add component-material
```

```jsx
function MyMaterial(props) {

  return (
      <ComponentMaterial 
        {...props}
        uniforms={{ color: { value: "red", type: "vec3" }}} 
        from={THREE.MeshPhysicalMaterial}
      >
      <frag.body>{/*glsl*/`
        gl_FragColor = vec4(color, 1.);
      `}</frag.body>
    </ComponentMaterial>
  )
}
```

1. declare your uniforms
2. write your fragment and vertex shader by hooking into existing shader chunks

#### Features

- Autocomplete: Typescript lets us add a bunch useful in-editor hints
![component-material autocomplete](https://raw.githubusercontent.com/emmelleppi/component-material/master/readme/autocomplete.jpeg)
