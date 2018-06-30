import * as socketio from 'socket.io';

import { BaseSocketHandler } from './base-socket-handler';

export class QuizSocketHandlers extends BaseSocketHandler {

    constructor() {
        super();
    }

    public register(socket: socketio.Socket): void {
        BaseSocketHandler.prototype.register(socket);
    }
}