import { ApiResources } from './test-resources';

const jasmineSettings: { config: { [key: string]: string } } = require('../jasmine-api.json');

export class TestToolResources extends ApiResources {

    get baseUrl(): string {
        return jasmineSettings.config.testApiUrl + '/test';
    }

    async generateRandomAnswers(questionId: string, options: { numAnswers: number }): Promise<{ [choiceId: string]: number }> {
        const params = { ...options, questionId };
        return this.post<{ [choiceId: string]: number }>('/answers:generate', params);
    }
}