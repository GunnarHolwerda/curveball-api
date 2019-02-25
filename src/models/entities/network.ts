import { Database } from '../database';
import { NetworkFactory } from '../factories/network-factory';

export interface INetwork {
    id: number;
    name: string;
    photo: string | null;
}

export const NETWORK_TABLE_NAME = 'network';

export class Network {
    public properties: INetwork;

    constructor(private _network: INetwork) {
        this.properties = { ...this._network };
    }

    public static async create(name: string): Promise<Network> {
        const sq = Database.instance.sq;
        const result = await sq.from(NETWORK_TABLE_NAME).insert({
            name
        }).return`id`;
        return (await NetworkFactory.load(result[0].id))!;
    }
}