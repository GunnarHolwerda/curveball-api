import * as uuid from 'uuid';
import { QuestionResponse } from '../../resources/quiz-resources';
import { IQuizResponse } from '../../../src/models/entities/quiz';
import { QuestionManagementResources } from '../../resources/question-management-resources';
import { AccountResources } from '../../resources/account-resources';
import { QuizManagementResources } from '../../resources/quiz-management-resources';

describe('PUT /questions/{questionId}', () => {
    let quizResources: QuizManagementResources;
    let questionResources: QuestionManagementResources;
    let quiz: IQuizResponse;
    let questionResponse: QuestionResponse;

    beforeAll(async () => {
        const account = await (new AccountResources()).createAndLoginToAccount();
        quizResources = new QuizManagementResources(account.token);
        questionResources = new QuestionManagementResources(account.token);
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
