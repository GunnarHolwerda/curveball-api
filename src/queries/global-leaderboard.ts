import { Database } from '../models/database';
import { ANSWER_TABLE_NAME } from '../models/entities/answer';
import { CHOICES_TABLE_NAME } from '../models/entities/question-choice';
import { QUESTION_TABLE_NAME } from '../models/entities/question';
import { LeaderboardRow } from '../interfaces/leaderboard-row';
import { SQF } from 'sqorn-pg/types/sq';

export function globalLeaderboardQuery(quizId: string): SQF {
    const sq = Database.instance.sq;
    return sq.from({
        leaderboard: sq.from({ a: ANSWER_TABLE_NAME })
            .join({ c: CHOICES_TABLE_NAME }).on`a.choice_id = c.choice_id`
            .join({ q: QUESTION_TABLE_NAME }).on`q.question_id = a.question_id`
            .where`q.quiz_id = ${quizId}`
            .group`a.user_id`
            .return({
                user_id: 'a.user_id',
                total_score: sq.l`SUM(COALESCE(c.score, 0))`
            }).order({ by: 'total_score', sort: 'desc' })
    });
}

export async function globalLeaderboard(quizId: string): Promise<Array<LeaderboardRow>> {
    const sq = Database.instance.sq;
    const query = globalLeaderboardQuery(quizId).return({
        standing: sq.l`rank() OVER (ORDER BY total_score DESC)`,
        user_id: `leaderboard.user_id`,
        total_score: `leaderboard.total_score`
    });

    const result = await query;
    return result as Array<LeaderboardRow>;
}