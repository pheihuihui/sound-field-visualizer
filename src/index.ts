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
import { createTable16x16 } from "./table"

let container: HTMLDivElement
let particles: Points
let camera: PerspectiveCamera, scene: Scene, renderer: WebGLRenderer

const params = {
    uniform: true,
    tension: 0.5,
    centripetal: true,
    chordal: true,
    server: "ws://localhost:8080",
}

const PARTICLE_SIZE = 25

// init()

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
    if (sserver) {
        params.server = sserver
    }

    gui.add(params, "uniform").onChange(render)
    gui.add(params, "centripetal").onChange(render)
    gui.add(params, "chordal").onChange(render)
    gui.add(params, "server").onChange((val) => {
        localStorage.setItem("socketServer", val)
    })
    gui.open()

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    // @ts-ignore
    controls.damping = 0.2

    window.addEventListener("resize", onWindowResize)

    render()
}

function render() {
    const positionAttribute = new BufferAttribute(new Float32Array(3), 3)
    if (window.sound && window.sound.length > 5) {
        let _arr = window.sound.split(",")
        let arr = _arr.map(parseFloat)
        console.log(arr)
        positionAttribute.setXYZ(0, arr[0], arr[1], 0)
    } else {
        positionAttribute.setXYZ(0, 0, 0, 0)
    }
    // positionAttribute.setXYZ(0, 0, 0, 0)
    const colors: number[] = []
    const sizes: number[] = []

    const color = new Color()

    for (let i = 0, l = positionAttribute.count; i < l; i++) {
        color.setRGB(0.9, 0.7, 0.9)
        color.toArray(colors, i * 3)
        sizes[i] = PARTICLE_SIZE * 0.5
    }

    const geometry = new BufferGeometry()
    geometry.setAttribute("position", positionAttribute)
    geometry.setAttribute("customColor", new Float32BufferAttribute(colors, 3))
    geometry.setAttribute("size", new Float32BufferAttribute(sizes, 1))

    const material = new ShaderMaterial({
        uniforms: {
            color: { value: new Color(0xffffff) },
            pointTexture: { value: new TextureLoader().load("./ball.png") },
            alphaTest: { value: 0.5 },
        },
        vertexShader: document.getElementById("vertexshader")!.textContent!,
        fragmentShader: document.getElementById("fragmentshader")!.textContent!,
    })

    particles = new Points(geometry, material)
    // make particles shine
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

createTable16x16()

logSocket()
