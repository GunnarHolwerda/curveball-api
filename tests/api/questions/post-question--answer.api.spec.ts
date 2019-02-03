import * as jwt from 'jsonwebtoken';
import * as uuid from 'uuid';

import { mockManualQuestionsPayload } from '../mock-data';
import { QuizResources, QuestionResponse, QuizStartResponse } from '../../resources/quiz-resources';
import { UserTokenResponse, UserResources } from '../../resources/user-resources';
import { QuestionPayload } from '../../../src/routes/handlers/quizzes/questions/post-questions';
import { QTClaims, BaseClaims } from '../../../src/types/qt';
import { expectHttpError } from '../../resources/test-helpers';
import { QuestionResources } from '../../resources/question-resources';

describe('POST /quizzes/{quizId}/questions/{questionId}:answer', () => {
    let quizResources: QuizResources;
    let questions: QuestionResponse;
    let userResponse: UserTokenResponse;
    let startResponse: QuizStartResponse;
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

    beforeEach(async () => {
        quizResources = new QuizResources();
        const response = await quizResources.createQuiz({
            title: uuid(),
            potAmount: 500,
        });
        questions = await quizResources.addQuestions(response.quiz.quizId, { questions: quizQuestions });
        startResponse = await quizResources.startQuiz(response.quiz.quizId);
        const userResources = new UserResources();
        userResponse = await userResources.getNewUser();
        quizResources.token = userResponse.token;
    });

    it('should submit answer properly', async () => {
        const { quiz, firstQuestion } = startResponse;
        const response = await quizResources.answerQuestion(
            quiz.quizId,
            firstQuestion.questionId,
            firstQuestion.choices[0].choiceId
        );
        expect(response.token).toBeDefined('QT token was not returned by response');
    });

    it('should have proper qt claims', async () => {
        const { quiz, firstQuestion } = startResponse;
        const response = await quizResources.answerQuestion(
            quiz.quizId,
            firstQuestion.questionId,
            firstQuestion.choices[0].choiceId,
        );
        const claims: QTClaims & BaseClaims = jwt.decode(response.token) as QTClaims & BaseClaims;
        expect(claims.iss).toBe(quiz.quizId, 'iss claim was not quizId');
        expect(claims.sub).toBe(questions.questions[1].questionId, 'sub claim was not set to next question');
        expect(claims.aud).toBe(userResponse.user.userId, 'aud claim was not set to userId');
        expect(claims.lifeUsed).toBe(false, 'lifeUsed was true when no life was used');
        expect(claims.isLastQuestion).toBeFalsy('isLastQuestion was true for non-last question');
    });

    it('should return a token of null after answering last question in quiz', async () => {
        const { quiz } = startResponse;
        let response: any = { token: undefined };
        for (const question of questions.questions) {
            if (question.questionNum !== 1) {
                await quizResources.startQuestion(quiz.quizId, question.questionId);
            }
            response = await quizResources.answerQuestion(
                quiz.quizId,
                question.questionId,
                getRightAnswer(question.questionId, quizQuestions),
                response.token
            );
        }
        expect(response.token).toBeNull('Did not return null for token on last quiz');
    });

    describe('No Authentication Quizzes', () => {
        beforeEach(async () => {
            const response = await quizResources.createQuiz({
                title: uuid(),
                potAmount: 500,
                auth: false
            });
            questions = await quizResources.addQuestions(response.quiz.quizId, { questions: quizQuestions });
            startResponse = await quizResources.startQuiz(response.quiz.quizId);
            const userResources = new UserResources();
            userResponse = await userResources.getNewUser();
            quizResources.token = userResponse.token;
        });

        it('should allow any qt for the quiz for any question', async () => {
            const { quiz, firstQuestion } = startResponse;
            let result = await quizResources.answerQuestion(
                quiz.quizId,
                firstQuestion.questionId,
                getWrongAnswer(firstQuestion.questionId)
            );
            expect(result.token).toBeTruthy('Did not get token back for not authenticated quiz');
            await quizResources.startQuestion(quiz.quizId, questions.questions[1].questionId);
            const question = questions.questions[1];
            result = await quizResources.answerQuestion(
                quiz.quizId,
                question.questionId,
                getWrongAnswer(question.questionId)
            );
            expect(result.token).toBeTruthy('Unable to submit to any question with initial QT');
        });

        it('should return 403 if submitting to quiz that does not match QT', async () => {
            const otherQuiz = (await quizResources.createQuiz({ title: uuid(), potAmount: 20 })).quiz;
            await quizResources.addQuestions(otherQuiz.quizId, { questions: quizQuestions });
            const { firstQuestion } = startResponse;
            await expectHttpError(quizResources.answerQuestion(
                otherQuiz.quizId,
                firstQuestion.questionId,
                getWrongAnswer(firstQuestion.questionId)
            ), 403);
        });
    });

    describe('Authorization', () => {
        it('should return 403 if submitting to question that does not match sub', async () => {
            const { quiz, firstQuestion } = startResponse;
            await expectHttpError(quizResources.answerQuestion(
                quiz.quizId,
                questions.questions[1].questionId,
                getWrongAnswer(firstQuestion.questionId)
            ), 403);
        });

        it('should return 403 if submitting to quiz that does not match iss', async () => {
            const { firstQuestion } = startResponse;
            const response = await quizResources.createQuiz({ title: uuid(), potAmount: 10 });
            await quizResources.addQuestions(response.quiz.quizId, { questions: quizQuestions });
            await expectHttpError(quizResources.answerQuestion(
                response.quiz.quizId,
                firstQuestion.questionId,
                getWrongAnswer(firstQuestion.questionId)
            ), 403);
        });

        it('should return 401 if submitting by user that does not match aud', async () => {
            const { quiz, firstQuestion } = startResponse;
            quizResources.token = 'banana';
            await expectHttpError(quizResources.answerQuestion(
                quiz.quizId,
                firstQuestion.questionId,
                getWrongAnswer(firstQuestion.questionId)
            ), 401);
        });

        it('should return 403 if jwt is invalid', async () => {
            const { quiz, firstQuestion } = startResponse;
            await expectHttpError(quizResources.answerQuestion(
                quiz.quizId,
                firstQuestion.questionId,
                getWrongAnswer(firstQuestion.questionId),
                'banana'
            ), 403);
        });

        it('should return 403 if user submits a second answer to the same quiz', async () => {
            const { quiz, firstQuestion } = startResponse;
            await quizResources.answerQuestion(
                quiz.quizId,
                firstQuestion.questionId,
                getRightAnswer(firstQuestion.questionId, quizQuestions));
            await expectHttpError(quizResources.answerQuestion(
                quiz.quizId,
                firstQuestion.questionId,
                getWrongAnswer(firstQuestion.questionId)
            ), 403, 'User already has an answer for this question');
        });
    });

    describe('Validation', () => {
        it('should return 400 if no choice is provided', async () => {
            const { quiz, firstQuestion } = startResponse;
            await expectHttpError(quizResources.answerQuestion(
                quiz.quizId,
                firstQuestion.questionId,
                // @ts-ignore:one-line
                null
            ), 400);
        });

        it('should return 400 if invalid choice is supplied', async () => {
            const { quiz, firstQuestion } = startResponse;
            await expectHttpError(quizResources.answerQuestion(
                quiz.quizId,
                firstQuestion.questionId,
                uuid()
            ), 400, 'Choice does not exist');
        });

        it('should return 403 if question is expired', async () => {
            const { quiz, firstQuestion } = startResponse;
            const originalDate = firstQuestion.expired;
            const questionResources = new QuestionResources();
            const oldDate = new Date();
            oldDate.setDate(oldDate.getDate() - 1);
            const quizToken = (await quizResources.getQuizAccess(quiz.quizId)).token!;
            await questionResources.updateQuestion(firstQuestion.questionId, {
                expired: oldDate.toISOString()
            });
            await expectHttpError(quizResources.answerQuestion(
                quiz.quizId,
                firstQuestion.questionId,
                getWrongAnswer(firstQuestion.questionId),
                quizToken
            ), 403, 'Question expired');
            await questionResources.updateQuestion(firstQuestion.questionId, {
                expired: originalDate
            });
        });

        it('should return 403 if question has not been sent', async () => {
            const { quiz, firstQuestion } = startResponse;
            const response = await quizResources.answerQuestion(
                quiz.quizId,
                firstQuestion.questionId,
                getRightAnswer(firstQuestion.questionId, quizQuestions)
            );
            await expectHttpError(quizResources.answerQuestion(
                quiz.quizId,
                questions.questions[1].questionId,
                getWrongAnswer(questions.questions[1].questionId),
                response.token
            ), 403, 'Question has not been started');
        });
    });

    function getWrongAnswer(questionId: string): string {
        return questions.questions.find(q => q.questionId === questionId)!.choices[1].choiceId;
    }

    function getRightAnswer(questionId: string, originalQuestions: Array<QuestionPayload>): string {
        const question = questions.questions.find(q => q.questionId === questionId)!;
        const correctAnswer = originalQuestions
            .find(q => q.question === question.question)!.choices.find(c => c.isAnswer!)!.text;
        return question.choices.find(c => c.text === correctAnswer)!.choiceId;
    }
});
