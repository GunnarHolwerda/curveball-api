import { RouteOptionsPreObject, Request, ResponseToolkit } from 'hapi';
import * as Boom from 'boom';
import { QuizFactory } from '../../models/factories/quiz-factory';
import { AccountJwtClaims } from '../../interfaces/account-jwt-claims';

export const accountQuizVerification: RouteOptionsPreObject = {
    method: async (req: Request, _1: ResponseToolkit): Promise<boolean> => {
        const { quizId } = req.params as { quizId?: string };
        const { networkId } = req.auth.credentials as AccountJwtClaims;
        if (quizId === undefined) {
            throw Boom.internal('Url is malformed for verifying quiz');
        }
        const quiz = await QuizFactory.load(quizId);
        if (quiz === null) {
            throw Boom.notFound();
        }

        if (quiz.properties.network_id !== networkId) {
            throw Boom.forbidden();
        }

        return true;
    },
    assign: 'ownerVerified',
};
