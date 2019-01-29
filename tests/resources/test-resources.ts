import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { trustOwnCa } from './test-helpers';

const jasmineSettings: { config: { [key: string]: string } } = require('../jasmine-api.json');

trustOwnCa();

export class ApiResources {
    protected config: AxiosRequestConfig | undefined = undefined;

    public constructor(private _token?: string) {
        this.initializeConfig(this._token);
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
    protected async get<T>(apiPath: string, config?: AxiosRequestConfig): Promise<T> {
        try {
            return (await axios.get(this.baseUrl + apiPath, { ...this.config, ...config })).data;
        } catch (err) {
            this.handleError(err);
        }
    }

    // @ts-ignore
    protected async post<T>(apiPath: string, payload: object = {}, config?: AxiosRequestConfig): Promise<T> {
        try {
            return (await axios.post(this.baseUrl + apiPath, payload, config || this.config)).data;
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

    protected handleError(err: AxiosError): void {
        const { method, url } = err.config;
        throw new Error(`${method!.toUpperCase()} ${url}\nCode: ${err.code} Message: ${err.message}`);
    }

    protected initializeConfig(token?: string): void {
        if (!token) {
            return;
        }
        this.config = {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        };
    }

    protected async makeInternalRequest<T>(request: () => Promise<T>): Promise<T> {
        const originalToken = this.token;
        this.token = jasmineSettings.config.testInternalToken;
        const result = await request();
        this.token = originalToken;
        return result;
    }

    public set token(value: string | undefined) {
        this._token = value;
        this.initializeConfig(value);
    }

    public get token(): string | undefined {
        return this._token;
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
