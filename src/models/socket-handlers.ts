import * as socketio from 'socket.io';

import disconnect from '../socket-handlers/disconnect';

export class SocketHandlers {
    public static numConnected = 0;

    public static register(socket: socketio.Socket): void {
        SocketHandlers.numConnected++;
        console.log('a user connected');
        socket.on('disconnect', () => {
            SocketHandlers.numConnected--;
            disconnect();
        });
    }
}