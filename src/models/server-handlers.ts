import * as socketio from 'socket.io';
import { BaseSocketHandler } from './base-socket-handler';
import { CbRedis } from './cb-redis';

export class ServerHandler extends BaseSocketHandler {
    public register(socket: socketio.Socket): void {
        socket.on('disconnect', this.disconnect.bind(this));

        CbRedis.instance.getQuizzes().then((quizzes) => {
            socket.emit('active_quizzes', quizzes);
        });
    }
}