import * as uuid from 'uuid';
import { QuestionResponse } from '../../resources/quiz-resources';
import { IQuizResponse } from '../../../src/models/entities/quiz';
import { AccountResources } from '../../resources/account-resources';
import { QuizManagementResources } from '../../resources/quiz-management-resources';
import { expectHttpError } from '../../resources/test-helpers';
import { IQuestionResponse } from '../../../src/models/entities/question';
import { IChoiceResponse } from '../../../src/models/entities/question-choice';

describe('PUT /quizId/{quizId}/questions/{questionId}/choice/{choiceId}', () => {
    let quizResources: QuizManagementResources;
    let quiz: IQuizResponse;
    let questionResponse: QuestionResponse;

    beforeAll(async () => {
        const account = await (new AccountResources()).createAndLoginToAccount();
        quizResources = new QuizManagementResources(account.token);
        const response = await quizResources.createQuiz({
            title: uuid(),
            potAmount: 500,
        });
        quiz = response.quiz;
        questionResponse = await quizResources.addQuestions(quiz.quizId, {
            questions: [
                {
                    question: 'What is your favorite color?',
                    questionNum: 1,
                    topic: 1,
                    typeId: 1,
                    ticker: 'why not',
                    choices: [
                        { text: 'Blue', isAnswer: true, score: 0 }
                    ]
                }
            ]
        });
    });

    it('should update choice properly', async () => {
        const { questions } = questionResponse;
        const question = questions[0];
        const choice = question.choices[0];
        const response = await quizResources.updateChoice(quiz.quizId, question.questionId, choice.choiceId, {
            score: 9
        });
        expect(response.score, 'Score was not updated properly from update').toEqual(9);
    });

    describe('Entity Relationships', () => {
        let otherQuestions: QuestionResponse;

        beforeEach(async () => {
            const response = await quizResources.createQuiz({
                title: uuid(),
                potAmount: 500,
            });
            const otherQuiz = response.quiz;
            otherQuestions = await quizResources.addQuestions(otherQuiz.quizId, {
                questions: [
                    {
                        question: 'What is your favorite color?',
                        questionNum: 1,
                        topic: 1,
                        typeId: 1,
                        ticker: 'why not',
                        choices: [
                            { text: 'Blue', isAnswer: true, score: 0 }
                        ]
                    }
                ]
            });
        });

        it('should return 404 if question does not belong to quiz', async () => {
            const otherQuestion = otherQuestions.questions[0];
            const choice = otherQuestion.choices[0];
            await expectHttpError(quizResources.updateChoice(quiz.quizId, otherQuestion.questionId, choice.choiceId, { score: 2 }), 404);
        });

        it('should return 404 if choice does not belong to question', async () => {
            const question = otherQuestions.questions[0];
            const otherChoice = questionResponse.questions[0].choices[0];
            await expectHttpError(quizResources.updateChoice(quiz.quizId, question.questionId, otherChoice.choiceId, { score: 2 }), 404);
        });
    });

    describe('Errors', () => {
        let question: IQuestionResponse;
        let choice: IChoiceResponse;

        beforeEach(() => {
            const { questions } = questionResponse;
            question = questions[0];
            choice = question.choices[0];
        });

        it('should return 404 if quiz does not exist', async () => {
            await expectHttpError(quizResources.updateChoice(uuid(), question.questionId, choice.choiceId, { score: 2 }), 404);
        });

        it('should return 404 if question does not exist', async () => {
            await expectHttpError(quizResources.updateChoice(quiz.quizId, uuid(), choice.choiceId, { score: 2 }), 404);
        });

        it('should return 404 if choice does not exist', async () => {
            await expectHttpError(quizResources.updateChoice(quiz.quizId, question.questionId, uuid(), { score: 2 }), 404);
        });
    });
});
