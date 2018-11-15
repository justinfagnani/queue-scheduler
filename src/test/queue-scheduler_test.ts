import {
  AnimationFrameQueueScheduler,
  IdleQueueScheduler,
  Scheduler,
  LocalTaskContext
} from '../index.js';

declare const assert: Chai.Assert;

suite('scheduler', () => {
  let scheduler: Scheduler;

  setup(() => { scheduler = new Scheduler(); })

  test('a local task is executed', async () => {
    scheduler.addLocalQueue('test', new AnimationFrameQueueScheduler());
    const task = async (context: LocalTaskContext<number>) => {
      console.log('task started');
      for (let i = 0; i < 25; i++) {
        await context.yield();
        let time = performance.now();
        console.log('iteration', i, time);
      }
      return 42;
    };
    const result = await scheduler.scheduleTask('test', task);
    assert.equal(42, result);
  });

  test('two local tasks are executed concurrently', async () => {
    scheduler.addLocalQueue('test', new AnimationFrameQueueScheduler());

    const task1 = async (context: LocalTaskContext<number>) => {
      console.log('task1 started');
      for (let i = 0; i < 25; i++) {
        await context.yield();
        let time = performance.now();
        console.log('task1 iteration', i, time);
      }
      return 42;
    };
    const task2 = async (context: LocalTaskContext<number>) => {
      console.log('task2 started');
      for (let i = 0; i < 25; i++) {
        await context.yield();
        let time = performance.now();
        console.log('task2 iteration', i, time);
      }
      return 99;
    };

    const [result1, result2] = await Promise.all([
      scheduler.scheduleTask('test', task1),
      scheduler.scheduleTask('test', task2),
    ]);
    assert.equal(42, result1);
    assert.equal(99, result2);
  });

  test('a worker task is executed', async () => {
    scheduler.addWorkerQueue('test-worker', new AnimationFrameQueueScheduler());


  });

  suite('IdleQueueScheduler', async () => {
    test('executes a task', async () => {
      scheduler.addLocalQueue('idle', new IdleQueueScheduler());
      const task = async (context: LocalTaskContext<number>) => {
        console.log('task started');
        for (let i = 0; i < 25; i++) {
          await context.yield();
          let time = performance.now();
          console.log('iteration', i, time);
        }
        return 42;
      };
      const result = await scheduler.scheduleTask('idle', task);
      assert.equal(42, result);
    });
  });
});
