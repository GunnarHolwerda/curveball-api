import { LeaderboardRow } from '../interfaces/leaderboard-row';
import { Database } from '../models/database';

export async function friendLeaderboard(currentUserId: string, quizId: string): Promise<Array<LeaderboardRow>> {
    const sq = Database.instance.sq;
    const query = sq.l`select
            rank() OVER (ORDER BY total_score DESC) as standing,
            board.user_id as user_id,
            board.total_score as total_score
        from (
            select * from (
                select a.user_id as user_id, SUM(COALESCE(c.score, 0)) as total_score
                from answer_submission as a
                    join questions_choices as c on (a.choice_id = c.choice_id)
                    join questions as q on (q.question_id = a.question_id)
                where (q.quiz_id = ${quizId})
                group by a.user_id
                order by total_score desc
        ) as leaderboard
            where leaderboard.user_id IN (
                SELECT outgoing.friend_user_id FROM friends outgoing
                    JOIN friends incoming ON incoming.account_user_id = outgoing.friend_user_id
                WHERE outgoing.account_user_id = ${currentUserId}
                    AND outgoing.deleted = FALSE
                    AND incoming.deleted = FALSE
                GROUP BY outgoing.id
            ) OR leaderboard.user_id = ${currentUserId}
        ) as board;`;

    const result = await query;
    return result as Array<LeaderboardRow>;
}

// Query to get friend leaderboard with standings relative to global leaderboard
// sq.l` SELECT standing, scored_board.user_id, scored_board.total_score FROM (
//     SELECT rank() OVER (ORDER BY total_score DESC) as standing, leaderboard.* FROM (
//         select
//             a.user_id as user_id,
//             SUM(COALESCE(c.score, 0)) as total_score
//         from answer_submission as a
//             join questions_choices as c on (a.choice_id = c.choice_id)
//             join questions as q on (q.question_id = a.question_id)
//         where (q.quiz_id = ${quizId})
//         group by a.user_id
//         order by total_score desc
//         ) as leaderboard
//     ) as scored_board
//         join friends as f on (f.friend_user_id = scored_board.user_id)
//         join friends as friends_friends on (friends_friends.account_user_id = f.friend_user_id
//             AND friends_friends.friend_user_id = ${currentUserId} AND friends_friends.deleted = false)
//     where (f.account_user_id = ${currentUserId})`;