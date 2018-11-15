/**
 * A proxy to a module running in a Worker.
 * 
 * For every export in the module, there is a Promise-valued property on the
 * proxy. Exported functions can be invoked with the `call()` method.
 */
export type WorkerModuleProxy<M = any> = {

  /**
   * Call the exported function `name` of the worker module.
   */
  call(name: string, ...args: any[]): Promise<any>;
} & {

  /**
   * Get an exported variable of the worker module.
   */
  [P in keyof M]: M[P] extends Promise<any> ? M[P] : Promise<M[P]>;
};

/**
 * A worker that loads a JS module and provides a convenient way to access and
 * invoke its exports.
 */
export class ModuleWorker<M = any> {
  private _worker: Worker;

  /**
   * Resolves to a proxy for the module in a worker.
   */
  module: Promise<WorkerModuleProxy<M>>;

  constructor(url: string|URL) {
    let resolveModule: (module: any) => void;
    // let rejectModule;
    this.module = new Promise((resolve, _reject) => {
      resolveModule = resolve;
      // rejectModule = reject;
    });
    this._worker = new Worker('./module-worker-host.js');
    this._worker.postMessage({
      type: 'import-module',
      url: url.toString(),
    });
    let currentMessageId = 0;
    const pendingRequests = new Map<number, Deferred<any>>();
    this._worker.addEventListener('message', (e: MessageEvent) => {

      if (e.data == null) {
        return;
      }
      const type = e.data.type;
      if (type === 'module-record') {
        const module = {
          call: (name: string, ...args: any[]) => {
            const messageId = currentMessageId++;
            const deferred = new Deferred<M>();
            pendingRequests.set(messageId, deferred);
            this._worker.postMessage({
              type: 'call-export',
              messageId,
              name,
              args,
            });
            return deferred.promise;
          }
        };
        for (const name of e.data.exportNames) {
          Object.defineProperty(module, name, {
            get: () => {
              const messageId = currentMessageId++;
              const deferred = new Deferred();
              pendingRequests.set(messageId, deferred);
              this._worker.postMessage({
                type: 'get-export',
                messageId,
                name,
              });
              return deferred.promise;
            },
          });
        }
        resolveModule(module);
      } else if (type === 'get-export-reply' || type === 'call-export-reply') {
        const messageId = e.data.messageId;
        const deferred = pendingRequests.get(messageId);
        if (deferred == null) {
          throw new Error(`Invalid message id: ${messageId}`);
        }
        pendingRequests.delete(messageId);
        deferred.resolve(e.data.value);
      }
    });
  }
}

export class Deferred<T> {

  promise: Promise<T>;
  resolve!: (o?: T) => void;
  reject!: (e?: Error) => void;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
