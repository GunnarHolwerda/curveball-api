import { QuizFactory } from '../factories/quiz-factory';
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
import { buildUpatePropertyString } from '../../util/build-update-property-string';
import { camelizeKeys } from '../../util/camelize-keys';
import { ANSWER_TABLE_NAME } from './answer';

export interface IQuiz {
    quiz_id: string;
    active: boolean;
    title: string;
    pot_amount: number;
    completed: boolean;
    created: Date;
    auth: boolean;
}

export interface IQuizResponse {
    quizId: string;
    active: boolean;
    title: string;
    potAmount: number;
    completed: boolean;
    created: string;
    auth: boolean;
}

export const QUIZZES_TABLE_NAME = 'quizzes';

export class Quiz implements Cacheable, Analyticize {
    public properties: IQuiz;
    public static events: EventEmitter = new EventEmitter();

    constructor(private _quiz: IQuiz) {
        this.properties = { ...this._quiz };
    }

    public static async create(quiz: Partial<IQuiz>): Promise<Quiz> {
        const result = await Database.instance.client.query(`
            INSERT INTO ${QUIZZES_TABLE_NAME} (title, pot_amount, auth)
            VALUES ($1, $2, $3)
            RETURNING quiz_id;
        `, [quiz.title, quiz.pot_amount, quiz.auth]);
        return (await QuizFactory.load(result!.rows[0].quiz_id))!;
    }

    public async markUserAsIncorrect(userId: string): Promise<boolean> {
        await CbRedis.instance.client.set(`wrong-answer-${this.properties.quiz_id}-${userId}`, true);
        return true;
    }

    public async hasAnsweredIncorrectly(userId: string): Promise<boolean> {
        return +(await CbRedis.instance.client.exists(`wrong-answer-${this.properties.quiz_id}-${userId}`)) === 1;
    }

    public async save(): Promise<void> {
        const updateString = buildUpatePropertyString(this._quiz, this.properties);
        if (updateString !== '') {
            await Database.instance.client.query(`
                    UPDATE ${QUIZZES_TABLE_NAME}
                    SET
                        ${updateString}
                    WHERE quiz_id = $1;
                `, [this._quiz.quiz_id]);
        }
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
        const result = await Database.instance.client.query(`
        SELECT u.*
            from ${QUIZZES_TABLE_NAME} qz
                JOIN ${QUESTION_TABLE_NAME} q ON q.quiz_id = qz.quiz_id
                JOIN ${CHOICES_TABLE_NAME} c ON q.question_id = c.question_id
                JOIN ${ANSWER_TABLE_NAME} a ON a.choice_id = c.choice_id
                JOIN ${USER_TABLE_NAME} u ON u.user_id = a.user_id
                LEFT JOIN ${POWERUP_TABLE_NAME} l ON l.user_id = u.user_id
            WHERE
                qz.quiz_id = $1
                AND (c.is_answer = TRUE OR l.question IS NOT NULL)
                AND q.question_num = (
                    select max(question_num)
                    from questions q
                    WHERE q.quiz_id = $1 and q.sent IS NOT NULL);
            `, [this._quiz.quiz_id]);
        return result.rows.map((u: IUser) => {
            return new User(u);
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