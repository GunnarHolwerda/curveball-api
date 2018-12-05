import { IQuestionResponse } from '../../src/models/entities/question';
import { ApiResources } from './test-resources';


export interface SingleQuestionResponse {
    question: IQuestionResponse;
}

export class QuestionResources extends ApiResources {
    constructor(token?: string) {
        super(token);
    }

    public async updateQuestion(questionId: string, properties: Partial<IQuestionResponse>): Promise<SingleQuestionResponse> {
        return this.makeInternalRequest(() => this.put<SingleQuestionResponse>(`/questions/${questionId}`, properties));
    }
}

