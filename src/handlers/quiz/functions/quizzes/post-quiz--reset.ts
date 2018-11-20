import * as hapi from 'hapi';
import * as Boom from 'boom';
import { QuizFactory } from '../../models/factories/quiz-factory';
import { AnswerFactory } from '../../models/factories/answer-factory';

export async function postQuizReset(event: hapi.Request): Promise<object> {
    const quizId = event.path['quizId'];
    const quiz = await QuizFactory.load(quizId);
    if (quiz === null) {
        throw Boom.notFound();
    }

    quiz.properties.active = false;
    quiz.properties.completed = false;
    const questions = await quiz.getQuestions();

    for (const question of questions) {
        question.properties.sent = null;
        question.properties.expired = null;
        const answers = await AnswerFactory.loadAllForQuestion(question.properties.question_id);
        for (const answer of answers) {
            answer.properties.disabled = true;
            await answer.save();
        }
        await question.save();
    }

    await quiz.cleanUpAnswers();
    await quiz.save();

    return {
        quiz: await quiz.toResponseObject(true)
    };
}


