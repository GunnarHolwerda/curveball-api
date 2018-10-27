import { PlaybackUrls, UllStreamTarget } from '../interfaces/stream-target';

export interface StreamTarget {
    playbackUrls(): PlaybackUrls;
}

export class UltraLowLatencyStream implements StreamTarget {
    constructor(protected target: UllStreamTarget) { }

    playbackUrls(): PlaybackUrls {
        if (!this.target) {
            throw new Error('No target has been retrieved for livestream');
        }
        const playbackUrls = this.target.playback_urls;
        if (this.target.primary_url) {
            playbackUrls.rtmp = [this.target.primary_url];
        }
        return playbackUrls;
    }
}