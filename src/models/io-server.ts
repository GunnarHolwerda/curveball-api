import * as socketio from 'socket.io';

import { SocketHandlers } from './socket-handlers';

export class IoServer {
    private static _server: socketio.Server;
    private constructor() { }

    public static start(server: socketio.Server): void {
        this._server = server;
        server.on('connect', SocketHandlers.register);
    }

    public static get server(): socketio.Server {
        if (!this._server) {
            throw new Error('Attempted to access server before server was started');
        }
        return this._server;
    }
}