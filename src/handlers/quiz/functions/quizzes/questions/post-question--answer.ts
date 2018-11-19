import * as Joi from 'joi';

import * as hapi from 'hapi';
import { Answer } from '../../../models/answer';
import { CurveballForbidden, CurveballBadRequest } from '../../../models/curveball-error';
import { createQt } from '../../../models/qt';
import { QuizFactory } from '../../../models/factories/quiz-factory';
import { UserJwtClaims } from '../../../lambda/lambda';

export const questionsAnswerSchema = Joi.object().keys({
    choice: Joi.string().required()
});

export interface QuestionsAnswerPayload {
    choice: string;
}

export async function answerQuestion(event: hapi.Request): Promise<object> {
    const { userId, username, name } = event.auth.credentials as UserJwtClaims;
    console.log('username', username);
    console.log('name', name);
    // Get QUIZ claims
    // const { lifeUsed } = getQuizClaims(event.headers['QT']);
    const { choice: choiceText } = event.payload as QuestionsAnswerPayload;

    const { quizId, questionId } = event.params;
    const quiz = await QuizFactory.load(quizId);
    const allQuestions = await quiz.getQuestions();
    const question = allQuestions.find(q => q.properties.question_id === questionId)!;
    if (!question!.properties.sent) {
        throw new CurveballForbidden('Question has not been started');
    }

    if (new Date(question!.properties.expired!) <= new Date((new Date()).toISOString())) {
        throw new CurveballForbidden('Question expired');
    }

    // If answer is correct return new QT with aud for userId of the jwt
    const choices = await question.choices();
    const selectedChoice = choices.find(c => c.properties.text === choiceText);
    if (selectedChoice === undefined) {
        throw new CurveballBadRequest('Choice does not exist');
    }
    const isCorrect = selectedChoice!.properties.is_answer;

    if (await Answer.existsForUser(quizId, questionId, userId)) {
        throw new CurveballForbidden('User already has an answer for this question');
    }

    await Answer.create(quizId, questionId, userId, selectedChoice.properties.choice_id);

    if (!isCorrect && quiz.properties.auth) {
        await quiz.markUserAsIncorrect(userId);
    }

    const nextQuestion = allQuestions.find(q => q.properties.question_num === (question!.properties.question_num + 1));

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
