import * as uuid from 'uuid';

import { mockManualQuestionsPayload } from '../mock-data';
import { expectHttpError } from '../../resources/test-helpers';
import { QuizResources, QuestionResponse, QuizStartResponse } from '../../resources/quiz-resources';

describe('POST /quizzes/{quizId}/questions/{questionId}:start', () => {
    let quizResources: QuizResources;
    let questions: QuestionResponse;
    let startResponse: QuizStartResponse;

    beforeAll(async () => {
        quizResources = new QuizResources();
        const response = await quizResources.createQuiz({
            title: uuid(),
            potAmount: 500,
        });
        questions = await quizResources.addQuestions(response.quiz.quizId, mockManualQuestionsPayload);
        startResponse = await quizResources.startQuiz(response.quiz.quizId);
    });

    it('should start question properly', async () => {
        const { quiz } = startResponse;
        const startedQuestion = await quizResources.startQuestion(quiz.quizId, questions.questions[1].questionId);
        expect(startedQuestion.question.expired, 'Question was not set to expire after starting').toBeDefined();
        expect(startedQuestion.question.sent, 'Question was not marked as sent').toBeDefined();
    });

    describe('Validation', () => {
        it('should return 404 if question does not exist on quiz', async () => {
            const { quiz } = startResponse;
            await expectHttpError(quizResources.startQuestion(quiz.quizId, uuid()), 404);
        });

        it('should return 404 if quiz does not exist', async () => {
            await expectHttpError(quizResources.startQuestion('banana', questions.questions[1].questionId), 404);
        });
    });
});
