import * as uuid from 'uuid';

import { mockManualQuestionsPayload } from '../mock-data';
import { QuizResources, QuizResponse } from '../../resources/quiz-resources';
import { IQuizResponse } from '../../../src/models/entities/quiz';
import { UserResources } from '../../resources/user-resources';
import { QuizManagementResources } from '../../resources/quiz-management-resources';
import { AccountResources } from '../../resources/account-resources';

describe('POST /quizzes/{quizId}/reset', () => {
    let quizResources: QuizResources;
    let quizResponse: QuizResponse;
    let quizManagement: QuizManagementResources;
    let quiz: IQuizResponse;

    beforeAll(async () => {
        const account = await (new AccountResources()).createAndLoginToAccount();
        quizManagement = new QuizManagementResources(account.token);
        quizResources = new QuizResources();
        quizResponse = await quizManagement.createQuiz({
            title: uuid(),
            potAmount: 500,
        });
        quiz = quizResponse.quiz;
        await quizManagement.addQuestions(quiz.quizId, mockManualQuestionsPayload);
        const startResponse = await quizManagement.startQuiz(quiz.quizId);
        const userResources = new UserResources();
        const userResponse = await userResources.getNewUser();
        quizResources.token = userResponse.token;
        const { firstQuestion } = startResponse;
        await quizResources.answerQuestion(
            quiz.quizId,
            firstQuestion.questionId,
            firstQuestion.choices[1].choiceId
        );
    });

    it('should mark the quiz as inactive, set all answers to disabled, and all questions should not be sent', async () => {
        const resetQuiz = await quizManagement.resetQuiz(quiz.quizId);
        expect(resetQuiz.quiz.active, 'Reset quiz was not set to inactive').toBeFalsy();
        for (const question of resetQuiz.quiz.questions) {
            expect(question.sent, 'All questions were not sent to unsent').toBeNull();
            const results = await quizManagement.getQuestionResults(quiz.quizId, question.questionId);
            expect(results.totalAnswers, 'All answers were not disabled').toBe(0);
        }
    });

    it('should allow a user to reenter a quiz where they entered a question wrong', async () => {
        await quizManagement.resetQuiz(quiz.quizId);
        const { firstQuestion } = await quizManagement.startQuiz(quiz.quizId);
        await quizResources.answerQuestion(
            quiz.quizId,
            firstQuestion.questionId,
            firstQuestion.choices[1].choiceId
        );
    });
});
