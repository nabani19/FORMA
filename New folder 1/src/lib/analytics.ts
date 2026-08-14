// 📊 TRACker Real-Time Analytics & Event Telemetry Engine

export interface AnalyticsEvent {
  eventName: string;
  category: 'user_action' | 'navigation' | 'scanner' | 'auth' | 'payment';
  payload?: Record<string, any>;
  timestamp: string;
}

class AnalyticsTracker {
  private eventsKey = 'tracker_analytics_events';

  public track(eventName: string, category: AnalyticsEvent['category'], payload?: Record<string, any>) {
    const event: AnalyticsEvent = {
      eventName,
      category,
      payload,
      timestamp: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem(this.eventsKey) || '[]');
      existing.unshift(event);
      localStorage.setItem(this.eventsKey, JSON.stringify(existing.slice(0, 100)));
    } catch (e) {
      console.warn('Analytics storage error:', e);
    }

    if (process.env.NODE_ENV === 'development' || true) {
      console.log(`[Analytics] 📈 ${category.toUpperCase()} -> ${eventName}`, payload || '');
    }
  }

  public getEvents(): AnalyticsEvent[] {
    try {
      return JSON.parse(localStorage.getItem(this.eventsKey) || '[]');
    } catch {
      return [];
    }
  }
}

export const analytics = new AnalyticsTracker();
