import * as uuid from 'uuid';

import { Test } from '../resources/quiz-resources';
import { Test as UserTest } from '../resources/user-resources';
import { expectHttpError } from '../resources/test-helpers';
import { IQuizResponse } from '../../../src/handlers/quiz/models/quiz';
import { mockQuestionsPayload } from '../mock-data';
import { IUserResponse } from '../../../src/handlers/quiz/models/user';
import { IQuestionResponse } from '../../../src/handlers/quiz/models/question';

describe('POST /quizzes/{quizId}/complete', () => {
    let quizResources: Test.QuizResources;
    let quiz: IQuizResponse;
    let questions: Array<IQuestionResponse>;
    let rightUser: IUserResponse;
    let wrongUser: IUserResponse;
    let wrongUserResponse: UserTest.UserTokenResponse;
    let rightUserResponse: UserTest.UserTokenResponse;
    let userResources: UserTest.UserResources;
    let startResponse: Test.QuizStartResponse;
    let wrongUserQt: string;

    beforeEach(async () => {
        quizResources = new Test.QuizResources();
        const response = await quizResources.createQuiz({
            title: uuid(),
            potAmount: 500,
        });
        quiz = response.quiz;
        const qPayload = {
            questions: [
                ...mockQuestionsPayload.questions,
                {
                    question: 'What is your favorite animal?',
                    questionNum: 3,
                    sport: 'mlb',
                    ticker: 'College World Series',
                    choices: [
                        { text: 'Cat', isAnswer: true },
                        { text: 'Dog', isAnswer: false },
                        { text: 'Alligator', isAnswer: false }
                    ]
                }
            ]
        };
        questions = (await quizResources.addQuestions(response.quiz.quizId, qPayload)).questions;
        startResponse = await quizResources.startQuiz(response.quiz.quizId);
        const { firstQuestion } = startResponse;
        userResources = new UserTest.UserResources();
        wrongUserResponse = await userResources.getNewUser();
        wrongUser = wrongUserResponse.user;
        rightUserResponse = await userResources.getNewUser();
        rightUser = rightUserResponse.user;

        const question = mockQuestionsPayload.questions.find(q => q.question === firstQuestion.question)!;
        const questionId = firstQuestion.questionId;
        const correctAnswer = question.choices.find(c => c.isAnswer!)!.text!;

        quizResources.token = wrongUserResponse.token;
        const wrongAnswer = questions
            .find(q => q.questionId === firstQuestion.questionId)!.choices
            .find(c => c.text !== correctAnswer)!.choiceId;
        const { token: wrongUserToken } = await quizResources.answerQuestion(quiz.quizId, questionId, wrongAnswer);
        wrongUserQt = wrongUserToken;

        quizResources.token = rightUserResponse.token;
        const correctAnswerChoice = questions
            .find(q => q.questionId === firstQuestion.questionId)!.choices
            .find(c => c.text === correctAnswer)!.choiceId;
        await quizResources.answerQuestion(quiz.quizId, questionId, correctAnswerChoice);
    });

    it('should return users who have not submitted an incorrect answer', async () => {
        const { users } = await quizResources.completeQuiz(quiz.quizId);
        expect(users.find(u => u.userId === rightUser.userId)).toBeDefined('Unable to find user who only submitted correct answers');
        expect(users.find(u => u.userId === wrongUser.userId)).toBeUndefined('Found user who answered incorrectly');
    });

    it('should return 404 if quiz does not exist', async () => {
        await expectHttpError(quizResources.completeQuiz(uuid()), 404);
    });

    it('should include users who used a life', async () => {
        await userResources.getNewUser(wrongUser.username);
        userResources.token = wrongUserResponse.token;
        await userResources.useLife(wrongUser.userId, wrongUserQt);
        const { users } = await quizResources.completeQuiz(quiz.quizId);
        expect(users.find(u => u.userId === rightUser.userId)).toBeDefined('Unable to find user who only submitted correct answers');
        expect(users.find(u => u.userId === wrongUser.userId)).toBeDefined('User who used life was excluded');
    });

    it('should return the amount won', async () => {
        const { amountWon, users } = await quizResources.completeQuiz(quiz.quizId);
        expect(amountWon).toBe((quiz.potAmount / users.length).toFixed(2), 'Amount won was not divided among winning users correctly');
    });

    it('should mark quiz as completed and inactive', async () => {
        await quizResources.completeQuiz(quiz.quizId);
        const { quiz: completedQuiz } = await quizResources.getQuiz(quiz.quizId);
        expect(completedQuiz.active).toBeFalsy('Quiz was not marked inactive after completion');
        expect(completedQuiz.completed).toBeTruthy('Quiz was not marked as complete after completion');
    });

    it('should update the users stats', async () => {
        await quizResources.completeQuiz(quiz.quizId);
        userResources.token = rightUserResponse.token;
        const userInfo = await userResources.getUser(rightUser.userId);
        expect(userInfo.stats.wins).toBe(1, 'Did not mark the user as a winner');
        expect(userInfo.stats.winnings).toBeGreaterThan(0, 'Winnings were not attributed to the user');
    });
});
