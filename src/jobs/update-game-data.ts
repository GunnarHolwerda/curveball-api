import { Row } from 'sqorn-pg/types/methods';
import { Subject, ISubject } from '../models/entities/subject';
import { SportGame } from '../interfaces/sport-game';

type SportGameSubject = Subject<ISubject> & SportGame;

function loadAllGamesToday(): Array<Row> {
    return [];
}

function transformToSubject(subject: Array<Row>): Array<SportGameSubject> {
    console.log(subject);
    return [];
}

async function setScoresForSubjects(subjects: Array<Subject<ISubject>>): Promise<void> {
    for (const subject of subjects) {
        const choices = await subject.getRelatedChoices();
        if (choices.length === 0) {
            continue;
        }
        await Promise.all([
            choices.map(c => c.setScoreForSubject(subject))
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
    const subjects = await loadAllGamesToday();
    if (subjects.length === 0) {
        return;
    }

    // Turn them into game objects
    const games = await transformToSubject(subjects);

    for (const game of games) {
        if (game.isFinished()) {
            continue;
        }
        await game.updateStatistics();
        await updateScoresForGame(game);
    }
}

updateGameData().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
});