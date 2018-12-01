export interface AnalyticsProperties {
    [property: string]: any;
}

export interface Analyticize {
    analyticsProperties(): AnalyticsProperties;
}