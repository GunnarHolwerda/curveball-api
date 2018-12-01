import { CbRedis } from './cb-redis';
import { Quiz } from '../handlers/quiz/models/quiz';

export class QuizCache {
    private static readonly key = 'quizzes';

    public static async addQuiz(quiz: Quiz): Promise<void> {
        CbRedis.instance.client.sadd(QuizCache.key, JSON.stringify(quiz.properties));
    }

    public static async getQuizzes(): Promise<Array<Quiz>> {
        const result = await CbRedis.instance.client.smembers(QuizCache.key);
        return result.map((r: string) => new Quiz(JSON.parse(r))) as Array<Quiz>;
    }

    public static async getQuiz(quizId: string): Promise<Quiz | undefined> {
        const quiz = (await QuizCache.getQuizzes()).find(q => q.properties.quiz_id === quizId);
        return quiz ? quiz : undefined;
    }

    public static async removeQuiz(quiz: Quiz): Promise<number> {
        return CbRedis.instance.client.srem(QuizCache.key, 0, JSON.stringify(quiz.properties));
    }

    public static async clear(): Promise<void> {
        return CbRedis.instance.client.del(QuizCache.key);
    }
}