import { BaseSocketHandler } from './base-socket-handler';
import { QuizCache } from './quiz-cache';
import { Socket } from '../interfaces/socket';

export class ServerHandler extends BaseSocketHandler {
    public register(socket: Socket): void {
        super.register(socket);
        QuizCache.getQuizzes().then((quizzes) => {
            socket.emit('active_quizzes', quizzes);
        });
    }

    protected get cachePrefix(): string {
        return 'server';
    }
}