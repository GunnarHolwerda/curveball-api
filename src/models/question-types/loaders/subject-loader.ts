import { ITopicResponse } from '../../factories/topic-factory';
import { SubjectType } from '../../../types/subject-type';
import { SubjectSupplierOptions } from '../../../interfaces/subject-supplier';
import { Subject, ISubject, SUBJECT_TABLE_NAME } from '../../entities/subject';
import { Database } from '../../database';
import { SubjectTypeTableMap, SubjectFactory } from '../../factories/subject-factory';

export async function subjectLoader(
    topic: ITopicResponse,
    type: SubjectType,
    options: SubjectSupplierOptions
): Promise<Array<Subject<ISubject>>> {
    const sq = Database.instance.sq;
    const { startDate, endDate } = options;
    let query = sq.from({ s: SUBJECT_TABLE_NAME })
        .join({ g: SubjectTypeTableMap[type] }).on`g.subject_id = s.subject_id`
        .where`s.subject_type = ${type}`.and`s.topic = ${topic.topicId}`;

    if (startDate !== undefined) {
        const startDateString = startDate.toISOString();
        query = query.where(sq.raw(
            `(json->>'scheduled')::timestamp with time zone >= TO_TIMESTAMP('${startDateString}', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`
        ));
    }

    if (endDate !== undefined) {
        const endDateString = endDate.toISOString();
        query = query.where(
            sq.raw(`(json->>'scheduled')::timestamp with time zone < TO_TIMESTAMP('${endDateString}', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')`)
        );
    }

    const result = await query;
    return Promise.all(result.map(r => SubjectFactory.instantiateInstance(r as ISubject)));
}