import * as Joi from 'joi';
import * as Boom from 'boom';
import * as hapi from 'hapi';
import { UserJwtClaims } from '../../../../interfaces/user-jwt-claims';
import { AllQtClaims } from '../../../../types/qt';
import { QuizFactory } from '../../../../models/factories/quiz-factory';
import { Answer } from '../../../../models/entities/answer';
import { createQt } from '../../../../util/create-qt';

export const questionsAnswerSchema = Joi.object().keys({
    choice: Joi.string().required().description('The choice id of the choice being submitted')
});

export interface QuestionsAnswerPayload {
    choice: string;
}

export async function answerQuestion(event: hapi.Request): Promise<object> {
    const { userId } = event.auth.credentials as UserJwtClaims;
    const { lifeUsed } = event.pre.quizClaims as AllQtClaims;
    const { choice: choiceId } = event.payload as QuestionsAnswerPayload;

    const { quizId, questionId } = event.params;
    const quiz = await QuizFactory.load(quizId);
    if (quiz === null) {
        throw Boom.notFound();
    }
    const allQuestions = await quiz.getQuestions();
    const question = allQuestions.find(q => q.properties.question_id === questionId)!;
    if (!question!.properties.sent) {
        throw Boom.forbidden('Question has not been started');
    }

    if (new Date(question!.properties.expired!) <= new Date((new Date()).toISOString())) {
        throw Boom.forbidden('Question expired');
    }

    // If answer is correct return new QT with aud for userId of the jwt
    const choices = await question.choices();
    const selectedChoice = choices.find(c => c.properties.choice_id === choiceId);
    if (selectedChoice === undefined) {
        throw Boom.badRequest('Choice does not exist');
    }
    const isCorrect = selectedChoice!.properties.is_answer;

    if (await Answer.existsForUser(quizId, questionId, userId)) {
        throw Boom.forbidden('User already has an answer for this question');
    }

    await Answer.create(quizId, questionId, userId, selectedChoice.properties.choice_id);

    if (!isCorrect && quiz.properties.auth) {
        await quiz.markUserAsIncorrect(userId);
    }

    const nextQuestion = allQuestions.find(q => q.properties.question_num === (question!.properties.question_num + 1));

    // const user = (await UserFactory.load(userId))!;
    // Removed in favor of client side event
    // Analytics.instance.track(user, AnalyticsEvents.answeredQuestion, {
    //     selectedChoice: selectedChoice.properties.text,
    //     choices: (await question.choices()).map(c => c.analyticsProperties())
    // }, [quiz, question]);

    if (!nextQuestion) {
        return { token: null };
    }
    const newQt = createQt(quizId, nextQuestion!.properties.question_id, {
        isLastQuestion: !allQuestions.find(q => q.properties.question_num > nextQuestion!.properties.question_num),
        lifeUsed
    }, userId);

    return { token: newQt };
}

// Add validation of QT (validate aud if question is not first question)

