import * as hapi from 'hapi';
import * as Boom from 'boom';
import * as Joi from 'joi';
import { QuizFactory } from '../../../../models/factories/quiz-factory';
import { UserFactory } from '../../../../models/factories/user-factory';
import { UserJwtClaims } from '../../../../interfaces/user-jwt-claims';
import { friendLeaderboard } from '../../../../queries/friend-leaderboard';
import { globalLeaderboard } from '../../../../queries/global-leaderboard';
import { LeaderboardRow } from '../../../../interfaces/leaderboard-row';

export const getQuizLeaderboardQueryParams = {
    filter: Joi.string().optional().allow('friends').description('Filter leaderboard to only friends')
};

export async function getQuizLeaderboard(event: hapi.Request): Promise<object> {
    const quizId: string = event.params['quizId'];
    const { userId: currentUserId } = event.auth.credentials as UserJwtClaims;
    const { filter } = event.query as { filter?: string };
    const quiz = await QuizFactory.load(quizId);
    if (quiz === null) {
        throw Boom.notFound();
    }
    let leaderboard: Array<LeaderboardRow>;
    switch (filter) {
        case undefined:
            leaderboard = await globalLeaderboard(quizId);
            break;
        case 'friends':
            leaderboard = await friendLeaderboard(currentUserId, quizId);
            break;
        default:
            throw Boom.badRequest('Unknown filter');
    }

    const userScoreMap: { [userId: string]: { standing: number, score: number } } = leaderboard.reduce((carry, r) => {
        carry[r.user_id] = { standing: r.standing, score: parseFloat(r.total_score) };
        return carry;
    }, {});

    const users = await UserFactory.batchLoad(leaderboard.map(r => r.user_id));
    const standings = users.map(async (user) =>
        ({
            user: await user.toResponseObject(),
            standing: userScoreMap[user.properties.user_id].standing,
            score: userScoreMap[user.properties.user_id].score
        })
    );

    return {
        standings: await Promise.all(standings)
    };
}


