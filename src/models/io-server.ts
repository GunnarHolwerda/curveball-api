import * as socketio from 'socket.io';

import { Room } from '../interfaces/room';
import { ServerHandler } from './server-handlers';
import { QuizCache } from './quiz-cache';

export class IoServer implements Room {
    private socketHandlers: ServerHandler;

    constructor(private _server: socketio.Server) {
        this.socketHandlers = new ServerHandler();
    }

    public start(): void {
        if (process.env.NODE_ENV === 'development') {
            QuizCache.clear();
        }
        this.server.on('connect', (socket) => {
            this.socketHandlers.register(socket);
        });
    }

    public get server(): socketio.Server {
        if (!this._server) {
            throw new Error('Attempted to access server before server was started');
        }
        return this._server;
    }

    public getNamespace(namespace: string): socketio.Namespace {
        return this._server.of(namespace);
    }

    public get numConnected(): Promise<number> {
        return new Promise((res) => {
            this._server.clients().clients((_: any, clients: Array<string>) => res(clients.length));
        });
    }

    public get namespace(): socketio.Namespace {
        return this.server.of('/');
    }

    public async delete(): Promise<void> {
        this.server.close();
    }
}