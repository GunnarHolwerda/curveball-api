import * as uuid from 'uuid';

import { expectHttpError } from '../../resources/test-helpers';
import { QuizResources } from '../../resources/quiz-resources';
import { IQuizResponse } from '../../../src/models/entities/quiz';

describe('PUT /quizzes', () => {
    let quizResources: QuizResources;
    let quiz: IQuizResponse;

    beforeAll(async () => {
        quizResources = new QuizResources();
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
