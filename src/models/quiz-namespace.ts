import * as socketio from 'socket.io';

import { Room } from '../interfaces/room';
import { QuizSocketHandlers } from './quiz-socket-handlers';
import { IQuiz } from './quiz';
import { QuizCache } from './quiz-cache';

export class QuizNamespace implements Room {
    private socketHandlers: QuizSocketHandlers;

    constructor(private _namespace: socketio.Namespace, private quiz: IQuiz) {
        this.socketHandlers = new QuizSocketHandlers(this.quiz.quizId);
    }

    public start(): void {
        QuizCache.addQuiz(this.quiz);
        this.namespace.on('connect', this.socketHandlers.register.bind(this.socketHandlers));
    }

    public get quizId(): string {
        return this.quiz.quizId;
    }

    public get numConnected(): Promise<number> {
        return new Promise((res) => {
            this.namespace.clients((_: any, clients: Array<string>) => res(clients.length));
        });
    }

    public get namespace(): socketio.Namespace {
        return this._namespace;
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