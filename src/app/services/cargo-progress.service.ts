import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { CargoResponse } from '../generated_services';
import { environment } from '../enviroments/environment';

/**
 * Service that opens a native EventSource (SSE) connection to
 * `GET /cargo/{id}/progress` and emits each intermediate CargoResponse
 * as the optimiser improves item positions in real-time.
 *
 * Handles reconnection automatically:
 *   - EventSource natively retries on transient errors (readyState CONNECTING)
 *   - If the browser gives up (readyState CLOSED), this service manually
 *     re-opens the connection up to MAX_RECONNECT_ATTEMPTS times.
 */
@Injectable({ providedIn: 'root' })
export class CargoProgressService {
  private eventSource: EventSource | null = null;
  private subject = new Subject<CargoResponse>();
  private currentRequestId: string | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private manuallyDisconnected = false;

  /** How many SSE events have been received for the current run */
  eventCount = 0;

  /** Max manual reconnection attempts after EventSource gives up */
  private static readonly MAX_RECONNECT_ATTEMPTS = 10;
  /** Delay between manual reconnection attempts (ms) */
  private static readonly RECONNECT_DELAY_MS = 2000;

  constructor(private ngZone: NgZone) {}

  /**
   * Open the SSE connection for a given cargo request id.
   * Returns an Observable that emits each improving CargoResponse.
   */
  connect(requestId: string): Observable<CargoResponse> {
    this.disconnect();
    this.subject = new Subject<CargoResponse>();
    this.eventCount = 0;
    this.reconnectAttempts = 0;
    this.manuallyDisconnected = false;
    this.currentRequestId = requestId;

    this.openEventSource(requestId);

    return this.subject.asObservable();
  }

  private openEventSource(requestId: string): void {
    const url = `${environment.server}/cargo/${encodeURIComponent(requestId)}/progress`;
    console.log(`[CargoProgress] Opening SSE → ${url} (attempt ${this.reconnectAttempts})`);

    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event: MessageEvent) => {
      this.ngZone.run(() => {
        // Reset reconnect counter on every successful message
        this.reconnectAttempts = 0;
        try {
          const data: CargoResponse = JSON.parse(event.data);
          this.eventCount++;
          this.subject.next(data);
        } catch (err) {
          console.error('[CargoProgress] Failed to parse SSE message', err);
        }
      });
    };

    this.eventSource.onerror = () => {
      this.ngZone.run(() => {
        if (this.manuallyDisconnected) return;

        const state = this.eventSource?.readyState;
        console.warn(`[CargoProgress] SSE error — readyState=${state}`);

        if (state === EventSource.CONNECTING) {
          // Browser is auto-reconnecting — just log, do nothing
          console.log('[CargoProgress] Browser is auto-reconnecting…');
          return;
        }

        // readyState === CLOSED — browser gave up.  Try manual reconnect.
        this.eventSource?.close();
        this.eventSource = null;

        if (this.reconnectAttempts < CargoProgressService.MAX_RECONNECT_ATTEMPTS) {
          this.reconnectAttempts++;
          console.log(`[CargoProgress] Manual reconnect #${this.reconnectAttempts} in ${CargoProgressService.RECONNECT_DELAY_MS}ms`);
          this.reconnectTimer = setTimeout(() => {
            if (!this.manuallyDisconnected && this.currentRequestId) {
              this.openEventSource(this.currentRequestId);
            }
          }, CargoProgressService.RECONNECT_DELAY_MS);
        } else {
          // Exhausted retries — complete the stream
          console.error('[CargoProgress] Max reconnect attempts reached, giving up.');
          if (!this.subject.closed) {
            this.subject.complete();
          }
        }
      });
    };
  }

  /** Tear down the SSE connection and complete the observable. */
  disconnect(): void {
    this.manuallyDisconnected = true;
    this.currentRequestId = null;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (!this.subject.closed) {
      this.subject.complete();
    }
  }
}
