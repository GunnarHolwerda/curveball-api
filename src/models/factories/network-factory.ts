import { Database } from '../database';
import { NETWORK_TABLE_NAME, Network, INetwork } from '../entities/network';

export class NetworkFactory {
    public static async load(id: number): Promise<Network | null> {
        const sq = Database.instance.sq;
        const result = await sq.from(NETWORK_TABLE_NAME).where`id = ${id}`;
        if (result.length === 0) {
            return null;
        }
        return new Network(result[0] as INetwork);
    }

    public static async loadByName(networkName: string): Promise<Network | null> {
        const sq = Database.instance.sq;
        const result = await sq.from(NETWORK_TABLE_NAME).where`name = ${networkName}`;
        if (result.length === 0) {
            return null;
        }
        return new Network(result[0] as INetwork);
    }
}