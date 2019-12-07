import { IQuestionResponse } from '../../src/models/entities/question';
import { ApiResources } from './api-resources';
import { IQuestionTypeResponse } from '../../src/models/entities/question-type';
import { IQuestionCalculatorResponse } from '../../src/models/entities/question-calculator';
import { ITopicResponse } from '../../src/models/factories/topic-factory';


export interface SingleQuestionResponse {
    question: IQuestionResponse;
}

export interface TypeResponse {
    type: IQuestionTypeResponse;
}

export interface QuestionCalculatorPayload {
    topic: number;
    functionName: string;
    typeId: number;
}

export interface QuestionCalculatorResponse {
    calculator: IQuestionCalculatorResponse;
}

export interface QuestionTopicsResponse {
    topics: Array<ITopicResponse>;
}

export class QuestionManagementResources extends ApiResources {
    constructor(token: string) {
        super(token);
    }

    public async updateQuestion(questionId: string, properties: Partial<IQuestionResponse>): Promise<SingleQuestionResponse> {
        return this.put<SingleQuestionResponse>(`/questions/${questionId}`, properties);
    }

    public async createType(title: string, description: string): Promise<TypeResponse> {
        return this.post<TypeResponse>(`/questions/type`, { title, description });
    }

    public async getTypes(topicId?: number): Promise<{ types: Array<IQuestionTypeResponse> }> {
        return this.get<{ types: Array<IQuestionTypeResponse> }>(`/questions/type`, { params: { forTopic: topicId } });
    }

    public async createCalculator(payload: QuestionCalculatorPayload): Promise<QuestionCalculatorResponse> {
        return this.post<QuestionCalculatorResponse>(`/questions/calculator`, payload);
    }

    public async getTopics(): Promise<QuestionTopicsResponse> {
        return this.get<QuestionTopicsResponse>(`/questions/topics`);
    }
}

