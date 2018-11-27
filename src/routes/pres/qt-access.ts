import { RouteOptionsPreObject, Request, ResponseToolkit } from 'hapi';
import * as Boom from 'boom';
import { QuizFactory } from '../../handlers/quiz/models/factories/quiz-factory';
import { verifyQt } from '../../handlers/quiz/authorizers/helpers/verify-qt';
import { UserJwtClaims } from '../../handlers/quiz/lambda/lambda';
import { getQtTokenFromHeader } from './extract-quiz-claims';

export const qtPreRouteHandler: RouteOptionsPreObject = {
    method: async (request: Request, _: ResponseToolkit): Promise<any> => {
        const token = getQtTokenFromHeader(request);
        if (!token) {
            throw Boom.forbidden();
        }

        const { quizId, questionId } = request.params as { quizId: string; questionId: string };
        const quiz = await QuizFactory.load(quizId);
        if (quiz === null) {
            throw Boom.notFound();
        }

        const userClaims = request.auth.credentials as UserJwtClaims;

        const claims = verifyQt(token, quizId, questionId, userClaims, quiz.properties.auth);

        return claims;
    },
    assign: 'quizClaims',

};
