import { TestToolResources } from '../../resources/test-tool-resources';
import { QuizAndQuestion } from '../../resources/quiz-resources';
import * as uuid from 'uuid';
import { mockManualQuestionsPayload } from '../mock-data';
import { AccountResources } from '../../resources/account-resources';
import { QuizManagementResources } from '../../resources/quiz-management-resources';

describe('POST /test/answers:generate', () => {
    let testToolResources: TestToolResources;
    let quizManagement: QuizManagementResources;
    let quiz: QuizAndQuestion;

    beforeAll(async () => {
        const account = await (new AccountResources()).createAndLoginToAccount();
        quizManagement = new QuizManagementResources(account.token);
        testToolResources = new TestToolResources();
    });

    beforeEach(async () => {
        const quizResponse = await quizManagement.createQuiz({
            title: uuid(),
            potAmount: 500,
        });
        await quizManagement.addQuestions(quizResponse.quiz.quizId, mockManualQuestionsPayload);
        quiz = (await quizManagement.getQuiz(quizResponse.quiz.quizId)).quiz;
    });

    it('should return a distribution that adds up to one for all choices in a quiz', async () => {
        const question = quiz.questions[0];
        const result = await testToolResources.generateRandomAnswers(question.questionId, { numAnswers: 10 });
        let sumOfDistribution = 0;
        for (const choiceId in result) {
            if (result.hasOwnProperty(choiceId)) {
                sumOfDistribution += result[choiceId];
                expect(result[choiceId], 'One choice was given all the answers').toBeLessThan(1);
            }
        }
        expect(sumOfDistribution, 'Distribution did not add up to 100%').toBe(1);
    });
});
