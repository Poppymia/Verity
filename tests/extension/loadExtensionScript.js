import fs from 'node:fs';
import vm from 'node:vm';

export function loadExtensionScriptIntoContext(scriptPath, contextOverrides = {}) {
  const code = fs.readFileSync(scriptPath, 'utf8');

  const context = vm.createContext({
    console,
    // Some extension scripts rely on globals that are not automatically
    // exposed inside a VM context.
    URL: globalThis.URL,
    Date: globalThis.Date,
    Math: globalThis.Math,
    ...contextOverrides
  });

  const script = new vm.Script(code, { filename: scriptPath });
  script.runInContext(context);

  return context;
}

