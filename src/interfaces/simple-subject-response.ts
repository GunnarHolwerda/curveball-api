export interface SimpleSubjectResponse {
    subjectId: number;
    headline: string;
    status: 'in-progress' | 'finished' | 'not-started';
    description: string;
}