import { Quiz } from '../models/entities/quiz';
import { globalLeaderboard } from '../queries/global-leaderboard';
import { UserFactory } from '../models/factories/user-factory';
import { Winner } from '../models/entities/winner';
import { LeaderboardRow } from '../interfaces/leaderboard-row';

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
    quiz.properties.closed = true;
    await quiz.save();
}