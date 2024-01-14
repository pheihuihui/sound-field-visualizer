import {
    AdditiveBlending,
    BufferGeometry,
    CanvasTexture,
    Color,
    Float32BufferAttribute,
    GridHelper,
    Mesh,
    NormalBufferAttributes,
    PerspectiveCamera,
    PlaneGeometry,
    Points,
    PointsMaterial,
    Scene,
    ShadowMaterial,
    WebGLRenderer,
} from "three"

import { GUI } from "three/addons/libs/lil-gui.module.min.js"

import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { logSocket } from "./sound"

let container: HTMLDivElement
let camera: PerspectiveCamera, scene: Scene, renderer: WebGLRenderer
let lastTimestamp = 0
let particles: Points<BufferGeometry<NormalBufferAttributes>, PointsMaterial>

const params = {
    uniform: true,
    tension: 0.5,
    centripetal: true,
    chordal: true,
    socketServer: "ws://localhost:8080",
    recordServer: "http://localhost:3000",
}

const PARTICLE_SIZE = 10

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
    gui.add(params, "socketServer").onChange((val) => {
        localStorage.setItem("socketServer", val)
    })
    gui.add(params, "recordServer").onChange((val) => {
        localStorage.setItem("recordServer", val)
    })
    gui.open()

    const controls = new OrbitControls(camera, renderer.domElement)
    // @ts-ignore
    controls.damping = 0.2

    window.addEventListener("resize", onWindowResize)
    addParticles()

    render()
}

function addParticles() {
    const positionAttribute = new Float32BufferAttribute(new Float32Array(3 * 256), 3)
    const colorAttribute = new Float32BufferAttribute(new Float32Array(3 * 256).fill(0.5), 3)
    const sizeAttribute = new Float32BufferAttribute(new Float32Array(256).fill(PARTICLE_SIZE), 1)

    let canvas = document.createElement("canvas")
    canvas.width = 256
    canvas.height = 256
    let context = canvas.getContext("2d")!

    let gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2)
    gradient.addColorStop(0, "rgba(255,255,255,1)")
    gradient.addColorStop(1, "rgba(0,0,0,1)")
    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)

    let texture = new CanvasTexture(canvas)

    const material = new PointsMaterial({
        color: 0xffffff,
        size: 20.0,
        map: texture,
        transparent: true,
        blending: AdditiveBlending,
        depthTest: false,
        vertexColors: true,
    })

    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
            let idx = i * 16 + j
            positionAttribute.setXYZ(idx, j * 50 - 400, 0, i * 50 - 400)
        }
    }

    const geometry = new BufferGeometry()
    geometry.setAttribute("position", positionAttribute)
    geometry.setAttribute("color", colorAttribute)
    geometry.setAttribute("size", sizeAttribute)

    particles = new Points(geometry, material)
    scene.add(particles)
}

function render() {
    let time = window.sound?.time
    let frames = window.sound?.data
    if (time && time > lastTimestamp && frames && frames.length == 256) {
        for (let i = 0; i < 16; i++) {
            for (let j = 0; j < 16; j++) {
                let idx = i * 16 + j
                let tmp = frames[idx] / 256
                particles.geometry.attributes.color.setXYZ(idx, tmp, tmp, tmp)
            }
        }
        particles.geometry.attributes.color.needsUpdate = true
        lastTimestamp = time
    }
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
