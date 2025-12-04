import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { record, type eventWithTime } from 'rrweb';
import { getRecordConsolePlugin } from '@rrweb/rrweb-plugin-console-record';

// Type declaration for the global session object
declare global {
  interface Window {
    __RRWEB_SESSION__: {
      sessionId: string;
      startedAt: number;
      events: eventWithTime[];
    } | undefined;
  }
}

// Generate a unique session ID
function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + random suffix
  const timestamp = Date.now().toString(36);
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomSuffix}`;
}

export function SessionRecorder() {
  const location = useLocation();
  const stopRecordingRef = useRef<(() => void) | null>(null);
  const originalFetchRef = useRef<typeof window.fetch | null>(null);
  const sessionIdRef = useRef<string>('');
  const isInitializedRef = useRef(false);

  // Initialize recording on mount
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const sessionId = generateSessionId();
    sessionIdRef.current = sessionId;
    const startedAt = Date.now();
    const events: eventWithTime[] = [];

    // Store session on window
    window.__RRWEB_SESSION__ = {
      sessionId,
      startedAt,
      events,
    };

    // Patch window.fetch for network logging
    originalFetchRef.current = window.fetch;
    window.fetch = async function patchedFetch(
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      const method = init?.method || 'GET';
      const requestId = Math.random().toString(36).substring(2, 10);

      console.log('[REC_NET_REQUEST]', {
        requestId,
        url,
        method,
        timestamp: Date.now(),
      });

      try {
        const response = await originalFetchRef.current!(input, init);

        console.log('[REC_NET_RESPONSE]', {
          requestId,
          url,
          method,
          status: response.status,
          statusText: response.statusText,
          timestamp: Date.now(),
        });

        return response;
      } catch (error) {
        console.log('[REC_NET_RESPONSE]', {
          requestId,
          url,
          method,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now(),
        });
        throw error;
      }
    };

    // Start rrweb recording with console plugin
    stopRecordingRef.current = record({
      emit(event) {
        events.push(event);
      },
      plugins: [
        getRecordConsolePlugin({
          level: ['log', 'warn', 'error'],
          lengthThreshold: 10000,
          stringifyOptions: {
            stringLengthLimit: 1000,
            numOfKeysLimit: 100,
          },
        }),
      ],
    }) || null;

    // Record initial route as a custom event
    record.addCustomEvent('route', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      at: Date.now(),
      sessionId,
    });

    // Cleanup function
    return () => {
      // Restore original fetch
      if (originalFetchRef.current) {
        window.fetch = originalFetchRef.current;
      }

      // Stop rrweb recording
      if (stopRecordingRef.current) {
        stopRecordingRef.current();
      }
    };
  }, []);

  // Track route changes
  useEffect(() => {
    // Skip the initial render since we record it in the mount effect
    if (!isInitializedRef.current || !sessionIdRef.current) return;

    record.addCustomEvent('route', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      at: Date.now(),
      sessionId: sessionIdRef.current,
    });
  }, [location.pathname, location.search, location.hash]);

  // This component doesn't render anything
  return null;
}

export default SessionRecorder;

