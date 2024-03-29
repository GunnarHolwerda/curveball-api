import * as uuid from 'uuid';

import { expectHttpError } from '../../resources/test-helpers';
import { IQuizResponse } from '../../../src/models/entities/quiz';
import { QuizManagementResources } from '../../resources/quiz-management-resources';
import { AccountResources } from '../../resources/account-resources';

describe('GET /quizzes/{quizId}', () => {
    let quizResources: QuizManagementResources;
    let quiz: IQuizResponse;

    beforeAll(async () => {
        const account = await (new AccountResources()).createAndLoginToAccount();
        quizResources = new QuizManagementResources(account.token);
        const response = await quizResources.createQuiz({
            title: uuid(),
            potAmount: 500,
        });
        quiz = response.quiz;
    });

    it('should retrieve a quiz', async () => {
        const response = await quizResources.getQuiz(quiz.quizId);
        expect(response.quiz.title).toBe(quiz.title);
        expect(response.quiz.questions.length, 'Quiz with no questions returned questions').toBe(0);
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
                        topic: 1,
                        typeId: 1,
                        choices: [
                            { text: 'Blue', isAnswer: true }
                        ]
                    },
                    {
                        question: 'What is your favorite animal?',
                        questionNum: 2,
                        ticker: 'wow',
                        topic: 1,
                        typeId: 1,
                        choices: [
                            { text: 'Cat', isAnswer: true },
                        ]
                    }
                ]
            });
        });

        it('should return questions if the quiz has questions', async () => {
            const response = await quizResources.getQuiz(quiz.quizId);
            expect(response.quiz.questions.length, 'Quiz did not return with the number of questions added').toBe(2);
        });

        it('should return questions in order of questionNum', async () => {
            const response = await quizResources.getQuiz(quiz.quizId);
            const responseOrder = response.quiz.questions.map(q => q.questionNum);
            expect(responseOrder, 'Questions were not sorted properly').toEqual([1, 2]);
        });
    });
});
