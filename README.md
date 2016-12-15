# A JavaScript Scheduler API

Tasks are async functions that take a single `TaskContext` argument. Tasks yield to
the scheduler by awaiting on `TaskContext.prototype.nextTick()`. Tasks can be composed by
passing their `TaskContext` to sub-task async functions.

Tasks are added to named queues, which have their own scheduling functions.

Tasks are not aware of how they're scheduled. Whether they are on microtask, animation
frame, idle, setInterval, or other timing.

## Example

```typescript
const scheduler = new Scheduler();

scheduler.addQueue('animation', new AnimationFrameQueueScheduler());

const task = async (context: TaskContext) => {
  console.log('task started');
  for (let i = 0; i < 50; i++) {
    // yield to the scheduler
    await context.nextTick();
    let time = performance.now();
    console.log('iteration', i, time);
  }
  return 42;
}

const result = await scheduler.scheduleTask('animation', task);

console.log(result); // 42
```

Because `AnimationFrameQueueScheduler` tries to fit multiple task ticks into a frame,
more than one log statement will be output per frame. The number will increase as the
example warms up.

## API

```typescript
/**
 * A long-running task that yields to the Scheduler by awaiting on
 * TaskContext.prototype.nextTick(). Returns a Promise that resolves when the
 * task is complete.
 */
type TaskFunction<T> = (taskContext: TaskContext) => Promise<T>;

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
  scheduleTask<T>(queueName: string, task: TaskFunction<T>): Promise<T>;
}

/**
 * An object that controls when tasks are executed from a queue or set of queues.
 */
interface QueueScheduler {
  schedule(queue: TaskQueue): void;
}

/**
 * A QueueScheduler that uses requestAnimationFrame timing.
 *
 * This scheduler tries to fit in as many task ticks as will fit in a frame. It
 * remembers the average time a tick takes per task and only executes a tick if it
 * thinks it'll fit in the remaining frame budget. It's a very simple estimate and
 * doesn't try to fit in faster tasks if a long one is next, so slow tasks can starve
 * fast ones.
 */
class AnimationFrameQueueScheduler extends BaseQueueScheduler {
}

class TaskContext {
  /**
   * Yields control back to the scheduler. Returns a Promise that resolves when
   * the scheduler continues the task, or rejects if the scheduler cancels the task.
   */
  nextTick(): Promise<void>;
}
```

## Install

```
yarn global add polymer-cli@next
yarn install
bower install
```

## Run the one little test

```
polymer test lib/test/scheduler_test.html -l chrome -p
```
