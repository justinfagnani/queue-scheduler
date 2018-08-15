export class Deferred<T> {
  promise: Promise<T> = new Promise((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
  });
  resolve!: (o?: T) => void;
  reject!: (e?: Error) => void;
}
