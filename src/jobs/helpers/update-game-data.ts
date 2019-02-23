import { Subject, ISubject } from '../../models/entities/subject';
import { BasicSportGame } from '../../interfaces/basic-sport-game';
import { SubjectFactory } from '../../models/factories/subject-factory';
import { ChoiceFactory } from '../../models/factories/choice-factory';
import { Database } from '../../models/database';
import { QUESTION_TABLE_NAME } from '../../models/entities/question';
import { CHOICES_TABLE_NAME } from '../../models/entities/question-choice';
import { createWinnersForQuiz } from '../process-winners';
import { QuizFactory } from '../../models/factories/quiz-factory';

type SportGameSubject = Subject<ISubject> & BasicSportGame;

function loadAllGamesToday(): Promise<Array<SportGameSubject>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 1);

    return SubjectFactory.loadAllSportsGamesBetweenDate(startDate, endDate) as Promise<Array<SportGameSubject>>;
}

async function setScoresForSubjects(subjects: Array<Subject<ISubject>>): Promise<void> {
    for (const subject of subjects) {
        const choices = await ChoiceFactory.loadAllBySubjectId(subject.properties.subject_id);
        if (choices.length === 0) {
            continue;
        }
        await Promise.all([
            choices.map(async (c) => {
                const question = await c.question;
                const scorer = await question.getScorer();
                if (scorer === null) {
                    return;
                }
                const score = await scorer.calculateScoreForSubject(subject, c);
                c.properties.score = score;
                await c.save();
            })
        ]);
    }
}

async function completedRelatedQuizzes(subjects: Array<Subject<ISubject>>): Promise<void> {
    const subjectIds = subjects.map(s => s.properties.subject_id);
    const sq = Database.instance.sq;
    const quizzesFromQuestions = sq.from(QUESTION_TABLE_NAME)
        .where(sq.raw(`subject_id IN (${subjectIds.map(id => `${id}`).join(',')})`))
        .return`quiz_id`;
    const quizzesFromChoices = sq.from({ c: CHOICES_TABLE_NAME })
        .join({ q: QUESTION_TABLE_NAME }).where`q.question_id = c.question_id`
        .where(sq.raw(`subject_id IN (${subjectIds.map(id => `${id}`).join(',')})`))
        .return`q.quiz_id`;
    const query = quizzesFromQuestions.union(quizzesFromChoices);
    const result = await query;
    const quizzes = await QuizFactory.batchLoad(result.map(r => r.quiz_id) as Array<string>);
    for (const quiz of quizzes) {
        await createWinnersForQuiz(quiz);
    }
}

async function updateScoresAndCompleteQuizzes(game: SportGameSubject): Promise<void> {
    try {
        const relatedSubjects = [...(await game.getRelatedSubjects()), game];
        await setScoresForSubjects(relatedSubjects);
        if (game.isFinished()) {
            await completedRelatedQuizzes(relatedSubjects);
        }
    } catch (e) {
        console.error('Error setting scores for related subjects', e);
    }
}

export async function updateGameData(): Promise<void> {
    // Load all games that are going on today
    const games = (await loadAllGamesToday());
    if (games.length === 0) {
        console.log('No games today');
        return;
    }

    let skippedGames = 0;
    let counter = 0;
    let errors = 0;
    for (const game of games) {
        console.log(`Processing game ${game.properties.subject_id} ${counter + skippedGames + 1}/${games.length}`);
        try {
            if (game.isFinished()) {
                console.log('Game is completed, skipping game');
                skippedGames++;
                continue;
            }
            await game.updateStatistics();
            await updateScoresAndCompleteQuizzes(game);
            counter++;
        } catch (e) {
            console.error(`Failed to update ${game.properties.subject_id}`);
            errors++;
        }
    }
    console.log(`Updated ${games.length - skippedGames} games. Skipped ${skippedGames}. ${errors} errors`);
}