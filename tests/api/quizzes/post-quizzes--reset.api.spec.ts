import * as uuid from 'uuid';

import { mockQuestionsPayload } from '../mock-data';
import { Test } from '../resources/quiz-resources';
import { Test as UserTest } from '../resources/user-resources';
import { IQuizResponse } from '../../../src/handlers/quiz/models/quiz';

describe('POST /quizzes/{quizId}/reset', () => {
    let quizResources: Test.QuizResources;
    let quizResponse: Test.QuizResponse;
    let quiz: IQuizResponse;

    beforeAll(async () => {
        quizResources = new Test.QuizResources();
        quizResponse = await quizResources.createQuiz({
            title: uuid(),
            potAmount: 500,
        });
        quiz = quizResponse.quiz;
        await quizResources.addQuestions(quiz.quizId, mockQuestionsPayload);
        const startResponse = await quizResources.startQuiz(quiz.quizId);
        const userResources = new UserTest.UserResources();
        const userResponse = await userResources.getNewUser();
        quizResources.token = userResponse.token;
        const { firstQuestion } = startResponse;
        await quizResources.answerQuestion(
            quiz.quizId,
            firstQuestion.questionId,
            firstQuestion.choices[1].text
        );
    });

    it('should mark the quiz as inactive, set all answers to disabled, and all questions should not be sent', async () => {
        const resetQuiz = await quizResources.resetQuiz(quiz.quizId);
        expect(resetQuiz.quiz.active).toBeFalsy('Reset quiz was not set to inactive');
        for (const question of resetQuiz.quiz.questions) {
            expect(question.sent).toBeNull('All questions were not sent to unsent');
            const results = await quizResources.getQuestionResults(quiz.quizId, question.questionId);
            expect(results.totalAnswers).toBe(0, 'All answers were not disabled');
        }
    });

    it('should allow a user to reenter a quiz where they entered a question wrong', async () => {
        await quizResources.resetQuiz(quiz.quizId);
        const { firstQuestion } = await quizResources.startQuiz(quiz.quizId);
        await quizResources.answerQuestion(
            quiz.quizId,
            firstQuestion.questionId,
            firstQuestion.choices[1].text
        );
    });
});
