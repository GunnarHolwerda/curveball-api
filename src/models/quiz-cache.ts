import { CbRedis } from './cb-redis';
import { IQuizRoom } from '../interfaces/quiz-room';

export class QuizCache {
    private static readonly key = 'quizzes';

    public static async addQuiz(quiz: IQuizRoom): Promise<void> {
        CbRedis.instance.client.sadd(QuizCache.key, JSON.stringify(quiz));
    }

    public static async getQuizzes(): Promise<Array<IQuizRoom>> {
        const result = await CbRedis.instance.client.smembers(QuizCache.key);
        return result.map((r: string) => JSON.parse(r)) as Array<IQuizRoom>;
    }

    public static async getQuiz(quizId: string): Promise<IQuizRoom | undefined> {
        const quiz = (await QuizCache.getQuizzes()).find(q => q.quizId === quizId);
        return quiz;
    }

    public static async removeQuiz(quiz: IQuizRoom): Promise<number> {
        return CbRedis.instance.client.srem(QuizCache.key, 0, JSON.stringify(quiz));
    }

    public static async clear(): Promise<void> {
        return CbRedis.instance.client.del(QuizCache.key);
    }
}