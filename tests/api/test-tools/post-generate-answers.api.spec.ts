import { TestToolResources } from '../../resources/test-tool-resources';
import { QuizResources, QuizAndQuestion } from '../../resources/quiz-resources';
import * as uuid from 'uuid';
import { mockQuestionsPayload } from '../mock-data';

describe('POST /test/answers:generate', () => {
    let testToolResources: TestToolResources;
    let quizResources: QuizResources;
    let quiz: QuizAndQuestion;

    beforeAll(async () => {
        testToolResources = new TestToolResources();
        quizResources = new QuizResources();
    });

    beforeEach(async () => {
        const quizResponse = await quizResources.createQuiz({
            title: uuid(),
            potAmount: 500,
        });
        await quizResources.addQuestions(quizResponse.quiz.quizId, mockQuestionsPayload);
        quiz = (await quizResources.getQuiz(quizResponse.quiz.quizId)).quiz;
    });

    it('should return a distribution that adds up to one for all choices in a quiz', async () => {
        const question = quiz.questions[0];
        const result = await testToolResources.generateRandomAnswers(question.questionId, { numAnswers: 10 });
        let sumOfDistribution = 0;
        for (const choiceId in result) {
            if (result.hasOwnProperty(choiceId)) {
                sumOfDistribution += result[choiceId];
                expect(result[choiceId]).toBeLessThan(1, 'One choice was given all the answers');
            }
        }
        expect(sumOfDistribution).toBe(1, 'Distribution did not add up to 100%');
    });
});
