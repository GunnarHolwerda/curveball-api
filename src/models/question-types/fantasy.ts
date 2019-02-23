import { SubjectSupplier, SubjectSupplierOptions } from '../../interfaces/subject-supplier';
import { Subject, ISubject } from '../entities/subject';
import { QuestionType } from '../entities/question-type';
import { ITopicResponse } from '../factories/topic-factory';
import { SubjectType } from '../../types/subject-type';
import { subjectLoader } from './loaders/subject-loader';
import * as _ from 'lodash';

export class FantasyQuestionType extends QuestionType implements SubjectSupplier {
    isSubjectSupplier(): boolean {
        return true;
    }

    async questionSubjects(_1: ITopicResponse, _2: SubjectSupplierOptions): Promise<Array<Subject<ISubject>>> {
        return [];
    }

    async choiceSubjects(topic: ITopicResponse, options: SubjectSupplierOptions): Promise<Array<Subject<ISubject>>> {
        let teamsPromise: Promise<Array<Subject<ISubject>>> = Promise.resolve([]);
        // TODO: Find better way than if statement here, make it data driven?
        if (topic.machineName === 'nfl') {
            teamsPromise = subjectLoader(topic, SubjectType.sportTeam, _.omit(options, ['startDate', 'endDate']));
            // teamsPromise = SubjectFactory.loadAllByTypeAndTopic(SubjectType.sportTeam, topic.topicId);
        }

        const playersPromise = subjectLoader(topic, SubjectType.sportPlayer, _.omit(options, ['startDate', 'endDate']));
        const [teams, players] = await Promise.all([teamsPromise, playersPromise]);
        return [...teams, ...players];
    }
}