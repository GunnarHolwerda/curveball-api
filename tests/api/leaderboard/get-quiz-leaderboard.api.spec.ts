import { QuizResources } from '../../resources/quiz-resources';
import { UserResources, UserTokenResponse } from '../../resources/user-resources';
import { runFullQuiz, QuizResult } from '../helpers/run-full-quiz';

describe('GET /quizzes/{quizId}/leaderboard', () => {
    const userResources = new UserResources();
    let quizResources: QuizResources;
    let currentUser: UserTokenResponse;
    let quizData: QuizResult;

    beforeAll(() => {
        quizResources = new QuizResources();
    });

    beforeEach(async () => {
        currentUser = await userResources.getNewUser();
        quizResources.token = currentUser.token;
        quizData = await runFullQuiz({ answeringUsers: [currentUser] });
    });

    it('should return users in desc order by score', async () => {
        const { standings } = await quizResources.getLeaderboard(quizData.quiz.quizId);
        expect(standings.map(s => s.score)).toEqual(standings.map(s => s.score).sort(), 'Standings were not return in standing order');
    });

    describe('Filters', () => {
        describe('?filter=friends', () => {
            let friendQuizData: QuizResult;
            let friend: UserTokenResponse;

            beforeEach(async () => {
                friend = await userResources.getNewUser();
                userResources.token = currentUser.token;
                await userResources.addFriend(currentUser.user.userId, friend.user.userId);
                const friendUserResources = new UserResources(friend.token);
                await friendUserResources.addFriend(friend.user.userId, currentUser.user.userId);
            });

            it('should filter to only friends of the current user', async () => {
                friendQuizData = await runFullQuiz({ answeringUsers: [currentUser, friend] });
                const { standings } = await quizResources.getLeaderboard(friendQuizData.quiz.quizId, { filter: 'friends' });
                const leaderBoardUsers = standings.map(s => s.user.userId);
                expect(leaderBoardUsers.length).toBe(2, 'Returned more users than expected');
                expect(leaderBoardUsers.find(u => currentUser.user.userId === u)).toBeDefined('Did not find current user');
                expect(leaderBoardUsers.find(u => friend.user.userId === u)).toBeDefined('Did not find friend user');
            });

            it('should exclude friends who have not accepted the friend invite', async () => {
                const inviteOnlyUser = await userResources.getNewUser();
                friendQuizData = await runFullQuiz({ answeringUsers: [currentUser, friend, inviteOnlyUser] });
                await userResources.addFriend(currentUser.user.userId, inviteOnlyUser.user.userId);
                const { standings } = await quizResources.getLeaderboard(friendQuizData.quiz.quizId, { filter: 'friends' });
                const leaderBoardUsers = standings.map(s => s.user.userId);
                expect(leaderBoardUsers.length).toBe(2, 'Returned more users than expected');
                expect(leaderBoardUsers.find(u => currentUser.user.userId === u)).toBeDefined('Did not find current user');
                expect(leaderBoardUsers.find(u => friend.user.userId === u)).toBeDefined('Did not find friend user');
            });
        });
    });
});