import { ModuleWorker } from './module-worker.js';

// TODO: also store state about pending tasks, so that we know if a worker
// is busy or not? Or is that the responsibility of the scheduler?
const workers = new Map<string, ModuleWorker>();

export const getWorker = (url: string) => {
  let worker = workers.get(url);
  if (worker === undefined) {
    worker = new ModuleWorker(url);
    workers.set(url, worker);
  }
  return worker;
};
