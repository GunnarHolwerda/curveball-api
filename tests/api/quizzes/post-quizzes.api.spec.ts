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
        expect(response.quiz.active, 'Active was not defaulted to false').toBeFalsy();
        expect(response.quiz.title).toBe(quizTitle);
        expect(response.quiz.auth, 'Auth did not default to true').toBeTruthy();
    });

    it('should set auth correctly', async () => {
        const { quiz } = await quizResources.createQuiz({
            title: uuid(),
            potAmount: 300,
            auth: false
        });
        expect(quiz.auth, 'Auth parameter was not recognized').toBeFalsy();
    });

    it('should return 400 if not all required parameters provided', async () => {
        // @ts-ignore
        await expectHttpError(quizResources.createQuiz({ title: uuid() }), 400);
    });
});
