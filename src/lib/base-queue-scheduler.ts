import {TaskQueue} from './task-queue.js';
import {Task} from './task.js';

export abstract class BaseQueueScheduler {
  protected _queues = new Set<TaskQueue>();
  protected _queueIterator: Iterator<TaskQueue>;
  protected _queueData = new WeakMap<TaskQueue, any>();
  protected _taskData = new WeakMap<Task<any>, any>();

  protected _callbackId = 0;

  protected _nextQueue?: TaskQueue;
  nextTask?: Task<any>;

  constructor() { this._queueIterator = this._queues.values(); }

  schedule(queue: TaskQueue): void {
    this._queues.add(queue);
    if (!this._queueData.has(queue)) {
      this._queueData.set(queue, {
        taskIterator : queue.tasks.values(),
      });
    }
    if (this.nextTask === undefined) {
      this.advanceTask();
    }
    if (this.nextTask !== undefined && this._callbackId === 0) {
      this._callbackId = this._schedule();
    }
  }

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

  advanceTask() {
    this._advanceQueue();
    const queue = this._nextQueue;
    if (queue === undefined) {
      this.nextTask = undefined;
      return;
    }
    if (queue.tasks.size === 0) {
      this.nextTask = undefined;
      return;
    }
    const queueData = this._queueData.get(queue);
    let next = queueData.taskIterator.next();
    if (next.done) {
      queueData.taskIterator = queue.tasks.values();
      next = queueData.taskIterator.next();
    }
    console.assert(!next.done);
    this.nextTask = next.value;
  }

  getTaskData(task: Task<any>) {
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
   * Schedule a new callback of _execute. Returns a callback id.
   */
  protected abstract _schedule(): number;

  protected async _execute(initialTimeRemaining: number) {
    console.log(`BaseQueueScheduler._execute ${initialTimeRemaining}`);
    // Mark that we don't have a scheduled callback
    this._callbackId = 0;
    const estimatedEnd = performance.now() + initialTimeRemaining;
    let tasksExecuted = 0;
    while (this.nextTask) {
      const task = this.nextTask;
      const taskData = this.getTaskData(task);
      const start = performance.now();
      const timeRemaining = estimatedEnd - start;
      // Always execute at least one task, or if we think there's enough time
      // left in the frame
      if (tasksExecuted === 0 || timeRemaining >= taskData.avgTickDuration) {
        tasksExecuted++;
        this.advanceTask();
        const done = await task._continue();
        const end = performance.now();
        const duration = end - start;
        taskData.avgTickDuration =
            (taskData.avgTickDuration * taskData.tickCount + duration) /
            ++taskData.tickCount;
        if (done) {
          // clean up task
          const queue = task._queue;
          queue.removeTask(task);
          if (this.nextTask === task) {
            this.advanceTask();
          }
        }
      } else {
        break;
      }
    }
    if (this.nextTask !== undefined && this._callbackId === 0) {
      this._callbackId = this._schedule();
    }
  }
}
