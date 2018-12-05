import * as uuid from 'uuid';

import { expectHttpError } from '../../resources/test-helpers';
import { QuizResources } from '../../resources/quiz-resources';

describe('POST /quizzes', () => {
    let quizResources: QuizResources;

    beforeAll(async () => {
        quizResources = new QuizResources();
    });

    it('should create a quiz', async () => {
        const quizTitle = uuid();
        const response = await quizResources.createQuiz({
            title: quizTitle,
            potAmount: 500,
        });
        expect(response.quiz.active).toBeFalsy('Active was not defaulted to false');
        expect(response.quiz.title).toBe(quizTitle);
        expect(response.quiz.auth).toBeTruthy('Auth did not default to true');
    });

    it('should set auth correctly', async () => {
        const { quiz } = await quizResources.createQuiz({
            title: uuid(),
            potAmount: 300,
            auth: false
        });
        expect(quiz.auth).toBeFalsy('Auth parameter was not recognized');
    });

    it('should return 400 if not all required parameters provided', async () => {
        // @ts-ignore
        await expectHttpError(quizResources.createQuiz({ title: uuid() }), 400);
    });
});
