
import * as hapi from 'hapi';
import * as Boom from 'boom';
import { UserFactory } from '../../../../models/factories/user-factory';
import { IChoiceResponse, CHOICES_TABLE_NAME } from '../../../../models/entities/question-choice';
import { Database } from '../../../../models/database';
import { QUIZZES_TABLE_NAME } from '../../../../models/entities/quiz';
import { QUESTION_TABLE_NAME, IQuestionResponse } from '../../../../models/entities/question';
import { ANSWER_TABLE_NAME } from '../../../../models/entities/answer';
import * as _ from 'lodash';

export interface Picks {
    shows: Array<{
        quizId: string;
        title: string;
        potAmount: string;
        completedDate: string | null;
        picks: Array<{
            answerId: string;
            question: IQuestionResponse<any>
            choice: IChoiceResponse<any>
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
    question_subject_id: number;
    question_topic_id: number;
    question_type_id: number;
    choice_subject_id: number;
    choice_score: number;
    choice_id: number;
    choice: string;
}

type QueryColumns = keyof PicksQueryResponse;

type PicksQueryColumns = {
    [key in QueryColumns]: string;
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
        .where`a.user_id = ${user.properties.user_id}`
        .order`qs.question_num`
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
            choice_score: 'c.score',
            choice_id: 'c.choice_id',
            choice: 'c.text'
        } as PicksQueryColumns);

    const showPicks = _.groupBy<PicksQueryResponse>(result as Array<PicksQueryResponse>, r => r.quiz_id);
    const response = [];
    for (const quizId in showPicks) {
        if (showPicks.hasOwnProperty(quizId)) {
            const showData = showPicks[quizId];
            response.push(
                {
                    quizId: quizId,
                    title: showData[0].title,
                    potAmount: showData[0].pot_amount,
                    completedDate: showData[0].completed_date,
                    picks: showData.map((s) => ({
                        answerId: s.answer_id,
                        question: {
                            questionId: s.question_id,
                            question: s.question,
                            subject: s.question_subject_id
                        },
                        choice: {
                            choiceId: s.choice_id,
                            score: s.choice_score,
                            subject: s.choice_subject_id,
                            text: s.choice
                        }
                    }))
                }
            );
        }
    }

    return {
        shows: response
    };
}


