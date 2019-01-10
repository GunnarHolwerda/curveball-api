import { QuestionResources } from '../../resources/question-resources';
import * as uuid from 'uuid/v4';
import { KnownQuestionTypes } from '../../../src/models/entities/question-type';

describe('GET /questions/type', () => {
    let questionResources: QuestionResources;

    beforeAll(async () => {
        questionResources = new QuestionResources();
    });

    describe('?forTopic', () => {
        it('should return only generic question types for Any type', async () => {
            const { type: nonGenericType } = await questionResources.createType(uuid(), uuid());
            const { types } = await questionResources.getTypes(KnownQuestionTypes.any);
            expect(types.length).toBeGreaterThan(0, 'Did not receive any topics for the Any type');
            expect(types.find(t => t.id === nonGenericType.id)).toBeUndefined('Found non generic type for Any type');
        });

        it('should return non generic question type with calculator for topic', async () => {
            const { topics } = await questionResources.getTopics();
            const { type: customType } = await questionResources.createType(uuid(), uuid());
            const selectedTopic = topics.find(t => t.machineName !== 'any')!;
            await questionResources.createCalculator({
                topic: selectedTopic.topicId,
                functionName: uuid(),
                typeId: customType.id
            });

            const { types: typesForCustomTopic } = await questionResources.getTypes(selectedTopic.topicId);
            expect(typesForCustomTopic.find(t => t.id === customType.id))
                .toBeDefined('Unable to find custom question type for topic with calculator');
        });
    });
});
