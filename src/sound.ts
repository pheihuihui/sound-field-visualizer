export function logSocket() {
    const server = localStorage.getItem("socketServer") || "ws://localhost:8080"
    const socket = new WebSocket(server)
    socket.addEventListener("message", (event) => {
        let dt = event.data as Blob
        dt.arrayBuffer().then((buffer) => {
            let data = new Uint8Array(buffer)
            for (let i = 0; i < 16; i++) {
                for (let j = 0; j < 16; j++) {
                    let id = `td-${i}-${j}`
                    let idx = i * 16 + j
                    let val = data[idx]
                    changeColor(id, val)
                }
            }
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
