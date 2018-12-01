import * as uuid from 'uuid';

import { mockQuestionsPayload } from '../mock-data';
import { QuizResources, QuizStartResponse } from '../resources/quiz-resources';
import { IQuizResponse } from '../../../src/models/entities/quiz';
import { IQuestionResponse } from '../../../src/models/entities/question';
import { IUserResponse } from '../../../src/models/entities/user';
import { UserTokenResponse, UserResources } from '../resources/user-resources';
import { expectHttpError } from '../resources/test-helpers';

describe('GET /quizzes/{quizId}/users', () => {
    let quizResources: QuizResources;
    let quiz: IQuizResponse;
    let questions: Array<IQuestionResponse>;
    let rightUser: IUserResponse;
    let wrongUser: IUserResponse;
    let wrongUserResponse: UserTokenResponse;
    let userResources: UserResources;
    let startResponse: QuizStartResponse;
    let wrongUserQt: string;

    beforeEach(async () => {
        quizResources = new QuizResources();
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
        userResources = new UserResources();
        wrongUserResponse = await userResources.getNewUser();
        wrongUser = wrongUserResponse.user;
        const rightUserResponse = await userResources.getNewUser();
        rightUser = rightUserResponse.user;

        const question = mockQuestionsPayload.questions.find(q => q.question === firstQuestion.question)!;
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
        const { users } = await quizResources.getCurrentParticipants(quiz.quizId);
        expect(users.find(u => u.userId === rightUser.userId)).toBeDefined('Unable to find user who only submitted correct answers');
        expect(users.find(u => u.userId === wrongUser.userId)).toBeUndefined('Found user who answered incorrectly');
    });

    it('should return 404 if quiz does not exist', async () => {
        await expectHttpError(quizResources.getCurrentParticipants(uuid()), 404);
    });

    it('should only return users who have answered the most recently sent question', async () => {
        await quizResources.startQuestion(quiz.quizId, questions[1].questionId);
        const { users } = await quizResources.getCurrentParticipants(quiz.quizId);
        expect(users.length).toBe(0, 'Did not filter out users who had not answered all questions');
    });

    it('should include users who used a life', async () => {
        await userResources.getNewUser(wrongUser.username);
        userResources.token = wrongUserResponse.token;
        await userResources.useLife(wrongUser.userId, wrongUserQt);
        const { users } = await quizResources.getCurrentParticipants(quiz.quizId);
        expect(users.find(u => u.userId === rightUser.userId)).toBeDefined('Unable to find user who only submitted correct answers');
        expect(users.find(u => u.userId === wrongUser.userId)).toBeDefined('User who used life was excluded');
    });
});
