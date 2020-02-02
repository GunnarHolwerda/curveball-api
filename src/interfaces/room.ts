import * as socketio from 'socket.io';
import * as socketioJwt from 'socketio-jwt';
import { BaseSocketHandler } from '../models/socket-handlers/base-socket-handler';
import { Socket } from './socket';
import { ApplicationConfig } from '../models/config';
import { QuizEvents } from '../types/events';

export abstract class Room {
    constructor(protected _namespace: socketio.Namespace, protected socketHandlers: BaseSocketHandler) { }

    public abstract get numConnected(): Promise<number>;
    public abstract delete(): Promise<void>;

    public get namespace(): socketio.Namespace {
        return this._namespace;
    }

    public async start(): Promise<void> {
        this._namespace.on('connection', socketioJwt.authorize({
            secret: ApplicationConfig.jwtSecret,
            decodedPropertyName: 'user',
            timeout: 15000
        })).on('authenticated', (socket: Socket) => {
            this.numConnected.then(count => {
                socket.emit(QuizEvents.audienceCount, count);
            }).catch(e => {
                console.error(`Error retrieving num connected users for ${this.namespace}`, e);
            });
            socket.broadcast.emit(QuizEvents.userConnected);
            this.socketHandlers.register(socket);
        });
    }
}