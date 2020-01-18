import * as pg from 'pg';
import sqorn = require('sqorn-pg');
import { SQF } from 'sqorn-pg/types/sq';

// Int fields
pg.types.setTypeParser(20, (val) => parseInt(val, 10));

// Numeric Fields
pg.types.setTypeParser(1700, val => parseFloat(val));

export class Database {
    private activeSchema = '';
    private _client: pg.Pool;
    private _sq: SQF;
    private static _instance: Database;

    private constructor() {
        this._client = new pg.Pool();
        this._sq = sqorn({ pg, pool: this._client, mapInputKeys: k => k, mapOutputKeys: k => k });
        this._client.on('connect', async (c) => {
            await c.query(`SET SCHEMA '${this.activeSchema}';`);
        });
        this._client.on('error', (err) => {
            console.error(err.message);
        });
    }

    public static get instance(): Database {
        if (this._instance === undefined) {
            this._instance = new Database();
        }
        return this._instance;
    }

    public async connect(schema: string = 'quizrunner'): Promise<void> {
        if (schema !== this.activeSchema) {
            this.activeSchema = schema;
        }
        console.log('Connected to DB');
        await this._client.connect();
    }

    public async disconnect(): Promise<void> {
        console.log('disconnecting from database');
        await this.sq.end();
    }

    public get sq(): SQF {
        return this._sq;
    }

    public get pool(): pg.Pool {
        return this._client;
    }
}