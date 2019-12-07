import { Request } from 'hapi';
import { QuizFactory } from '../../../models/factories/quiz-factory';
import { AccountJwtClaims } from '../../../interfaces/account-jwt-claims';

export async function getQuizzes(request: Request): Promise<object> {
    const { networkId } = request.auth.credentials as AccountJwtClaims;
    const quizzes = await QuizFactory.loadAllForNetwork(networkId);

    const quizResponses = await Promise.all(quizzes.map((q) => {
        return new Promise((res) => q.toResponseObject(true).then(c => res(c)));
    }));

    return {
        quizzes: quizResponses
    };
}


