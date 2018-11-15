import {BaseLocalQueueScheduler} from './base-queue-scheduler.js';

/**
 * A QueueScheduler that uses requestIdleCallback timing.
 *
 * This scheduler tries to fit in as many task ticks as will fit under the
 * extimated time that the UA expects the user to remain idle.
 */
export class IdleQueueScheduler extends BaseLocalQueueScheduler {
  protected _schedule(): number {
    return window.requestIdleCallback(
        (deadline) => { this._execute(deadline.timeRemaining()); });
  }
}

declare global {
  interface IdleDeadline {
    timeRemaining(): number;
    didTimeout: boolean;
  }
  interface Window {
    requestIdleCallback(callback: (deadline: IdleDeadline) => void): number;
  }
}
