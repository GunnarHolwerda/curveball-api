import { Subject, ISubject } from '../models/entities/subject';
import { BasicSportGame } from '../interfaces/basic-sport-game';
import { Database } from '../models/database';
import { SubjectFactory } from '../models/factories/subject-factory';
import { ChoiceFactory } from '../models/factories/choice-factory';

type SportGameSubject = Subject<ISubject> & BasicSportGame;

function loadAllGamesToday(): Promise<Array<SportGameSubject>> {
    const startDate = new Date();
    startDate.setTime(0);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);

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
    await Promise.all([
        setScoresForSubjects([game]),
        game.getRelatedSubjects().then(subjects => setScoresForSubjects(subjects))
    ]);
}

async function updateGameData(): Promise<void> {
    // Load all games that are going on today
    const games = await loadAllGamesToday();
    if (games.length === 0) {
        console.log('No games today');
        return;
    }

    let skippedGames = 0;
    let counter = 0;
    for (const game of games) {
        console.log(`Processing game ${counter + skippedGames + 1}/${games.length}`);
        if (game.isFinished()) {
            console.log('Skipping game');
            skippedGames++;
            continue;
        }
        console.log('Updating game');
        await game.updateStatistics();
        console.log('Updating scores');
        await updateScoresForGame(game);
        counter++;
    }
    console.log(`Skipped ${skippedGames}/${games.length} games`);
}
Database.instance.connect()
    .then(() => updateGameData())
    .then(() => {
        console.log('success!');
        process.exit(0);
    }).catch((err) => {
        console.error('An error occurred', err);
        process.exit(1);
    });