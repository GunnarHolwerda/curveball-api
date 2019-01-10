import { IQuestionResponse } from '../../src/models/entities/question';
import { ApiResources } from './test-resources';
import { IQuestionType } from '../../src/models/entities/question-type';
import { IQuestionCalculatorResponse } from '../../src/models/entities/question-calculator';
import { ITopicResponse } from '../../src/models/factories/topic-factory';


export interface SingleQuestionResponse {
    question: IQuestionResponse;
}

export interface TypeResponse {
    type: IQuestionType;
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

export class QuestionResources extends ApiResources {
    constructor(token?: string) {
        super(token);
    }

    public async updateQuestion(questionId: string, properties: Partial<IQuestionResponse>): Promise<SingleQuestionResponse> {
        return this.makeInternalRequest(() => this.put<SingleQuestionResponse>(`/questions/${questionId}`, properties));
    }

    public async createType(title: string, description: string): Promise<TypeResponse> {
        return this.makeInternalRequest(() => this.post<TypeResponse>(`/questions/type`, { title, description }));
    }

    public async getTypes(topicId?: number): Promise<{ types: Array<IQuestionType> }> {
        return this.makeInternalRequest(
            () => this.get<{ types: Array<IQuestionType> }>(`/questions/type`, { params: { forTopic: topicId } })
        );
    }

    public async createCalculator(payload: QuestionCalculatorPayload): Promise<QuestionCalculatorResponse> {
        return this.makeInternalRequest(() => this.post<QuestionCalculatorResponse>(`/questions/calculator`, payload));
    }

    public async getTopics(): Promise<QuestionTopicsResponse> {
        return this.makeInternalRequest(() => this.get<QuestionTopicsResponse>(`/questions/topics`));
    }
}

