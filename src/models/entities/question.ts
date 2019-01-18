import { Choice, IChoiceResponse } from './question-choice';
import { Database } from '../database';
import { QuestionFactory } from '../factories/question-factory';
import { AnswerFactory } from '../factories/answer-factory';
import { ChoiceFactory } from '../factories/choice-factory';
import { Analyticize, AnalyticsProperties } from '../../interfaces/analyticize';
import { snakifyKeys } from '../../util/snakify-keys';
import { camelizeKeys } from '../../util/camelize-keys';
import { omit } from '../../util/omit';
import { IQuestionTypeResponse } from './question-type';
import { QuestionTypeFactory } from '../factories/question-type-factory';
import { TopicFactory, ITopicResponse } from '../factories/topic-factory';
import { SubjectFactory } from '../factories/subject-factory';
import { Scorer } from '../scorers/scorer';
import { QuestionTypeMachineNames } from '../../types/question-type-machine-names';
import { SpreadScorer } from '../scorers/spread-scorer';

export interface IQuestion {
    question_id: string;
    created: Date;
    question: string;
    question_num: number;
    topic: number;
    type_id: number;
    subject_id: number | null;
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
    topic: ITopicResponse;
    type: IQuestionTypeResponse;
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
        const sq = Database.instance.sq;
        const result = await sq.from(QUESTION_TABLE_NAME).insert(params).return`question_id`;
        return (await QuestionFactory.load(result![0].question_id))!;
    }

    public async save(): Promise<void> {
        const sq = Database.instance.sq;
        await sq.from(QUESTION_TABLE_NAME)
            .set({ ...omit(this.properties, ['question_id']) })
            .where`question_id = ${this._question.question_id}`;
    }

    public async choices(): Promise<Array<Choice>> {
        return await ChoiceFactory.loadAllForQuestion(this._question.question_id);
    }

    public isExpired(): boolean {
        return !!this.properties.expired && this.properties.expired <= (new Date());
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

    public async toResponseObject(withChoices: boolean = false): Promise<IQuestionResponse> {
        const {
            question_id, created, question, question_num, topic, type_id, sent, expired, quiz_id, ticker,
            subject_id
        } = this.properties;

        let choiceResponses: Array<IChoiceResponse> | undefined;
        if (withChoices) {
            const choices = await this.choices();
            choiceResponses = await Promise.all(choices.map(c => c.toResponseObject()));
        }

        const [typeResponse, topicResponse, subjectResponse] = await Promise.all([
            QuestionTypeFactory.load(type_id).then(r => r!.toResponseObject()),
            TopicFactory.load(topic),
            subject_id ? SubjectFactory.loadById(subject_id).then(s => {
                return s ? s.toResponseObject() : null;
            }) : Promise.resolve(null)
        ]);

        return camelizeKeys({
            created,
            question,
            ticker,
            sent,
            expired,
            quizId: quiz_id,
            questionId: question_id,
            questionNum: question_num,
            type: typeResponse,
            topic: topicResponse,
            subject: subjectResponse,
            choices: choiceResponses
        });
    }

    public analyticsProperties(): AnalyticsProperties {
        // TODO: Get more detailed properties
        return {
            question_id: this.properties.question_id,
            created: this.properties.created,
            text: this.properties.question,
            question_num: this.properties.question_num,
            topic: this.properties.topic,
            ticker: this.properties.ticker,
            sent: this.properties.sent,
            expired: this.properties.expired,
            quiz_id: this.properties.quiz_id
        };
    }

    public async getScorer(): Promise<Scorer | null> {
        const [type, topic] = await Promise.all([
            QuestionTypeFactory.load(this.properties.type_id),
            TopicFactory.load(this.properties.topic)
        ]);
        if (type === null || topic === null) {
            throw new Error('Question was associated with nonexistant type or topic');
        }

        if (type.properties.machine_name === QuestionTypeMachineNames.spread) {
            if (topic.machineName === 'nfl') {
                return new SpreadScorer(this);
            }
        }
        return null;
    }
}