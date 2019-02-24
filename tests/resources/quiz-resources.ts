
import { ApiResources } from './api-resources';
import { IQuizResponse } from '../../src/models/entities/quiz';
import { IQuestionResponse } from '../../src/models/entities/question';
import { IUserResponse } from '../../src/models/entities/user';

export interface QuizResponse {
    quiz: IQuizResponse;
}

export interface QuestionResponse {
    questions: Array<IQuestionResponse>;
}

export interface SingleQuestionResponse {
    question: IQuestionResponse;
}

export interface FullQuizResponse {
    quiz: QuizAndQuestion;
}

export type QuizAndQuestion = IQuizResponse & QuestionResponse;

export interface AllQuizzesResponse {
    quizzes: Array<QuizAndQuestion>;
}

export interface QuizStartResponse {
    quiz: IQuizResponse;
    firstQuestion: IQuestionResponse;
}

// TODO: Make this the response of the completed quiz data
// export interface QuizCompleteResponse {
//     users: Array<IUserResponse>;
//     amountWon: string;
// }

export interface Standing {
    user: IUserResponse;
    standing: number;
    score: number;
}

export interface LeaderboardResponse {
    standings: Array<Standing>;
}

export class QuizResources extends ApiResources {
    constructor(token?: string) {
        super(token);
    }

    public async answerQuestion(quizId: string, questionId: string, choice: string, qt?: string): Promise<{ token: string }> {
        let quizToken: string | undefined = qt;
        if (quizToken === undefined) {
            quizToken = (await this.getQuizAccess(quizId)).token!;
        }
        const config = { ...this.config! };
        config.headers.QT = `Bearer ${quizToken}`;
        return await this.post<{ token: string }>(`/quizzes/${quizId}/questions/${questionId}/answer`, { choice }, config);
    }

    public async getQuizAccess(quizId: string): Promise<{ token: string | null }> {
        return this.get<{ token: string | null }>(`/quizzes/${quizId}/access`);
    }

    public async getLeaderboard(quizId: string, options?: { filter?: 'friends' }): Promise<LeaderboardResponse> {
        return this.get<LeaderboardResponse>(`/quizzes/${quizId}/leaderboard`, { params: options });
    }
}
