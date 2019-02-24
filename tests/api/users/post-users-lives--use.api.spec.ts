import * as jwt from 'jsonwebtoken';
import * as uuid from 'uuid';

import { mockManualQuestionsPayload } from '../mock-data';
import { QuestionPayload } from '../../../src/routes/handlers/quizzes/questions/post-questions';
import { QTClaims, BaseClaims } from '../../../src/types/qt';
import { UserResources, UserTokenResponse } from '../../resources/user-resources';
import { expectHttpError } from '../../resources/test-helpers';
import { QuestionResponse } from '../../resources/quiz-resources';
import { QuizResources } from '../../resources/quiz-resources';
import { QuizStartResponse } from '../../resources/quiz-resources';
import { QuizManagementResources } from '../../resources/quiz-management-resources';
import { AccountResources } from '../../resources/account-resources';

describe('POST /users/{userId}/lives:use', () => {
    let quizResources: QuizResources;
    let quizManagement: QuizManagementResources;
    let userResources: UserResources;
    let questions: QuestionResponse;
    let userResponse: UserTokenResponse;
    let startResponse: QuizStartResponse;
    let qt: string;
    const quizQuestions: Array<QuestionPayload> = [
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
    ];

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
        const qPayload = {
            questions: quizQuestions
        };
        questions = await quizManagement.addQuestions(response.quiz.quizId, qPayload);
        startResponse = await quizManagement.startQuiz(response.quiz.quizId);
        userResources = new UserResources();
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
            await quizManagement.startQuestion(quiz.quizId, questions.questions[1].questionId);
            await expectHttpError(userResources.useLife(userResponse.user.userId, qt), 403, 'Question was already sent');
        });
    });

    function getWrongAnswer(questionId: string): string {
        return questions.questions.find(q => q.questionId === questionId)!.choices[1].choiceId;
    }

    // function getRightAnswer(questionId: string, originalQuestions: Array<IQuestionResponse>): string {
    //     const question = questions.questions.find(q => q.questionId === questionId)!;
    //     const correctAnswerText = originalQuestions
    //         .find(q => q.question === question.question)!.choices.find(c => c.isAnswer === true)!.choiceId;
    //     return question.choices.find(c => c.text === correctAnswerText)!.choiceId;
    // }
});
