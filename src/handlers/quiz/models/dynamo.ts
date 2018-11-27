import { DynamoDB } from 'aws-sdk';
import * as uuid from 'uuid';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { omit } from '../util/omit';
import { Environment } from '../types/environments';

let dbConnectionOptions: DocumentClient.DocumentClientOptions & DynamoDB.Types.ClientConfiguration;
if (process.env.ENV !== Environment.local) {
    dbConnectionOptions = { region: 'us-west-2' };
} else {
    dbConnectionOptions = {
        region: 'localhost',
        endpoint: 'http://localhost:8000'
    };
}

export class Dynamo {
    private static _db: DynamoDB.DocumentClient = new DynamoDB.DocumentClient(dbConnectionOptions);
    private static _instance: Dynamo;

    static get instance(): Dynamo {
        if (this._instance === undefined) {
            this._instance = new Dynamo();
        }
        return this._instance;
    }

    static get db(): DynamoDB.DocumentClient {
        return this._db;
    }

    static async createItem<T>(
        tableName: string,
        idKey: string,
        properties: object,
        options: object = { ReturnValues: 'NONE' }
    ): Promise<T> {
        const id = uuid();
        const createdDate = new Date();
        const params = {
            TableName: tableName,
            Item: { ...properties, [idKey]: id, created: createdDate.toISOString(), updated: createdDate.toISOString() },
            ...options
        };
        await this.db.put(params).promise();
        const data = await this.db.get({ TableName: tableName, Key: { [idKey]: id } }).promise();
        return data.Item! as T;
    }

    static async updateItem<T>(
        tableName: string,
        idKey: string,
        properties: object,
        options: object = { ReturnValues: 'UPDATED_NEW' }
    ): Promise<T> {
        const attributeUpdates: DocumentClient.AttributeUpdates = {};
        for (const property in properties) {
            if (!properties.hasOwnProperty(property)) {
                continue;
            }
            attributeUpdates[property] = {
                Value: properties[property],
                Action: 'PUT'
            };
        }

        const updateDate = new Date();
        attributeUpdates['updated'] = {
            Value: updateDate.toISOString(),
            Action: 'PUT'
        };

        const params: DocumentClient.UpdateItemInput = {
            TableName: tableName,
            AttributeUpdates: {
                ...omit(attributeUpdates, [idKey, 'created'])
            },
            Key: { [idKey]: properties[idKey] },
            ...options
        };
        const result = await Dynamo.db.update(params).promise();
        return { ...result.Attributes, [idKey]: properties[idKey] } as T;
    }
}