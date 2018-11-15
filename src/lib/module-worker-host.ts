let moduleObject: any;
let url: string;

addEventListener('message', async (e: MessageEvent) => {
  if (e.data == null) {
    return;
  }
  const type = e.data.type;
  
  if (type === 'import-module') {
    let exportNames, error;

    try {
      if (url !== undefined) {
        throw new Error('Module already loaded for ModuleWorker');
      }
      url = e.data.url;
      moduleObject = await import(url);
      exportNames = Array.from(Object.keys(moduleObject));
    } catch (e) {
      error = e;
    }

    postMessage({
      type: 'module-record',
      exportNames,
      error,
    });
  } else if (type === 'get-export') {
    let value, error;

    try {
      value = await moduleObject[e.data.name];
    } catch (e) {
      error = e;
    }

    postMessage({
      type: 'get-export-reply',
      value,
      error, 
      messageId: e.data.messageId,
    });
  } else if (type === 'call-export') {
    let value, error;

    try {
      value = await moduleObject[e.data.name](...e.data.args);
    } catch (e) {
      error = e;
    }

    postMessage({
      type: 'call-export-reply',
      value,
      error,
      messageId: e.data.messageId,
    });
  }
});

declare function postMessage(message: any, transfer?: any[] | undefined): void
