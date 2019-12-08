import * as hapi from '@hapi/hapi';
import * as Boom from '@hapi/boom';
import { QuizFactory } from '../../../models/factories/quiz-factory';
import { Winner } from '../../../models/entities/winner';

export async function postQuizComplete(event: hapi.Request): Promise<object> {
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
            return { message: 'ok' };
        }

        const amountWon = quiz.getWinningsForNumberOfWinners(participants.length);
        try {
            await Winner.batchCreate(participants, quiz, amountWon);
        } catch (e) {
            console.error('Failed to create winners', e);
            throw Boom.internal();
        }
    }

    // TODO: Create new endpoint to get winner information for a quiz
    return { message: 'ok' };
}


