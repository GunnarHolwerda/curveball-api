export interface PlaybackUrls {
    ws?: string[];
    wowz?: string[];
    hls?: string[];
    rtmp?: string[];
}

export interface UllStreamTarget {
    id: string;
    name: string;
    enabled: boolean;
    state: string;
    stream_name: string;
    primary_url: string;
    source_delivery_method: string;
    playback_urls: PlaybackUrls;
    connection_code: string;
    connection_code_expires_at: Date;
    enable_hls: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface WowzaStreamResponse {
    ull_stream_target: UllStreamTarget;
}
