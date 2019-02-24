import * as uuid from 'uuid';

import { mockManualQuestionsPayload } from '../mock-data';
import { QuizResources } from '../../resources/quiz-resources';
import { IQuizResponse } from '../../../src/models/entities/quiz';
import { UserResources } from '../../resources/user-resources';
import { QuizManagementResources } from '../../resources/quiz-management-resources';
import { AccountResources } from '../../resources/account-resources';

describe('GET /quizzes/{quizId}/access', () => {
    let quizManagement: QuizManagementResources;
    let quizResources: QuizResources;
    let quiz: IQuizResponse;

    beforeAll(async () => {
        const account = await (new AccountResources()).createAndLoginToAccount();
        quizManagement = new QuizManagementResources(account.token);
        quizResources = new QuizResources();
        const userResources = new UserResources();
        const userResponse = await userResources.getNewUser();
        quizResources.token = userResponse.token;
    });

    describe('Quiz with Auth', () => {
        beforeEach(async () => {
            const response = await quizManagement.createQuiz({
                title: uuid(),
                potAmount: 500,
                auth: true
            });
            quiz = response.quiz;
            await quizManagement.addQuestions(quiz.quizId, mockManualQuestionsPayload);
        });

        it('should return a token for a quiz with authentication on that has not started', async () => {
            const access = await quizResources.getQuizAccess(quiz.quizId);
            expect(access.token).toBeTruthy('Token was not returned');
        });

        it('should return a token if a quiz with authentication has started, but first question has not expired', async () => {
            await quizManagement.startQuiz(quiz.quizId);
            const access = await quizResources.getQuizAccess(quiz.quizId);
            expect(access.token).toBeTruthy('Token was returned');
        });

        xit('should return a null token if a quiz with authentication has expired', async () => {
            const quizStart = await quizManagement.startQuiz(quiz.quizId);
            while (Date.parse(quizStart.firstQuestion.expired!) + 5000 > Date.now()) { }
            const access = await quizResources.getQuizAccess(quiz.quizId);
            expect(access.token).toBeNull('Token was returned');
        }, 70000);
    });

    describe('Quiz without auth', () => {
        beforeEach(async () => {
            const response = await quizManagement.createQuiz({
                title: uuid(),
                potAmount: 500,
                auth: false
            });
            quiz = response.quiz;
            await quizManagement.addQuestions(quiz.quizId, mockManualQuestionsPayload);
        });

        it('should return a token for a quiz with no authentication', async () => {
            const access = await quizResources.getQuizAccess(quiz.quizId);
            expect(access.token).toBeTruthy('Token was not returned');
        });

        it('should return a token for a quiz without authentication even if a question is sent', async () => {
            await quizManagement.startQuiz(quiz.quizId);
            const access = await quizResources.getQuizAccess(quiz.quizId);
            expect(access.token).toBeTruthy('Token was not returned');
        });
    });
});
