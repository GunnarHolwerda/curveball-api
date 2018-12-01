import * as hapi from 'hapi';
import { IoServer } from '../models/namespaces/io-server';
import { qtPreRouteHandler } from './pres/qt-access';
import { extractQtClaims } from './pres/extract-quiz-claims';
import { onlyCurrentUser } from './pres/only-current-user';
import { postUserSchema, postUser } from './handlers/users/post-user';
import { getUser } from './handlers/users/get-user';
import { putUserSchema, putUser } from './handlers/users/put-user';
import { getUserLives } from './handlers/users/get-user-lives';
import { postUserVerifySchema, postUserVerify } from './handlers/users/post-user--verify';
import { postUserForceLoginSchema, postUserForceLogin } from './handlers/users/post-user--forcelogin';
import { postQuizzesSchema, postQuizzes } from './handlers/quizzes/post-quizzes';
import { putQuizSchema, putQuiz } from './handlers/quizzes/put-quiz';
import { getQuiz } from './handlers/quizzes/get-quiz';
import { postQuestionsSchema, postQuestions } from './handlers/quizzes/questions/post-questions';
import { getQuestions } from './handlers/quizzes/questions/get-questions';
import { postQuizzesStart } from './handlers/quizzes/post-quiz--start';
import { questionsAnswerSchema, answerQuestion } from './handlers/quizzes/questions/post-question--answer';
import { postQuestionStart } from './handlers/quizzes/questions/post-question--start';
import { putQuestionSchema, putQuestions } from './handlers/questions/put-question';
import { getQuestionResults } from './handlers/quizzes/questions/get-question--results';
import { getQuizzes } from './handlers/quizzes/get-quizzes';
import { getQuizUsers } from './handlers/quizzes/users/get-quiz-users';
import { useLife } from './handlers/users/post-users-lives--use';
import { postQuizReset } from './handlers/quizzes/post-quiz--reset';
import { postQuizComplete } from './handlers/quizzes/post-quiz--complete';
import { getQuizAccess } from './handlers/quizzes/get-quiz--access';

export function quizRoutes(server: hapi.Server, _: IoServer): void {
    const routes: Array<hapi.ServerRoute> = [
        {
            path: '/users',
            method: 'post',
            options: {
                auth: false,
                validate: { payload: postUserSchema }
            },
            handler: postUser
        },
        {
            path: '/users/{userId}',
            method: 'get',
            handler: getUser
        },
        {
            path: '/users/{userId}',
            method: 'put',
            options: {
                pre: [onlyCurrentUser],
                validate: { payload: putUserSchema }
            },
            handler: putUser
        },
        {
            path: '/users/{userId}/lives',
            method: 'get',
            options: { pre: [onlyCurrentUser] },
            handler: getUserLives
        },
        {
            path: '/users/{userId}/verify',
            method: 'post',
            options: { auth: false, validate: { payload: postUserVerifySchema } },
            handler: postUserVerify
        },
        {
            path: '/users_force_login',
            method: 'post',
            options: { auth: 'internalJwt', validate: { payload: postUserForceLoginSchema } },
            handler: postUserForceLogin
        },
        {
            path: '/quizzes',
            method: 'post',
            options: { auth: 'internalJwt', validate: { payload: postQuizzesSchema } },
            handler: postQuizzes
        },
        {
            path: '/quizzes/{quizId}',
            method: 'put',
            options: { auth: 'internalJwt', validate: { payload: putQuizSchema } },
            handler: putQuiz
        },
        {
            path: '/quizzes/{quizId}',
            method: 'get',
            options: { auth: 'internalJwt' },
            handler: getQuiz
        },
        {
            path: '/quizzes/{quizId}/questions',
            method: 'post',
            options: { auth: 'internalJwt', validate: { payload: postQuestionsSchema } },
            handler: postQuestions
        },
        {
            path: '/quizzes/{quizId}/questions',
            method: 'get',
            options: { auth: 'internalJwt' },
            handler: getQuestions
        },
        {
            path: '/quizzes/{quizId}/start',
            method: 'post',
            options: { auth: 'internalJwt' },
            handler: postQuizzesStart
        },
        {
            path: '/quizzes/{quizId}/questions/{questionId}/answer',
            method: 'post',
            options: {
                pre: [qtPreRouteHandler],
                validate: { payload: questionsAnswerSchema }
            },
            handler: answerQuestion
        },
        {
            path: '/quizzes/{quizId}/questions/{questionId}/start',
            method: 'post',
            options: { auth: 'internalJwt' },
            handler: postQuestionStart
        },
        {
            path: '/questions/{questionId}',
            method: 'put',
            options: { auth: 'internalJwt', validate: { payload: putQuestionSchema } },
            handler: putQuestions
        },
        {
            path: '/quizzes/{quizId}/questions/{questionId}/results',
            method: 'get',
            options: { auth: 'internalJwt' },
            handler: getQuestionResults
        },
        {
            path: '/quizzes',
            method: 'get',
            options: { auth: 'internalJwt' },
            handler: getQuizzes
        },
        {
            path: '/quizzes/{quizId}/users',
            method: 'get',
            options: { auth: 'internalJwt' },
            handler: getQuizUsers
        },
        {
            path: '/users/{userId}/lives/use',
            method: 'post',
            options: { pre: [extractQtClaims, onlyCurrentUser] },
            handler: useLife
        },
        {
            path: '/quizzes/{quizId}/reset',
            method: 'post',
            options: { auth: 'internalJwt' },
            handler: postQuizReset
        },
        {
            path: '/quizzes/{quizId}/complete',
            method: 'post',
            options: { auth: 'internalJwt' },
            handler: postQuizComplete
        },
        {
            path: '/quizzes/{quizId}/access',
            method: 'get',
            handler: getQuizAccess
        },
    ];

    const devRoutes = routes.map(r => {
        r.path = '/dev' + r.path;
        return r;
    });

    devRoutes.forEach(r => server.route(r));
}