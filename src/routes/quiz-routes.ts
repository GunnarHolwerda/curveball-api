import * as hapi from 'hapi';
import { IoServer } from '../models/io-server';
import { postUser, postUserSchema } from '../handlers/quiz/functions/users/post-user';
import { getUser } from '../handlers/quiz/functions/users/get-user';
import { putUser, putUserSchema } from '../handlers/quiz/functions/users/put-user';
import { getUserLives } from '../handlers/quiz/functions/users/get-user-lives';
import { postUserVerify, postUserVerifySchema } from '../handlers/quiz/functions/users/post-user--verify';
import { postUserForceLogin, postUserForceLoginSchema } from '../handlers/quiz/functions/users/post-user--forcelogin';
import { postQuizzes, postQuizzesSchema } from '../handlers/quiz/functions/quizzes/post-quizzes';
import { putQuiz, putQuizSchema } from '../handlers/quiz/functions/quizzes/put-quiz';
import { postQuestions, postQuestionsSchema } from '../handlers/quiz/functions/quizzes/questions/post-questions';
import { getQuestions } from '../handlers/quiz/functions/quizzes/questions/get-questions';
import { postQuizzesStart } from '../handlers/quiz/functions/quizzes/post-quiz--start';
import { answerQuestion, questionsAnswerSchema } from '../handlers/quiz/functions/quizzes/questions/post-question--answer';
import { postQuestionStart } from '../handlers/quiz/functions/quizzes/questions/post-question--start';
import { putQuestions, putQuestionSchema } from '../handlers/quiz/functions/questions/put-question';
import { getQuestionResults } from '../handlers/quiz/functions/quizzes/questions/get-question--results';
import { getQuizzes } from '../handlers/quiz/functions/quizzes/get-quizzes';
import { getQuizUsers } from '../handlers/quiz/functions/quizzes/users/get-quiz-users';
import { useLife } from '../handlers/quiz/functions/users/post-users-lives--use';
import { postQuizReset } from '../handlers/quiz/functions/quizzes/post-quiz--reset';
import { postQuizComplete } from '../handlers/quiz/functions/quizzes/post-quiz--complete';
import { getQuizAccess } from '../handlers/quiz/functions/quizzes/get-quiz--access';
import { getQuiz } from '../handlers/quiz/functions/quizzes/get-quiz';
import { qtPreRouteHandler } from './pres/qt-access';
import { extractQtClaims } from './pres/extract-quiz-claims';
import { onlyCurrentUser } from './pres/only-current-user';

export function quizRoutes(server: hapi.Server, _: IoServer): void {
    server.route({
        path: '/users',
        method: 'post',
        options: {
            auth: false,
            validate: { payload: postUserSchema }
        },
        handler: postUser
    });

    server.route({
        path: '/users/{userId}',
        method: 'get',
        handler: getUser
    });

    server.route({
        path: '/users/{userId}',
        method: 'put',
        options: {
            pre: [onlyCurrentUser],
            validate: { payload: putUserSchema }
        },
        handler: putUser
    });

    server.route({
        path: '/users/{userId}/lives',
        method: 'get',
        handler: getUserLives
    });

    server.route({
        path: '/users/{userId}/verify',
        method: 'post',
        options: { auth: false, validate: { payload: postUserVerifySchema } },
        handler: postUserVerify
    });

    server.route({
        path: '/users_force_login',
        method: 'post',
        options: { auth: 'internalJwt', validate: { payload: postUserForceLoginSchema } },
        handler: postUserForceLogin
    });
    server.route({
        path: '/quizzes',
        method: 'post',
        options: { auth: 'internalJwt', validate: { payload: postQuizzesSchema } },
        handler: postQuizzes
    });
    server.route({
        path: '/quizzes/{quizId}',
        method: 'put',
        options: { auth: 'internalJwt', validate: { payload: putQuizSchema } },
        handler: putQuiz
    });
    server.route({
        path: '/quizzes/{quizId}',
        method: 'get',
        options: { auth: 'internalJwt' },
        handler: getQuiz
    });
    server.route({
        path: '/quizzes/{quizId}/questions',
        method: 'post',
        options: { auth: 'internalJwt', validate: { payload: postQuestionsSchema } },
        handler: postQuestions
    });
    server.route({
        path: '/quizzes/{quizId}/questions',
        method: 'get',
        options: { auth: 'internalJwt' },
        handler: getQuestions
    });
    server.route({
        path: '/quizzes/{quizId}/start',
        method: 'post',
        options: { auth: 'internalJwt' },
        handler: postQuizzesStart
    });
    server.route({
        path: '/quizzes/{quizId}/questions/{questionId}/answer',
        method: 'post',
        options: {
            pre: [qtPreRouteHandler],
            validate: { payload: questionsAnswerSchema }
        },
        handler: answerQuestion
    });
    server.route({
        path: '/quizzes/{quizId}/questions/{questionId}/start',
        method: 'post',
        options: { auth: 'internalJwt' },
        handler: postQuestionStart
    });
    server.route({
        path: '/questions/{questionId}',
        method: 'put',
        options: { auth: 'internalJwt', validate: { payload: putQuestionSchema } },
        handler: putQuestions
    });
    server.route({
        path: '/quizzes/{quizId}/questions/{questionId}/results',
        method: 'get',
        options: { auth: 'internalJwt' },
        handler: getQuestionResults
    });

    server.route({
        path: '/quizzes',
        method: 'get',
        options: { auth: 'internalJwt' },
        handler: getQuizzes
    });

    server.route({
        path: '/quizzes/{quizId}/users',
        method: 'get',
        options: { auth: 'internalJwt' },
        handler: getQuizUsers
    });

    server.route({
        path: '/users/{userId}/lives/use',
        method: 'post',
        options: { pre: [extractQtClaims, onlyCurrentUser] },
        handler: useLife
    });

    server.route({
        path: '/quizzes/{quizId}/reset',
        method: 'post',
        options: { auth: 'internalJwt' },
        handler: postQuizReset
    });

    server.route({
        path: '/quizzes/{quizId}/complete',
        method: 'post',
        options: { auth: 'internalJwt' },
        handler: postQuizComplete
    });

    server.route({
        path: '/quizzes/{quizId}/access',
        method: 'get',
        handler: getQuizAccess
    });

}