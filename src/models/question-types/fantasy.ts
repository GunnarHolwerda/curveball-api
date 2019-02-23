import { SubjectSupplier, SubjectSupplierOptions } from '../../interfaces/subject-supplier';
import { Subject, ISubject } from '../entities/subject';
import { QuestionType } from '../entities/question-type';
import { ITopicResponse } from '../factories/topic-factory';
import { SubjectType } from '../../types/subject-type';
import { subjectLoader } from './loaders/subject-loader';

export class FantasyQuestionType extends QuestionType implements SubjectSupplier {
    isSubjectSupplier(): boolean {
        return true;
    }

    async questionSubjects(_: ITopicResponse, _1: SubjectSupplierOptions): Promise<Array<Subject<ISubject>>> {
        return [];
    }

    async choiceSubjects(topic: ITopicResponse, options: SubjectSupplierOptions): Promise<Array<Subject<ISubject>>> {
        let teamsPromise: Promise<Array<Subject<ISubject>>> = Promise.resolve([]);
        // TODO: Find better way than if statement here, make it data driven?
        if (topic.machineName === 'nfl') {
            teamsPromise = subjectLoader(topic, SubjectType.sportTeam, options);
            // teamsPromise = SubjectFactory.loadAllByTypeAndTopic(SubjectType.sportTeam, topic.topicId);
        }

        const playersPromise = subjectLoader(topic, SubjectType.sportPlayer, options);
        const [teams, players] = await Promise.all([teamsPromise, playersPromise]);
        return [...teams, ...players];
    }
}