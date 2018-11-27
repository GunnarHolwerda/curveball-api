import * as hapi from 'hapi';
import * as Boom from 'boom';
import { createQt } from '../../models/qt';
import { UserFactory } from '../../models/factories/user-factory';
import { AnswerFactory } from '../../models/factories/answer-factory';
import { UserJwtClaims, AllQtClaims } from '../../lambda/lambda';
import { QuestionFactory } from '../../models/factories/question-factory';

export async function useLife(event: hapi.Request): Promise<object> {
    const userClaims = event.auth.credentials as UserJwtClaims;
    const { qtClaims } = event.pre as { qtClaims: AllQtClaims };
    const user = await UserFactory.load(userClaims.userId);
    if (user === null) {
        throw Boom.notFound();
    }
    const { iss: quizId, sub: nextQuestionId, isLastQuestion, lifeUsed } = qtClaims;
    if (lifeUsed) {
        throw Boom.forbidden('User has already used a life');
    }
    const questions = await QuestionFactory.loadAllForQuiz(quizId);
    const nextQuestion = (questions).find(q => q.properties.question_id === nextQuestionId);
    if (nextQuestion && nextQuestion.properties.sent) {
        throw Boom.forbidden('Question was already sent');
    }
    const lives = await user.lives();
    if (lives.length === 0) {
        throw Boom.forbidden('User has no lives');
    }
    const lifeToUse = lives.pop()!;
    await lifeToUse.use(nextQuestionId);
    const lastAnswer = await AnswerFactory.loadMostRecentForQuiz(quizId, user.properties.user_id)!;
    if (!lastAnswer) {
        throw Boom.forbidden();
    }
    const newQt = createQt(quizId, nextQuestionId, {
        isLastQuestion,
        lifeUsed: true
    }, user.properties.user_id);

    return { token: newQt };
}


