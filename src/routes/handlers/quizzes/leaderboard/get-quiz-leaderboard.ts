import * as hapi from 'hapi';
import * as Boom from 'boom';
import * as Joi from 'joi';
import { QuizFactory } from '../../../../models/factories/quiz-factory';
import { Database } from '../../../../models/database';
import { ANSWER_TABLE_NAME } from '../../../../models/entities/answer';
import { CHOICES_TABLE_NAME } from '../../../../models/entities/question-choice';
import { QUESTION_TABLE_NAME } from '../../../../models/entities/question';
import { UserFactory } from '../../../../models/factories/user-factory';
import { UserJwtClaims } from '../../../../interfaces/user-jwt-claims';
import { FRIEND_TABLE_NAME } from '../../../../models/entities/friend';

export const getQuizLeaderboardQueryParams = {
    filter: Joi.string().optional().allow('friends').description('Filter leaderboard to only friends')
};

export async function getQuizLeaderboard(event: hapi.Request): Promise<object> {
    const quizId: string = event.params['quizId'];
    const { filter } = event.query as { filter?: string };
    const quiz = await QuizFactory.load(quizId);
    if (quiz === null) {
        throw Boom.notFound();
    }

    const sq = Database.instance.sq;
    let query = sq.from({ a: ANSWER_TABLE_NAME })
        .join({ c: CHOICES_TABLE_NAME }).on`a.choice_id = c.choice_id`
        .join({ q: QUESTION_TABLE_NAME }).on`q.question_id = a.question_id`
        .where`q.quiz_id = ${quiz.properties.quiz_id}`
        .group`a.user_id`
        .return({
            user_id: 'a.user_id',
            score: sq.l`SUM(COALESCE(c.score, 0))`
        }).order({ by: 'score', sort: 'desc' });

    if (filter === 'friends') {
        const { userId: currentUserId } = (event.auth.credentials as UserJwtClaims);
        query = query.join({ f: FRIEND_TABLE_NAME }).on`f.friend_user_id = a.user_id`
            .join({ friends_friends: FRIEND_TABLE_NAME })
            .on`friends_friends.account_user_id = f.friend_user_id AND friends_friends.friend_user_id = ${currentUserId}`
            .where`f.account_user_id = ${currentUserId}`;
    }
    console.log(query.unparameterized);

    const result = await query;

    const userScoreMap = result.reduce((carry, r) => {
        carry[r.user_id] = r.score;
        return carry;
    }, {});

    const users = await UserFactory.batchLoad(result.map(r => r.user_id));

    const standings = users.map(async (user, standing) =>
        ({
            user: await user.toResponseObject(),
            standing: standing + 1,
            score: parseInt(userScoreMap[user.properties.user_id], 10)
        })
    );

    return {
        standings: await Promise.all(standings)
    };
}


