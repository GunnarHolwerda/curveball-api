import * as uuid from 'uuid';

import { expectHttpError } from '../resources/test-helpers';
import { QuizResources } from '../resources/quiz-resources';
import { IQuizResponse } from '../../../src/models/entities/quiz';

describe('GET /quizzes/{quizId}', () => {
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

    it('should retrieve a quiz', async () => {
        const response = await quizResources.getQuiz(quiz.quizId);
        expect(response.quiz.title).toBe(quiz.title);
        expect(response.quiz.questions.length).toBe(0, 'Quiz with no questions returned questions');
    });

    it('should return 404 if no quiz exists', async () => {
        await expectHttpError(quizResources.getQuiz(uuid()), 404);
    });

    describe('Quiz with questions', () => {
        beforeAll(async () => {
            await quizResources.addQuestions(quiz.quizId, {
                questions: [
                    {
                        question: 'What is your favorite color?',
                        questionNum: 1,
                        ticker: 'wow',
                        sport: 'wow',
                        choices: [
                            { text: 'Blue', isAnswer: true }
                        ]
                    },
                    {
                        question: 'What is your favorite animal?',
                        questionNum: 2,
                        ticker: 'wow',
                        sport: 'wow',
                        choices: [
                            { text: 'Cat', isAnswer: true },
                        ]
                    }
                ]
            });
        });

        it('should return questions if the quiz has questions', async () => {
            const response = await quizResources.getQuiz(quiz.quizId);
            expect(response.quiz.questions.length).toBe(2, 'Quiz did not return with the number of questions added');
        });

        it('should return questions in order of questionNum', async () => {
            const response = await quizResources.getQuiz(quiz.quizId);
            const responseOrder = response.quiz.questions.map(q => q.questionNum);
            expect(responseOrder).toEqual([1, 2], 'Questions were not sorted properly');
        });
    });
});
