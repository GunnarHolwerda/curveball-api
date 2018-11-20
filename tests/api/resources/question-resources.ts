
import { Test as BaseTest } from './test-resources';
import { IQuestionResponse } from '../../../src/handlers/quiz/models/question';

export namespace Test {

    export interface SingleQuestionResponse {
        question: IQuestionResponse;
    }

    export class QuestionResources extends BaseTest.ApiResources {
        constructor(token?: string) {
            super(token);
        }

        public async updateQuestion(questionId: string, properties: Partial<IQuestionResponse>): Promise<SingleQuestionResponse> {
            return this.makeInternalRequest(() => this.put<SingleQuestionResponse>(`/questions/${questionId}`, properties));
        }
    }
}
