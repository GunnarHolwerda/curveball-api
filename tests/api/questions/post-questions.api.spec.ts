import * as uuid from 'uuid';

import { Test } from '../resources/quiz-resources';
import { expectHttpError } from '../resources/test-helpers';
import { mockQuestionsPayload } from '../mock-data';
import { IQuizResponse } from '../../../src/handlers/quiz/models/quiz';

describe('POST /quizzes/{quizId}/questions', () => {
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

    it('should add questions to a quiz', async () => {
        const response = await quizResources.addQuestions(quiz.quizId, {
            questions: [
                {
                    question: 'What is your favorite color?',
                    questionNum: 1,
                    sport: 'test',
                    ticker: 'test',
                    choices: [
                        { text: 'Blue', isAnswer: true }
                    ]
                },
                {
                    question: 'What is your favorite animal?',
                    questionNum: 2,
                    sport: 'test',
                    ticker: 'test',
                    choices: [
                        { text: 'Cat', isAnswer: true },
                    ]
                }
            ]
        });

        expect(response.questions[0].questionId).toBeTruthy();
    });

    it('should return 404 if quiz does not exist', async () => {
        await expectHttpError(quizResources.addQuestions(uuid(), mockQuestionsPayload), 404);
    });

    it('should return 400 if ticker is excluded', async () => {
        // @ts-ignore
        await expectHttpError(quizResources.addQuestions(quiz.quizId, {
            questions: [
                {
                    question: 'What is your favorite color?',
                    questionNum: 1,
                    sport: 'test',
                    choices: [
                        { text: 'Blue', isAnswer: true }
                    ]
                }
            ]
        }), 400);
    });
});