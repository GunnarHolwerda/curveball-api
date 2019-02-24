import * as uuid from 'uuid';
import { expectHttpError } from '../../resources/test-helpers';
import { IQuizResponse } from '../../../src/models/entities/quiz';
import { QuizManagementResources } from '../../resources/quiz-management-resources';
import { AccountResources } from '../../resources/account-resources';

describe('DELETE /quizes/{quizId}', () => {
    let quiz: IQuizResponse;
    let quizResources: QuizManagementResources;

    beforeAll(async () => {
        const account = await (new AccountResources()).createAndLoginToAccount();
        quizResources = new QuizManagementResources(account.token);
    });

    beforeEach(async () => {
        quiz = (await quizResources.createQuiz({
            title: uuid(),
            potAmount: 100,
            auth: false
        })).quiz;
    });

    it('should delete delete the quiz', async () => {
        await quizResources.deleteQuiz(quiz.quizId);
        const deletedQuiz = await quizResources.getQuiz(quiz.quizId);
        expect(deletedQuiz.quiz.deleted).toBeTruthy('Quiz was not marked as deleted');
    });

    it('should return 404 if quiz does not exist', async () => {
        await expectHttpError(quizResources.deleteQuiz(uuid()), 404);
    });
});