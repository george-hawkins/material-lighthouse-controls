import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { timer } from 'rxjs';
import { retryWhen, tap, delayWhen } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const RECONNECT_INTERVAL_MS = 2000;

const STX = '\x02';
const ETX = '\x03';


// TODO:
// * look at discarding messages if volume gets too high.
// * Heartbeat every second to provoke closed connection awareness.
// * On off power button.
// * Spinner overlay when not connected.

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private wsSubject$: WebSocketSubject<any>;

  connect(): void {
    // In older examples, people work directly with a WebSocket and handling reconnects
    // etc. is moderately complicated. Here, however, a WebSocketSubject is used and its
    // retry logic will reconnect the underlying websocket connection if lost.
    this.wsSubject$ = this.createWsSubject();

    this.wsSubject$.pipe(
      retryWhen(errors =>
        errors.pipe(
          tap(e => console.log("Error", e)),
          delayWhen(_ => timer(RECONNECT_INTERVAL_MS))
        )
      )
    ).subscribe();
  }

  sendMessage(msg: any) {
    this.wsSubject$.next(msg);
  }

  private serializer(o: any): string {
    if (typeof o !== "string")
      return '';

    return `${STX}${o}${ETX}`;
  }

  private createWsSubject(): WebSocketSubject<any> {
    // Amazingly, neither Typescript nor Javascript have some kind of String.format function.
    const endpoint = environment.wsEndpoint.replace('{}', location.host);

    return webSocket({
      url: endpoint,
      serializer: this.serializer,
      openObserver: {
        next: () => {
          console.log('[DataService]: connection ok');
        }
      },
      closeObserver: {
        next: () => {
          console.log('[DataService]: connection closed');
        }
      },
    });
  }
}
