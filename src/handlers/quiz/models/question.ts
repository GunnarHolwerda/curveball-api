import { Postgres } from '../postgres';
import { Choice, IChoiceResponse } from './question-choice';
import { Database } from './database';
import { QuestionFactory } from './factories/question-factory';
import { AnswerFactory } from './factories/answer-factory';
import { ChoiceFactory } from './factories/choice-factory';

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

export class Question {
    private expirationPeriod = 60000; // one minute
    public properties: IQuestion;

    constructor(private _question: IQuestion) {
        this.properties = { ...this._question };
    }

    public static async create(question: Partial<IQuestion>): Promise<Question> {
        const result = await Database.instance.client.query(`
            INSERT INTO ${QUESTION_TABLE_NAME} (quiz_id, question, question_num, sport, ticker)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING question_id;
        `, [question.quiz_id, question.question, question.question_num, question.sport, question.ticker]);
        return (await QuestionFactory.load(result!.rows[0].question_id))!;
    }

    public async save(): Promise<void> {
        const updateString = Postgres.buildUpatePropertyString(this._question, this.properties);
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
            totalAnswers: results.reduce((carry, value) => carry + value.count, 0),
            results: choices.reduce((carry, value) => {
                const choiceId = value.properties.choice_id;
                const choice = results.find(r => r.choice_id === choiceId);
                carry[choiceId] = choice ? choice.count : 0;
                return carry;
            }, {})
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

        return response;
    }

    public isExpired(): boolean {
        return !!this.properties.expired && this.properties.expired <= (new Date());
    }
}