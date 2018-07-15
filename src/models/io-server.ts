import * as socketio from 'socket.io';

import { Room } from '../interfaces/room';
import { ServerHandler } from './server-handlers';

export class IoServer implements Room {
    private socketHandlers: ServerHandler;

    constructor(private _server: socketio.Server) {
        this.socketHandlers = new ServerHandler();
    }

    public start(): void {
        this.server.on('connect', this.socketHandlers.register.bind(this.socketHandlers));
    }

    public get numConnected(): number {
        return this.socketHandlers.numConnected;
    }

    public get server(): socketio.Server {
        if (!this._server) {
            throw new Error('Attempted to access server before server was started');
        }
        return this._server;
    }
}