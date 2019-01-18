import { Question } from '../entities/question';
import { Choice } from '../entities/question-choice';
import { Subject, ISubject } from '../entities/subject';

export abstract class Scorer {
    constructor(protected question: Question) { }

    abstract calculateScoreForSubject(subject: Subject<ISubject>, choice: Choice): Promise<number>;
}