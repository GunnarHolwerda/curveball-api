import { BaseSocketHandler } from './base-socket-handler';
import { Socket } from '../../interfaces/socket';
import { AnalyticsEvents } from '../../types/events';
import { Analytics } from '../analytics';
import { IQuizRoom } from '../../interfaces/quiz';
import { UserFactory } from '../factories/user-factory';

export class QuizSocketHandlers extends BaseSocketHandler {

    constructor(private quiz: IQuizRoom) {
        super();
    }

    public register(socket: Socket): void {
        super.register(socket);
        UserFactory.load(socket.user.userId).then((user) => {
            Analytics.instance.track(user!, AnalyticsEvents.joinedShow, { quiz: this.quiz });
            Analytics.instance.incrementProperty(user!, 'showsJoined', 1);
        });
        socket.on('complete', () => {
            UserFactory.load(socket.user.userId).then((user) => {
                Analytics.instance.track(user!, AnalyticsEvents.reachedEndOfShow, { quiz: this.quiz });
            });
        });
    }

    protected async disconnect(socket: Socket): Promise<void> {
        super.disconnect(socket);
        UserFactory.load(socket.user.userId).then((user) => {
            Analytics.instance.track(user!, AnalyticsEvents.leftShow, {
                quiz: this.quiz
            });
        });
    }

    protected get cachePrefix(): string {
        return this.quiz.quizId;
    }
}