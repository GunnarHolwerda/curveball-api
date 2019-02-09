import { UserResources, UserTokenResponse } from '../../resources/user-resources';
import { runFullQuiz, QuizResult } from '../helpers/run-full-quiz';
import { nflSpreadQuestionPayload } from '../mock-data';
import { QuizResources } from '../../resources/quiz-resources';
import { expectHttpError } from '../../resources/test-helpers';
import * as uuid from 'uuid/v4';

describe('GET /users/{userId}/picks', () => {
    let userResponse: UserTokenResponse;
    let userResources: UserResources;
    let fullQuizRun: QuizResult;

    beforeAll(async () => {
        userResources = new UserResources();
        userResponse = await userResources.getNewUser();
        // userResponse = await userResources.verifyUser('e5d2b59e-1d9b-4ca9-a36c-adb209ecf719');
        userResources = new UserResources(userResponse.token);
    });

    describe('Manual Questions', () => {
        beforeEach(async () => {
            fullQuizRun = await runFullQuiz({
                answeringUsers: [userResponse],
                authenticateQuiz: false
            });
        });

        it('should retrieve user picks', async () => {
            const picks = await userResources.getPicks(userResponse.user.userId);
            expect(picks.shows.find(s => s.quizId === fullQuizRun.quiz.quizId)).toBeDefined('Did not find show participated in');
        });

        it('should exclude disabled picks', async () => {
            const quizResources = new QuizResources();
            await quizResources.resetQuiz(fullQuizRun.quiz.quizId);
            const picks = await userResources.getPicks(userResponse.user.userId);
            expect(picks.shows.find(s => s.quizId === fullQuizRun.quiz.quizId)).toBeUndefined('Included disabled picks');
        });

        it('should retrieve picks shows participated in that ended in the last 5 days', async () => {
            const otherQuiz = await runFullQuiz({
                answeringUsers: [userResponse],
                authenticateQuiz: false
            });
            const quizResources = new QuizResources();
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() - 10);
            await quizResources.updateQuiz(otherQuiz.quiz.quizId, { completedDate: futureDate.toISOString() });
            const picks = await userResources.getPicks(userResponse.user.userId);
            expect(picks.shows.find(s => s.quizId === fullQuizRun.quiz.quizId)).toBeDefined('Did not find show ended just now');
            expect(picks.shows.find(s => s.quizId === otherQuiz.quiz.quizId)).toBeUndefined('Found show that ended 10 days ago');
        });

        it('should return 404 if user does not exist', async () => {
            await expectHttpError(userResources.getPicks(uuid()), 404);
        });
    });

    describe('NFL Spread', () => {
        beforeEach(async () => {
            fullQuizRun = await runFullQuiz({
                answeringUsers: [userResponse],
                authenticateQuiz: false,
                questions: nflSpreadQuestionPayload
            });
        });

        it('should retrieve user picks', async () => {
            const picks = await userResources.getPicks(userResponse.user.userId);
            expect(picks.shows.find(s => s.quizId === fullQuizRun.quiz.quizId)).toBeDefined('Did not find show participated in');
        });
    });
});
