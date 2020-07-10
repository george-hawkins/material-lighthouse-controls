import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { timer, interval, Subject, EMPTY } from 'rxjs';
import { retryWhen, tap, delayWhen, switchMap, sampleTime } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const RECONNECT_INTERVAL_MS = 2000;
const PING_INTERVAL_MS = 1000;
const THROTTLE_DURATION_MS = 120; // Lower than this and the remote end will start discarding data.

const HEARTBEAT = '';

const STX = '\x02';
const ETX = '\x03';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  private connected = new Subject<boolean>();
  private throttler = new Subject<string>();
  private wsSubject$: WebSocketSubject<string>;

  connected$ = this.connected.asObservable();

  connect(): void {
    // In older examples, people work directly with a WebSocket and handling reconnects
    // etc. is moderately complicated. Here, however, a WebSocketSubject is used and its
    // retry logic will reconnect the underlying websocket connection if lost.
    this.wsSubject$ = this.createWsSubject();

    this.wsSubject$.pipe(
      retryWhen(errors =>
        errors.pipe(
          tap(e => console.log("Error", e)),
          delayWhen(_ =>  timer(RECONNECT_INTERVAL_MS))
        )
      )
    ).subscribe();

    // Limit the volume of messages sent to the remote end.
    // Note: initially I used `throttleTime` but this means you often lose the most recent
    // value (which can be important, e.g. if dragging speed down to 0 and lose the 0 value).
    this.throttler.pipe(
      sampleTime(THROTTLE_DURATION_MS)
    ).subscribe(s => this.wsSubject$.next(s));

    const pings = interval(PING_INTERVAL_MS);

    // Send heartbeats while connected in an attempt to trigger faster disconnect detection.
    // In practice sending can continue long after the remote device is e.g. powered off
    // without a disconnect being detected.
    this.connected$.pipe(
      switchMap(c => c ? pings : EMPTY)
    ).subscribe(_ => this.sendMessage(HEARTBEAT))
  }

  sendMessage(msg: string) {
    this.throttler.next(msg);
  }

  private serializer(o: string): string {
    if (typeof o !== "string")
      return '';

    return `${STX}${o}${ETX}`;
  }

  private createWsSubject(): WebSocketSubject<string> {
    // Amazingly, neither Typescript nor Javascript have some kind of String.format function.
    const endpoint = environment.wsEndpoint.replace('{}', location.host);

    return webSocket<string>({
      url: endpoint,
      serializer: this.serializer,
      openObserver: {
        next: () => {
          this.connected.next(true);
          console.log('websocket opened');
        }
      },
      closeObserver: {
        next: () => {
          this.connected.next(false);
          console.log('websocket closed');
        }
      },
    });
  }
}
