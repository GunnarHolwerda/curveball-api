import { Question, QUESTION_TABLE_NAME } from './question';
import { IUser, User, USER_TABLE_NAME } from './user';
import { CbRedis } from '../cb-redis';
import { Database } from '../database';
import { QuestionFactory } from '../factories/question-factory';
import { Cacheable } from '../../interfaces/cacheable';
import { EventEmitter } from 'events';
import { CHOICES_TABLE_NAME } from './question-choice';
import { POWERUP_TABLE_NAME } from './powerup';
import { Analyticize, AnalyticsProperties } from '../../interfaces/analyticize';
import { camelizeKeys } from '../../util/camelize-keys';
import { ANSWER_TABLE_NAME } from './answer';
import { QuizFactory } from '../factories/quiz-factory';
import { omit } from '../../util/omit';

export interface IQuiz {
    quiz_id: string;
    active: boolean;
    title: string;
    pot_amount: number;
    completed: boolean;
    created: Date;
    auth: boolean;
    deleted: boolean;
}

export interface IQuizResponse {
    quizId: string;
    active: boolean;
    title: string;
    potAmount: number;
    completed: boolean;
    created: string;
    auth: boolean;
    deleted: boolean;
}

export const QUIZZES_TABLE_NAME = 'quizzes';

export class Quiz implements Cacheable, Analyticize {
    public properties: IQuiz;
    public static events: EventEmitter = new EventEmitter();

    constructor(private _quiz: IQuiz) {
        this.properties = { ...this._quiz };
    }

    public static async create(quiz: Partial<IQuiz>): Promise<Quiz> {
        const sq = Database.instance.sq;
        const result = await sq.from(QUIZZES_TABLE_NAME).insert({ ...quiz }).return`quiz_id`;
        return (await QuizFactory.load(result[0].quiz_id as string))!;
    }

    public async markUserAsIncorrect(userId: string): Promise<boolean> {
        await CbRedis.instance.client.set(`wrong-answer-${this.properties.quiz_id}-${userId}`, true);
        return true;
    }

    public async hasAnsweredIncorrectly(userId: string): Promise<boolean> {
        return +(await CbRedis.instance.client.exists(`wrong-answer-${this.properties.quiz_id}-${userId}`)) === 1;
    }

    public async delete(): Promise<void> {
        this.properties.deleted = true;
        await this.save();
    }

    public async save(): Promise<void> {
        const sq = Database.instance.sq;
        await sq.from(QUIZZES_TABLE_NAME).set({ ...omit(this.properties, ['quiz_id']) }).where`quiz_id = ${this._quiz.quiz_id}`;
        this._quiz = { ...this.properties };
        Quiz.events.emit('save', this);
    }

    public cachify(): string {
        return JSON.stringify(this.properties);
    }

    public async getQuestions(): Promise<Array<Question>> {
        return QuestionFactory.loadAllForQuiz(this.properties.quiz_id);
    }

    public async toResponseObject(withQuestions: boolean = false): Promise<IQuiz> {
        const response = {
            ...this.properties,
        };

        if (withQuestions) {
            const questions = await this.getQuestions();
            const questionResponses = await Promise.all(questions.map((q) => {
                return new Promise((res) => q.toResponseObject().then(c => res(c)));
            }));
            response['questions'] = questionResponses;
        }

        return camelizeKeys(response);
    }

    public async activeParticipants(): Promise<Array<User>> {
        const quizId = this._quiz.quiz_id;
        const sq = Database.instance.sq;
        const result = await sq.from({ qz: QUIZZES_TABLE_NAME })
            .join({ q: QUESTION_TABLE_NAME }).on`q.quiz_id = qz.quiz_id`
            .join({ c: CHOICES_TABLE_NAME }).on`q.question_id = c.question_id`
            .join({ a: ANSWER_TABLE_NAME }).on`a.choice_id = c.choice_id`
            .join({ u: USER_TABLE_NAME }).on`a.user_id = u.user_id`
            .left.join({ l: POWERUP_TABLE_NAME }).on`l.user_id = u.user_id`
            .where`qz.quiz_id = ${quizId}`
            .and`c.is_answer = ${true} OR l.question IS NOT NULL`
            .and`q.question_num = (SELECT max(question_num) FROM questions q WHERE q.quiz_id = ${quizId} and q.sent IS NOT NULL)`
            .return`u.*`;
        return result.map((u) => {
            return new User(u as IUser);
        });
    }

    public async cleanUpAnswers(): Promise<void> {
        const cachedAnswers = await CbRedis.instance.keys(`answer-${this.properties.quiz_id}-*`);
        const wrongAnswers = await CbRedis.instance.keys(`wrong-answer-${this.properties.quiz_id}-*`);
        const redisPromises: Array<Promise<any>> = [];
        const keys = [...wrongAnswers, ...cachedAnswers];
        keys.forEach(wa => redisPromises.push(CbRedis.instance.client.del(wa)));
        await Promise.all(redisPromises);
    }

    public analyticsProperties(): AnalyticsProperties {
        return {
            title: this.properties.title,
            id: this.properties.quiz_id,
            pot_amount: this.properties.pot_amount,
            created: this.properties.created,
            auth: this.properties.auth,
        };
    }
}