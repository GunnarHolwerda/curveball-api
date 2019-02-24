import * as uuid from 'uuid';

import { mockManualQuestionsPayload } from '../mock-data';
import { QuizResources, QuizStartResponse } from '../../resources/quiz-resources';
import { IQuizResponse } from '../../../src/models/entities/quiz';
import { IQuestionResponse } from '../../../src/models/entities/question';
import { IUserResponse } from '../../../src/models/entities/user';
import { UserTokenResponse, UserResources } from '../../resources/user-resources';
import { expectHttpError } from '../../resources/test-helpers';
import { QuizManagementResources } from '../../resources/quiz-management-resources';
import { AccountResources } from '../../resources/account-resources';

describe('GET /quizzes/{quizId}/users', () => {
    let quizResources: QuizResources;
    let quizManagement: QuizManagementResources;
    let quiz: IQuizResponse;
    let questions: Array<IQuestionResponse>;
    let rightUser: IUserResponse;
    let wrongUser: IUserResponse;
    let wrongUserResponse: UserTokenResponse;
    let userResources: UserResources;
    let startResponse: QuizStartResponse;
    let wrongUserQt: string;

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
                    topic: 1,
                    typeId: 1,
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
        wrongUser = wrongUserResponse.user;
        const rightUserResponse = await userResources.getNewUser();
        rightUser = rightUserResponse.user;

        const question = mockManualQuestionsPayload.questions.find(q => q.question === firstQuestion.question)!;
        const questionId = firstQuestion.questionId;
        const correctAnswer = question.choices.find(c => c.isAnswer!)!.text!;

        quizResources.token = wrongUserResponse.token;
        const wrongChoice = questions
            .find(q => q.questionId === firstQuestion.questionId)!.choices
            .find(c => c.text !== correctAnswer)!.choiceId;
        const { token: wrongUserToken } = await quizResources.answerQuestion(quiz.quizId, questionId, wrongChoice);
        wrongUserQt = wrongUserToken;

        quizResources.token = rightUserResponse.token;
        const correctAnswerId = questions
            .find(q => q.questionId === firstQuestion.questionId)!.choices
            .find(c => c.text === correctAnswer)!.choiceId;
        await quizResources.answerQuestion(quiz.quizId, questionId, correctAnswerId);
    });

    it('should return users who have not submitted an incorrect answer', async () => {
        const { users } = await quizManagement.getCurrentParticipants(quiz.quizId);
        expect(users.find(u => u.userId === rightUser.userId)).toBeDefined('Unable to find user who only submitted correct answers');
        expect(users.find(u => u.userId === wrongUser.userId)).toBeUndefined('Found user who answered incorrectly');
    });

    it('should return 404 if quiz does not exist', async () => {
        await expectHttpError(quizManagement.getCurrentParticipants(uuid()), 404);
    });

    it('should only return users who have answered the most recently sent question', async () => {
        await quizManagement.startQuestion(quiz.quizId, questions[1].questionId);
        const { users } = await quizManagement.getCurrentParticipants(quiz.quizId);
        expect(users.length).toBe(0, 'Did not filter out users who had not answered all questions');
    });

    it('should include users who used a life', async () => {
        await userResources.getNewUser(wrongUser.username);
        userResources.token = wrongUserResponse.token;
        await userResources.useLife(wrongUser.userId, wrongUserQt);
        const { users } = await quizManagement.getCurrentParticipants(quiz.quizId);
        expect(users.find(u => u.userId === rightUser.userId)).toBeDefined('Unable to find user who only submitted correct answers');
        expect(users.find(u => u.userId === wrongUser.userId)).toBeDefined('User who used life was excluded');
    });
});
