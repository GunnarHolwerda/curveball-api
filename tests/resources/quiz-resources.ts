import { ApiResources } from './api-resources';

const jasmineSettings = require('../jasmine-api.json');

export class QuizResources extends ApiResources {
    constructor() {
        super(jasmineSettings.testInternalToken);
    }

    createQuizRoom(quizId: string, title?: string, potAmount?: number): Promise<{ quizId: string }> {
        return this.post<{ quizId: string }>(`/quizzes`, { quizId, title, potAmount });
    }
}