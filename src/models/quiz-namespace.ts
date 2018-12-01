import * as socketio from 'socket.io';

import { Room } from '../interfaces/room';
import { QuizSocketHandlers } from './quiz-socket-handlers';
import { QuizCache } from './quiz-cache';
import { Quiz } from '../handlers/quiz/models/quiz';

export class QuizNamespace extends Room {

    constructor(_namespace: socketio.Namespace, private quiz: Quiz) {
        super(_namespace, new QuizSocketHandlers(quiz));
    }

    public start(): void {
        QuizCache.addQuiz(this.quiz);
        super.start();
    }

    public get quizId(): string {
        return this.quiz.properties.quiz_id;
    }

    public get numConnected(): Promise<number> {
        return new Promise((res) => {
            this._namespace.clients((_: any, clients: Array<string>) => res(clients.length));
        });
    }

    public async delete(): Promise<void> {
        try {
            await QuizCache.removeQuiz(this.quiz);
            await this.socketHandlers.destroy();
        } catch (e) {
            throw new Error('Failed to delete quiz namespace');
        }
    }
}