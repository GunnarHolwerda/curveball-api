import * as uuid from 'uuid';

import { expectHttpError } from '../../resources/test-helpers';
import { QuizManagementResources } from '../../resources/quiz-management-resources';
import { AccountResources } from '../../resources/account-resources';

describe('POST /quizzes', () => {
    let quizManagement: QuizManagementResources;

    beforeAll(async () => {
        const account = await (new AccountResources()).createAndLoginToAccount();
        quizManagement = new QuizManagementResources(account.token);
    });

    it('should create a quiz', async () => {
        const quizTitle = uuid();
        const response = await quizManagement.createQuiz({
            title: quizTitle,
            potAmount: 500,
        });
        expect(response.quiz.active).toBeFalsy('Active was not defaulted to false');
        expect(response.quiz.title).toBe(quizTitle);
        expect(response.quiz.auth).toBeTruthy('Auth did not default to true');
    });

    it('should set auth correctly', async () => {
        const { quiz } = await quizManagement.createQuiz({
            title: uuid(),
            potAmount: 300,
            auth: false
        });
        expect(quiz.auth).toBeFalsy('Auth parameter was not recognized');
    });

    it('should return 400 if not all required parameters provided', async () => {
        // @ts-ignore
        await expectHttpError(quizManagement.createQuiz({ title: uuid() }), 400);
    });
});
