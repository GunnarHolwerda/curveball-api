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

export function trustOwnCa(): void {
    const rootCas = require('ssl-root-cas/latest').create();
    const resolve = require('path').resolve;
    rootCas.addFile(resolve('./tests/api/ssl-ca/rootCA.pem'));
    require('https').globalAgent.options.ca = rootCas;
}