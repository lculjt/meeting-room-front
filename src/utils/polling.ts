import {
  Observable,
  Observer,
  Subscription,
  interval,
  switchMap,
  takeUntil,
} from "rxjs";

export interface PollingOptions<T> {
  /** 每次循环间隔 */
  intervals?: number;

  /** 超时时间 */
  timeout?: number;

  /** 执行内容 */
  callback: (observer: Observer<T>) => void;

  /** 停止条件 */
  stopCondition: (value: T) => boolean;
}

export class Polling<T = any> {
  private intervals;

  private timeout;

  private callback: (observer: Observer<T>) => void;

  private $source: Subscription | undefined;

  private stopCondition: (value: T) => boolean;

  constructor(options: PollingOptions<T>) {
    this.intervals = (options.intervals ?? 1) * 1000;
    this.timeout = (options.timeout ?? 60) * 1000;
    this.callback = options.callback;
    this.stopCondition = options.stopCondition;
  }

  run() {
    if (!this.$source || this.$source.closed) {
      return new Promise((resolve, reject) => {
        this.$source = interval(this.intervals)
          .pipe(
            switchMap(() => this.pollingRecipient()),
            takeUntil(interval(this.timeout)),
          )
          .subscribe({
            next: (value) => {
              if (this.stopCondition(value)) {
                console.log("Stop polling condition");
                this.stopPolling(); // 根据停止条件停止轮询
                resolve(value);
              }
            },
            error: (error) => {
              reject(error);
              console.log(error);
              this.stopPolling();
            },
            complete: () => {
              console.log("polling complete");
            },
          });
      });
    }
  }

  stopPolling() {
    if (this.$source && !this.$source.closed) {
      this.$source.unsubscribe();
    }
  }

  pollingRecipient() {
    return new Observable((observer: Observer<T>) => {
      this.callback(observer);
    });
  }
}
