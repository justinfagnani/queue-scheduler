export class TaskContext {
  _continue: (() => void)|undefined = undefined;
  _cancel: ((error?: any) => void)|undefined = undefined;
  _yielded: Promise<boolean>;
  _yield!: ((done: boolean) => void);
  _error!: ((error?: any) => void);

  constructor() {
    this._yielded = new Promise<boolean>((resolve, reject) => {
      this._yield = resolve;
      this._error = reject;
    });
  }

  /**
   * Yields control back to the scheduler. Returns a Promise that resolves when
   * the scheduler continues the task, or rejects if the scheduler cancels the
   * task.
   */
  nextTick(): Promise<void> {
    console.assert(this._continue === undefined);
    console.assert(this._cancel === undefined);

    const _yield = this._yield;
    this._yielded = new Promise<boolean>((resolve, reject) => {
      this._yield = resolve;
      this._error = reject;
    });

    _yield(false);

    return new Promise<void>((resolve, reject) => {
      this._continue = resolve;
      this._cancel = reject;
    });
  }
}
