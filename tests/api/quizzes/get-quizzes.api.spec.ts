import { QuizResources } from '../../resources/quiz-resources';
import uuid = require('uuid');


describe('GET /quizzes', () => {
    let quizResources: QuizResources;

    beforeAll(async () => {
        quizResources = new QuizResources();
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
