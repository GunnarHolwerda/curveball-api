import * as uuid from 'uuid';

import { mockQuestionsPayload } from '../mock-data';
import { Test } from '../resources/quiz-resources';
import { expectHttpError } from '../resources/test-helpers';
import { IQuizResponse } from '../../../src/handlers/quiz/models/quiz';

describe('POST /quizzes/{quizId}:start', () => {
    let quizResources: Test.QuizResources;
    let quizResponse: Test.QuizResponse;
    let quiz: IQuizResponse;
    let startedQuiz: Test.QuizStartResponse;

    beforeAll(async () => {
        quizResources = new Test.QuizResources();
        const quizTitle = uuid();
        quizResponse = await quizResources.createQuiz({
            title: quizTitle,
            potAmount: 500,
        });
        quiz = quizResponse.quiz;
        await quizResources.addQuestions(quiz.quizId, mockQuestionsPayload);
        startedQuiz = await quizResources.startQuiz(quiz.quizId);
    });

    it('should start a quiz, return first question and token', async () => {
        expect(startedQuiz.firstQuestion).toBeTruthy();
        expect(startedQuiz.quiz.quizId).toBe(quiz.quizId);
    });

    it('should return the question with the questionNum of 1', async () => {
        expect(startedQuiz.firstQuestion.questionNum).toBe(1, 'First question was not the first question');
    });

    it('should start the first question', async () => {
        expect(startedQuiz.firstQuestion.sent).toBeTruthy();
    });

    it('should return 200 if starting the same quiz that is already active', async () => {
        await quizResources.startQuiz(quiz.quizId);
    });

    it('should return 400 if starting quiz with no questions', async () => {
        const otherQuiz = await quizResources.createQuiz({
            title: uuid(),
            potAmount: 500,
        });
        await expectHttpError(quizResources.startQuiz(otherQuiz.quiz.quizId), 400, 'Cannot start quiz with zero questions');
    });

    it('should return 404 if quiz started does not exist', async () => {
        await quizResources.updateQuiz(quiz.quizId, { active: false });
        await expectHttpError(quizResources.startQuiz('wow'), 404);
    });
});
