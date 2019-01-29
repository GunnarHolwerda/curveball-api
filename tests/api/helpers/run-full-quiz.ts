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
    endQuestionNumber: number;
    authenticateQuiz: boolean;
}

export async function runFullQuiz(params: Partial<FullQuizParameters> = {}): Promise<QuizResult> {
    const userTokenMap: { [userId: string]: string } = {};
    const { answeringUsers, numberOfAnswers, questions, endQuestionNumber, authenticateQuiz } = buildParamsWithDefaults(params);
    const participants = [...answeringUsers, ...(await generateUsers(numberOfAnswers - answeringUsers.length))];
    const quizResources = new QuizResources();
    const response = await quizResources.createQuiz({
        title: uuid(),
        potAmount: 500,
        auth: authenticateQuiz
    });
    await quizResources.addQuestions(response.quiz.quizId, questions);
    const startedQuiz = await quizResources.startQuiz(response.quiz.quizId);
    const { quiz } = startedQuiz;
    const answerPromises: Array<Promise<any>> = [];
    const fullQuiz = await quizResources.getQuiz(quiz.quizId);
    for (let i = 0; i <= endQuestionNumber - 1; i++) {

        const question = fullQuiz.quiz.questions[i];
        if (i > 0) {
            await quizResources.startQuestion(fullQuiz.quiz.quizId, question.questionId);
        }

        for (const p of participants) {
            answerPromises.push(new Promise((resolve, reject) => {
                const specialQuizResources = new QuizResources(p.token);
                const randomChoice = getRandomChoice(question.choices);
                return specialQuizResources.answerQuestion(
                    quiz.quizId, question.questionId, randomChoice, userTokenMap[p.user.userId]
                ).then((r) => {
                    userTokenMap[p.user.userId] = r.token;
                    resolve();
                }).catch(reject);
            }));
        }
        await Promise.all(answerPromises);
    }

    return {
        quiz: response.quiz,
        questions: questions,
        quizStart: startedQuiz
    };
}

function buildParamsWithDefaults(params: Partial<FullQuizParameters>): FullQuizParameters {
    const { answeringUsers, numberOfAnswers, questions, endQuestionNumber, authenticateQuiz } = params;
    const paramQuestions = questions === undefined ? mockQuestionsPayload : questions;
    const endQuestionNum = endQuestionNumber === undefined ? paramQuestions.questions.length : endQuestionNumber;
    return {
        answeringUsers: answeringUsers === undefined ? [] : answeringUsers,
        numberOfAnswers: numberOfAnswers === undefined ? 15 : numberOfAnswers,
        questions: paramQuestions,
        endQuestionNumber: endQuestionNum,
        authenticateQuiz: authenticateQuiz || true
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