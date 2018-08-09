import * as uuid from 'uuid';

import { QuizResources } from '../resources/quiz-resources';
import { expectHttpError } from '../resources/test-helpers';

describe('GET quizzes', () => {
    let quizResources: QuizResources;
    let createdQuizId: string;

    beforeAll(async () => {
        quizResources = new QuizResources();
        createdQuizId = (await quizResources.createQuizRoom(uuid())).quizId;
    });

    it('should return an existing quiz room', async () => {
        const { quizId } = await quizResources.getQuizRoom(createdQuizId);
        expect(quizId).toBe(createdQuizId, 'Quiz room was not retrieved properly');
    });

    it('should return 404 if the quiz room does not exist', async () => {
        expectHttpError(quizResources.getQuizRoom(uuid()), 404);
    });
});