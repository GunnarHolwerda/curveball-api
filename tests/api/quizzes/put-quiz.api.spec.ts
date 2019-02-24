import * as uuid from 'uuid';
import { expectHttpError } from '../../resources/test-helpers';
import { IQuizResponse } from '../../../src/models/entities/quiz';
import { QuizManagementResources } from '../../resources/quiz-management-resources';
import { AccountResources } from '../../resources/account-resources';

describe('PUT /quizzes', () => {
    let quizManagement: QuizManagementResources;
    let quiz: IQuizResponse;

    beforeAll(async () => {
        const account = await (new AccountResources()).createAndLoginToAccount();
        quizManagement = new QuizManagementResources(account.token);
        const response = await quizManagement.createQuiz({
            title: uuid(),
            potAmount: 500,
        });
        quiz = response.quiz;
    });

    it('should update a quiz', async () => {
        const quizTitle = uuid();
        const response = await quizManagement.updateQuiz(quiz.quizId, {
            title: quizTitle,
            active: true,
        });
        expect(response.quiz.active).toBeTruthy('Active was not updated properly');
        expect(response.quiz.title).toBe(quizTitle, 'Title was not updated');
    });

    it('should return 400 if no parameters provided', async () => {
        // @ts-ignore
        await expectHttpError(quizManagement.updateQuiz(quiz.quizId, {}), 400);
    });
});
