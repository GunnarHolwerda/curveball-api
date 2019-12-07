import { ApiResources } from './test-resources';
import { GetEnvConfigValue } from './env-config';

export class TestToolResources extends ApiResources {

    get baseUrl(): string {
        return GetEnvConfigValue('testApiUrl') + '/test';
    }

    async generateRandomAnswers(questionId: string, options: { numAnswers: number }): Promise<{ [choiceId: string]: number }> {
        const params = { ...options, questionId };
        return this.post<{ [choiceId: string]: number }>('/answers:generate', params);
    }
}