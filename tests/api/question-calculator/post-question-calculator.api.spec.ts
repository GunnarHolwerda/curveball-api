import { expectHttpError } from '../../resources/test-helpers';
import { QuestionResources } from '../../resources/question-resources';
import * as uuid from 'uuid/v4';
import { IQuestionTypeResponse } from '../../../src/models/entities/question-type';

describe('POST /questions/calculator', () => {
    let questionResources: QuestionResources;
    let newType: IQuestionTypeResponse;

    beforeAll(async () => {
        questionResources = new QuestionResources();
        newType = (await questionResources.createType(uuid(), uuid())).type;
    });

    it('should create and return question calculator', async () => {
        const { topics } = await questionResources.getTopics();
        const { calculator } = await questionResources.createCalculator({
            topic: topics[0].topicId,
            functionName: uuid(),
            typeId: newType.id
        });
        expect(calculator).toBeTruthy('Calculator was not created correctly');
    });

    describe('Error handling', () => {
        it('should return 400 if topic does not exist', async () => {
            await expectHttpError(questionResources.createCalculator({
                topic: -1,
                functionName: uuid(),
                typeId: newType.id
            }), 400, 'Type or topic do not exist');
        });

        it('should return 400 if type does not exist', async () => {
            const { topics } = await questionResources.getTopics();
            await expectHttpError(questionResources.createCalculator({
                topic: topics[0].topicId,
                functionName: uuid(),
                typeId: -1
            }), 400, 'Type or topic do not exist');
        });
    });
});
