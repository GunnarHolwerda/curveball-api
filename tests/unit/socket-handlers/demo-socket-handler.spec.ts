import { DemoScript } from '../../../src/interfaces/demo-script';
import { DemoSocketHandlers } from '../../../src/models/socket-handlers/demo-socket-handler';
import { Socket } from '../../../src/interfaces/socket';
import { mock, anything, verify, instance, anyString, when } from 'ts-mockito';

const TestDemoScript: DemoScript = {
    videoUrl: 'test.mp4',
    name: 'test',
    schedule: [1000, 2000],
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

interface QueuedMessages { msDelay: number; callback: Function; }
interface ExpectedMessages { msDelay: number; validate: Function; }

describe('DemoSocketHandlers', () => {
    let socketHandlers: DemoSocketHandlers;
    let mockSocket: Socket;
    let socket: Socket;

    let eventHandlers: { [eventName: string]: (...args: Array<any>) => void } = {};
    let queuedMessages: Array<QueuedMessages> = [];

    const verifyQueuedMessages = (expectedMessages: Array<ExpectedMessages>, actualMessages: Array<QueuedMessages>): void => {
        expect(expectedMessages.length, 'Did not receive the number of expected messages').toEqual(actualMessages.length);
        for (let i = 0; i < expectedMessages.length; i++) {
            const expectedMessage = expectedMessages[i];
            const actualMessage = actualMessages[i];
            expect(expectedMessage.msDelay, 'Message delay did not match expected').toEqual(actualMessage.msDelay);
            actualMessage.callback();
            expectedMessage.validate();
        }
    };

    beforeEach(() => {
        socketHandlers = new DemoSocketHandlers(
            TestDemoScript,
            (callback, msDelay) => {
                queuedMessages.push({ msDelay, callback });
                return setTimeout(() => { }, 0);
            }
        );
        mockSocket = mock<Socket>();
        when(mockSocket.on(anyString(), anything())).thenCall((eventName: string, callback: (...args: Array<any>) => void) => {
            eventHandlers[eventName] = callback;
        });
        when(mockSocket.emit(anyString(), anything())).thenCall((eventName: string, data: any) => {
            if (eventName in eventHandlers) {
                eventHandlers[eventName](data);
            }
        });
        when(mockSocket.emit(anyString())).thenCall((eventName: string, data: any) => {
            if (eventName in eventHandlers) {
                eventHandlers[eventName](data);
            }
        });
        when(mockSocket.nsp).thenReturn({ name: TestDemoScript.name } as any);
        socket = instance(mockSocket);
    });

    afterEach(() => {
        queuedMessages = [];
        eventHandlers = {};
    });

    it('should emit video event when a new socket registers', () => {
        socketHandlers.register(socket);
        verify(mockSocket.emit('video', anything())).once();
    });

    it('should emit scripted demo questions and results at specified intervals', () => {
        socketHandlers.register(socket);
        socket.emit('connect');

        expect(queuedMessages.length, 'Did not receive two queued messages per question').toEqual(TestDemoScript.schedule.length * 2);

        const { schedule, script } = TestDemoScript;
        const expectedMessages: Array<ExpectedMessages> = [
            { msDelay: schedule[0], validate: () => verify(mockSocket.emit('question', script[0])).once() },
            { msDelay: schedule[0] + 20000, validate: () => verify(mockSocket.emit('results', anything())).once() },
            { msDelay: schedule[1], validate: () => verify(mockSocket.emit('question', script[1])).once() },
            { msDelay: schedule[1] + 20000, validate: () => verify(mockSocket.emit('results', anything())).twice() },
        ];
        verifyQueuedMessages(expectedMessages, queuedMessages);
    });
});