import * as THREE from "three"
import { uniform, texture, storage, SpriteNodeMaterial } from "three/examples/jsm/nodes/Nodes.js"

import WebGPU from "three/addons/capabilities/WebGPU.js"
import WebGPURenderer from "three/addons/renderers/webgpu/WebGPURenderer.js"

import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import Stats from "three/addons/libs/stats.module.js"

const particleCount = 100000
const size = uniform(0.12)

let camera: THREE.Camera, scene: THREE.Scene, renderer: WebGPURenderer
let controls: OrbitControls, stats: Stats

init()

function init() {
    if (WebGPU.isAvailable() === false) {
        document.body.appendChild(WebGPU.getErrorMessage())

        throw new Error("No WebGPU support")
    }

    const { innerWidth, innerHeight } = window

    camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 1000)
    camera.position.set(40, 15, 40)

    scene = new THREE.Scene()

    // textures

    const textureLoader = new THREE.TextureLoader()
    const map = textureLoader.load("textures/sprite1.png")

    const createBuffer = () =>
        // @ts-ignore
        storage(new THREE.InstancedBufferAttribute(new Float32Array(particleCount * 4), 4), "vec3", particleCount)

    const positionBuffer = createBuffer()
    const velocityBuffer = createBuffer()
    const colorBuffer = createBuffer()

    // create nodes

    const textureNode = texture(map)

    // create particles

    const particleMaterial = new SpriteNodeMaterial()
    // @ts-ignore
    particleMaterial.colorNode = textureNode.mul(colorBuffer.element(instanceIndex))
    // @ts-ignore
    particleMaterial.positionNode = positionBuffer.toAttribute()
    particleMaterial.scaleNode = size
    particleMaterial.depthWrite = false
    particleMaterial.depthTest = true
    particleMaterial.transparent = true

    const particles = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), particleMaterial)
    // @ts-ignore
    particles.isInstancedMesh = true
    // @ts-ignore
    particles.count = particleCount
    scene.add(particles)

    const helper = new THREE.GridHelper(60, 40, 0x303030, 0x303030)
    scene.add(helper)

    const geometry = new THREE.PlaneGeometry(1000, 1000)
    geometry.rotateX(-Math.PI / 2)

    const plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }))
    scene.add(plane)

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    renderer = new WebGPURenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setAnimationLoop(animate)
    document.body.appendChild(renderer.domElement)
    stats = new Stats()
    document.body.appendChild(stats.dom)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.minDistance = 5
    controls.maxDistance = 70
    controls.target.set(0, -1, 0)
    controls.update()

    window.addEventListener("resize", onWindowResize)
}

function onWindowResize() {
    const { innerWidth, innerHeight } = window

    // @ts-ignore
    camera.aspect = innerWidth / innerHeight
    // @ts-ignore
    camera.updateProjectionMatrix()

    renderer.setSize(innerWidth, innerHeight)
}

function animate() {
    renderer.render(scene, camera)
}
