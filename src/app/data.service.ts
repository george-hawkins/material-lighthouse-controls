import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, timer, Subject, EMPTY } from 'rxjs';
import { retryWhen, tap, delayWhen, switchAll, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const RECONNECT_INTERVAL_MS = 2000;


@Injectable({
  providedIn: 'root'
})
export class DataService {
  private socket$: WebSocketSubject<any>;

  connect(): void {
    if (this.socket$ && !this.socket$.closed) {
      return;
    }

    this.socket$ = this.createWebSocket();

    // See https://rxjs-dev.firebaseapp.com/api/webSocket/webSocket
    // https://stackoverflow.com/a/44067972/245602 seem to suggest that retrying should be enough to trigger attempting to reconnect the underlying websocket.
    // TODO: in which case I can get rid of the closeObserver below.
    // Actually, it's very unclear what that's all about, if retryWhen on it's own doesn't reconnect, try the closeObserver route - note the weird
    // `connect` parameter that causes `retryWhen` to be included if you call `connect(reconnect = true)` (as the close observer does) and not if you call
    // just `connect()` as you do if your calling from AppComponet.
    // You can probably also get rid of the `this.socket$ && !this.socket$.closed` guard above.
    // https://stackoverflow.com/a/23176223/245602
    this.socket$.pipe(
      retryWhen(errors =>
        errors.pipe(
          tap(e => console.log("Error", e)),
          delayWhen(_ => timer(RECONNECT_INTERVAL_MS))
        )
      )
    ).subscribe();
  }

  sendMessage(msg: any) {
    console.log(`attempting to send message ${msg}`);

    // TODO: look at discarding messages if volume gets too high.

    this.socket$.next(msg);
  }

  private createWebSocket(): WebSocketSubject<any> {
    // Amazingly, neither Typescript nor Javascript have some kind of String.format function.
    const endpoint = environment.wsEndpoint.replace('{}', location.host);

    console.log(`attempting to connect to ${endpoint}`);

    // TODO: if you don't set `serialize:` to something here then it defaults to JSON.stringify, hence double-quotes around strings.
    return webSocket({
      url: endpoint,
      openObserver: {
        next: () => {
          console.log('[DataService]: connection ok');
        }
      },
      closeObserver: {
        next: () => {
          console.log('[DataService]: connection closed');
          this.socket$ = undefined;
          // this.connect();
        }
      },
    });
  }
}
