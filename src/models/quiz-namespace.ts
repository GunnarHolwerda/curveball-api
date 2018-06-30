import * as socketio from 'socket.io';

import { Room } from '../interfaces/room';
import { QuizSocketHandlers } from './socket-handlers';

export class QuizNamespace implements Room {
    private socketHandlers: QuizSocketHandlers;

    constructor(private _quizId: string, private _namespace: socketio.Namespace) {
        this.socketHandlers = new QuizSocketHandlers();
    }

    public start(): void {
        this.namespace.on('connect', this.socketHandlers.register);
    }

    public quizId(): string {
        return this._quizId;
    }

    public get numConnected(): any {
        return this.socketHandlers.numConnected;
    }

    public get namespace(): socketio.Namespace {
        if (!this._namespace) {
            throw new Error('Attempted to access server before server was started');
        }
        return this._namespace;
    }
}