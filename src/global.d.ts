export interface SoundFrame {
    time: number
    data: number[]
}

export declare global {
    interface Window {
        socket: WebSocket
        sound?: SoundFrame
        listAllObjects: () => void
    }
}
