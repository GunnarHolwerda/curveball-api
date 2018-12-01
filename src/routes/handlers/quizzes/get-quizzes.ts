import { QuizFactory } from '../../../models/factories/quiz-factory';

export async function getQuizzes(): Promise<object> {
    const quizzes = await QuizFactory.loadAll();

    const quizResponses = await Promise.all(quizzes.map((q) => {
        return new Promise((res) => q.toResponseObject(true).then(c => res(c)));
    }));

    return {
        quizzes: quizResponses
    };
}


