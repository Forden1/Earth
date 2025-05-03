import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import earthVertexShader from './shaders/earth/vertex.glsl'
import earthFragmentShader from './shaders/earth/fragment.glsl' 
import atmosphereVertexShader from './shaders/atmosphere/vertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphere/fragment.glsl' 
import { ThreeMFLoader } from 'three/examples/jsm/Addons.js'

/**
 * Base
 */
// Debug
const gui = new GUI()
const debugObject={
    uCloudsNightColor:"#2f2d2d"
}
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()

/**
 * Earth
 */
const earthParameters = {}
earthParameters.atmosphereDayColor = '#00aaff'
earthParameters.atmosphereTwilightColor = '#ff6600'
// Textures
const earthDayTexture = textureLoader.load('./earth/day.jpg')
const earthNightTexture = textureLoader.load('./earth/night.jpg')
earthDayTexture.colorSpace=THREE.SRGBColorSpace
earthNightTexture.colorSpace=THREE.SRGBColorSpace
const earthSpecularCloudsTexture = textureLoader.load('./earth/specularClouds.jpg')
earthDayTexture.anisotropy=8
earthNightTexture.anisotropy=8
earthSpecularCloudsTexture.anisotropy=8
// Mesh
const earthGeometry = new THREE.SphereGeometry(2, 64, 64)
const earthMaterial = new THREE.ShaderMaterial({
    vertexShader: earthVertexShader,
    fragmentShader: earthFragmentShader,
    uniforms:
    {   uTime:new THREE.Uniform(0),
        uDayTexture: new THREE.Uniform(earthDayTexture),
        uNightTexture: new THREE.Uniform(earthNightTexture),
        uSpecularCloudsTexture: new THREE.Uniform(earthSpecularCloudsTexture),
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
        uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereDayColor)),
        uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereTwilightColor)),
        uCloudsNightColor:new THREE.Uniform(new THREE.Color(debugObject.uCloudsNightColor)),
        uTime:new THREE.Uniform(0)
    }
})
const earth = new THREE.Mesh(earthGeometry, earthMaterial)
scene.add(earth)

gui
    .addColor(debugObject,'uCloudsNightColor')
    .onChange(()=>{
        earthMaterial.uniforms.uCloudsNightColor.value.set(debugObject.uCloudsNightColor)
    })

    gui
    .addColor(earthParameters, 'atmosphereDayColor')
    .onChange(() =>
    {
        
        earthMaterial.uniforms.uAtmosphereDayColor.value.set(earthParameters.atmosphereDayColor)
        atmosphereMaterial.uniforms.uAtmosphereDayColor.value.set(earthParameters.atmosphereDayColor)
    })

gui
    .addColor(earthParameters, 'atmosphereTwilightColor')
    .onChange(() =>
    {
        earthMaterial.uniforms.uAtmosphereTwilightColor.value.set(earthParameters.atmosphereTwilightColor)
        atmosphereMaterial.uniforms.uAtmosphereTwilightColor.value.set(earthParameters.atmosphereTwilightColor)
        
    })

/**
 * atmoshpeher
 */

const atmosphereMaterial = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    vertexShader:atmosphereVertexShader,
    fragmentShader:atmosphereFragmentShader,
    transparent:true,
    uniforms:{
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
        uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereDayColor)),
        uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(earthParameters.atmosphereTwilightColor)),

    }

})

const atmosphere = new THREE.Mesh(
    earthGeometry,
    atmosphereMaterial
)
atmosphere.scale.set(1.05,1.05,1.05)
scene.add(atmosphere)

const params = {
    scale: 1.05
  };
  
  gui.add(params, 'scale', 0.5, 1.5,0.001).name('atmoshpere scale').onChange((value) => {
    atmosphere.scale.setScalar(value);
  });



/**
 * Sun
 */
const sunSpherical= new THREE.Spherical(1,Math.PI*0.5,0.5)
const sunDirection = new THREE.Vector3()

//sun helper
const debugSun= new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.1,2),
    new THREE.MeshBasicMaterial({
    })
)
scene.add(debugSun)

//update sun
const updateSun=()=>{
    sunDirection.setFromSpherical(sunSpherical)

    debugSun.position.copy(sunDirection).multiplyScalar(5)
    earthMaterial.uniforms.uSunDirection.value.copy(sunDirection)
    atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection)

}
updateSun()



// Tweaks
gui
    .add(sunSpherical, 'phi')
    .min(0)
    .max(Math.PI)
    .onChange(updateSun)

gui
    .add(sunSpherical, 'theta')
    .min(- Math.PI)
    .max(Math.PI)
    .onChange(updateSun)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 12
camera.position.y = 5
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)
renderer.setClearColor('#000011')

/**
 * Animate
 */
const clock = new THREE.Clock()
console.log(renderer.capabilities.getMaxAnisotropy())
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    earthMaterial.uniforms.uTime.value=elapsedTime

    earthMaterial.uniforms.uTime.value=elapsedTime
    earth.rotation.y = elapsedTime * 0.1

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()