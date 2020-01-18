import * as uuid from 'uuid';

import { mockManualQuestionsPayload } from '../mock-data';
import { IQuizResponse } from '../../../src/models/entities/quiz';
import { expectHttpError } from '../../resources/test-helpers';
import { QuizManagementResources } from '../../resources/quiz-management-resources';
import { AccountResources } from '../../resources/account-resources';

describe('POST /quizzes/{quizId}/questions', () => {
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

    it('should add questions to a quiz', async () => {
        const response = await quizResources.addQuestions(quiz.quizId, {
            questions: [
                {
                    question: 'What is your favorite color?',
                    questionNum: 1,
                    topic: 1,
                    typeId: 1,
                    ticker: 'woo',
                    choices: [
                        { text: 'Blue', isAnswer: true }
                    ]
                },
                {
                    question: 'What is your favorite animal?',
                    questionNum: 2,
                    topic: 1,
                    typeId: 1,
                    ticker: 'doo',
                    choices: [
                        { text: 'Cat', isAnswer: true, score: 3 },
                    ]
                }
            ]
        });

        expect(response.questions[0].questionId).toBeTruthy();
    });

    it('should return 404 if quiz does not exist', async () => {
        await expectHttpError(quizResources.addQuestions(uuid(), mockManualQuestionsPayload), 404);
    });

    it('should return 400 if ticker is excluded', async () => {
        // @ts-ignore
        await expectHttpError(quizResources.addQuestions(quiz.quizId, {
            questions: [
                // @ts-ignore
                {
                    question: 'What is your favorite color?',
                    questionNum: 1,
                    topic: 1,
                    typeId: 1,
                    choices: [
                        { text: 'Blue', isAnswer: true }
                    ]
                }
            ]
        }), 400);
    });
});