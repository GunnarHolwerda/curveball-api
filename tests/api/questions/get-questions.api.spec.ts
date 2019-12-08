import * as uuid from 'uuid';

import { IQuizResponse } from '../../../src/models/entities/quiz';
import { expectHttpError } from '../../resources/test-helpers';
import { QuizManagementResources } from '../../resources/quiz-management-resources';
import { AccountResources } from '../../resources/account-resources';

describe('GET /quizzes/{quizId}/questions', () => {
    let quizManagement: QuizManagementResources;
    let quiz: IQuizResponse;

    beforeAll(async () => {
        const account = await (new AccountResources()).createAndLoginToAccount();
        quizManagement = new QuizManagementResources(account.token);
        const response = await quizManagement.createQuiz({
            title: uuid(),
            potAmount: 500,
        });
        quiz = response.quiz;
        await quizManagement.addQuestions(quiz.quizId, {
            questions: [
                {
                    question: 'What is your favorite color?',
                    questionNum: 1,
                    ticker: 'sport',
                    topic: 1,
                    typeId: 1,
                    choices: [
                        { text: 'Blue', isAnswer: true }
                    ]
                },
                {
                    question: 'What is your favorite animal?',
                    questionNum: 2,
                    ticker: 'sport',
                    topic: 1,
                    typeId: 1,
                    choices: [
                        { text: 'Cat', isAnswer: true },
                    ]
                }
            ]
        });
    });

    it('should retrieve only questions for quiz', async () => {
        const response = await quizManagement.getQuestions(quiz.quizId);
        // @ts-ignore
        expect(response.quiz, 'Quiz was returned from the questions only endpoint').toBeUndefined();
        expect(response.questions.length, 'Questions did not return expected number of questions').toBe(2);
    });

    it('should return 404 if no quiz exists', async () => {
        await expectHttpError(quizManagement.getQuestions(uuid()), 404);
    });

    it('should return questions in order of questionNum', async () => {
        const response = await quizManagement.getQuestions(quiz.quizId);
        const questionOrder = response.questions.map(q => q.questionNum);
        expect(questionOrder, 'Questions were not returned in order').toEqual([1, 2]);
    });
});
