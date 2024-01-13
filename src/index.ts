import {
    BufferAttribute,
    BufferGeometry,
    Color,
    Float32BufferAttribute,
    GridHelper,
    Mesh,
    PerspectiveCamera,
    PlaneGeometry,
    Points,
    Scene,
    ShaderMaterial,
    ShadowMaterial,
    TextureLoader,
    WebGLRenderer,
} from "three"

import { GUI } from "three/addons/libs/lil-gui.module.min.js"

import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { logSocket } from "./sound"

let container: HTMLDivElement
let particles: Points
let camera: PerspectiveCamera, scene: Scene, renderer: WebGLRenderer
let lastTimestamp = 0

const params = {
    uniform: true,
    tension: 0.5,
    centripetal: true,
    chordal: true,
    socketServer: "ws://localhost:8080",
    recordServer: "http://localhost:3000",
}

const PARTICLE_SIZE = 100

init()

function init() {
    // @ts-ignore
    container = document.getElementById("container")

    scene = new Scene()
    scene.background = new Color(0x000000)

    camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000)
    camera.position.set(0, 250, 1000)
    scene.add(camera)

    const planeGeometry = new PlaneGeometry(2000, 2000)
    planeGeometry.rotateX(-Math.PI / 2)
    const planeMaterial = new ShadowMaterial({ color: 0x000000, opacity: 0.2 })

    const plane = new Mesh(planeGeometry, planeMaterial)
    plane.position.y = -200
    plane.receiveShadow = true
    scene.add(plane)

    const helper = new GridHelper(2000, 100)
    helper.position.y = -199
    helper.material.opacity = 0.25
    helper.material.transparent = true
    scene.add(helper)

    renderer = new WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    container.appendChild(renderer.domElement)

    const gui = new GUI()

    let sserver = localStorage.getItem("socketServer")
    let rserver = localStorage.getItem("recordServer")
    if (sserver) {
        params.socketServer = sserver
    }
    if (rserver) {
        params.recordServer = rserver
    }

    gui.add(params, "uniform").onChange(render)
    gui.add(params, "centripetal").onChange(render)
    gui.add(params, "chordal").onChange(render)
    gui.add(params, "socketServer").onChange((val) => {
        localStorage.setItem("socketServer", val)
    })
    gui.add(params, "recordServer").onChange((val) => {
        localStorage.setItem("recordServer", val)
    })
    gui.open()

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    // @ts-ignore
    controls.damping = 0.2

    window.addEventListener("resize", onWindowResize)

    render()
}

const material = new ShaderMaterial({
    uniforms: {
        color: { value: new Color(0x00ffff) },
        pointTexture: { value: new TextureLoader().load("./ball.png") },
        alphaTest: { value: 0.5 },
    },
    vertexShader: document.getElementById("vertexshader")!.textContent!,
    fragmentShader: document.getElementById("fragmentshader")!.textContent!,
})

function render() {
    const positionAttribute = new BufferAttribute(new Float32Array(3 * 256), 3)
    const colors: number[] = []
    const sizeAttribute = new Float32BufferAttribute(new Array(256).fill(PARTICLE_SIZE), 1)
    let nodes = window.sound?.data
    let time = window.sound?.time
    if (nodes && nodes.length == 256 && time && time != lastTimestamp) {
        for (let i = 0; i < 16; i++) {
            for (let j = 0; j < 16; j++) {
                let idx = i * 16 + j
                let node = nodes[i * 16 + j]
                positionAttribute.setXYZ(idx, i * 50 - 400, 0, j * 50 - 400)
                colors.push(node, node, node)
            }
        }
        lastTimestamp = time
    }
    const colorAttribute = new Float32BufferAttribute(new Float32Array(colors), 3)

    const geometry = new BufferGeometry()
    geometry.setAttribute("position", positionAttribute)
    geometry.setAttribute("customColor", colorAttribute)
    geometry.setAttribute("size", sizeAttribute)

    particles = new Points(geometry, material)
    particles.scale.multiplyScalar(1.5)
    scene.add(particles)

    renderer.render(scene, camera)
    requestAnimationFrame(render)
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)

    render()
}

logSocket()
