import { StreamTarget } from './ull-stream-target';
import { PlaybackUrls } from '../interfaces/stream-target';

export class CurveballStreamTarget implements StreamTarget {

    playbackUrls(): PlaybackUrls {
        return {
            rtmp: ['https://live.dev.curveball.tv/app/live']
        };
    }

}