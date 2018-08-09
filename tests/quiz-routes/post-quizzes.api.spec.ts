import * as uuid from 'uuid';

import { QuizResources } from '../resources/quiz-resources';
import { expectHttpError } from '../resources/test-helpers';

describe('POST Quizzes', () => {
    let quizResources: QuizResources;

    beforeEach(() => {
        quizResources = new QuizResources();
    });

    it('should create a quiz room for a quiz', async () => {
        const originalQuizId = uuid();
        const { quizId: returnedQuizId } = await quizResources.createQuizRoom(originalQuizId);
        expect(returnedQuizId).toBe(originalQuizId, 'Quiz id was not returned properly');

        const { quizId: storedQuizId } = await quizResources.getQuizRoom(originalQuizId);
        expect(storedQuizId).toBe(originalQuizId, 'Quiz id for quiz room does not match');
    });

    it('should return 400 if quizId is not specified', async () => {
        // @ts-ignore:one-line
        await expectHttpError(quizResources.createQuizRoom(undefined), 400);
    });

    xit('should emit a start event on quiz room creation', async () => {
        fail('not implemented');
    });
});