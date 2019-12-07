import { DemoScript } from '../../../src/interfaces/demo-script';
import { DemoSocketHandlers } from '../../../src/models/socket-handlers/demo-socket-handler';
import { Socket } from '../../../src/interfaces/socket';
import { mock, anything, verify, instance, anyString, when } from 'ts-mockito';

const TestDemoScript: DemoScript = {
    videoUrl: 'test.mp4',
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

describe('DemoSocketHandlers', () => {
    let socketHandlers: DemoSocketHandlers;
    let mockSocket: Socket;
    let socket: Socket;

    let eventHandlers: { [eventName: string]: (...args: Array<any>) => void } = {};
    let queuedMessages: Array<{ msDelay: number, callback: Function }> = [];

    beforeEach(() => {
        socketHandlers = new DemoSocketHandlers(
            {} as any,
            { 'test': TestDemoScript },
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
        when(mockSocket.nsp).thenReturn({ name: 'test' } as any);
        socket = instance(mockSocket);
    });

    afterEach(() => {
        queuedMessages = [];
        eventHandlers = {};
    });

    it('should wire up connect event when registering', () => {
        socketHandlers.register(socket);
        verify(mockSocket.on('connect', anything())).once();
    });

    it('should emit video event on connect event', () => {
        socketHandlers.register(socket);
        socket.emit('connect');
        verify(mockSocket.emit('video', anything())).once();
    });

    it('should emit scripted demo questions at specified intervals', () => {
        socketHandlers.register(socket);
        socket.emit('connect');

        expect(queuedMessages.length, 'Did not queue all questions in script').toEqual(TestDemoScript.schedule.length);
        for (let i = 0; i < queuedMessages.length; i++) {
            const queuedMessage = queuedMessages[i];
            const expectedDelay = TestDemoScript.schedule[i];
            const expectedQuestion = TestDemoScript.script[i];
            expect(queuedMessage.msDelay, `Delay does not match expected delay for question ${i}`).toEqual(expectedDelay);

            queuedMessage.callback();
            verify(mockSocket.emit('question', expectedQuestion)).once();
        }
    });
});