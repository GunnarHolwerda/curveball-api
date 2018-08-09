export async function expectHttpError(promise: Promise<any>, expectedStatus: number, expectedMessage?: string): Promise<void> {
    try {
        await promise;
        fail('Expected request to fail, but it was successful');
    } catch (reason) {
        expect(reason.response.status).toEqual(expectedStatus);
        if (expectedMessage) {
            expect(reason.response.data.message).toEqual(expectedMessage);
        }
    }
}