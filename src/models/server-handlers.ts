import * as socketio from 'socket.io';
import { BaseSocketHandler } from './base-socket-handler';
import { QuizCache } from './quiz-cache';

export class ServerHandler extends BaseSocketHandler {
    public register(socket: socketio.Socket): void {
        super.register(socket);
        QuizCache.getQuizzes().then((quizzes) => {
            socket.emit('active_quizzes', quizzes);
        });
    }

    protected get cachePrefix(): string {
        return 'server';
    }
}