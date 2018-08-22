import { BaseSocketHandler } from './base-socket-handler';
import { Socket } from '../interfaces/socket';

export class QuizSocketHandlers extends BaseSocketHandler {

    constructor(private quizId: string) {
        super();
    }

    public register(socket: Socket): void {
        super.register(socket);
    }

    protected get cachePrefix(): string {
        return this.quizId;
    }
}