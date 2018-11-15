import {BaseLocalQueueScheduler} from './base-queue-scheduler.js';

/**
 * A QueueScheduler that uses requestAnimationFrame timing.
 *
 * This scheduler tries to fit in as many task ticks as will fit in a frame. It
 * remembers the average time a tick takes per task and only executes a tick if
 * it thinks it'll fit in the remaining frame budget. It's a very simple
 * estimate and doesn't try to fit in faster tasks if a long one is next, so
 * slow tasks can starve fast ones.
 */
export class AnimationFrameQueueScheduler extends BaseLocalQueueScheduler {

  /**
   * Time allocated to script execution per frame, in ms.
   */
  private _frameBudget: number;

  constructor(frameBudget: number = 12) {
    super();
    this._frameBudget = frameBudget;
  }

  protected _schedule() {
    return requestAnimationFrame((frameStart: number) => {
      const timeRemaining = this._frameBudget + frameStart - performance.now();
      this._execute(timeRemaining);
    });
  }
}
