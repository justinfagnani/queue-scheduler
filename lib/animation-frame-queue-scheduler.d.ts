import { BaseQueueScheduler } from './base-queue-scheduler.js';
/**
 * A QueueScheduler that uses requestAnimationFrame timing.
 *
 * This scheduler tries to fit in as many task ticks as will fit in a frame. It
 * remembers the average time a tick takes per task and only executes a tick if
 * it thinks it'll fit in the remaining frame budget. It's a very simple
 * estimate and doesn't try to fit in faster tasks if a long one is next, so
 * slow tasks can starve fast ones.
 */
export declare class AnimationFrameQueueScheduler extends BaseQueueScheduler {
    /**
     * Time allocated to script execution per frame, in ms.
     */
    private _frameBudget;
    constructor(frameBudget?: number);
    protected _schedule(): number;
}
