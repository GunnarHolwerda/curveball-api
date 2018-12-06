import * as socketio from 'socket.io';


import { Room } from '../../interfaces/room';
import { ServerHandler } from '../socket-handlers/server-handlers';
import { ApplicationConfig } from '../config';
import { Environment } from '../../types/environments';
import { QuizCache } from '../quiz-cache';

export class IoServer extends Room {
    constructor(private _server: socketio.Server) {
        super(_server.of('/'), new ServerHandler());
    }

    public start(): void {
        if (ApplicationConfig.nodeEnv !== Environment.prod) {
            QuizCache.clear();
        }
        super.start();
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

    public async delete(): Promise<void> {
        this.server.close();
    }
}