import { Subject, ISubject } from '../../models/entities/subject';
import { BasicSportGame } from '../../interfaces/basic-sport-game';
import { SubjectFactory } from '../../models/factories/subject-factory';
import { ChoiceFactory } from '../../models/factories/choice-factory';

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

async function updateScoresForGame(game: SportGameSubject): Promise<void> {
    try {
        await setScoresForSubjects([game]);
    } catch (e) {
        console.error('Error setting scores for subject', e);
    }

    try {
        const relatedSubjects = await game.getRelatedSubjects();
        await setScoresForSubjects(relatedSubjects);
    } catch (e) {
        console.error('Error setting scores for related subjects', e);
    }
}

export async function retrieveStatsAndUpdateChoices(game: SportGameSubject): Promise<boolean> {
    if (game.isFinished()) {
        console.log('Game is completed, skipping game');
        return false;
    }
    console.log('Updating game');
    await game.updateStatistics();
    console.log('Updating scores');
    await updateScoresForGame(game);
    return true;
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
            const didUpdate = await retrieveStatsAndUpdateChoices(game);
            if (!didUpdate) {
                skippedGames++;
                continue;
            }
            counter++;
        } catch (e) {
            console.error(`Failed to update ${game.properties.subject_id}`);
            errors++;
        }
    }
    console.log(`Updated ${games.length - skippedGames} games. Skipped ${skippedGames}. ${errors} errors`);
}