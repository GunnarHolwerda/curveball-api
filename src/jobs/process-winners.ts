import { Database } from '../models/database';
import { QUIZZES_TABLE_NAME, Quiz } from '../models/entities/quiz';
import { QUESTION_TABLE_NAME } from '../models/entities/question';
import { SPORT_GAME_TABLE_NAME } from '../models/entities/subject';
import { globalLeaderboard } from '../queries/global-leaderboard';
import { UserFactory } from '../models/factories/user-factory';
import { Winner } from '../models/entities/winner';
import { LeaderboardRow } from '../interfaces/leaderboard-row';
import { QuizFactory } from '../models/factories/quiz-factory';

export async function processWinners() {
    await Database.instance.connect();
    const sq = Database.instance.sq;
    // Load all quiz_ids for quizzes that reference games that are completed
    const query = sq.from({ qz: QUIZZES_TABLE_NAME })
        .join({ q: QUESTION_TABLE_NAME }).on`q.quiz_id = qz.quiz_id`
        .join({ g: SPORT_GAME_TABLE_NAME }).on`q.subject_id = g.subject_id`
        .where`g.json->>status = 'closed'`.or`g.statistics->>status = 'closed'`
        .return({ quiz_id: 'qz.quiz_id' });

    const result = await query;

    const quizzes = await QuizFactory.batchLoad(result.map(r => r.quiz_id));
    for (const quiz of quizzes) {
        await createWinnersForQuiz(quiz);
    }
}

export async function createWinnersForQuiz(quiz: Quiz) {
    const leaderboard = await globalLeaderboard(quiz.properties.quiz_id);
    const winners: Array<LeaderboardRow> = [];
    const topScore = leaderboard[0].total_score;
    for (const standing of leaderboard) {
        if (standing.total_score !== topScore) {
            break;
        }
        winners.push(standing);
    }
    const winningUsers = await UserFactory.batchLoad(winners.map(w => w.user_id));
    const amountWon = quiz.getWinningsForNumberOfWinners(winningUsers.length);
    winningUsers.forEach(w => console.log(`user_id ${w.properties.user_id} won ${amountWon} in quiz ${quiz.properties.quiz_id}`));
    await Winner.batchCreate(winningUsers, quiz, amountWon);
}