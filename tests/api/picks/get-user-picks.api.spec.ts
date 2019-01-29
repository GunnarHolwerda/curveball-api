import { IUserResponse } from '../../../src/models/entities/user';
import { UserResources } from '../../resources/user-resources';
import { runFullQuiz, QuizResult } from '../helpers/run-full-quiz';

describe('GET /users/{userId}/picks', () => {
    let user: IUserResponse;
    let userResources: UserResources;
    let fullQuizRun: QuizResult;

    beforeAll(async () => {
        userResources = new UserResources();
        const response = await userResources.getNewUser();
        user = response.user;
        userResources = new UserResources(response.token);
    });

    beforeEach(async () => {
        fullQuizRun = await runFullQuiz();
        console.log(user);
        console.log(fullQuizRun);
    });

    it('should retrieve user picks', async () => {
        fail();
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
