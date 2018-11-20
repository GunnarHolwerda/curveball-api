import { Test } from '../resources/quiz-resources';

describe('GET /quizzes', () => {
    let quizResources: Test.QuizResources;

    beforeAll(async () => {
        quizResources = new Test.QuizResources();
    });

    it('should retrieve all quizzes', async () => {
        const response = await quizResources.allQuizzes();
        expect(response.quizzes.length).toBeGreaterThanOrEqual(0);
    });
});
