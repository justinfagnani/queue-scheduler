import { BaseQueueScheduler } from './base-queue-scheduler.js';
/**
 * A QueueScheduler that uses requestIdleCallback timing.
 *
 * This scheduler tries to fit in as many task ticks as will fit under the
 * extimated time that the UA expects the user to remain idle.
 */
export class IdleQueueScheduler extends BaseQueueScheduler {
    _schedule() {
        return window.requestIdleCallback((deadline) => { this._execute(deadline.timeRemaining()); });
    }
}
//# sourceMappingURL=idle-queue-scheduler.js.map