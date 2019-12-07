import * as uuid from 'uuid';

import { IQuizResponse } from '../../../src/models/entities/quiz';
import { QuizResources } from '../../resources/quiz-resources';
import { expectHttpError } from '../../resources/test-helpers';

describe('GET /quizzes/{quizId}/questions', () => {
    let quizResources: QuizResources;
    let quiz: IQuizResponse;

    beforeAll(async () => {
        quizResources = new QuizResources();
        const response = await quizResources.createQuiz({
            title: uuid(),
            potAmount: 500,
        });
        quiz = response.quiz;
        await quizResources.addQuestions(quiz.quizId, {
            questions: [
                {
                    question: 'What is your favorite color?',
                    questionNum: 1,
                    ticker: 'sport',
                    topic: 1,
                    typeId: 1,
                    choices: [
                        { text: 'Blue', isAnswer: true }
                    ]
                },
                {
                    question: 'What is your favorite animal?',
                    questionNum: 2,
                    ticker: 'sport',
                    topic: 1,
                    typeId: 1,
                    choices: [
                        { text: 'Cat', isAnswer: true },
                    ]
                }
            ]
        });
    });

    it('should retrieve only questions for quiz', async () => {
        const response = await quizResources.getQuestions(quiz.quizId);
        // @ts-ignore
        expect(response.quiz, 'Quiz was returned from the questions only endpoint').toBeUndefined();
        expect(response.questions.length, 'Questions did not return expected number of questions').toBe(2);
    });

    it('should return 404 if no quiz exists', async () => {
        await expectHttpError(quizResources.getQuestions(uuid()), 404);
    });

    it('should return questions in order of questionNum', async () => {
        const response = await quizResources.getQuestions(quiz.quizId);
        const questionOrder = response.questions.map(q => q.questionNum);
        expect(questionOrder, 'Questions were not returned in order').toEqual([1, 2]);
    });
});
