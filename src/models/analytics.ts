import * as Mixpanel from 'mixpanel';
import { ApplicationConfig } from '../config';
import { User } from '../handlers/quiz/models/user';
import { AnalyticsProperties, Analyticize } from '../handlers/quiz/interfaces/analyticize';
import { AnalyticsEvents } from '../events';

export type IncrementalUserProperties = 'showsJoined';

export class Analytics {
    private analytics: Mixpanel.Mixpanel;
    private static _instance: Analytics;

    private constructor() {
        this.analytics = Mixpanel.init(ApplicationConfig.mixpanelKey, { protocol: 'https' });
    }

    public static get instance(): Analytics {
        if (this._instance === undefined) {
            this._instance = new Analytics();
        }
        return this._instance;
    }

    trackUser(user: User): void {
        const { user_id } = user.properties;
        this.analytics.people.set(user_id, user.analyticsProperties());
    }

    track(
        user: User,
        eventName: AnalyticsEvents,
        properties: AnalyticsProperties = {},
        trackableObjects: Array<Analyticize> = [],
    ): void {
        const analyticsProperties = { distinct_id: user.properties.user_id, ...properties };
        trackableObjects.forEach(o => {
            let highLevelPropertyName = o.constructor.name.toLowerCase();
            if (analyticsProperties.hasOwnProperty(highLevelPropertyName)) {
                highLevelPropertyName += '_default';
            }
            analyticsProperties[highLevelPropertyName] = o.analyticsProperties();
        });
        this.analytics.track(eventName, analyticsProperties);
    }

    incrementProperty(user: User, propertyName: IncrementalUserProperties, amount: number): void {
        this.analytics.people.increment(user.properties.user_id, propertyName, amount);
    }
}