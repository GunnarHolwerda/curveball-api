import * as uuid from 'uuid';

import { mockQuestionsPayload } from '../mock-data';
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
