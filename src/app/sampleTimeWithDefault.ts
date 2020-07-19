import { Observable, Operator, Subscriber, SchedulerAction, TeardownLogic, MonoTypeOperatorFunction, asyncScheduler } from 'rxjs';

// Copied from https://github.com/ReactiveX/rxjs/blob/master/src/internal/operators/sampleTime.ts
// and adapted to take a lambda `def` that is given the opportunity to generate a value if no
// value was recorded during the last sample period.
export function sampleTimeWithDefault<T>(period: number, def: () => T): MonoTypeOperatorFunction<T> {
    return (source: Observable<T>) => source.lift(new SampleTimeOperator(period, def));
}

class SampleTimeOperator<T> implements Operator<T, T> {
  constructor(private period: number, private def: () => T) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new SampleTimeSubscriber(subscriber, this.period, this.def));
  }
}

class SampleTimeSubscriber<T> extends Subscriber<T> {
  lastValue: T | undefined;
  hasValue = false;

  constructor(destination: Subscriber<T>, private period: number, private def: () => T) {
    super(destination);
    this.add(asyncScheduler.schedule(dispatchNotification, period, { subscriber: this, period }));
  }

  protected _next(value: T) {
    this.lastValue = value;
    this.hasValue = true;
  }

  notifyNext() {
    if (this.hasValue) {
      this.hasValue = false;
      this.destination.next(this.lastValue);
    } else {
      const defaultValue = this.def();

      if (defaultValue !== undefined) {
        this.destination.next(defaultValue);
      }
    }
  }
}

function dispatchNotification<T>(this: SchedulerAction<any>, state: any) {
  const { subscriber, period } = state;
  subscriber.notifyNext();
  this.schedule(state, period);
}
