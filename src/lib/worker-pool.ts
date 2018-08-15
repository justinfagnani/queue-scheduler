import { ModuleWorker } from './module-worker.js';

const workers = new Map<string, ModuleWorker>();

export const getWorker = (url: string) => {
  let worker = workers.get(url);
  if (worker === undefined) {
    worker = new ModuleWorker(url);
    workers.set(url, worker);
  }
  return worker;
};
