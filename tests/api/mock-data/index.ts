import { QuestionsPayload } from '../../../src/handlers/quiz/functions/quizzes/questions/post-questions';

export const mockQuestionsPayload: QuestionsPayload = {
    questions: [
        {
            question: 'What is your favorite color?',
            questionNum: 1,
            sport: 'nfl',
            ticker: 'Deion Sander',
            choices: [
                { text: 'Blue', isAnswer: true },
                { text: 'Yellow', isAnswer: false },
                { text: 'Red', isAnswer: false }
            ]
        },
        {
            question: 'What is your favorite animal?',
            questionNum: 2,
            sport: 'mlb',
            ticker: 'College World Series',
            choices: [
                { text: 'Cat', isAnswer: true },
                { text: 'Dog', isAnswer: false },
                { text: 'Alligator', isAnswer: false }
            ]
        }
    ]
};