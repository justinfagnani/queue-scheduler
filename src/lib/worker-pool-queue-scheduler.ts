import { WorkerQueueScheduler, WorkerTaskQueue } from './worker-task-queue.js';
import {getWorker} from './worker-pool.js';
import { WorkerTaskContext } from './worker-task-context.js';

export class WorkerPoolQueueScheduler implements WorkerQueueScheduler {
  protected _queues = new Set<WorkerTaskQueue>();
  protected _queueIterator: Iterator<WorkerTaskQueue>;
  protected _queueData = new WeakMap<WorkerTaskQueue, any>();
  protected _taskData = new WeakMap<WorkerTaskContext<any>, any>();

  // protected _callbackId = 0;

  protected _nextQueue?: WorkerTaskQueue;
  protected _nextTaskContext?: WorkerTaskContext<any>;

  constructor() { this._queueIterator = this._queues.values(); }

  schedule(queue: WorkerTaskQueue): void {
    console.log('WorkerPoolQueueScheduler.schedule');
    this._queues.add(queue);
    if (!this._queueData.has(queue)) {
      this._queueData.set(queue, {
        taskIterator : queue.tasks.values(),
      });
    }
    if (this._nextTaskContext === undefined) {
      this.advanceTask();
    }
    if (this._nextTaskContext !== undefined) {
      this._nextTaskContext
      getWorker
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

  getTaskData(task: WorkerTaskContext<any>) {
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

}
