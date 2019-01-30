import * as hapi from 'hapi';
import * as Boom from 'boom';
import { QuizFactory } from '../../../models/factories/quiz-factory';
import { Winner } from '../../../models/entities/winner';

export async function postQuizComplete(event: hapi.Request): Promise<string> {
    const quizId: string = event.params.quizId;
    const quiz = await QuizFactory.load(quizId);
    if (quiz === null) {
        throw Boom.notFound('Quiz not found');
    }

    quiz.properties.active = false;
    quiz.properties.completed_date = new Date();
    await quiz.save();
    await quiz.cleanUpAnswers();

    if (quiz.properties.auth) {
        const participants = await quiz.activeParticipants();
        if (participants.length === 0) {
            return 'ok';
        }

        const amountWon = (quiz.properties.pot_amount / participants.length).toFixed(2);
        try {
            await Winner.batchCreate(participants, quiz, Number.parseFloat(amountWon));
        } catch (e) {
            console.error('Failed to create winners', e);
            throw Boom.internal();
        }
    }

    // TODO: Create new endpoint to get winner information for a quiz
    return 'ok';
}


