import * as socketio from 'socket.io';

import { Room } from '../../interfaces/room';
import { QuizSocketHandlers } from '../socket-handlers/quiz-socket-handlers';
import { QuizCache } from '../quiz-cache';
import { IQuizResponse } from '../entities/quiz';
import { QuizEvents } from '../../types/events';

export class QuizNamespace extends Room {
    private audienceCountInterval: NodeJS.Timeout | undefined;

    constructor(_namespace: socketio.Namespace, private quiz: IQuizResponse) {
        super(_namespace, new QuizSocketHandlers(quiz));
    }

    public async start(): Promise<void> {
        try {
            await QuizCache.addQuiz(this.quiz);
        } catch (e) {
            console.error(`Failed to add ${this.quizId} to quizCache`, e);
        }
        await super.start();
        this.audienceCountInterval = this.initializeAudienceCountInterval();
    }

    public get quizId(): string {
        return this.quiz.quizId;
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
            if (this.audienceCountInterval) {
                clearInterval(this.audienceCountInterval);
            }
        } catch (e) {
            throw new Error('Failed to delete quiz namespace');
        }
    }

    private initializeAudienceCountInterval(): NodeJS.Timeout {
        return setInterval(async () => {
            this._namespace.emit(QuizEvents.audienceCount, await this.numConnected);
        }, 10000);
    }
}