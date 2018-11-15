import {Deferred} from './deferred.js';
import {LocalTask} from './task.js';

const notStarted = 0;
const started = 1;
const complete = 2;
const canceled = 3;

type TaskState =
    typeof notStarted|typeof started|typeof complete|typeof canceled;

export class LocalTaskContext<T> {
  task: LocalTask<T>;

  private _state: TaskState = notStarted;

  /**
   * Controls the Promise returned by completed. Resolves when the task returns.
   */
  private _completedDeferred = new Deferred<T>();

  /**
   * Controls the Promise returned by the last call to yield(). Resolves when
   * the task should continue.
   */
  private _continueDeferred?: Deferred<void>;

  /**
   * Controls the Promise returned by continue(). Resolves when the task yields.
   */
  private _yieldDeferred?: Deferred<boolean> = new Deferred<boolean>();

  constructor(task: LocalTask<T>) { this.task = task; }

  get completed() { return this._completedDeferred.promise; }

  /**
   * Yields control back to the scheduler. Returns a Promise that resolves when
   * the scheduler continues the task, or rejects if the scheduler cancels the
   * task.
   */
  yield(): Promise<void> {
    console.assert(this._continueDeferred === undefined);

    // Capture the Deferred returned from the previous call to continue() so
    // that we can resolve it.
    const _yield = this._yieldDeferred!.resolve;

    // Create a new Deferred for the next call to continue()
    this._yieldDeferred = new Deferred<boolean>();
    _yield(false);

    this._continueDeferred = new Deferred<void>();
    return this._continueDeferred.promise;
  }

  /**
   * Continues or starts this task.
   *
   * _continue() starts a task function by invoking it, and continues a task by
   * resolving the Promise returned from the last TaskContext.yield() call.
   *
   * Returns a Promise that resolves when the task yields.
   */
  async continue(): Promise<boolean> {
    if (this._state === notStarted) {
      this._state = started;

      // We haven't started the task, so invoke the task function. This is an
      // async operation, so we'll immediately return the _yieldDeferred
      // Promise.
      (async () => {
        try {
          // Wait to start the task so that we can await it's yield() call.
          await 0;
          const start = performance.now();
          const result = this.task.call(null, this);
          const end = performance.now();
          // TODO: report duration somewhere!
          const duration = end - start;
          console.log('sync time', duration);
          await result;
          this._completedDeferred.resolve(result);
        } catch (e) {
          this._completedDeferred.reject(e);
        } finally {
          // continue() is waiting on _context.yielded, so resolve it to keep
          // going
          this._yieldDeferred!.resolve(true);
        }
      })();
    } else if (this._state === started) {
      // The task is started and has called TaskContext.yield()
      // const context = this._context;
      console.assert(this._continueDeferred !== undefined);
      const _continue = this._continueDeferred!.resolve;
      this._continueDeferred = undefined;
      _continue();
    } else {
      throw new Error('continue() called on non-running task');
    }
    // Wait till the task yields
    return this._yieldDeferred!.promise;
  }

  /**
   * Cancels a running task by rejecting the Promise returned from yield().
   */
  cancel() {
    console.assert(this._state !== canceled);
    if (this._state === notStarted) {
      // Nothing to cleanup, just change the state
      this._state = canceled;
    } else if (this._state === started) {
      // The task is started and has called TaskContext.yield()
      console.assert(this._continueDeferred !== undefined);
      const _cancel = this._continueDeferred!.reject;
      this._continueDeferred = undefined;

      // Rejects the Promise returned from the last TaskContext.yield() call
      // This should in turn reject or resolve the Promise returned by the task
      // function. If not it means the task caught the CancelError and ignored
      // it. If we can detect that case we should reject the _completed Promise
      // via _rejectCompleted().
      _cancel!(new Error('Task canceled'));
    }
  }
}
