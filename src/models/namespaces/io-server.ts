import * as socketio from 'socket.io';
import { Room } from '../../interfaces/room';
import { ServerHandler } from '../socket-handlers/server-handlers';
import { ApplicationConfig } from '../config';
import { Environment } from '../../types/environments';
import { QuizCache } from '../quiz-cache';
import { Demos } from '../socket-handlers/demo-socket-handler';
import { DemoNamespace } from './demo-namespace';

export class IoServer extends Room {
    constructor(private _server: socketio.Server) {
        super(_server.of('/'), new ServerHandler());
    }

    public async start(): Promise<void> {
        if (ApplicationConfig.nodeEnv !== Environment.prod) {
            await this.prepareDevEnvironment();
        }
        await super.start();
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

    private async prepareDevEnvironment(): Promise<void> {
        console.warn('Preparing development environment realtime configuration');
        try {
            await QuizCache.clear();
        } catch (e) {
            console.error(`Failed to clear quiz cache`);
        }
        for (const demo of Object.keys(Demos).map(k => Demos[k])) {
            console.log(`Creating demo namespace for ${demo.name}`);
            const namespace = this.getNamespace(demo.name);
            const demoSpace = new DemoNamespace(namespace, Demos[demo.name]);
            await demoSpace.start();
        }
    }
}