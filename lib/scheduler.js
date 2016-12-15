var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * Maintains a set of queues, each with their own QueueScheduler to schedule
     * task execution.
     */
    class Scheduler {
        constructor() {
            this._queues = new Map();
        }
        addQueue(name, scheduler) {
            const queue = new TaskQueue(scheduler);
            this._queues.set(name, queue);
        }
        /**
         * Schedule a task on a named queue. The queue must already exist via a call
         * to `addQueue`.
         *
         * TODO: Accept a CancelToken
         */
        scheduleTask(queueName, task) {
            const queue = this._queues.get(queueName);
            if (queue == null) {
                throw new Error(`No queue named ${queueName}`);
            }
            return queue.scheduleTask(task);
        }
    }
    exports.Scheduler = Scheduler;
    class TaskQueue {
        constructor(scheduler) {
            this.tasks = [];
            this.scheduler = scheduler;
        }
        scheduleTask(taskFn) {
            const task = new Task(taskFn);
            this.tasks.push(task);
            this.scheduler.schedule(this);
            return task._completed;
        }
    }
    exports.TaskQueue = TaskQueue;
    class BaseQueueScheduler {
        constructor() {
            this._queues = new Set();
            this._queueData = new WeakMap();
            this._taskData = new WeakMap();
            this._queueIterator = this._queues.values();
        }
        schedule(queue) {
            this._queues.add(queue);
            if (!this._queueData.has(queue)) {
                this._queueData.set(queue, {
                    taskIterator: queue.tasks[Symbol.iterator](),
                });
            }
            if (this.nextTask == null) {
                this.advanceTask();
            }
        }
        _advanceQueue() {
            if (this._queues.size === 0) {
                this._nextQueue = null;
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
            if (queue == null) {
                this.nextTask = null;
                return;
            }
            const queueData = this._queueData.get(queue);
            let next = queueData.taskIterator.next();
            if (next.done) {
                queueData.taskIterator = queue.tasks[Symbol.iterator]();
                next = queueData.taskIterator.next();
            }
            console.assert(!next.done);
            this.nextTask = next.value;
        }
        getTaskData(task) {
            let taskData = this._taskData.get(task);
            if (taskData == null) {
                taskData = {
                    tickCount: 0,
                    avgTickDuration: 0,
                };
                this._taskData.set(task, taskData);
            }
            return taskData;
        }
    }
    exports.BaseQueueScheduler = BaseQueueScheduler;
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
        constructor() {
            super(...arguments);
            this._frameId = 0;
        }
        schedule(queue) {
            super.schedule(queue);
            this._schedule();
        }
        _schedule() {
            // Check if we have a scheduled rAF already
            if (this._frameId === 0) {
                // We don't, so schedule one
                this._frameId = requestAnimationFrame((frameStart) => this._execute(frameStart));
            }
        }
        _execute(frameStart) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('AnimationFrameQueueScheduler._execute');
                // Mark that we don't have a scheduled rAF
                this._frameId = 0;
                let tasksExecuted = 0;
                while (this.nextTask) {
                    const task = this.nextTask;
                    const taskData = this.getTaskData(task);
                    const start = performance.now();
                    const remainingFrameBudget = 12 - (start - frameStart);
                    // Always execute at least one task, or if we think there's enough time left in the frame
                    if (tasksExecuted === 0 || remainingFrameBudget >= taskData.avgTickDuration) {
                        tasksExecuted++;
                        this.advanceTask();
                        yield task._continue();
                        const end = performance.now();
                        const duration = end - start;
                        taskData.avgTickDuration = (taskData.avgTickDuration * taskData.tickCount + duration) / ++taskData.tickCount;
                    }
                    else {
                        break;
                    }
                }
                this._schedule();
            });
        }
    }
    exports.AnimationFrameQueueScheduler = AnimationFrameQueueScheduler;
    class Task {
        constructor(taskFn) {
            this._isComplete = false;
            this._isCanceled = false;
            this._taskFn = taskFn;
            this._completed = new Promise((resolve, reject) => {
                this._resolveCompleted = resolve;
                this._rejectCompleted = reject;
            });
        }
        get completed() {
            return this._completed;
        }
        /**
         * Continues or starts this task.
         *
         * _continue() starts a task function by invoking it, and continues a task by
         * resolving the Promise returned from the last TaskContext.nextTick() call.
         *
         * Returns a Promise that resolves when the task yields.
         */
        _continue() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this._context == null) {
                    this._context = new TaskContext();
                    // We haven't started the task, so invoke the task function.
                    (() => __awaiter(this, void 0, void 0, function* () {
                        try {
                            // force task start to wait so we can await it yielding first
                            yield Promise.resolve();
                            const result = yield this._taskFn.call(null, this._context);
                            this._resolveCompleted(result);
                        }
                        catch (e) {
                            this._rejectCompleted(e);
                        }
                    }))();
                }
                else {
                    // The task is started and has called TaskContext.nextTick()
                    const context = this._context;
                    console.assert(context._continue != null);
                    console.assert(context._cancel != null);
                    const _continue = context._continue;
                    context._continue = null;
                    context._cancel = null;
                    _continue();
                }
                // Wait till the task yields
                yield this._context._yielded;
            });
        }
        cancel() {
            console.assert(this._isCanceled === false);
            if (this._context == null) {
                this._isCanceled = true;
            }
            else {
                // The task is started and has called TaskContext.nextTick()
                const context = this._context;
                console.assert(context._continue != null);
                console.assert(context._cancel != null);
                const _cancel = context._cancel;
                context._continue = null;
                context._cancel = null;
                // Rejects the Promise returned from the last TaskContext.nextTick() call
                // This should in turn reject or resolve the Promise returned by the task
                // function. If not it means the task caught the CancelError and ignored it.
                // If we can detect that case we should reject the _completed Promise via
                // _rejectCompleted().
                _cancel(new Error('Task canceled'));
            }
        }
    }
    exports.Task = Task;
    class TaskContext {
        constructor() {
            this._yielded = new Promise((resolve, reject) => {
                this._yield = resolve;
                this._error = reject;
            });
        }
        /**
         * Yields control back to the scheduler. Returns a Promise that resolves when
         * the scheduler continues the task, or rejects if the scheduler cancels the task.
         */
        nextTick() {
            console.assert(this._continue == null);
            console.assert(this._cancel == null);
            const _yield = this._yield;
            this._yielded = new Promise((resolve, reject) => {
                this._yield = resolve;
                this._error = reject;
            });
            _yield();
            return new Promise((resolve, reject) => {
                this._continue = resolve;
                this._cancel = reject;
            });
        }
    }
    exports.TaskContext = TaskContext;
});
//# sourceMappingURL=scheduler.js.map