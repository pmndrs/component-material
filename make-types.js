import * as THREE from 'three'

const fragTypes = Object.keys(THREE.ShaderChunk).map(x => `"${x}"`).filter(x => x.indexOf("frag") > - 1).join(' | ')
const vertTypes = Object.keys(THREE.ShaderChunk).map(x => `"${x}"`).filter(x => x.indexOf("vert") > - 1).join(' | ')
const common = Object.keys(THREE.ShaderChunk).map(x => `"${x}"`).filter(x => x.indexOf("vert") === - 1 && x.indexOf("frag") === -1).join(' | ')

