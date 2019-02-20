import { QuestionResources } from '../../resources/question-resources';
import { KnownQuestionTypes } from '../../../src/models/entities/question-type';

describe('GET /questions/type', () => {
    let questionResources: QuestionResources;

    beforeAll(async () => {
        questionResources = new QuestionResources();
    });

    describe('?forTopic', () => {
        it('should return only generic question types for Manual type', async () => {
            const { types } = await questionResources.getTypes(KnownQuestionTypes.manual);
            expect(types.length).toBeGreaterThan(0, 'Did not receive any topics for the Manual type');
            expect(types.find(t => t.generic === false)).toBeUndefined('Found non generic type for Manual type');
        });

        it('should return non generic question type with calculator for topic', async () => {
            const { topics } = await questionResources.getTopics();
            const selectedTopic = topics.find(t => t.machineName !== 'any')!;

            const { types: typesForCustomTopic } = await questionResources.getTypes(selectedTopic.topicId);
            expect(typesForCustomTopic.find(t => t.machineName === 'spread'))
                .toBeDefined('Unable to find custom question type for topic with calculator');
        });
    });
});
