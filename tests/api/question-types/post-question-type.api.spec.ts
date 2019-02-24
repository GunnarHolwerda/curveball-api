import { expectHttpError } from '../../resources/test-helpers';
import { QuestionManagementResources } from '../../resources/question-management-resources';
import * as uuid from 'uuid/v4';
import { AccountResources } from '../../resources/account-resources';

xdescribe('POST /questions/type', () => {
    let questionResources: QuestionManagementResources;

    beforeAll(async () => {
        const { token } = await (new AccountResources()).createAndLoginToAccount();
        questionResources = new QuestionManagementResources(token);
    });

    it('should create new question type', async () => {
        const { type } = await questionResources.createType(uuid(), uuid());
        const { types } = await questionResources.getTypes();
        expect(types.find(t => t.id === type.id)).toBeTruthy('Did not create new question type');
    });

    describe('Error handling', () => {
        it('should require title and description', async () => {
            // @ts-ignore
            await expectHttpError(questionResources.createType(undefined, uuid()), 400);
            // @ts-ignore
            await expectHttpError(questionResources.createType(uuid(), undefined), 400);
        });
    });
});
