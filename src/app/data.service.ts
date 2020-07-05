import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, timer, Subject, EMPTY } from 'rxjs';
import { retryWhen, tap, delayWhen, switchAll, catchError } from 'rxjs/operators';

const RECONNECT_INTERVAL_MS = 2000;


// Code derived from https://javascript-conference.com/blog/real-time-in-angular-a-journey-into-websocket-and-rxjs/
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private socket$: WebSocketSubject<any>;
  private messagesSubject$ = new Subject();
  messages$ = this.messagesSubject$.pipe(
    switchAll(),
    catchError(e => { throw e; })
  );

  connect(): void {
    if (this.socket$ && !this.socket$.closed) {
      return
    }

    this.socket$ = this.getNewWebSocket();

    const messages = this.socket$.pipe(
      this.reconnect,
      tap({
        error: error => console.log(error),
      }),
      catchError(_ => EMPTY)
    );

    // TODO: only next an observable if a new subscription was made. Double-check this.
    this.messagesSubject$.next(messages);
  }

  private reconnect(o: Observable<any>): Observable<any> {
    return o.pipe(
      retryWhen(errors => errors.pipe(
        tap(val => console.log('[Data Service] Try to reconnect', val)),
        delayWhen(_ => timer(RECONNECT_INTERVAL_MS))
      ))
    );
  }

  close() {
    this.socket$.complete();
    this.socket$ = undefined;
  }

  sendMessage(msg: any) {
    console.log(`attempting to send message ${msg}`);

    this.socket$.next(msg);
  }

  private getNewWebSocket(): WebSocketSubject<any> {
    const endpoint = `ws://${location.origin}/socket`

    console.log(`attempting to connect to ${endpoint}`);

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
          this.connect();
        }
      },
    });
  }
}