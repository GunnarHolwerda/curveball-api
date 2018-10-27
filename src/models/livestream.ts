import axios from 'axios';
import { WowzaStreamResponse } from '../interfaces/stream-target';
import { UltraLowLatencyStream, StreamTarget } from './ull-stream-target';

export class Livestream {
    private readonly endpoint: string = 'https://api.cloud.wowza.com/api/v1.2/stream_targets/ull';

    constructor(private quizTitle: string) { }

    async getStreamTarget(): Promise<StreamTarget | undefined> {
        const target = (await axios.post<WowzaStreamResponse>(this.endpoint, {
            ull_stream_target: {
                name: this.quizTitle,
                source_delivery_method: 'push',
                enable_hls: true
            }
        }, {
                headers: {
                    'wsc-api-key': process.env.WOWZA_API_KEY,
                    'wsc-access-key': process.env.WOWZA_ACCESS_KEY,
                    'content-type': 'application/json'
                }
            })).data;

        if (target === null) {
            throw new Error(`Unable to create stream target for  ${this.quizTitle}`);
        }

        return this.createStreamTarget(target);
    }

    private createStreamTarget(response: WowzaStreamResponse): StreamTarget | undefined {
        if (Object.hasOwnProperty('ull_stream_target')) {
            return new UltraLowLatencyStream(response.ull_stream_target);
        }
        return undefined;
    }
}