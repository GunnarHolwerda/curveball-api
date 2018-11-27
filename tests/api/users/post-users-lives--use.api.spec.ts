import * as jwt from 'jsonwebtoken';
import * as uuid from 'uuid';

import { mockQuestionsPayload } from '../mock-data';
import { Test } from '../resources/quiz-resources';
import { expectHttpError } from '../resources/test-helpers';
import { Test as UserTest } from '../resources/user-resources';
import { BaseClaims, QTClaims } from '../../../src/handlers/quiz/models/qt';
import { QuestionPayload } from '../../../src/handlers/quiz/functions/quizzes/questions/post-questions';

describe('POST /users/{userId}/lives:use', () => {
    let quizResources: Test.QuizResources;
    let userResources: UserTest.UserResources;
    let questions: Test.QuestionResponse;
    let userResponse: UserTest.UserTokenResponse;
    let startResponse: Test.QuizStartResponse;
    let qt: string;
    const quizQuestions: Array<QuestionPayload> = [
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
    ];

    beforeEach(async () => {
        quizResources = new Test.QuizResources();
        const response = await quizResources.createQuiz({
            title: uuid(),
            potAmount: 500,
        });
        const qPayload = {
            questions: quizQuestions
        };
        questions = await quizResources.addQuestions(response.quiz.quizId, qPayload);
        startResponse = await quizResources.startQuiz(response.quiz.quizId);
        userResources = new UserTest.UserResources();
        userResponse = await userResources.getNewUser();
        await userResources.getNewUser(userResponse.user.username);
        userResources.token = userResponse.token;
        quizResources.token = userResponse.token;
        const { quiz, firstQuestion } = startResponse;
        qt = (await quizResources.answerQuestion(
            quiz.quizId,
            questions.questions[0].questionId,
            getWrongAnswer(firstQuestion.questionId)
        )).token;
    });

    it('should use a life for the question properly', async () => {
        const response = await userResources.useLife(userResponse.user.userId, qt);
        const lives = await userResources.getLives(userResponse.user.userId);
        expect(response.token).toBeDefined('QT token was not returned by response');
        expect(lives).toBe(0, 'Lives were not reduced by 1 after using a life');
    });

    it('should have proper qt claims for the next question', async () => {
        const { quiz } = startResponse;
        const response = await userResources.useLife(userResponse.user.userId, qt);
        const claims: QTClaims & BaseClaims = jwt.decode(response.token) as QTClaims & BaseClaims;
        expect(claims.iss).toBe(quiz.quizId, 'iss claim was not quizId');
        expect(claims.sub).toBe(questions.questions[1].questionId, 'sub claim was not set to next question');
        expect(claims.aud).toBe(userResponse.user.userId, 'aud claim was not set to userId');
        expect(claims.lifeUsed).toBe(true, 'lifeUsed was false when a life was used');
    });

    describe('Authorization', () => {
        // TODO: Removing this test until we are sure we want this functionality back
        xit('should return 403 if user has not failed a question', async () => {
            const { quiz, firstQuestion } = startResponse;
            const { user, token } = await userResources.getNewUser();
            // Give user a life by adding a user with their referral code
            await userResources.getNewUser(user.username);
            userResources.token = token;
            quizResources.token = token;
            const quizToken = (await quizResources.answerQuestion(
                quiz.quizId,
                questions.questions[0].questionId,
                getRightAnswer(firstQuestion.questionId, quizQuestions)
            )).token;
            await expectHttpError(userResources.useLife(user.userId, quizToken), 403, 'User has not failed a question');
        });

        it('should return 403 if user has zero lives', async () => {
            const { quiz, firstQuestion } = startResponse;
            const { user, token } = await userResources.getNewUser();
            quizResources.token = token;
            const quizToken = (await quizResources.answerQuestion(
                quiz.quizId,
                questions.questions[0].questionId,
                getWrongAnswer(firstQuestion.questionId)
            )).token;
            userResources.token = token;
            await expectHttpError(userResources.useLife(user.userId, quizToken), 403, 'User has no lives');
        });

        it('should return 403 if user already has used a life', async () => {
            const { token } = await userResources.useLife(userResponse.user.userId, qt);
            await expectHttpError(userResources.useLife(userResponse.user.userId, token), 403, 'User has already used a life');
        });

        it('should return 403 if next question was already sent', async () => {
            const { quiz } = startResponse;
            await quizResources.startQuestion(quiz.quizId, questions.questions[1].questionId);
            await expectHttpError(userResources.useLife(userResponse.user.userId, qt), 403, 'Question was already sent');
        });
    });

    function getWrongAnswer(questionId: string): string {
        return questions.questions.find(q => q.questionId === questionId)!.choices[1].text;
    }

    function getRightAnswer(questionId: string, originalQuestions: Array<QuestionPayload>): string {
        const question = questions.questions.find(q => q.questionId === questionId)!;
        const correctAnswerText = originalQuestions
            .find(q => q.question === question.question)!.choices.find(c => c.isAnswer === true)!.text;
        return question.choices.find(c => c.text === correctAnswerText)!.text;
    }
});
