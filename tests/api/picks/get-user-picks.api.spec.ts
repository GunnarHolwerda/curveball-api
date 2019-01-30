import { UserResources, UserTokenResponse } from '../../resources/user-resources';
import { runFullQuiz, QuizResult } from '../helpers/run-full-quiz';
import { mockQuestionsPayload } from '../mock-data';

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
        fullQuizRun = await runFullQuiz({
            answeringUsers: [userResponse],
            authenticateQuiz: false,
            questions: {
                questions: mockQuestionsPayload.questions.map(q => {
                    return {
                        ...q,
                        choices: q.choices.map(c => ({ ...c, subjectId: 1000 }))
                    };
                })
            }
        });
    });

    it('should retrieve user picks', async () => {
        const picks = await userResources.getPicks(userResponse.user.userId);
        expect(picks.shows.find(s => s.quizId === fullQuizRun.quiz.quizId)).toBeDefined('Did not find show participated in');
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
