
import * as hapi from '@hapi/hapi';
import * as Boom from '@hapi/boom';
import { UserFactory } from '../../../../models/factories/user-factory';
import { CHOICES_TABLE_NAME } from '../../../../models/entities/question-choice';
import { Database } from '../../../../models/database';
import { QUIZZES_TABLE_NAME } from '../../../../models/entities/quiz';
import { QUESTION_TABLE_NAME } from '../../../../models/entities/question';
import { ANSWER_TABLE_NAME } from '../../../../models/entities/answer';
import * as _ from 'lodash';
import { SubjectFactory } from '../../../../models/factories/subject-factory';
import { TopicFactory, ITopicResponse } from '../../../../models/factories/topic-factory';
import { QuestionTypeFactory } from '../../../../models/factories/question-type-factory';
import { IQuestionTypeResponse } from '../../../../models/entities/question-type';
import { SimpleSubjectResponse } from '../../../../interfaces/simple-subject-response';
import { SQF } from 'sqorn-pg/types/sq';

export interface Picks {
    shows: Array<{
        quizId: string;
        title: string;
        potAmount: string;
        completedDate: string | null;
        picks: Array<{
            answerId: string;
            question: {
                questionId: string;
                question: string,
                subject: SimpleSubjectResponse,
                type: IQuestionTypeResponse,
                topic: ITopicResponse;
            }
            choice: {
                choiceId: string;
                score: number;
                subject: SimpleSubjectResponse,
                text: string;
            }
        }>;
    }>;
}

interface PicksQueryResponse {
    title: string;
    quiz_id: string;
    pot_amount: number;
    completed_date: Date;
    answer_id: string;
    question_id: string;
    question: string;
    question_subject_id: number | null;
    question_topic_id: number;
    question_type_id: number;
    choice_subject_id: number | null;
    choice_score: string;
    choice_id: number;
    choice: string;
}

type QueryColumns = keyof PicksQueryResponse;

type PicksQueryColumns = {
    [key in QueryColumns]: string | SQF;
};

// TODO: Add query parameter to facilitate how far back to look

export async function getUserPicks(event: hapi.Request): Promise<object> {
    const userId = event.params['userId'];
    const user = await UserFactory.load(userId);
    if (user === null) {
        throw Boom.notFound();
    }
    const sq = Database.instance.sq;

    const result = await sq.from({ qz: QUIZZES_TABLE_NAME })
        .join({ qs: QUESTION_TABLE_NAME }).on`qz.quiz_id = qs.quiz_id`
        .join({ c: CHOICES_TABLE_NAME }).on`qs.question_id = c.question_id`
        .join({ a: ANSWER_TABLE_NAME }).on`c.choice_id = a.choice_id`
        .where`a.user_id = ${user.properties.user_id} AND a.disabled = FALSE`
        .where`qz.completed_date > now() - INTERVAL '5 days'`
        .order({ by: `qz.completed_date`, sort: 'desc' }).order`qs.question_num`
        .return({
            title: 'qz.title',
            quiz_id: 'qz.quiz_id',
            pot_amount: 'qz.pot_amount',
            completed_date: 'qz.completed_date',
            answer_id: 'a.answer_id',
            question_id: 'qs.question_id',
            question: 'qs.question',
            question_subject_id: 'qs.subject_id',
            question_topic_id: 'qs.topic',
            question_type_id: 'qs.type_id',
            choice_subject_id: 'c.subject_id',
            choice_score: sq.l`COALESCE(c.score, 0)`,
            choice_id: 'c.choice_id',
            choice: 'c.text'
        } as PicksQueryColumns);

    const showPicks = _.groupBy<PicksQueryResponse>(result as Array<PicksQueryResponse>, r => r.quiz_id);
    const response = [];
    for (const quizId in showPicks) {
        if (showPicks.hasOwnProperty(quizId)) {
            const showData = showPicks[quizId];
            const resolvedShowData = await buildPicksData(showData);
            response.push(
                {
                    quizId: quizId,
                    title: showData[0].title,
                    potAmount: showData[0].pot_amount,
                    completedDate: showData[0].completed_date,
                    picks: showData.map((s, i) => {
                        const { questionSubject, topic, type, subject: cSubject } = resolvedShowData[i];
                        return {
                            answerId: s.answer_id,
                            question: {
                                questionId: s.question_id,
                                question: s.question,
                                subject: questionSubject,
                                topic,
                                type
                            },
                            choice: {
                                choiceId: s.choice_id,
                                score: parseFloat(s.choice_score),
                                subject: cSubject,
                                text: s.choice
                            }
                        };
                    })
                }
            );
        }
    }

    return {
        shows: response
    };
}

interface AggregatedPicksData {
    questionSubject: SimpleSubjectResponse | null;
    topic: ITopicResponse | null;
    type: IQuestionTypeResponse | null;
    subject: SimpleSubjectResponse | null;
}

async function buildPicksData(
    data: Array<PicksQueryResponse>
): Promise<Array<AggregatedPicksData>> {
    const pickDataPromises = data.map(async (d) => {
        const { question_subject_id, choice_subject_id, question_topic_id, question_type_id } = d;
        const result = await Promise.all([
            question_subject_id ? SubjectFactory.loadById(question_subject_id).then(r => r!.asQuestionResponse()) : Promise.resolve(null),
            TopicFactory.load(question_topic_id),
            QuestionTypeFactory.load(question_type_id).then(r => r!.toResponseObject()),
            choice_subject_id ? SubjectFactory.loadById(choice_subject_id).then(r => r!.asQuestionResponse()) : Promise.resolve(null)
        ]);
        return {
            questionSubject: result[0],
            topic: result[1],
            type: result[2],
            subject: result[3]
        };
    });

    return await Promise.all(pickDataPromises);
}
