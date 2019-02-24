import { expectHttpError } from '../../resources/test-helpers';
import { QuestionManagementResources } from '../../resources/question-management-resources';
import * as uuid from 'uuid/v4';
import { IQuestionTypeResponse } from '../../../src/models/entities/question-type';
import { AccountResources } from '../../resources/account-resources';

xdescribe('POST /questions/calculator', () => {
    let questionResources: QuestionManagementResources;
    let newType: IQuestionTypeResponse;

    beforeAll(async () => {
        const { token } = await (new AccountResources).createAndLoginToAccount();
        questionResources = new QuestionManagementResources(token);
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
