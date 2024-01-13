import { SoundFrame } from "./global"

const recordServer = localStorage.getItem("recordServer") || "http://localhost:8080"
const socketServer = localStorage.getItem("socketServer") || "ws://localhost:3000"

export function logSocket() {
    const socket = new WebSocket(socketServer)
    socket.addEventListener("message", (event) => {
        let dt = event.data as Blob
        dt.arrayBuffer().then((buffer) => {
            let data = new Uint8Array(buffer)
            window.sound = { time: Date.now(), data: Array.from(data) }
        })
    })
    socket.addEventListener("open", (event) => {
        console.log("Connected to server")
    })
    socket.addEventListener("close", (event) => {
        console.log("Disconnected from server")
    })
    window.socket = socket
}

function changeColor(id: string, val: number) {
    let el = document.getElementById(id)
    if (el) {
        el.style.backgroundColor = `rgb(${val}, ${val}, ${val})`
    }
}

async function fetchGap() {
    let res = await fetch(`${recordServer}/gap`)
    let data = await res.text()
    return data
}

async function fetchRecords() {
    let res = await fetch(`${recordServer}/sounds`)
    let data = await res.json()
    return data
}

async function fetchRecord(id: string) {
    let res = await fetch(`${recordServer}/sound/${id}`)
    let data = await res.blob()
    return data
}

function getFramesFromBlob(blob: Blob) {
    return blob.arrayBuffer().then((buffer) => {
        let data = new Uint8Array(buffer)
        let frames: SoundFrame[] = []
        for (let i = 0; i < data.length / 17 / 16; i++) {
            let tmp = data.slice(i * 16 * 17, i * 16 * 17 + 16 * 17)
            let _time = tmp.slice(0, 16)
            let time = _time.reduce((pre, cur, index) => {
                return pre + cur * Math.pow(2, 8 * (15 - index))
            }, 0)
            let _data = tmp.slice(16, 17 * 16)
            let __data = Array.from(_data)
            frames.push({ time, data: __data })
        }
        return frames
    })
}

// fetchRecord("1705071141632").then(console.log)
// fetchRecord("1705071141632").then(getFramesFromBlob).then(console.log)
