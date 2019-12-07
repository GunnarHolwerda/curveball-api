import { DemoScript } from '../../../src/interfaces/demo-script';
import { DemoSocketHandlers } from '../../../src/models/socket-handlers/demo-quiz-handler';

const TestDemoScript: DemoScript = {
    videoUrl: 'test.mp4',
    schedule: [1000, 2000, 3000, 4000],
    script: [
        {
            question: 'What is the color of the sky?',
            type: 'poll',
            answers: [
                { text: 'Blue', },
                { text: 'Purple' },
                { text: 'Yellow' },
            ]
        },
        {
            question: 'What is the color of the ground?',
            type: 'poll',
            answers: [
                { text: 'Brown', },
                { text: 'Blue' },
                { text: 'Green' },
            ]
        }
    ]
};

describe('DemoSocketHandlers', () => {
    let socketHandlers: DemoSocketHandlers;
    let mockSocket: SocketIO.Socket;

    beforeEach(() => {
        socketHandlers = new DemoSocketHandlers({} as any, { 'test': TestDemoScript });
        mockSocket = {} as any;
        console.log(socketHandlers);
        console.log(mockSocket);
    });

    it('should emit the video event immediatly', () => {
        fail();
    });

    it('should emit scripted demo questions at specified intervals', () => {
        fail();
    });
});