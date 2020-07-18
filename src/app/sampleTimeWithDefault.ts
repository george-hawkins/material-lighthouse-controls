import { Observable, Operator, Subscriber, SchedulerAction, TeardownLogic, MonoTypeOperatorFunction, asyncScheduler } from 'rxjs';

export function sampleTimeWithDefault<T>(period: number): MonoTypeOperatorFunction<T> {
    return (source: Observable<T>) => source.lift(new SampleTimeOperator(period));
  }
  
  class SampleTimeOperator<T> implements Operator<T, T> {
    constructor(private period: number) {
    }
  
    call(subscriber: Subscriber<T>, source: any): TeardownLogic {
      return source.subscribe(new SampleTimeSubscriber(subscriber, this.period));
    }
  }
  
  class SampleTimeSubscriber<T> extends Subscriber<T> {
    lastValue: T | undefined;
    hasValue: boolean = false;
  
    constructor(destination: Subscriber<T>, private period: number) {
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
      }
    }
  }
  
  function dispatchNotification<T>(this: SchedulerAction<any>, state: any) {
    let { subscriber, period } = state;
    subscriber.notifyNext();
    this.schedule(state, period);
  }