import { IQuestionResponse } from '../../src/models/entities/question';
import { ApiResources } from './test-resources';
import { IQuestionType } from '../../src/models/entities/question-type';


export interface SingleQuestionResponse {
    question: IQuestionResponse;
}

export interface TypeResponse {
    type: IQuestionType;
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

    public async getTypes(): Promise<{ types: Array<IQuestionType> }> {
        return this.makeInternalRequest(() => this.get<{ types: Array<IQuestionType> }>(`/questions/type`));
    }
}

