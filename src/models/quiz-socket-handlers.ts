import * as socketio from 'socket.io';

import { BaseSocketHandler } from './base-socket-handler';

export class QuizSocketHandlers extends BaseSocketHandler {

    constructor(private quizId: string) {
        super();
    }

    public register(socket: socketio.Socket): void {
        super.register(socket);
    }

    protected get cachePrefix(): string {
        return this.quizId;
    }
}