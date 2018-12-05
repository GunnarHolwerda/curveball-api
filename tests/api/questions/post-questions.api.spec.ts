import * as uuid from 'uuid';

import { mockQuestionsPayload } from '../mock-data';
import { IQuizResponse } from '../../../src/models/entities/quiz';
import { QuizResources } from '../../resources/quiz-resources';
import { expectHttpError } from '../../resources/test-helpers';

describe('POST /quizzes/{quizId}/questions', () => {
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

    it('should add questions to a quiz', async () => {
        const response = await quizResources.addQuestions(quiz.quizId, {
            questions: [
                {
                    question: 'What is your favorite color?',
                    questionNum: 1,
                    sport: 'nba',
                    ticker: 'woo',
                    choices: [
                        { text: 'Blue', isAnswer: true }
                    ]
                },
                {
                    question: 'What is your favorite animal?',
                    questionNum: 2,
                    sport: 'nba',
                    ticker: 'doo',
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
                // @ts-ignore
                {
                    question: 'What is your favorite color?',
                    questionNum: 1,
                    sport: 'nba',
                    choices: [
                        { text: 'Blue', isAnswer: true }
                    ]
                }
            ]
        }), 400);
    });
});