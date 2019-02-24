import { ApiResources } from './api-resources';
import { UserTokenResponse } from './user-resources';

const jasmineSettings: { config: { [key: string]: string } } = require('../jasmine-api.json');

export class TestToolResources extends ApiResources {

    get baseUrl(): string {
        return jasmineSettings.config.testApiUrl + '/test';
    }

    async generateRandomAnswers(questionId: string, options: { numAnswers: number }): Promise<{ [choiceId: string]: number }> {
        const params = { ...options, questionId };
        return this.post<{ [choiceId: string]: number }>('/answers:generate', params);
    }

    public async forceLogin(phone: string): Promise<UserTokenResponse> {
        return this.post<UserTokenResponse>(`/users_force_login`, { phone }, this.config);
    }
}