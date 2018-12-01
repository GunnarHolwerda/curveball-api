import { Choice, IChoiceResponse } from './question-choice';
import { Database } from '../database';
import { QuestionFactory } from '../factories/question-factory';
import { AnswerFactory } from '../factories/answer-factory';
import { ChoiceFactory } from '../factories/choice-factory';
import { Analyticize, AnalyticsProperties } from '../../interfaces/analyticize';
import { snakifyKeys } from '../../util/snakify-keys';
import { camelizeKeys } from '../../util/camelize-keys';
import { buildUpatePropertyString } from '../../util/build-update-property-string';

export interface IQuestion {
    question_id: string;
    created: Date;
    question: string;
    question_num: number;
    sport: string;
    ticker: string;
    sent: Date | null;
    expired: Date | null;
    quiz_id: string;
}

export interface IQuestionResponse {
    questionId: string;
    created: string;
    question: string;
    questionNum: number;
    sport: string;
    ticker: string;
    sent: boolean;
    expired: string;
    quizId: string;
    choices: Array<IChoiceResponse>;
}

export interface QuestionResults {
    totalAnswers: number;
    correctAnswer?: string;
    results: {
        [choiceId: string]: number;
    };
}

export const QUESTION_TABLE_NAME = 'questions';

export class Question implements Analyticize {
    private expirationPeriod = 60000; // one minute
    public properties: IQuestion;

    constructor(private _question: IQuestion) {
        this.properties = { ...this._question };
    }

    public static async create(question: Partial<IQuestion>): Promise<Question> {
        const params = snakifyKeys(question);
        const result = await Database.instance.client.query(`
            INSERT INTO ${QUESTION_TABLE_NAME} (quiz_id, question, question_num, sport, ticker)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING question_id;
        `, [params.quiz_id, params.question, params.question_num, params.sport, params.ticker]);
        return (await QuestionFactory.load(result!.rows[0].question_id))!;
    }

    public async save(): Promise<void> {
        const updateString = buildUpatePropertyString(this._question, this.properties);
        if (!updateString) {
            return;
        }
        await Database.instance.client.query(`
            UPDATE ${QUESTION_TABLE_NAME}
            SET
                ${updateString}
            WHERE question_id = $1;
        `, [this._question.question_id]);
    }

    public async choices(): Promise<Array<Choice>> {
        return await ChoiceFactory.loadAllForQuestion(this._question.question_id);
    }

    public async start(): Promise<void> {
        this.properties.sent = new Date();
        this.properties.expired = new Date();
        this.properties.expired.setTime(this.properties.expired.getTime() + this.expirationPeriod);
        await this.save();
    }

    public async results(): Promise<QuestionResults> {
        const results = await AnswerFactory.questionResults(this.properties.question_id);
        const choices = await this.choices();
        const correctAnswer = choices.find(c => c.properties.is_answer);
        const result: QuestionResults = {
            totalAnswers: results.reduce((carry, value) => carry + Number.parseInt(value.count, 10), 0),
            results: choices.reduce((carry, value): { [choiceId: string]: number } => {
                const choiceId = value.properties.choice_id;
                const choice = results.find(r => r.choice_id === choiceId);
                carry[choiceId] = choice ? Number.parseInt(choice.count, 10) : 0;
                return carry;
            }, {} as { [choiceId: string]: number })
        };
        if (correctAnswer !== undefined) {
            result.correctAnswer = correctAnswer!.properties.choice_id;
        }
        return result;
    }

    public async toResponseObject(withChoices: boolean = false): Promise<any> {
        const response = { ...this.properties };

        if (withChoices) {
            const choices = await this.choices();
            response['choices'] = choices.map(c => c.toResponseObject());
        }

        return camelizeKeys(response);
    }

    public isExpired(): boolean {
        return !!this.properties.expired && this.properties.expired <= (new Date());
    }

    public analyticsProperties(): AnalyticsProperties {
        return {
            question_id: this.properties.question_id,
            created: this.properties.created,
            text: this.properties.question,
            question_num: this.properties.question_num,
            sport: this.properties.sport,
            ticker: this.properties.ticker,
            sent: this.properties.sent,
            expired: this.properties.expired,
            quiz_id: this.properties.quiz_id
        };
    }
}