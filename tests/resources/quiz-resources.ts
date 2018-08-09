import { ApiResources } from './api-resources';

const jasmineSettings: { config: { [key: string]: any } } = require('../jasmine-api.json');

export class QuizResources extends ApiResources {
    constructor() {
        super(jasmineSettings.config.testInternalToken);
    }

    createQuizRoom(quizId: string, title?: string, potAmount?: number): Promise<{ quizId: string }> {
        return this.post<{ quizId: string }>(`/quizzes`, { quiz: { quizId, title, potAmount } });
    }

    getQuizRoom(quizId: string): Promise<{ quizId: string }> {
        return this.get<{ quizId: string }>(`/quizzes/${quizId}`);
    }
}