import {
  AnimationFrameQueueScheduler
} from './lib/animation-frame-queue-scheduler.js';
import {IdleQueueScheduler} from './lib/idle-queue-scheduler.js';
import {Scheduler} from './lib/scheduler.js';

export {
  AnimationFrameQueueScheduler
} from './lib/animation-frame-queue-scheduler.js';
export {IdleQueueScheduler} from './lib/idle-queue-scheduler.js';
export {Scheduler} from './lib/scheduler.js';
export {LocalTaskContext} from './lib/task-context.js';
export {LocalTask} from './lib/task.js';

/**
 * The global Schduler instance.
 *
 * This scheduler has two default queues: 'animation' and 'idle'.
 */
export const scheduler = new Scheduler();

/**
 * The global AnimationFrameQueueScheduler.
 *
 * Queues should not create their own AnimationFrameQueueScheduler, so that the
 * animation frame budget is not incorrectly shared across uncoordinated
 * QueueSchedulers.
 */
export const animationQueueScheduler = new AnimationFrameQueueScheduler();
scheduler.addLocalQueue('animation', animationQueueScheduler);

/**
 * The global IdleQueueScheduler.
 *
 * Queues should not create their own IdleQueueScheduler.
 */
export const idleQueueScheduler = new IdleQueueScheduler();
scheduler.addLocalQueue('idle', idleQueueScheduler);
