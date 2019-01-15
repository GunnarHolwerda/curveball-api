import { Row } from 'sqorn-pg/types/methods';
import { Subject, ISubject } from '../models/entities/subject';

function loadAllGamesToday(): Array<Row> {
    return [];
}

function transformToSubject(subject: Array<Row>): Array<any> {
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

async function updateScoresForGame(game: Subject<ISubject>): Promise<void> {
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
        await game.updateDetails();
        await updateScoresForGame(game);
    }
}

updateGameData().then(() => {
    console.log('success!');
}).catch((err) => {
    console.error(err);
});