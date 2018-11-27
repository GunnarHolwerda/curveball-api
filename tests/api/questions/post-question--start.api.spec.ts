import * as uuid from 'uuid';

import { mockQuestionsPayload } from '../mock-data';
import { Test } from '../resources/quiz-resources';
import { expectHttpError } from '../resources/test-helpers';

describe('POST /quizzes/{quizId}/questions/{questionId}:start', () => {
    let quizResources: Test.QuizResources;
    let questions: Test.QuestionResponse;
    let startResponse: Test.QuizStartResponse;

    beforeAll(async () => {
        quizResources = new Test.QuizResources();
        const response = await quizResources.createQuiz({
            title: uuid(),
            potAmount: 500,
        });
        questions = await quizResources.addQuestions(response.quiz.quizId, mockQuestionsPayload);
        startResponse = await quizResources.startQuiz(response.quiz.quizId);
    });

    it('should start question properly', async () => {
        const { quiz } = startResponse;
        const startedQuestion = await quizResources.startQuestion(quiz.quizId, questions.questions[1].questionId);
        expect(startedQuestion.question.expired).toBeDefined('Question was not set to expire after starting');
        expect(startedQuestion.question.sent).toBeDefined('Question was not marked as sent');
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
