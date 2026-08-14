// Lightweight Production Analytics & Event Tracker for TRACker SaaS

export interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, any>;
  timestamp: string;
}

class AnalyticsTracker {
  private eventsLog: AnalyticsEvent[] = [];

  trackEvent(eventName: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      eventName,
      properties: properties || {},
      timestamp: new Date().toISOString(),
    };

    this.eventsLog.push(event);

    if (import.meta.env.DEV) {
      console.log(`[TRACker Analytics] 📊 ${eventName}`, properties || '');
    }

    // In production, sync to Google Analytics / Plausible / PostHog
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, properties);
    }
  }

  trackPageView(pageName: string) {
    this.trackEvent('page_view', { page: pageName });
  }

  getLoggedEvents(): AnalyticsEvent[] {
    return [...this.eventsLog];
  }
}

export const analytics = new AnalyticsTracker();
