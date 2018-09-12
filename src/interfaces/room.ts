import * as socketio from 'socket.io';
import * as socketioJwt from 'socketio-jwt';
import { BaseSocketHandler } from '../models/base-socket-handler';
import { Socket } from './socket';
import { ApplicationConfig } from '../config';
import { QuizEvents } from '../events';

export abstract class Room {
    constructor(protected _namespace: socketio.Namespace, protected socketHandlers: BaseSocketHandler) { }

    public abstract get numConnected(): Promise<number>;
    public abstract delete(): void;

    public get namespace(): socketio.Namespace {
        return this._namespace;
    }

    public start(): void {
        this._namespace.on('connection', socketioJwt.authorize({
            secret: ApplicationConfig.jwtSecret,
            decodedPropertyName: 'user',
            timeout: 15000
        })).on('authenticated', (socket: Socket) => {
            this.numConnected.then(count => {
                socket.emit(QuizEvents.numConnected, count);
            });
            socket.broadcast.emit(QuizEvents.userConnected);
            this.socketHandlers.register(socket);
        });
    }
}