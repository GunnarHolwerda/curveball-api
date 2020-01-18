import { ApiResources } from './api-resources';
import { PostQuizPayload } from '../../src/routes/handlers/quizzes/post-quizzes';
import {
    QuizResponse,
    FullQuizResponse,
    QuestionResponse,
    QuizStartResponse,
    SingleQuestionResponse,
    AllQuizzesResponse
} from './quiz-resources';
import { IQuizResponse } from '../../src/models/entities/quiz';
import { QuestionsPayload } from '../../src/routes/handlers/quizzes/questions/post-questions';
import { QuestionResults } from '../../src/models/entities/question';
import { IUserResponse } from '../../src/models/entities/user';
import { IChoiceResponse } from '../../src/models/entities/question-choice';

export class QuizManagementResources extends ApiResources {
    constructor(token: string) {
        super(token);
    }

    public async createQuiz(quiz: PostQuizPayload): Promise<QuizResponse> {
        return this.post<QuizResponse>('/quizzes', quiz);
    }

    public async getQuiz(quizId: string): Promise<FullQuizResponse> {
        return this.get<FullQuizResponse>(`/quizzes/${quizId}`);
    }

    public async updateQuiz(quizId: string, properties: Partial<IQuizResponse>): Promise<QuizResponse> {
        return this.put<QuizResponse>(`/quizzes/${quizId}`, properties);
    }

    public async addQuestions(quizId: string, payload: QuestionsPayload): Promise<QuestionResponse> {
        return this.post<QuestionResponse>(`/quizzes/${quizId}/questions`, payload);
    }

    public async getQuestions(quizId: string): Promise<QuestionResponse> {
        return this.get<QuestionResponse>(`/quizzes/${quizId}/questions`);
    }

    public async startQuiz(quizId: string): Promise<QuizStartResponse> {
        return this.post<QuizStartResponse>(`/quizzes/${quizId}/start`);
    }

    public async startQuestion(quizId: string, questionId: string): Promise<SingleQuestionResponse> {
        return this.post<SingleQuestionResponse>(`/quizzes/${quizId}/questions/${questionId}/start`);
    }

    public async getQuestionResults(quizId: string, questionId: string): Promise<QuestionResults> {
        return this.get<QuestionResults>(`/quizzes/${quizId}/questions/${questionId}/results`);
    }

    public async allQuizzes(): Promise<AllQuizzesResponse> {
        return this.get<AllQuizzesResponse>(`/quizzes`);
    }

    public async getCurrentParticipants(quizId: string): Promise<{ users: Array<IUserResponse> }> {
        return this.get<{ users: Array<IUserResponse> }>(`/quizzes/${quizId}/users`);
    }

    public async resetQuiz(quizId: string): Promise<FullQuizResponse> {
        return this.post<FullQuizResponse>(`/quizzes/${quizId}/reset`);
    }

    public async completeQuiz(quizId: string): Promise<string> {
        return this.post<string>(`/quizzes/${quizId}/complete`);
    }

    public async deleteQuiz(quizId: string): Promise<void> {
        return this.delete(`/quizzes/${quizId}`);
    }

    public async updateChoice(
        quizId: string,
        questionId: string,
        choiceId: string,
        choiceData: Partial<IChoiceResponse>
    ): Promise<IChoiceResponse> {
        return this.put(`/quizzes/${quizId}/questions/${questionId}/choices/${choiceId}`, choiceData);
    }
}