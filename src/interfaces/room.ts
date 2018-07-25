import * as socketio from 'socket.io';
import * as socketioJwt from 'socketio-jwt';
import { BaseSocketHandler } from '../models/base-socket-handler';

export abstract class Room {
    constructor(protected _namespace: socketio.Namespace, protected socketHandlers: BaseSocketHandler) { }

    public abstract get numConnected(): Promise<number>;
    public abstract delete(): void;

    public get namespace(): socketio.Namespace {
        return this._namespace;
    }

    public start(): void {
        this._namespace.on('connection', socketioJwt.authorize({
            secret: process.env.JWT_SECRET!,
            decodedPropertyName: 'user',
            timeout: 15000
        })).on('authenticated', (socket: socketio.Socket) => {
            this.socketHandlers.register(socket);
        });
    }
}