import { CbRedis } from './cb-redis';
import { IQuiz } from './quiz';

export class QuizCache {
    private static readonly key = 'quizzes';

    public static async addQuiz(quiz: IQuiz): Promise<void> {
        CbRedis.instance.client.rpush(QuizCache.key, JSON.stringify(quiz));
    }

    public static async getQuizzes(): Promise<Array<IQuiz>> {
        const result = await CbRedis.instance.client.lrange(QuizCache.key, 0, -1);
        return result.map((r: string) => JSON.parse(r)) as Array<IQuiz>;
    }

    public static async getQuiz(quizId: string): Promise<IQuiz | undefined> {
        return (await QuizCache.getQuizzes()).find(q => q.quizId === quizId);
    }

    public static async removeQuiz(quiz: IQuiz): Promise<number> {
        return CbRedis.instance.client.lrem(QuizCache.key, 0, JSON.stringify(quiz));
    }

    public static async clear(): Promise<void> {
        return CbRedis.instance.client.del(QuizCache.key);
    }
}