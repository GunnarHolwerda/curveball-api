import * as hapi from 'hapi';
import * as Boom from 'boom';
import { QuizFactory } from '../../models/factories/quiz-factory';
import { Winner } from '../../models/winner';

export async function postQuizComplete(event: hapi.Request): Promise<object> {
    const quizId: string = event.path['quizId'];
    const quiz = await QuizFactory.load(quizId);
    if (quiz === null) {
        throw Boom.notFound();
    }
    const participants = await quiz.activeParticipants();

    quiz.properties.active = false;
    quiz.properties.completed = true;
    // TODO: add this
    // quiz.properties.completedAt = (new Date()).toISOString();
    await quiz.save();
    await quiz.cleanUpAnswers();

    if (participants.length === 0) {
        return {
            users: [],
            amountWon: 0
        };
    }

    const amountWon = (quiz.properties.pot_amount / participants.length).toFixed(2);
    try {
        await Winner.batchCreate(participants, quiz, Number.parseFloat(amountWon));
    } catch (e) {
        console.error('Failed to create winners');
        throw e;
    }

    return {
        users: participants.map(p => p.toResponseObject()),
        amountWon: amountWon
    };
}


