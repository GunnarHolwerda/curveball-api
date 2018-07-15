import * as socketio from 'socket.io';

import { Room } from '../interfaces/room';
import { QuizSocketHandlers } from './socket-handlers';
import { CbRedis } from './cb-redis';
import { IQuiz } from './quiz';

export class QuizNamespace implements Room {
    private socketHandlers: QuizSocketHandlers;
    private static namespaces: { [quizId: string]: QuizNamespace } = {};

    constructor(private quiz: IQuiz, private _namespace: socketio.Namespace) {
        this.socketHandlers = new QuizSocketHandlers();
        QuizNamespace.namespaces[this.quiz.quizId] = this;
        CbRedis.instance.addQuiz(this.quiz);
    }

    public start(): void {
        this.namespace.on('connect', this.socketHandlers.register.bind(this.socketHandlers));
    }

    public get quizId(): string {
        return this.quiz.quizId;
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

    public async delete(): Promise<void> {
        try {
            await CbRedis.instance.client.lrem('quizzes', 1, JSON.stringify(this.quiz));
            delete QuizNamespace.namespaces[this.quiz.quizId];
        } catch (e) {
            throw new Error('Failed to delete quiz namespace');
        }
    }

    public static Get(quizId: string): QuizNamespace {
        return QuizNamespace.namespaces[quizId];
    }
}