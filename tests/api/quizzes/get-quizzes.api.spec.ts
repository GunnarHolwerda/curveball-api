import { QuizResources } from '../resources/quiz-resources';


describe('GET /quizzes', () => {
    let quizResources: QuizResources;

    beforeAll(async () => {
        quizResources = new QuizResources();
    });

    it('should retrieve all quizzes', async () => {
        const response = await quizResources.allQuizzes();
        expect(response.quizzes.length).toBeGreaterThanOrEqual(0);
    });
});
