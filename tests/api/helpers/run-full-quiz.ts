import { QuizResources, QuizStartResponse } from '../../resources/quiz-resources';
import { IChoiceResponse } from '../../../src/models/entities/question-choice';
import { mockQuestionsPayload } from '../mock-data';
import { UserResources, UserTokenResponse } from '../../resources/user-resources';
import * as uuid from 'uuid/v4';
import { QuestionsPayload } from '../../../src/routes/handlers/quizzes/questions/post-questions';
import { IQuizResponse } from '../../../src/models/entities/quiz';

export interface QuizResult {
    quiz: IQuizResponse;
    questions: QuestionsPayload;
    quizStart: QuizStartResponse;
}

export interface FullQuizParameters {
    answeringUsers: Array<UserTokenResponse>;
    numberOfAnswers: number;
    questions: QuestionsPayload;
}

export async function runFullQuiz(params: Partial<FullQuizParameters> = {}): Promise<QuizResult> {
    const { answeringUsers, numberOfAnswers, questions } = buildParamsWithDefaults(params);
    const participants = [...answeringUsers, ...(await generateUsers(numberOfAnswers - answeringUsers.length))];
    const quizResources = new QuizResources();
    const response = await quizResources.createQuiz({
        title: uuid(),
        potAmount: 500,
    });
    await quizResources.addQuestions(response.quiz.quizId, questions);
    const startedQuiz = await quizResources.startQuiz(response.quiz.quizId);
    const { firstQuestion, quiz } = startedQuiz;
    const answerPromises: Array<Promise<any>> = [];
    for (const p of participants) {
        answerPromises.push(new Promise((resolve, reject) => {
            const specialQuizResources = new QuizResources(p.token);
            const randomChoice = getRandomChoice(firstQuestion.choices);
            specialQuizResources.answerQuestion(
                quiz.quizId, firstQuestion.questionId, randomChoice
            ).then(resolve).catch(reject);
        }));
    }
    await Promise.all(answerPromises);
    return {
        quiz: response.quiz,
        questions: questions,
        quizStart: startedQuiz
    };
}

function buildParamsWithDefaults(params: Partial<FullQuizParameters>): FullQuizParameters {
    const { answeringUsers, numberOfAnswers, questions } = params;
    return {
        answeringUsers: answeringUsers === undefined ? [] : answeringUsers,
        numberOfAnswers: numberOfAnswers === undefined ? 15 : numberOfAnswers,
        questions: questions === undefined ? mockQuestionsPayload : questions
    };
}

async function generateUsers(count: number): Promise<Array<UserTokenResponse>> {
    const userResources = new UserResources();
    const promises = [];
    for (let i = 0; i < count; i++) {
        promises.push(userResources.getNewUser());
    }
    return Promise.all(promises);
}

function getRandomChoice(choices: Array<IChoiceResponse>): string {
    return choices[Math.floor(Math.random() * choices.length)].choiceId;
}