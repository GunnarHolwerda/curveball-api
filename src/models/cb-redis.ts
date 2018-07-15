import * as Redis from 'ioredis';

const CurveballRedisKeyPrefix = 'CB-Realtime-';

export class CbRedis {
    private redisClient: Redis.Redis;
    private static _instance: CbRedis;

    private constructor() {
        this.redisClient = new Redis(+(process.env.REDIS_PORT!), process.env.REDIS_HOST!, {
            keyPrefix: CurveballRedisKeyPrefix
        });
    }

    public static get instance(): CbRedis {
        if (!this._instance) {
            this._instance = new CbRedis();
        }
        return this._instance;
    }

    public get client(): Redis.Redis {
        return this.redisClient;
    }

    public async addQuiz(quiz: { quizId: string, title: string, potAmount: number }): Promise<void> {
        this.redisClient.rpush('quizzes', JSON.stringify(quiz));
    }

    public async getQuizzes(): Promise<Array<{ quizId: string, title: string, potAmount: number }>> {
        const result = await this.redisClient.lrange('quizzes', 0, -1);
        return result.map((r: string) => JSON.parse(r)) as Array<{ quizId: string, title: string, potAmount: number }>;
    }
}