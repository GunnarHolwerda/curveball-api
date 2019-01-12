import { BaseSocketHandler } from './base-socket-handler';
import { Socket } from '../../interfaces/socket';
import { IQuizResponse } from '../entities/quiz';

export class QuizSocketHandlers extends BaseSocketHandler {

    constructor(private quiz: IQuizResponse) {
        super();
    }

    public register(socket: Socket): void {
        super.register(socket);
    }

    protected async disconnect(socket: Socket): Promise<void> {
        super.disconnect(socket);
    }

    protected get cachePrefix(): string {
        return this.quiz.quizId;
    }
}