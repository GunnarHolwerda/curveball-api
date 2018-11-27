import axios, { AxiosRequestConfig } from 'axios';
import { trustOwnCa } from './test-helpers';

const jasmineSettings = require('../../jasmine-api.json');

trustOwnCa();

export class ApiResources {
    protected config: AxiosRequestConfig | undefined = undefined;

    public constructor(token?: string) {
        this.initializeConfig(token);
    }

    // @ts-ignore
    protected async put<T>(apiPath: string, payload: object = {}): Promise<T> {
        try {
            return (await axios.put(this.baseUrl + apiPath, payload, this.config)).data;
        } catch (err) {
            this.handleError(err);
        }
    }

    // @ts-ignore
    protected async get<T>(apiPath: string): Promise<T> {
        try {
            return (await axios.get(this.baseUrl + apiPath, this.config)).data;
        } catch (err) {
            this.handleError(err);
        }
    }

    // @ts-ignore
    protected async post<T>(apiPath: string, payload: object = {}): Promise<T> {
        try {
            return (await axios.post(this.baseUrl + apiPath, payload, this.config)).data;
        } catch (err) {
            this.handleError(err);
        }
    }

    protected async delete(apiPath: string): Promise<void> {
        try {
            return (await axios.delete(this.baseUrl + apiPath, this.config)).data;
        } catch (err) {
            this.handleError(err);
        }
    }

    protected handleError(err: Error): void {
        console.log(err.message, err.name);
        throw err;
    }

    private initializeConfig(token?: string): void {
        this.config = {
            headers: {
                'Authorization': `Bearer ${token}`
            },

        };
    }

    public set token(value: string) {
        this.initializeConfig(value);
    }

    public set headers(headers: object) {
        this.config!.headers = {
            ...this.config!.headers,
            ...headers
        };
    }

    protected get baseUrl(): string {
        return jasmineSettings.config.baseUrl;
    }
}