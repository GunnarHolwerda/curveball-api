import { Client, types } from 'pg';

types.setTypeParser(20, function (val): number {
    return parseInt(val, 10);
});

export class Database {
    private activeSchema = '';
    private _client: Client;
    public connected = false;
    private static _instance: Database;

    private constructor() {
        this._client = new Client();
        this.client.on('error', (err) => {
            console.log('DB ERROR', err);
            this.connected = false;
        });
    }

    public static get instance(): Database {
        if (this._instance === undefined) {
            this._instance = new Database();
        }
        return this._instance;
    }

    public async connect(schema: string = 'quizrunner'): Promise<void> {
        if (this.connected) {
            return;
        }
        if (schema !== this.activeSchema) {
            this.activeSchema = schema;
        }
        console.log('Connecting to database');
        try {
            await this.client.connect();
        } catch (e) {
            setTimeout(() => {
                this.connect(schema);
            }, 3000);
        }
        this.connected = true;
        console.log('Connected to DB');
        await this.client.query(`SET SCHEMA '${schema}';`);
    }

    public async disconnect(): Promise<void> {
        if (this.connected) {
            console.log('disconnecting from database');
            await this.client.end();
            this.connected = false;
        }
    }

    public get client(): Client {
        return this._client;
    }
}