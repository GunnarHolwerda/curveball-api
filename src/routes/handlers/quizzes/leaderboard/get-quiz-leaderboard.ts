import * as hapi from 'hapi';
import * as Boom from 'boom';
import { QuizFactory } from '../../../../models/factories/quiz-factory';
import { Database } from '../../../../models/database';
import { ANSWER_TABLE_NAME } from '../../../../models/entities/answer';
import { CHOICES_TABLE_NAME } from '../../../../models/entities/question-choice';
import { QUESTION_TABLE_NAME } from '../../../../models/entities/question';
import { UserFactory } from '../../../../models/factories/user-factory';

export async function getQuizLeaderboard(event: hapi.Request): Promise<object> {
    const quizId: string = event.params['quizId'];
    const quiz = await QuizFactory.load(quizId);
    if (quiz === null) {
        throw Boom.notFound();
    }

    const sq = Database.instance.sq;
    const result = await sq.from({ a: ANSWER_TABLE_NAME })
        .join({ c: CHOICES_TABLE_NAME }).on`a.choice_id = c.choice_id`
        .join({ q: QUESTION_TABLE_NAME }).on`q.question_id = a.question_id`
        .where`q.quiz_id = ${quiz.properties.quiz_id}`
        .group`a.user_id`
        .return({
            user_id: 'a.user_id',
            score: sq.l`SUM(COALESCE(c.score, 0))`
        }).order({ by: 'score', sort: 'desc' });

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


