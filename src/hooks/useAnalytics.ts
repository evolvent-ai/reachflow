import { useCallback } from 'react';
import type { AnalyticsEvent } from '@/types';

export function useAnalytics() {
  const track = useCallback((event: string, data?: Record<string, any>) => {
    const eventData: AnalyticsEvent = {
      event,
      timestamp: new Date().toISOString(),
      ...data,
    };

    if (window.dataLayer) {
      window.dataLayer.push(eventData);
    }

    if (import.meta.env.DEV) {
      console.log('[Analytics]', eventData);
    }
  }, []);

  return { track };
}
