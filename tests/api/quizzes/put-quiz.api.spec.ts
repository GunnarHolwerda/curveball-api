import * as uuid from 'uuid';

import { Test } from '../resources/quiz-resources';
import { expectHttpError } from '../resources/test-helpers';
import { IQuizResponse } from '../../../src/handlers/quiz/models/quiz';

describe('PUT /quizzes', () => {
    let quizResources: Test.QuizResources;
    let quiz: IQuizResponse;

    beforeAll(async () => {
        quizResources = new Test.QuizResources();
        const response = await quizResources.createQuiz({
            title: uuid(),
            potAmount: 500,
        });
        quiz = response.quiz;
    });

    it('should update a quiz', async () => {
        const quizTitle = uuid();
        const response = await quizResources.updateQuiz(quiz.quizId, {
            title: quizTitle,
            active: true,
        });
        expect(response.quiz.active).toBeTruthy('Active was not updated properly');
        expect(response.quiz.title).toBe(quizTitle, 'Title was not updated');
    });

    it('should return 400 if no parameters provided', async () => {
        // @ts-ignore
        await expectHttpError(quizResources.updateQuiz(quiz.quizId, {}), 400);
    });
});
