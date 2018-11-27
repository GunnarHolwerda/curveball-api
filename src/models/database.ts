import { Client, types } from 'pg';

types.setTypeParser(20, function (val): number {
    return parseInt(val, 10);
});

export class Database {
    private activeSchema = '';
    private _client: Client;
    private static _instance: Database;

    private constructor() {
        this._client = new Client();
        this.client.on('error', (err) => {
            console.log('DB ERROR', err);
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
        try {
            console.log('Connecting to database');
            await this.client.connect();
            console.log('Connected to DB');
            await this.client.query(`SET SCHEMA '${schema}';`);
        } catch (e) {
            await this.connect(schema);
        }
    }

    public async disconnect(): Promise<void> {
        console.log('disconnecting from database');
        await this.client.end();
    }

    public get client(): Client {
        return this._client;
    }
}