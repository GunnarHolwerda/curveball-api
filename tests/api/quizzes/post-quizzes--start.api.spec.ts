import * as uuid from 'uuid';

import { mockManualQuestionsPayload } from '../mock-data';
import { expectHttpError } from '../../resources/test-helpers';
import { QuizResponse, QuizStartResponse } from '../../resources/quiz-resources';
import { IQuizResponse } from '../../../src/models/entities/quiz';
import { QuizManagementResources } from '../../resources/quiz-management-resources';
import { AccountResources } from '../../resources/account-resources';

describe('POST /quizzes/{quizId}:start', () => {
    let quizManagement: QuizManagementResources;
    let quizResponse: QuizResponse;
    let quiz: IQuizResponse;
    let startedQuiz: QuizStartResponse;

    beforeAll(async () => {
        const account = await (new AccountResources()).createAndLoginToAccount();
        quizManagement = new QuizManagementResources(account.token);
        const quizTitle = uuid();
        quizResponse = await quizManagement.createQuiz({
            title: quizTitle,
            potAmount: 500,
        });
        quiz = quizResponse.quiz;
        await quizManagement.addQuestions(quiz.quizId, mockManualQuestionsPayload);
        startedQuiz = await quizManagement.startQuiz(quiz.quizId);
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
        await quizManagement.startQuiz(quiz.quizId);
    });

    it('should return 400 if starting quiz with no questions', async () => {
        const otherQuiz = await quizManagement.createQuiz({
            title: uuid(),
            potAmount: 500,
        });
        await expectHttpError(quizManagement.startQuiz(otherQuiz.quiz.quizId), 400, 'Cannot start quiz with zero questions');
    });

    it('should return 404 if quiz started does not exist', async () => {
        await quizManagement.updateQuiz(quiz.quizId, { active: false });
        await expectHttpError(quizManagement.startQuiz(uuid()), 404);
    });
});
