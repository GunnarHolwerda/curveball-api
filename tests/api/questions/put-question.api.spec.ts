import * as uuid from 'uuid';

import { Test as QuestionTest } from '../resources/question-resources';
import { Test } from '../resources/quiz-resources';
import { IQuizResponse } from '../../../src/handlers/quiz/models/quiz';

describe('PUT /questions/{questionId}', () => {
    let quizResources: Test.QuizResources;
    let questionResources: QuestionTest.QuestionResources;
    let quiz: IQuizResponse;
    let questionResponse: Test.QuestionResponse;

    beforeAll(async () => {
        quizResources = new Test.QuizResources();
        questionResources = new QuestionTest.QuestionResources();
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
                    sport: 'hello',
                    ticker: 'why not',
                    choices: [
                        { text: 'Blue', isAnswer: true }
                    ]
                }
            ]
        });
    });

    it('should update question properly', async () => {
        const { questions } = questionResponse;
        const newTitle = 'This is a new question now';
        const response = await questionResources.updateQuestion(questions[0].questionId, {
            question: 'This is a new question now'
        });
        expect(response).toBeDefined();
        expect(response.question.question).toBe(newTitle);
    });

    it('should update expiration date', async () => {
        const { questions } = questionResponse;
        const newExpirationDate = (new Date()).toISOString();
        const response = await questionResources.updateQuestion(questions[0].questionId, {
            expired: newExpirationDate
        });
        expect(response).toBeDefined();
        expect(response.question.expired).toBe(newExpirationDate);
    });
});
