import * as socketio from 'socket.io';

export interface Room {
    numConnected: Promise<number>;
    namespace: socketio.Namespace;
    start(): void;
    delete(): Promise<void>;
}