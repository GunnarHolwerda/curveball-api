import { CbRedis } from './cb-redis';
import { IQuizResponse } from './entities/quiz';

export class QuizCache {
    private static readonly key = 'quizzes';

    public static async addQuiz(quiz: IQuizResponse): Promise<void> {
        CbRedis.instance.client.sadd(QuizCache.key, JSON.stringify(quiz));
    }

    public static async getQuizzes(): Promise<Array<IQuizResponse>> {
        const result = await CbRedis.instance.client.smembers(QuizCache.key);
        return result.map((r: string) => JSON.parse(r)) as Array<IQuizResponse>;
    }

    public static async getQuiz(quizId: string): Promise<IQuizResponse | undefined> {
        const quiz = (await QuizCache.getQuizzes()).find(q => q.quizId === quizId);
        return quiz;
    }

    public static async removeQuiz(quiz: IQuizResponse): Promise<number> {
        return CbRedis.instance.client.srem(QuizCache.key, 0, JSON.stringify(quiz));
    }

    public static async clear(): Promise<void> {
        return CbRedis.instance.client.del(QuizCache.key);
    }
}