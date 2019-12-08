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

    // As of now networks and accounts are 1 to 1, I don't think this will be the case in the future
    it('should only return quizzes owned by the current network', async () => {
        const firstAccountQuiz = await quizResources.createQuiz({ title: uuid(), potAmount: 100 });
        const otherAccount = await (new AccountResources()).createAndLoginToAccount();
        const otherQuizManagement = new QuizManagementResources(otherAccount.token);
        const { quizzes } = await otherQuizManagement.allQuizzes();
        expect(quizzes.find(q => q.quizId === firstAccountQuiz.quiz.quizId), 'Returned quizzes were not restricted by account')
            .toBeUndefined();
    });

    it('should exclude deleted quizzes', async () => {
        const { quiz } = await quizResources.createQuiz({ title: uuid(), potAmount: 100, auth: false });
        await quizResources.deleteQuiz(quiz.quizId);
        const allQuizzes = await quizResources.allQuizzes();
        expect(allQuizzes.quizzes.find(a => a.quizId === quiz.quizId), 'All quizzes returned a deleted quiz').toBeUndefined();
    });
});
