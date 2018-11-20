import * as hapi from 'hapi';
import * as Boom from 'boom';
import { createQt } from '../../models/qt';
import { UserFactory } from '../../models/factories/user-factory';
import { AnswerFactory } from '../../models/factories/answer-factory';
import { CurveballForbidden } from '../../models/curveball-error';
import { UserJwtClaims } from '../../lambda/lambda';

export async function useLife(event: hapi.Request): Promise<object> {
    const userClaims = event.auth.credentials as UserJwtClaims;
    // TODO: Get quiz Claims
    // const { userClaims, quizClaims } = event.requestContext.authorizer;
    const user = await UserFactory.load(userClaims.userId);
    if (user === null) {
        throw Boom.notFound();
    }
    const quizClaims = { iss: 'hello', sub: 'goodbye', isLastQuestion: true };
    const { iss: quizId, sub: nextQuestionId, isLastQuestion } = quizClaims;
    const lifeToUse = (await user.lives()).pop()!;
    await lifeToUse.use(nextQuestionId);
    const lastAnswer = await AnswerFactory.loadMostRecentForQuiz(quizId, user.properties.user_id)!;
    if (!lastAnswer) {
        throw new CurveballForbidden();
    }
    lastAnswer.properties.life = lifeToUse.properties.id;
    await lastAnswer.save();
    const newQt = createQt(quizId, nextQuestionId, {
        isLastQuestion,
        lifeUsed: true
    }, user.properties.user_id);

    return { token: newQt };
}


