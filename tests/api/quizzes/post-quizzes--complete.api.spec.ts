import * as uuid from 'uuid';

import { mockManualQuestionsPayload } from '../mock-data';
import { IQuizResponse } from '../../../src/models/entities/quiz';
import { IQuestionResponse } from '../../../src/models/entities/question';
import { IUserResponse } from '../../../src/models/entities/user';
import { QuizResources, QuizStartResponse } from '../../resources/quiz-resources';
import { UserTokenResponse, UserResources } from '../../resources/user-resources';
import { expectHttpError } from '../../resources/test-helpers';
import { QuizManagementResources } from '../../resources/quiz-management-resources';
import { AccountResources } from '../../resources/account-resources';

describe('POST /quizzes/{quizId}/complete', () => {
    let quizResources: QuizResources;
    let quizManagement: QuizManagementResources;
    let quiz: IQuizResponse;
    let questions: Array<IQuestionResponse>;
    let rightUser: IUserResponse;
    // let wrongUser: IUserResponse;
    let wrongUserResponse: UserTokenResponse;
    let rightUserResponse: UserTokenResponse;
    let userResources: UserResources;
    let startResponse: QuizStartResponse;
    // let wrongUserQt: string;

    beforeAll(async () => {
        const account = await (new AccountResources()).createAndLoginToAccount();
        quizManagement = new QuizManagementResources(account.token);
    });

    beforeEach(async () => {
        quizResources = new QuizResources();
        const response = await quizManagement.createQuiz({
            title: uuid(),
            potAmount: 500,
        });
        quiz = response.quiz;
        const qPayload = {
            questions: [
                ...mockManualQuestionsPayload.questions,
                {
                    question: 'What is your favorite animal?',
                    questionNum: 3,
                    typeId: 1,
                    topic: 1,
                    ticker: 'College World Series',
                    choices: [
                        { text: 'Cat', isAnswer: true },
                        { text: 'Dog', isAnswer: false },
                        { text: 'Alligator', isAnswer: false }
                    ]
                }
            ]
        };
        questions = (await quizManagement.addQuestions(response.quiz.quizId, qPayload)).questions;
        startResponse = await quizManagement.startQuiz(response.quiz.quizId);
        const { firstQuestion } = startResponse;
        userResources = new UserResources();
        wrongUserResponse = await userResources.getNewUser();
        // wrongUser = wrongUserResponse.user;
        rightUserResponse = await userResources.getNewUser();
        rightUser = rightUserResponse.user;

        const question = mockManualQuestionsPayload.questions.find(q => q.question === firstQuestion.question)!;
        const questionId = firstQuestion.questionId;
        const correctAnswer = question.choices.find(c => c.isAnswer!)!.text!;

        quizResources.token = wrongUserResponse.token;
        // const wrongAnswer = questions
        //     .find(q => q.questionId === firstQuestion.questionId)!.choices
        //     .find(c => c.text !== correctAnswer)!.choiceId;
        // const { token: wrongUserToken } = await quizResources.answerQuestion(quiz.quizId, questionId, wrongAnswer);
        // wrongUserQt = wrongUserToken;

        quizResources.token = rightUserResponse.token;
        const correctAnswerChoice = questions
            .find(q => q.questionId === firstQuestion.questionId)!.choices
            .find(c => c.text === correctAnswer)!.choiceId;
        await quizResources.answerQuestion(quiz.quizId, questionId, correctAnswerChoice);
    });

    it('should return 404 if quiz does not exist', async () => {
        await expectHttpError(quizManagement.completeQuiz(uuid()), 404);
    });

    // TODO: Resurrect these tests once we have endpoint to get data about completed quiz
    // it('should return users who have not submitted an incorrect answer', async () => {
    //     const { users } = await quizResources.completeQuiz(quiz.quizId);
    //     expect(users.find(u => u.userId === rightUser.userId)).toBeDefined('Unable to find user who only submitted correct answers');
    //     expect(users.find(u => u.userId === wrongUser.userId)).toBeUndefined('Found user who answered incorrectly');
    // });

    // it('should include users who used a life', async () => {
    //     await userResources.getNewUser(wrongUser.username);
    //     userResources.token = wrongUserResponse.token;
    //     await userResources.useLife(wrongUser.userId, wrongUserQt);
    //     const { users } = await quizResources.completeQuiz(quiz.quizId);
    //     expect(users.find(u => u.userId === rightUser.userId)).toBeDefined('Unable to find user who only submitted correct answers');
    //     expect(users.find(u => u.userId === wrongUser.userId)).toBeDefined('User who used life was excluded');
    // });

    // it('should return the amount won', async () => {
    //     const { amountWon, users } = await quizResources.completeQuiz(quiz.quizId);
    //     expect(amountWon).toBe((quiz.potAmount / users.length).toFixed(2), 'Amount won was not divided among winning users correctly');
    // });

    it('should mark quiz as completed and inactive', async () => {
        await quizManagement.completeQuiz(quiz.quizId);
        const { quiz: completedQuiz } = await quizManagement.getQuiz(quiz.quizId);
        expect(completedQuiz.active).toBeFalsy('Quiz was not marked inactive after completion');
        expect(completedQuiz.completedDate).toBeTruthy('Quiz was not marked as complete after completion');
    });

    it('should update the users stats', async () => {
        await quizManagement.completeQuiz(quiz.quizId);
        userResources.token = rightUserResponse.token;
        const userInfo = await userResources.getUser(rightUser.userId);
        expect(userInfo.stats.wins).toBe(1, 'Did not mark the user as a winner');
        expect(userInfo.stats.winnings).toBeGreaterThan(0, 'Winnings were not attributed to the user');
    });
});
