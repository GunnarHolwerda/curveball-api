import uuid = require('uuid');
import { QuizManagementResources } from '../../resources/quiz-management-resources';
import { AccountResources } from '../../resources/account-resources';


describe('GET /quizzes', () => {
    let quizResources: QuizManagementResources;

    beforeAll(async () => {
        const account = await (new AccountResources()).createAndLoginToAccount();
        quizResources = new QuizManagementResources(account.token);
    });

    it('should retrieve all quizzes', async () => {
        const response = await quizResources.allQuizzes();
        expect(response.quizzes.length).toBeGreaterThanOrEqual(0);
    });

    it('should exclude deleted quizzes', async () => {
        const { quiz } = await quizResources.createQuiz({ title: uuid(), potAmount: 100, auth: false });
        await quizResources.deleteQuiz(quiz.quizId);
        const allQuizzes = await quizResources.allQuizzes();
        expect(allQuizzes.quizzes.find(a => a.quizId === quiz.quizId)).toBeUndefined('All quizzes returned a deleted quiz');
    });
});
