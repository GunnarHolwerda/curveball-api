
import { ApiResources } from './test-resources';
import { IQuizResponse } from '../../src/models/entities/quiz';
import { IQuestionResponse, QuestionResults } from '../../src/models/entities/question';
import { IUserResponse } from '../../src/models/entities/user';
import { PostQuizPayload } from '../../src/routes/handlers/quizzes/post-quizzes';
import { QuestionsPayload } from '../../src/routes/handlers/quizzes/questions/post-questions';

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

    public async createQuiz(quiz: PostQuizPayload): Promise<QuizResponse> {
        return this.makeInternalRequest(() => this.post<QuizResponse>('/quizzes', quiz));
    }

    public async getQuiz(quizId: string): Promise<FullQuizResponse> {
        return this.makeInternalRequest(() => this.get<FullQuizResponse>(`/quizzes/${quizId}`));
    }

    public async updateQuiz(quizId: string, properties: Partial<IQuizResponse>): Promise<QuizResponse> {
        return this.makeInternalRequest(() => this.put<QuizResponse>(`/quizzes/${quizId}`, properties));
    }

    public async addQuestions(quizId: string, payload: QuestionsPayload): Promise<QuestionResponse> {
        return this.makeInternalRequest(() => this.post<QuestionResponse>(`/quizzes/${quizId}/questions`, payload));
    }

    public async getQuestions(quizId: string): Promise<QuestionResponse> {
        return this.makeInternalRequest(() => this.get<QuestionResponse>(`/quizzes/${quizId}/questions`));
    }

    public async startQuiz(quizId: string): Promise<QuizStartResponse> {
        return this.makeInternalRequest(() => this.post<QuizStartResponse>(`/quizzes/${quizId}/start`));
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

    public async startQuestion(quizId: string, questionId: string): Promise<SingleQuestionResponse> {
        return this.makeInternalRequest(() => this.post<SingleQuestionResponse>(`/quizzes/${quizId}/questions/${questionId}/start`));
    }

    public async getQuestionResults(quizId: string, questionId: string): Promise<QuestionResults> {
        return this.makeInternalRequest(() => this.get<QuestionResults>(`/quizzes/${quizId}/questions/${questionId}/results`));
    }

    public async allQuizzes(): Promise<AllQuizzesResponse> {
        return this.makeInternalRequest(() => this.get<AllQuizzesResponse>(`/quizzes`));
    }

    public async getCurrentParticipants(quizId: string): Promise<{ users: Array<IUserResponse> }> {
        return this.makeInternalRequest(() => this.get<{ users: Array<IUserResponse> }>(`/quizzes/${quizId}/users`));
    }

    public async resetQuiz(quizId: string): Promise<FullQuizResponse> {
        return this.makeInternalRequest(() => this.post<FullQuizResponse>(`/quizzes/${quizId}/reset`));
    }

    public async completeQuiz(quizId: string): Promise<string> {
        return this.makeInternalRequest(() => this.post<string>(`/quizzes/${quizId}/complete`));
    }

    public async deleteQuiz(quizId: string): Promise<void> {
        return this.makeInternalRequest<void>(() => this.delete(`/quizzes/${quizId}`));
    }

    public async getLeaderboard(quizId: string, options?: { filter?: 'friends' }): Promise<LeaderboardResponse> {
        return this.get<LeaderboardResponse>(`/quizzes/${quizId}/leaderboard`, { params: options });
    }
}
