import * as uuid from 'uuid';

import { mockManualQuestionsPayload } from '../mock-data';
import { QuizResources, QuizResponse } from '../../resources/quiz-resources';
import { IQuizResponse } from '../../../src/models/entities/quiz';
import { UserResources } from '../../resources/user-resources';

describe('POST /quizzes/{quizId}/reset', () => {
    let quizResources: QuizResources;
    let quizResponse: QuizResponse;
    let quiz: IQuizResponse;

    beforeAll(async () => {
        quizResources = new QuizResources();
        quizResponse = await quizResources.createQuiz({
            title: uuid(),
            potAmount: 500,
        });
        quiz = quizResponse.quiz;
        await quizResources.addQuestions(quiz.quizId, mockManualQuestionsPayload);
        const startResponse = await quizResources.startQuiz(quiz.quizId);
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
        const resetQuiz = await quizResources.resetQuiz(quiz.quizId);
        expect(resetQuiz.quiz.active, 'Reset quiz was not set to inactive').toBeFalsy();
        for (const question of resetQuiz.quiz.questions) {
            expect(question.sent, 'All questions were not sent to unsent').toBeNull();
            const results = await quizResources.getQuestionResults(quiz.quizId, question.questionId);
            expect(results.totalAnswers, 'All answers were not disabled').toBe(0);
        }
    });

    it('should allow a user to reenter a quiz where they entered a question wrong', async () => {
        await quizResources.resetQuiz(quiz.quizId);
        const { firstQuestion } = await quizResources.startQuiz(quiz.quizId);
        await quizResources.answerQuestion(
            quiz.quizId,
            firstQuestion.questionId,
            firstQuestion.choices[1].choiceId
        );
    });
});
