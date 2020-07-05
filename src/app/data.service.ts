import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
//import { Observable, timer, Subject, EMPTY } from 'rxjs';
//import { retryWhen, tap, delayWhen, switchAll, catchError } from 'rxjs/operators';

//const RECONNECT_INTERVAL_MS = 2000;


@Injectable({
  providedIn: 'root'
})
export class DataService {
  private socket$: WebSocketSubject<any>;

  connect(): void {
    if (this.socket$ && !this.socket$.closed) {
      return;
    }

    this.socket$ = this.getNewWebSocket();

    // TODO: see https://rxjs-dev.firebaseapp.com/api/webSocket/webSocket
    // https://stackoverflow.com/a/23176223/245602
    this.socket$.subscribe();

    // const messages = this.socket$.pipe(
    //   this.reconnect,
    //   tap({
    //     error: error => console.log(error),
    //   }),
    //   catchError(e => { 
    //     console.log(e);
    //     return EMPTY
    //   })
    // );
  }

  // private reconnect(o: Observable<any>): Observable<any> {
  //   return o.pipe(
  //     retryWhen(errors => errors.pipe(
  //       tap(val => console.log('[Data Service] Try to reconnect', val)),
  //       delayWhen(_ => timer(RECONNECT_INTERVAL_MS))
  //     ))
  //   );
  // }

  close() {
    this.socket$.complete();
    this.socket$ = undefined;
  }

  sendMessage(msg: any) {
    console.log(`attempting to send message ${msg}`);

    this.socket$.next(msg);
  }

  private getNewWebSocket(): WebSocketSubject<any> {
    const endpoint = `ws://${location.host}/socket`;

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
          // this.connect();
        }
      },
    });
  }
}
