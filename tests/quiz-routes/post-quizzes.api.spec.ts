import * as uuid from 'uuid';

import { QuizResources } from '../resources/quiz-resources';

describe('POST Quizzes', () => {
    let quizResources: QuizResources;

    beforeEach(() => {
        quizResources = new QuizResources();
    });

    it('should create a quiz room for a quiz', async () => {
        const originalQuizId = uuid();
        const { quizId } = await quizResources.createQuizRoom(originalQuizId);
        expect(quizId).toBe(originalQuizId, 'Quiz id was not returned properly');

    });
});