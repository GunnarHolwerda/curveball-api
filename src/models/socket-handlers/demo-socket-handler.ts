import { BaseSocketHandler } from './base-socket-handler';
import { Socket } from '../../interfaces/socket';
import { IQuizResponse } from '../entities/quiz';
import { DemoScript, DemoQuestion } from '../../interfaces/demo-script';

const SlamballDemoScript: DemoScript = {
    videoUrl: 'test.mp4',
    schedule: [35000, 90000, 125000, 185000],
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

const Demos: { [roomName: string]: DemoScript } = {
    'slamball_demo': SlamballDemoScript
};

type TimeoutFunc = (callback: (...args: Array<any>) => void, ms: number, ...args: Array<any>) => NodeJS.Timeout;

export class DemoSocketHandlers extends BaseSocketHandler {
    constructor(
        private quiz: IQuizResponse,
        private demos: { [roomName: string]: DemoScript } = Demos,
        private timeoutCallback: TimeoutFunc = setTimeout
    ) {
        super();
    }

    public register(socket: Socket): void {
        super.register(socket);
        socket.on('connect', () => {
            const demo = this.demos[socket.nsp.name];
            socket.emit('video', { url: demo.videoUrl });
            for (let questionIndex = 0; questionIndex < demo.script.length; questionIndex++) {
                const msDelay = demo.schedule[questionIndex];
                const question = demo.script[questionIndex];
                this.queueDemoQuestion(socket, question, msDelay);
            }
        });
    }

    protected async disconnect(socket: Socket): Promise<void> {
        await super.disconnect(socket);
    }

    protected get cachePrefix(): string {
        return this.quiz.quizId;
    }

    private queueDemoQuestion(socket: Socket, question: DemoQuestion, msDelay: number): void {
        this.timeoutCallback(() => {
            socket.emit('question', question);
        }, msDelay);
    }
}
