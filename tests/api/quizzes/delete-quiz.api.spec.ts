import { QuizResources } from '../resources/quiz-resources';
import * as uuid from 'uuid';
import { expectHttpError } from '../resources/test-helpers';
import { IQuizResponse } from '../../../src/models/entities/quiz';

describe('DELETE /quizes/{quizId}', () => {
    let quiz: IQuizResponse;
    let quizResources: QuizResources;

    beforeEach(async () => {
        quizResources = new QuizResources();
        quiz = (await quizResources.createQuiz({
            title: uuid(),
            potAmount: 100,
            auth: false
        })).quiz;
    });

    it('should delete delete the quiz', async () => {
        await quizResources.deleteQuiz(quiz.quizId);
        const deletedQuiz = await quizResources.getQuiz(quiz.quizId);
        expect(deletedQuiz.quiz.deleted).toBeTruthy('Quiz was not marked as deleted');
    });

    it('should return 404 if quiz does not exist', async () => {
        await expectHttpError(quizResources.deleteQuiz(uuid()), 404);
    });
});