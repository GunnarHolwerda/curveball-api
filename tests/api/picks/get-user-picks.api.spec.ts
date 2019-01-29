import { UserResources, UserTokenResponse } from '../../resources/user-resources';
import { runFullQuiz, QuizResult } from '../helpers/run-full-quiz';

describe('GET /users/{userId}/picks', () => {
    let userResponse: UserTokenResponse;
    let userResources: UserResources;
    let fullQuizRun: QuizResult;

    beforeAll(async () => {
        userResources = new UserResources();
        userResponse = await userResources.getNewUser();
        userResources = new UserResources(userResponse.token);
    });

    beforeEach(async () => {
        fullQuizRun = await runFullQuiz({ answeringUsers: [userResponse], authenticateQuiz: false });
        console.log(fullQuizRun);
    });

    it('should retrieve user picks', async () => {
        const picks = await userResources.getPicks(userResponse.user.userId);
        expect(picks).toBeTruthy();
    });

    it('should retrieve picks shows participated in that ended in the last 5 days', async () => {
        fail();
    });

    it('should not return picks for shows that closed > 5 days ago', async () => {
        fail();
    });

    it('should return 404 if user does not exist', async () => {
        fail();
    });
});
