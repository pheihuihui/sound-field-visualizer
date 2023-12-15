export function logSocket() {
    const server = localStorage.getItem("socketServer") || "ws://localhost:8080"
    const socket = new WebSocket(server)
    socket.addEventListener("message", (event) => {
        window.sound = event.data as string
    })
    socket.addEventListener("open", (event) => {
        console.log("Connected to server")
    })
    socket.addEventListener("close", (event) => {
        console.log("Disconnected from server")
    })
    window.socket = socket
}
