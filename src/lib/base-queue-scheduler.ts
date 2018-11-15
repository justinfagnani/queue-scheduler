import {LocalTaskContext} from './task-context.js';
import {LocalTaskQueue} from './local-task-queue.js';

/**
 * A base class for schedulers that can manage multiple queues, executing tasks
 * in a round-robin fashion.
 * 
 * Subclasses must implement _schedule() to 
 */
export abstract class BaseLocalQueueScheduler {
  protected _queues = new Set<LocalTaskQueue>();
  protected _queueIterator: Iterator<LocalTaskQueue>;
  protected _queueData = new WeakMap<LocalTaskQueue, any>();
  protected _taskData = new WeakMap<LocalTaskContext<any>, any>();

  protected _callbackId = 0;

  protected _nextQueue?: LocalTaskQueue;
  protected _nextTaskContext?: LocalTaskContext<any>;

  constructor() {
    this._queueIterator = this._queues.values();
  }

  /**
   * Schedule a new callback of _execute. Returns a callback id.
   */
  protected abstract _schedule(): number;

  /**
   * 
   */
  schedule(queue: LocalTaskQueue): void {
    this._queues.add(queue);
    if (!this._queueData.has(queue)) {
      this._queueData.set(queue, {
        taskIterator : queue.tasks.values(),
      });
    }
    if (this._nextTaskContext === undefined) {
      this.advanceTask();
    }
    if (this._nextTaskContext !== undefined && this._callbackId === 0) {
      this._callbackId = this._schedule();
    }
  }

  /**
   * Pick the next queue to schedule a task for from `this._queues`.
   */
  private _advanceQueue() {
    if (this._queues.size === 0) {
      this._nextQueue = undefined;
      return;
    }
    let next = this._queueIterator.next();
    if (next.done) {
      // Reached the end of the queues iterator, start from beginning
      this._queueIterator = this._queues.values();
      next = this._queueIterator.next();
    }
    console.assert(!next.done);
    this._nextQueue = next.value;
  }

  /**
   * Pick the next queue to schedule a task for from `this._queues`.
   */
  advanceTask() {
    this._advanceQueue();
    const queue = this._nextQueue;
    if (queue === undefined) {
      this._nextTaskContext = undefined;
      return;
    }
    if (queue.tasks.size === 0) {
      this._nextTaskContext = undefined;
      return;
    }
    const queueData = this._queueData.get(queue);
    let next = queueData.taskIterator.next();
    if (next.done) {
      queueData.taskIterator = queue.tasks.values();
      next = queueData.taskIterator.next();
    }
    console.assert(!next.done);
    const nextTask = next.value;
    this._nextTaskContext = queue.contexts.get(nextTask);
  }

  getTaskData(task: LocalTaskContext<any>) {
    let taskData = this._taskData.get(task);
    if (taskData === undefined) {
      taskData = {
        tickCount : 0,
        avgTickDuration : 0,
      };
      this._taskData.set(task, taskData);
    }
    return taskData;
  }

  /**
   * Executes a batch of tasks, using previous run data to attempt to fit the
   * batch within the `initialTimeRemaining` remaining budget.
   * 
   * _execute() must be called from _schedule() implemented by a concrete base
   * class.
   */
  protected async _execute(initialTimeRemaining: number) {
    // Mark that we don't have a scheduled callback
    this._callbackId = 0;
    const estimatedEnd = performance.now() + initialTimeRemaining;
    let tasksExecuted = 0;
    while (this._nextTaskContext) {
      const context = this._nextTaskContext;
      const taskData = this.getTaskData(context);
      const start = performance.now();
      const timeRemaining = estimatedEnd - start;
      // Always execute at least one task, or if we think there's enough time
      // left in the frame
      if (tasksExecuted === 0 || timeRemaining >= taskData.avgTickDuration) {
        tasksExecuted++;
        this.advanceTask();
        const done = await context.continue();
        // Note: this measures the _async_ time of context.continue()
        // If task functions yield to something other than the task context
        // we will overestimate the time!!!
        const end = performance.now();
        const duration = end - start;
        taskData.avgTickDuration =
            (taskData.avgTickDuration * taskData.tickCount + duration) /
            ++taskData.tickCount;
        if (done) {
          // clean up task
          // const queue = task._queue;
          const queue = this._nextQueue!;
          queue.removeTask(context.task);
          if (this._nextTaskContext === context) {
            this.advanceTask();
          }
        }
      } else {
        break;
      }
    }
    if (this._nextTaskContext !== undefined && this._callbackId === 0) {
      this._callbackId = this._schedule();
    }
  }
}
