import { QuizFactory } from '../../../models/factories/quiz-factory';
import * as hapi from 'hapi';

export async function getQuizUsers(event: hapi.Request): Promise<object> {
    const quizId: string = event.path['quizId'];
    const quiz = await QuizFactory.load(quizId);

    const participants = await quiz.activeParticipants();

    return {
        users: participants.map(p => p.toResponseObject())
    };
}
