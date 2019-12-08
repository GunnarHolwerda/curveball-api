import { BaseSocketHandler } from './base-socket-handler';
import { Socket } from '../../interfaces/socket';
import { DemoScript, DemoQuestion } from '../../interfaces/demo-script';

const SlamballDemoScript: DemoScript = {
    videoUrl: 'test.mp4',
    name: 'slamball_demo',
    schedule: [35000, 90000],
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

export const Demos: { [roomName: string]: DemoScript } = {
    [SlamballDemoScript.name]: SlamballDemoScript
};

type TimeoutFunc = (callback: (...args: Array<any>) => void, ms: number, ...args: Array<any>) => NodeJS.Timeout;

export class DemoSocketHandlers extends BaseSocketHandler {
    constructor(private demo: DemoScript, private timeoutCallback: TimeoutFunc = setTimeout) {
        super();
    }

    public register(socket: Socket): void {
        super.register(socket);
        const { videoUrl, schedule, script } = this.demo;
        socket.emit('video', { url: videoUrl });
        for (let questionIndex = 0; questionIndex < script.length; questionIndex++) {
            const msDelay = schedule[questionIndex];
            const question = script[questionIndex];
            this.queueDemoQuestion(socket, question, msDelay);
        }
    }

    protected async disconnect(socket: Socket): Promise<void> {
        await super.disconnect(socket);
    }

    protected get cachePrefix(): string {
        return this.demo.videoUrl;
    }

    private queueDemoQuestion(socket: Socket, question: DemoQuestion, msDelay: number): void {
        this.timeoutCallback(() => {
            socket.emit('question', question);
        }, msDelay);
        this.timeoutCallback(() => {
            socket.emit('results', question.answers.map(a => ({ ...a, numAnswers: Math.floor(Math.random() * 10000) })));
        }, msDelay + 20000);
    }
}
