import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { timer, Subject } from 'rxjs';
import { retryWhen, tap, delayWhen } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { sampleTimeWithDefault } from './sampleTimeWithDefault';

const RECONNECT_INTERVAL_MS = 2000;
const PING_INTERVAL_MS = 1000;
const THROTTLE_DURATION_MS = 120; // Lower than this and the remote end will start discarding data.

const HEARTBEAT = '';

const STX = '\x02';
const ETX = '\x03';


// Send heartbeats in an _attempt_ to trigger faster disconnect detection.
// However, in practice sending can continue long after the remote device
// is e.g. powered off without a disconnect being detected at this level.
class HeartbeatGenerator<T> {
  private lastCall = 0;
  private accumulated = 0;

  constructor(private samplePeriod: number, private heartbeatInterval: number, private heartbeat: () => T) { }

  generate(): T | undefined {
    const now = Date.now();
    const diff = now - this.lastCall;

    this.lastCall = now;

    // If `diff` is greater than `samplePeriod` (with an added tolerance of 50%), it's assumed a real
    // sample value has been emitted since the last call to this method, so reset `accumulated`.
    if (diff > (this.samplePeriod * 1.5)) {
      this.accumulated = this.samplePeriod;
    } else {
      this.accumulated += this.samplePeriod;

      if (this.accumulated >= this.heartbeatInterval) {
        this.accumulated = 0;
        return this.heartbeat();
      }
    }

    return undefined;
  }
}

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
          tap(e => console.log('Error', e)),
          delayWhen(_ =>  timer(RECONNECT_INTERVAL_MS))
        )
      )
    ).subscribe();

    const heartbeatGenerator = new HeartbeatGenerator<string>(
      THROTTLE_DURATION_MS,
      PING_INTERVAL_MS,
      () => HEARTBEAT);

    // Limit the volume of messages sent to the remote end.
    // Note: initially I used `throttleTime` but this means you often lose the most recent
    // value (which can be important, e.g. if dragging speed down to 0 and lose the 0 value).
    // And initially I generated heartbeats via an independent proccess but this meant the
    // heartbeat was often the last message in a sample period and ended up knocking out more
    // important events like power-off or reverse.
    this.throttler.pipe(
      sampleTimeWithDefault(THROTTLE_DURATION_MS, () => heartbeatGenerator.generate())
    ).subscribe(s => this.wsSubject$.next(s));
  }

  sendMessage(msg: string) {
    this.throttler.next(msg);
  }

  private serializer(o: string): string {
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
