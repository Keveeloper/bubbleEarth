import * as THREE from 'three'
import { addPass, useCamera, useGui, useRenderSize, useScene, useTick } from './render/init.js'
// import postprocessing passes
import { SavePass } from 'three/examples/jsm/postprocessing/SavePass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { BlendShader } from 'three/examples/jsm/shaders/BlendShader.js'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

import vertexPars from './shaders/vertex_pars.glsl'
import vertexMain from './shaders/vertex_main.glsl'
import fragmentPars from './shaders/fragment_pars.glsl'
import fragmentMain from './shaders/fragment_main.glsl'
import earthImage from './images/earthmap4k.jpg'

const startApp = () => {
  const scene = useScene()
  const camera = useCamera()
  // const gui = useGui()
  const { width, height } = useRenderSize()

  // settings
  const MOTION_BLUR_AMOUNT = 0.725

  // lighting
  const dirLight = new THREE.DirectionalLight('#526cff', .3)
  dirLight.position.set(2, 2, 2)

  // const ambientLight = new THREE.AmbientLight('#4255ff', 0.5)
  const ambientLight = new THREE.AmbientLight('#ffffff', 0.2)
  
  // Spotlight
  const spotLightBlue = new THREE.SpotLight( 0x0395d3 );
  spotLightBlue.position.set( 2, 2, 2 );

  const spotLightPink = new THREE.SpotLight( 0xf210a5 );
  spotLightPink.position.set( -2, 2, 2 );

  const spotLightYellow = new THREE.SpotLight( 0xffe40d );
  spotLightYellow.position.set( 2, -2, 2 );

  const spotLightGreen = new THREE.SpotLight( 0x2bff00 );
  spotLightGreen.position.set( 2, 2, -2 );

  // const spotLightHelper = new THREE.SpotLightHelper( spotLightBlue );
  // const spotLightHelperPink = new THREE.SpotLightHelper( spotLightPink );
  // const spotLightHelperYellow = new THREE.SpotLightHelper( spotLightYellow );
  // const spotLightHelperGreen = new THREE.SpotLightHelper( spotLightGreen );
  
  scene.add(
    dirLight, 
    ambientLight, 
    spotLightBlue, 
    spotLightPink, 
    spotLightYellow, 
    spotLightGreen
  )

  // Earth
  const earthGroup = new THREE.Group();
  earthGroup.rotation.z = -23.4 * Math.PI / 180;
  scene.add(earthGroup);

  const loader = new THREE.TextureLoader();
  const earthGeometry = new THREE.IcosahedronGeometry(1, 16);
  const earthMaterial = new THREE.MeshStandardMaterial({
    // color: 0xffff00,
    map: loader.load(earthImage),
  });
  const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
  earthGroup.add(earthMesh);
  // scene.add(earthMesh);

  // meshes
  const geometry = new THREE.IcosahedronGeometry(1, 400)
  const material = new THREE.MeshPhysicalMaterial({
    // roughness: 0,
    // metalness: 0,
    // color: '#ffffff',
    // transparent: true,
    // opacity: 0.9,
    metalness: .9,
    roughness: .1,
    // envMapIntensity: 0.9,
    clearcoat: 1,
    transparent: true,
    // transmission: .95,
    opacity: .5,
    reflectivity: 0.2,
    refractionRatio: 0.985,
    ior: 0.9,
    color: '#ffffff',
    // side: THREE.BackSide,
    onBeforeCompile: (shader) => {
      // storing a reference to the shader object
      material.userData.shader = shader

      // uniforms
      shader.uniforms.uTime = { value: 0 }

      const parsVertexString = /* glsl */ `#include <displacementmap_pars_vertex>`
      shader.vertexShader = shader.vertexShader.replace(
        parsVertexString,
        parsVertexString + vertexPars
      )

      const mainVertexString = /* glsl */ `#include <displacementmap_vertex>`
      shader.vertexShader = shader.vertexShader.replace(
        mainVertexString,
        mainVertexString + vertexMain
      )

      const mainFragmentString = /* glsl */ `#include <normal_fragment_maps>`
      const parsFragmentString = /* glsl */ `#include <bumpmap_pars_fragment>`
      shader.fragmentShader = shader.fragmentShader.replace(
        parsFragmentString,
        parsFragmentString + fragmentPars
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        mainFragmentString,
        mainFragmentString + fragmentMain
      )
    },
  })

  const ico = new THREE.Mesh(geometry, material)
  scene.add(ico)

  // GUI
  // const cameraFolder = gui.addFolder('Camera')
  // cameraFolder.add(camera.position, 'z', 0, 10)
  // cameraFolder.open()

  // postprocessing
  const renderTargetParameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    stencilBuffer: false,
  }

  function animate() {
    requestAnimationFrame(animate);
  
    earthMesh.rotation.y += 0.002;
  }
  
  animate();

  


  // postprocessing
  addPass(new UnrealBloomPass(new THREE.Vector2(width, height), 0.7, 0.4, 0.4))

  useTick(({ timestamp, timeDiff }) => {
    const time = timestamp / 10000
    material.userData.shader.uniforms.uTime.value = time
  })
}

export default startApp
