import { ChoiceFactory } from '../factories/choice-factory';
import { Database } from '../database';
import { Analyticize, AnalyticsProperties } from '../../interfaces/analyticize';
import { snakifyKeys } from '../../util/snakify-keys';
import { omit } from '../../util/omit';
import { camelizeKeys } from '../../util/camelize-keys';
import { SubjectFactory } from '../factories/subject-factory';
import { ISubject, Subject } from './subject';
import { QuestionFactory } from '../factories/question-factory';
import { Question } from './question';

export interface IChoice {
    choice_id: string;
    question_id: string;
    text: string;
    is_answer: boolean;
    subject_id: number | null;
    score: number | null;
}

export interface IChoiceResponse {
    choiceId: string;
    questionId: string;
    text: string;
    isAnswer?: boolean;
}

export const CHOICES_TABLE_NAME = 'questions_choices';

export class Choice implements Analyticize {
    public properties: IChoice;

    constructor(private _choice: IChoice) {
        this.properties = { ...this._choice };
    }

    public static async create(choice: Partial<IChoice>): Promise<Choice> {
        const params = snakifyKeys(choice);
        const sq = Database.instance.sq;
        const result = await sq.from(CHOICES_TABLE_NAME).insert(params).return`choice_id`;
        return (await ChoiceFactory.load(result![0].choice_id))!;
    }

    public async save(): Promise<void> {
        const sq = Database.instance.sq;
        await sq.from(CHOICES_TABLE_NAME).set({ ...omit(this.properties, ['choice_id']) }).where`choice_id = ${this._choice.choice_id}`;
    }

    public async toResponseObject(): Promise<IChoiceResponse> {
        const { subject_id } = this.properties;
        let subject: Subject<ISubject> | null = null;
        if (subject_id) {
            subject = await SubjectFactory.loadById(subject_id);
        }

        const response = {
            ...omit(this.properties, ['is_answer', 'subject_id']),
            subject
        };
        return camelizeKeys(response);
    }

    public analyticsProperties(): AnalyticsProperties {
        return {
            choice_id: this.properties.choice_id,
            text: this.properties.text,
            is_answer: this.properties.is_answer
        };
    }

    public get question(): Promise<Question> {
        return (async () => {
            return (await QuestionFactory.load(this.properties.question_id))!;
        })();
    }


    public async setScoreForSubject(subject: Subject<ISubject>): Promise<void> {
        const question = await this.question;
        const scorer = question.getScorer();
        const score = scorer.calculateScoreForSubject(subject, this);
        this.properties.score = score;
        await this.save();
    }
}