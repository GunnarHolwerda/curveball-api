import * as socketio from 'socket.io';
import { Room } from '../../interfaces/room';
import { DemoSocketHandlers } from '../socket-handlers/demo-socket-handler';
import { DemoScript } from '../../interfaces/demo-script';

export class DemoNamespace extends Room {

    constructor(_namespace: socketio.Namespace, private demo: DemoScript) {
        super(_namespace, new DemoSocketHandlers(demo));
    }

    public async start(): Promise<void> {
        await super.start();
    }

    public get quizId(): string {
        return this.demo.name;
    }

    public get numConnected(): Promise<number> {
        return new Promise((res) => {
            this._namespace.clients((_: any, clients: Array<string>) => res(clients.length));
        });
    }

    public async delete(): Promise<void> {
        try {
            await this.socketHandlers.destroy();
        } catch (e) {
            throw new Error('Failed to delete quiz namespace');
        }
    }
}