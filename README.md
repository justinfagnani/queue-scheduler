# A JavaScript Scheduler API

## Overview

`queue-scheduler` implements a cooperative multi-tasking system based on queus of asynchronous JavaScript functions.

### Tasks

Tasks are async functions that take a single `TaskContext` argument. Tasks yield to the scheduler by awaiting on `TaskContext.prototype.yield()`. Tasks can be composed by passing their `TaskContext` to sub-task async functions.

Tasks are added to named queues, which have their own scheduling functions.

Tasks are not aware of how they're scheduled. Whether they are on microtask, animation frame, idle, setInterval, or other timing.

### Scheduler

A `Scheduler` controls a set of `TaskQueue`s and allows scheduling new `Task`s onto queues by name.

### TaskQueue

A `TaskQueue` is an ordered set of `Task`s controlled by a single `QueueScheduler` which determines when `Tasks` are run. A `TaskQueue` usually represents a global timing that tasks can be executed on, such as microtask, animation frame, idle callback, etc.

### TaskContext

A `TaskContext` controls the execution of a `Task` and maintains its running
state. `TaskContext#yield()`

## Example

```ts
import {scheduler} from 'queue-schduler';

const task = async (context: TaskContext) => {
  for (let i = 0; i < 50; i++) {
    doSomething();
    await context.yield();
  }
  return 42;
}

const result = await scheduler.scheduleTask('animation', task);

console.log(result); // 42
```

Because `AnimationFrameQueueScheduler` tries to fit multiple task ticks into a frame, more than one log statement will be output per frame. The number will increase as the example warms up.

## API

```ts
/**
 * A long-running task that yields to the Scheduler by awaiting on
 * TaskContext.prototype.yield(). Returns a Promise that resolves when the
 * task is complete.
 */
type Task<T> = (taskContext: TaskContext) => Promise<T>;

/**
 * Maintains a set of queues, each with their own QueueScheduler to schedule
 * task execution.
 */
class Scheduler {
  addQueue(name: string, scheduler: QueueScheduler): void;

  /**
   * Schedule a task on a named queue. The queue must already exist via a call
   * to `addQueue`.
   *
   * TODO: Accept a CancelToken
   */
  scheduleTask<T>(queueName: string, task: Task<T>): Promise<T>;
}

/**
 * An object that controls when tasks are executed from a queue or set of
 * queues.
 */
interface QueueScheduler {
  schedule(queue: TaskQueue): void;
}

/**
 * A QueueScheduler that uses requestAnimationFrame timing.
 *
 * This scheduler tries to fit in as many task ticks as will fit in a frame. It
 * remembers the average time a tick takes per task and only executes a tick if 
 * it estimates it'll fit in the remaining frame budget. It's a very simple 
 * estimate and doesn't try to fit in faster tasks if a long one is next, so 
 * slow tasks can starve fast ones.
 */
class AnimationFrameQueueScheduler extends BaseQueueScheduler {
}

/**
 * A QueueScheduler that uses requestIdleCallback timing.
 * 
 * This scheduler tries to fit in as many task ticks as will fit under the
 * extimated time that the UA expects the user to remain idle.
 */
class IdleQueueScheduler extends BaseQueueScheduler {
}

class TaskContext<T> {
  /**
   * Yields control back to the scheduler. Returns a Promise that resolves when
   * the scheduler continues the task, or rejects if the scheduler cancels the 
   * task.
   */
  yield(): Promise<void>;

  continue(): Promise<boolean>;

  cancel(): void;

  completed: Promise<T>;
}
```

## Build and Test

```
git clone https://github.com/justinfagnani/queue-scheduler.git
cd queue-scheduler
npm install
npm run build
npm test
```
