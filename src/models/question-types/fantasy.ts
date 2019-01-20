import { SubjectSupplier } from '../../interfaces/subject-supplier';
import { Subject, ISubject } from '../entities/subject';
import { QuestionType } from '../entities/question-type';
import { ITopicResponse } from '../factories/topic-factory';
import { SubjectFactory } from '../factories/subject-factory';
import { SubjectType } from '../../types/subject-type';

export class FantasyQuestionType extends QuestionType implements SubjectSupplier {
    isSubjectSupplier(): boolean {
        return true;
    }

    async questionSubjects(_: ITopicResponse): Promise<Array<Subject<ISubject>>> {
        return [];
    }

    async choiceSubjects(topic: ITopicResponse): Promise<Array<Subject<ISubject>>> {
        let teamsPromise: Promise<Array<Subject<ISubject>>> = Promise.resolve([]);
        // TODO: Find better way than if statement here, make it data driven?
        if (topic.machineName === 'nfl') {
            teamsPromise = SubjectFactory.loadAllByTypeAndTopic(SubjectType.sportTeam, topic.topicId);
        }

        const playersPromise = SubjectFactory.loadAllByTypeAndTopic(SubjectType.sportPlayer, topic.topicId);
        const [teams, players] = await Promise.all([teamsPromise, playersPromise]);
        return [...teams, ...players];
    }
}