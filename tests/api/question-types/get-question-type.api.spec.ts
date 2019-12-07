import { QuestionManagementResources } from '../../resources/question-management-resources';
import { KnownQuestionTypes } from '../../../src/models/entities/question-type';
import { AccountResources } from '../../resources/account-resources';

describe('GET /questions/type', () => {
    let questionResources: QuestionManagementResources;

    beforeAll(async () => {
        const { token } = await (new AccountResources()).createAndLoginToAccount();
        questionResources = new QuestionManagementResources(token);
    });

    describe('?forTopic', () => {
        it('should return only generic question types for Manual type', async () => {
            const { types } = await questionResources.getTypes(KnownQuestionTypes.manual);
            expect(types.length, 'Did not receive any topics for the Manual type').toBeGreaterThan(0);
            expect(types.find(t => t.generic === false), 'Found non generic type for Manual type').toBeUndefined();
        });

        it('should return non generic question type with calculator for topic', async () => {
            const { topics } = await questionResources.getTopics();
            const selectedTopic = topics.find(t => t.machineName !== 'any')!;

            const { types: typesForCustomTopic } = await questionResources.getTypes(selectedTopic.topicId);
            expect(
                typesForCustomTopic.find(t => t.machineName === 'spread'),
                'Unable to find custom question type for topic with calculator'
            )
                .toBeDefined();
        });
    });
});
