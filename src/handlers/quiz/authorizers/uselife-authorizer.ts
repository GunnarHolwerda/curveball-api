import { CurveballForbidden } from '../models/curveball-error';
import { UserFactory } from '../models/factories/user-factory';
import { QuizFactory } from '../models/factories/quiz-factory';

export async function useLifeAuthorizer(
    specifiedUserId: string,
    userId: string, quizId: string, questionId: string, lifeUsed: string): Promise<boolean> {
    const user = await UserFactory.load(userId);
    const lives = await user.lives();
    const quiz = await QuizFactory.load(quizId);
    const questions = await quiz.getQuestions();

    const question = questions.find(q => q.properties.question_id === questionId);
    const hasFailedQuestion = await quiz.hasAnsweredIncorrectly(userId);

    if (!hasFailedQuestion) {
        throw new CurveballForbidden('User has not failed a question');
    } else if (lifeUsed) {
        throw new CurveballForbidden('User has already used a life');
    } else if (lives.length === 0) {
        throw new CurveballForbidden('User has no lives');
    } else if (question!.properties.sent) {
        throw new CurveballForbidden('Question was already sent');
    } else {
        return specifiedUserId === userId;
    }
}