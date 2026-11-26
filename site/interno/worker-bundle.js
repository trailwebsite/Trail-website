var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// ../node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// ../node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// ../painel/sanitizar.mjs
import crypto2 from "node:crypto";
function escapar(texto2) {
  return String(texto2 ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
__name(escapar, "escapar");
var TAMANHOS = /* @__PURE__ */ new Set(["12", "14", "16", "18", "20", "24", "28", "32", "40", "48"]);
var ALINHA = /* @__PURE__ */ new Set(["tx-esq", "tx-centro", "tx-dir"]);
function decodificar(texto2) {
  return String(texto2).replaceAll("&nbsp;", " ").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", '"').replaceAll("&#39;", "'").replaceAll("&amp;", "&");
}
__name(decodificar, "decodificar");
function classesSpan(tag) {
  const achado = tag.match(/\bclass\s*=\s*"([^"]*)"/i);
  if (!achado) return "";
  let tamanho = "";
  let lado = "";
  for (const nome of achado[1].split(/\s+/)) {
    if (nome.startsWith("tx-") && TAMANHOS.has(nome.slice(3))) tamanho = nome;
    else if (ALINHA.has(nome)) lado = nome;
  }
  return [tamanho, lado].filter(Boolean).join(" ");
}
__name(classesSpan, "classesSpan");
function htmlSeguro(entrada, max = 2e5) {
  let bruto = String(entrada ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (bruto.includes("\0")) return { erro: "nulo" };
  if (bruto.length > max) return { erro: "largo" };
  bruto = bruto.replace(/<div\b[^>]*>/gi, "").replace(/<\/div>/gi, "\n");
  bruto = bruto.replace(/<p\b[^>]*>/gi, "").replace(/<\/p>/gi, "\n");
  const re = /<\/?(b|i|strong|em|span|br)\b[^>]*?>/gi;
  const pilha = [];
  let html2 = "";
  let i = 0;
  let m;
  const texto2 = /* @__PURE__ */ __name((pedaco) => {
    html2 += escapar(decodificar(pedaco)).replaceAll("\n", "<br>");
  }, "texto");
  while (m = re.exec(bruto)) {
    texto2(bruto.slice(i, m.index));
    i = m.index + m[0].length;
    const fecha = m[0].startsWith("</");
    const nome = m[1].toLowerCase() === "strong" ? "b" : m[1].toLowerCase() === "em" ? "i" : m[1].toLowerCase();
    if (nome === "br") {
      if (!fecha) html2 += "<br>";
      continue;
    }
    if (!fecha) {
      if (nome === "span") {
        const classe = classesSpan(m[0]);
        if (!classe) {
          pilha.push("");
          continue;
        }
        html2 += `<span class="${classe}">`;
        pilha.push("span");
      } else {
        html2 += `<${nome}>`;
        pilha.push(nome);
      }
      continue;
    }
    const onde = pilha.lastIndexOf(nome);
    if (onde < 0) continue;
    while (pilha.length - 1 > onde) {
      const topo = pilha.pop();
      if (topo) html2 += `</${topo}>`;
    }
    pilha.pop();
    html2 += `</${nome}>`;
  }
  texto2(bruto.slice(i));
  while (pilha.length) {
    const topo = pilha.pop();
    if (topo) html2 += `</${topo}>`;
  }
  return { html: html2 };
}
__name(htmlSeguro, "htmlSeguro");
function htmlDeTexto(valor) {
  const r = htmlSeguro(valor);
  if (r.erro || r.html == null) return escapar(valor).replaceAll("\n", "<br>");
  return r.html;
}
__name(htmlDeTexto, "htmlDeTexto");
function textoRico(entrada, max = 2e5) {
  const r = htmlSeguro(entrada, max);
  if (r.erro) return r;
  return { valor: r.html };
}
__name(textoRico, "textoRico");
function perfilPadrao(chave) {
  const k = String(chave || "");
  if (/^t\.nav\./.test(k) || k === "t.volunteer.signNow") return "nav";
  if (/^t\.(educational|sensory|volunteer|donations|sponsors)\.(h1|heroLine)$/.test(k)) return "cabeca";
  return "livre";
}
__name(perfilPadrao, "perfilPadrao");
var NAV_PARA_TITULO = {
  "t.nav.educational": "t.educational.title",
  "t.nav.sensory": "t.sensory.title",
  "t.nav.volunteer": "t.volunteer.title",
  "t.nav.sponsors": "t.sponsors.title",
  "t.nav.donations": "t.donations.title",
  "t.nav.app": "t.app.title"
};
function chaveTituloDaNav(chaveNav) {
  return NAV_PARA_TITULO[chaveNav] || "";
}
__name(chaveTituloDaNav, "chaveTituloDaNav");
function limparParagrafoVoluntario(valor) {
  return String(valor ?? "").replace(/(?:<br\s*\/?>|\s)+$/gi, "").replace(/^(?:<br\s*\/?>|\s)+/gi, "");
}
__name(limparParagrafoVoluntario, "limparParagrafoVoluntario");
function aplicarPadraoTexto(chave, html2) {
  const k = String(chave || "");
  if (/^t\.volunteer\.media\.[^.]+\.(who|work|why|p\d+)$/.test(k)) return limparParagrafoVoluntario(html2);
  const perfil = perfilPadrao(chave);
  if (perfil === "livre") return String(html2 ?? "");
  let saida = String(html2 ?? "");
  saida = saida.replace(/<span\b([^>]*)>/gi, (tag, attrs) => {
    const achado = attrs.match(/\bclass\s*=\s*"([^"]*)"/i);
    if (!achado) return "<span>";
    const keep = achado[1].split(/\s+/).filter((nome) => {
      if (!nome) return false;
      if (nome.startsWith("tx-") && TAMANHOS.has(nome.slice(3))) return false;
      if (ALINHA.has(nome)) return false;
      return true;
    });
    if (!keep.length) return "<span>";
    return `<span class="${keep.join(" ")}">`;
  });
  let anterior;
  do {
    anterior = saida;
    saida = saida.replace(/<span>([\s\S]*?)<\/span>/gi, "$1");
  } while (saida !== anterior);
  if (perfil === "nav") {
    saida = saida.replace(/<br\s*\/?>/gi, " ");
    saida = saida.replace(/[ \t\f\v]+/g, " ");
    saida = saida.replace(/ *\n */g, " ").trim();
  }
  return saida;
}
__name(aplicarPadraoTexto, "aplicarPadraoTexto");
function tituloAPartirDaNav(nomeVisivel, siteName) {
  const nome = String(nomeVisivel ?? "").replace(/\s+/g, " ").trim();
  const marca = String(siteName ?? "").trim() || "Inca Braille Trail";
  if (!nome) return marca;
  return `${nome} \u2014 ${marca}`;
}
__name(tituloAPartirDaNav, "tituloAPartirDaNav");
function alinharTitulosDaNav(textos, siteName = "Inca Braille Trail") {
  const saida = { ...textos || {} };
  for (const [nav, titulo] of Object.entries(NAV_PARA_TITULO)) {
    if (!Object.prototype.hasOwnProperty.call(saida, nav)) continue;
    const nome = textoVisivel(aplicarPadraoTexto(nav, saida[nav]));
    saida[titulo] = tituloAPartirDaNav(nome, siteName);
  }
  return saida;
}
__name(alinharTitulosDaNav, "alinharTitulosDaNav");
function textoVisivel(html2) {
  return String(html2 ?? "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replaceAll("&nbsp;", " ").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", '"').replaceAll("&#39;", "'").replaceAll("&amp;", "&");
}
__name(textoVisivel, "textoVisivel");
function textoPlano(entrada, max = 2e5) {
  const valor = String(entrada ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (valor.includes("\0")) return { erro: "nulo" };
  if (valor.length > max) return { erro: "largo" };
  return { valor };
}
__name(textoPlano, "textoPlano");
function emailValido(entrada) {
  const email = String(entrada ?? "").trim().toLowerCase();
  if (email.length < 6 || email.length > 200) return "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "";
  return email;
}
__name(emailValido, "emailValido");
function chaveValida(chave) {
  return typeof chave === "string" && /^[a-zA-Z0-9._-]{1,180}$/.test(chave);
}
__name(chaveValida, "chaveValida");
function segredoIgual(recebido, esperado) {
  const a = Buffer.from(String(recebido ?? ""));
  const b = Buffer.from(String(esperado ?? ""));
  if (!esperado || a.length !== b.length) {
    crypto2.timingSafeEqual(Buffer.alloc(32), Buffer.alloc(32));
    return false;
  }
  return crypto2.timingSafeEqual(a, b);
}
__name(segredoIgual, "segredoIgual");

// ../painel/chave.mjs
var ITER = 1e5;
function b64(bytes) {
  let s = "";
  const lista = new Uint8Array(bytes);
  for (const b of lista) s += String.fromCharCode(b);
  return btoa(s);
}
__name(b64, "b64");
function deB64(texto2) {
  const bin = atob(texto2);
  const saida = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) saida[i] = bin.charCodeAt(i);
  return saida;
}
__name(deB64, "deB64");
async function derivar(senha, salt, iter) {
  const chave = await crypto.subtle.importKey("raw", new TextEncoder().encode(String(senha)), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: iter, hash: "SHA-256" }, chave, 256);
  return new Uint8Array(bits);
}
__name(derivar, "derivar");
async function hashSenhaNuvem(senha) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const bits = await derivar(senha, salt, ITER);
  return `pbkdf2$${ITER}$${b64(salt)}$${b64(bits)}`;
}
__name(hashSenhaNuvem, "hashSenhaNuvem");
async function senhaConfereHash(senha, hash) {
  const partes = String(hash || "").split("$");
  if (partes[0] !== "pbkdf2" || partes.length !== 4) return false;
  const iter = Number(partes[1]);
  if (!iter) return false;
  const bits = await derivar(senha, deB64(partes[2]), iter);
  const esperado = deB64(partes[3]);
  if (bits.length !== esperado.length) return false;
  let diff = 0;
  for (let i = 0; i < bits.length; i++) diff |= bits[i] ^ esperado[i];
  return diff === 0;
}
__name(senhaConfereHash, "senhaConfereHash");

// ../painel/arquivo.mjs
var MAX_LADO = 8e3;
function nomeAleatorio(ext) {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return `${[...bytes].map((b) => b.toString(16).padStart(2, "0")).join("")}${ext}`;
}
__name(nomeAleatorio, "nomeAleatorio");
function tipoImagem(buffer) {
  if (!buffer || buffer.length < 12) return "";
  if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return "jpeg";
  if (buffer[0] === 137 && buffer[1] === 80 && buffer[2] === 78 && buffer[3] === 71) return "png";
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return "webp";
  const inicio = buffer.subarray(0, Math.min(200, buffer.length)).toString("utf8").trimStart().toLowerCase();
  if (inicio.startsWith("<svg") || inicio.startsWith("<?xml")) return "svg";
  return "";
}
__name(tipoImagem, "tipoImagem");
function tipoVideo(buffer) {
  if (!buffer || buffer.length < 12) return "";
  if (buffer.toString("ascii", 4, 8) === "ftyp") return "mp4";
  if (buffer[0] === 26 && buffer[1] === 69 && buffer[2] === 223 && buffer[3] === 163) return "webm";
  return "";
}
__name(tipoVideo, "tipoVideo");
function sanitizarSvg(texto2) {
  const cru = String(texto2 || "");
  if (cru.length > 5e5) return "";
  if (!/<svg[\s>]/i.test(cru)) return "";
  if (/<!entity|<!doctype|foreignobject|<script|javascript:|data:text\/html|\son[a-z]+\s*=/i.test(cru)) return "";
  const limpo = cru.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "").replace(/javascript:/gi, "");
  if (/<script|on[a-z]+\s*=|javascript:/i.test(limpo)) return "";
  return limpo;
}
__name(sanitizarSvg, "sanitizarSvg");
function dimensoes(buffer, tipo) {
  if (tipo === "png" && buffer.length >= 24) return { largura: buffer.readUInt32BE(16), altura: buffer.readUInt32BE(20) };
  if (tipo === "jpeg") {
    let i = 2;
    while (i < buffer.length - 8) {
      if (buffer[i] !== 255) {
        i += 1;
        continue;
      }
      const marca = buffer[i + 1];
      const tam = buffer.readUInt16BE(i + 2);
      if (marca >= 192 && marca <= 195) return { altura: buffer.readUInt16BE(i + 5), largura: buffer.readUInt16BE(i + 7) };
      if (tam < 2) break;
      i += 2 + tam;
    }
  }
  return { largura: 0, altura: 0 };
}
__name(dimensoes, "dimensoes");
async function processarImagemNuvem(buffer, limite) {
  if (buffer.length > limite) return { erro: "grande" };
  const tipo = tipoImagem(buffer);
  if (!tipo) return { erro: "formato" };
  if (tipo === "svg") {
    const limpo = sanitizarSvg(buffer.toString("utf8"));
    if (!limpo) return { erro: "formato" };
    return { ext: ".svg", tipo: "image/svg+xml", buffer: Buffer.from(limpo), largura: 0, altura: 0 };
  }
  const bruto = dimensoes(buffer, tipo);
  if ((bruto.largura || 0) > MAX_LADO || (bruto.altura || 0) > MAX_LADO) return { erro: "formato" };
  const ext = tipo === "jpeg" ? ".jpg" : `.${tipo}`;
  return { ext, tipo: `image/${tipo === "jpeg" ? "jpeg" : tipo}`, buffer, ...bruto };
}
__name(processarImagemNuvem, "processarImagemNuvem");
function validarVideoNuvem(buffer, limite) {
  if (buffer.length > limite) return { erro: "grande" };
  const tipo = tipoVideo(buffer);
  if (!tipo) return { erro: "formato" };
  return { ext: tipo === "mp4" ? ".mp4" : ".webm", tipo: tipo === "mp4" ? "video/mp4" : "video/webm" };
}
__name(validarVideoNuvem, "validarVideoNuvem");

// ../painel/conteudo.mjs
function textoDaChave(chave, valor) {
  return aplicarPadraoTexto(chave, htmlDeTexto(valor));
}
__name(textoDaChave, "textoDaChave");
function itemGaleria(item, legenda, indice, abrir) {
  const id = escapar(item.id);
  const src = escapar(item.src);
  const legendaHtml = `<span data-edit-key="${escapar(item.legenda_chave)}" data-edit-type="text">${textoDaChave(item.legenda_chave, legenda)}</span>`;
  const rotulo = `${escapar(abrir)} ${indice}`;
  const w = item.largura ? ` width="${Number(item.largura)}"` : "";
  const h = item.altura ? ` height="${Number(item.altura)}"` : "";
  if (item.tipo === "video") {
    const poster = item.poster ? ` poster="${escapar(item.poster)}"` : "";
    const mime = item.src.endsWith(".webm") ? "video/webm" : "video/mp4";
    return `<li class="galeria-item" data-item-id="${id}">
              <button class="galeria-botao" type="button" data-tipo="video" data-src="${src}" data-legenda="${escapar(legenda)}" data-legenda-chave="${escapar(item.legenda_chave)}" aria-label="${rotulo}">
                <video muted playsinline preload="metadata" tabindex="-1" aria-hidden="true"${poster}><source src="${src}#t=0.1" type="${mime}"></video>
              </button>
              <figure class="galeria-cheia">
                <video controls playsinline preload="metadata"${poster}${w}${h} aria-label="${escapar(legenda)}"><source src="${src}" type="${mime}"></video>
                <figcaption>${legendaHtml}</figcaption>
              </figure>
            </li>`;
  }
  const webp = item.webp && item.webp !== item.src ? `<source type="image/webp" srcset="${escapar(item.webp)}">` : "";
  const foto = `${webp}<img src="${src}"${w}${h} alt="">`;
  const fotoCheia = `${webp}<img src="${src}"${w}${h} alt="${escapar(legenda)}">`;
  return `<li class="galeria-item" data-item-id="${id}">
              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="${src}" data-legenda="${escapar(legenda)}" data-legenda-chave="${escapar(item.legenda_chave)}" aria-label="${rotulo}">
                <picture>${foto}</picture>
              </button>
              <figure class="galeria-cheia">
                <picture>${fotoCheia}</picture>
                <figcaption>${legendaHtml}</figcaption>
              </figure>
            </li>`;
}
__name(itemGaleria, "itemGaleria");
function aplicarGalerias(html2, galerias, textos) {
  const mapa = new Map(galerias.map((g2) => [g2.chave, g2]));
  return html2.replace(/<ul class="galeria"[^>]*\bdata-edit-key="([^"]+)"[^>]*>[\s\S]*?<\/ul>/g, (bloco, chave) => {
    const g2 = mapa.get(chave);
    if (!g2) return bloco;
    const abrirChave = g2.abrir_chave || bloco.match(/\bdata-abrir-chave="([^"]+)"/)?.[1] || "";
    const abrir = abrirChave && textos[abrirChave] ? textos[abrirChave] : "";
    const abrirAttr = abrirChave ? ` data-abrir-chave="${escapar(abrirChave)}"` : "";
    const itens = g2.itens.map((item, i) => itemGaleria(item, textos[item.legenda_chave] || "", i + 1, abrir)).join("\n            ");
    return `<ul class="galeria" data-edit-key="${escapar(chave)}" data-edit-type="gallery"${abrirAttr}>${itens}</ul>`;
  });
}
__name(aplicarGalerias, "aplicarGalerias");
function aplicarImagens(html2, imagens, textos) {
  let saida = html2.replace(/<picture\b([^>]*\bdata-edit-key="([^"]+)"[^>]*)>([\s\S]*?)<\/picture>/g, (tudo, attrs, chave, inner) => {
    const im = imagens[chave];
    if (!im) return tudo;
    const altChave = attrs.match(/\bdata-alt-key="([^"]+)"/)?.[1] || im.alt_chave;
    const altAtual = inner.match(/\salt="([^"]*)"/)?.[1] || "";
    const alt = altChave && Object.prototype.hasOwnProperty.call(textos, altChave) ? textos[altChave] : altAtual;
    const w = im.largura || inner.match(/\bwidth="(\d+)"/)?.[1] || "";
    const h = im.altura || inner.match(/\bheight="(\d+)"/)?.[1] || "";
    const dims = `${w ? ` width="${w}"` : ""}${h ? ` height="${h}"` : ""}`;
    const pressa = /fetchpriority="high"/.test(inner) ? ' fetchpriority="high"' : "";
    const webp = im.webp && im.webp !== im.src ? `<source type="image/webp" srcset="${escapar(im.webp)}">` : "";
    return `<picture${attrs}>${webp}<img src="${escapar(im.src)}"${dims} alt="${escapar(alt)}"${pressa}></picture>`;
  });
  saida = saida.replace(/<img\b[^>]*\bdata-edit-key="([^"]+)"[^>]*>/g, (tag, chave) => {
    const im = imagens[chave];
    if (!im) return tag;
    let novo = tag.replace(/\ssrc="[^"]*"/, ` src="${escapar(im.src)}"`);
    const altChave = tag.match(/\bdata-alt-key="([^"]+)"/)?.[1] || im.alt_chave;
    if (altChave && Object.prototype.hasOwnProperty.call(textos, altChave)) {
      novo = novo.replace(/\salt="[^"]*"/, ` alt="${escapar(textos[altChave])}"`);
    }
    return novo;
  });
  return saida;
}
__name(aplicarImagens, "aplicarImagens");
function aplicarTextos(html2, textos) {
  return html2.replace(/(<([a-zA-Z0-9]+)\b[^>]*\bdata-edit-key="([^"]+)"[^>]*\bdata-edit-type="text"[^>]*>)([\s\S]*?)(<\/\2>)/g, (tudo, abre, _tag, chave, _miolo, fecha) => {
    if (!Object.prototype.hasOwnProperty.call(textos, chave)) return tudo;
    if (abre.includes('data-edit="locked"')) return tudo;
    return `${abre}${textoDaChave(chave, textos[chave])}${fecha}`;
  });
}
__name(aplicarTextos, "aplicarTextos");
function aplicarMeta(html2, textos) {
  let saida = html2.replace(/<title\b([^>]*)>([^<]*)<\/title>/g, (tudo, attrs, _texto) => {
    const chave = attrs.match(/\bdata-edit-key="([^"]+)"/)?.[1];
    if (!chave || !Object.prototype.hasOwnProperty.call(textos, chave)) return tudo;
    return `<title${attrs}>${escapar(textoVisivel(textos[chave]))}</title>`;
  });
  saida = saida.replace(/<meta\b[^>]*\bname="description"[^>]*>/g, (tag) => {
    const chave = tag.match(/\bdata-edit-key="([^"]+)"/)?.[1];
    if (!chave || !Object.prototype.hasOwnProperty.call(textos, chave)) return tag;
    return tag.replace(/\bcontent="[^"]*"/, `content="${escapar(textoVisivel(textos[chave]))}"`);
  });
  saida = saida.replace(/<([a-zA-Z0-9]+)\b([^>]*\bdata-numero-chave="([^"]+)"[^>]*)>/g, (tudo, tag, attrs, chave) => {
    if (!Object.prototype.hasOwnProperty.call(textos, chave)) return tudo;
    const novos = attrs.replace(/\bdata-numero="[^"]*"/, `data-numero="${escapar(textos[chave])}"`);
    return `<${tag}${novos}>`;
  });
  saida = saida.replace(/<a\b([^>]*\bdata-href-chave="([^"]+)"[^>]*)>/g, (tudo, attrs, chave) => {
    if (!Object.prototype.hasOwnProperty.call(textos, chave)) return tudo;
    const prefixo = attrs.match(/\bdata-href-prefixo="([^"]*)"/)?.[1] || "";
    const href = `${prefixo}${String(textos[chave]).replaceAll(" ", "")}`;
    const novos = attrs.replace(/\bhref="[^"]*"/, `href="${escapar(href)}"`);
    return `<a${novos}>`;
  });
  return saida;
}
__name(aplicarMeta, "aplicarMeta");
function itemVoluntario(id, textos, imagens) {
  const base = `t.volunteer.media.${id}`;
  const nome = textos[`${base}.name`] || id;
  const alt = textos[`${base}.alt`] || nome;
  const im = imagens[`img.volunteer.${id}`] || {};
  const src = im.src || "/img/og.png";
  const webp = im.webp && im.webp !== src ? `<source type="image/webp" srcset="${escapar(im.webp)}">` : "";
  const w = im.largura || 768;
  const h = im.altura || 1024;
  const baseEsc = base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const extras = Object.keys(textos).filter((chave) => new RegExp(`^${baseEsc}\\.p\\d+$`).test(chave) && textos[chave]).sort((a, b) => Number(a.match(/p(\d+)$/)[1]) - Number(b.match(/p(\d+)$/)[1]));
  const paragrafos = ["who", "work", "why"].map((campo) => `${base}.${campo}`).concat(extras).map((chave) => {
    const campo = chave.slice(base.length + 1);
    if (!Object.prototype.hasOwnProperty.call(textos, chave) && campo !== "who") return "";
    const valor = limparParagrafoVoluntario(textos[chave] || "");
    if (!valor && campo !== "who") return "";
    return `<p><span data-edit-key="${escapar(chave)}" data-edit-type="text">${htmlDeTexto(valor)}</span></p>`;
  }).filter(Boolean).join("\n                ");
  const dica = textos["t.volunteer.media.click"] || "Click to open";
  return `<li class="voluntario" data-voluntario-id="${escapar(id)}">
            <button class="voluntario-mini" type="button" aria-haspopup="dialog" aria-controls="visor-voluntarios" aria-label="${escapar(nome)}">
              <picture data-edit-key="img.volunteer.${escapar(id)}" data-edit-type="image" data-alt-key="${escapar(`${base}.alt`)}">
                ${webp}<img src="${escapar(src)}" width="${Number(w)}" height="${Number(h)}" alt="${escapar(alt)}">
              </picture>
              <span class="voluntario-dica">${htmlDeTexto(dica)}</span>
            </button>
            <h3 class="voluntario-nome"><span data-edit-key="${escapar(`${base}.name`)}" data-edit-type="text">${htmlDeTexto(nome)}</span></h3>
            <div class="voluntario-bio">
              ${paragrafos}
            </div>
          </li>`;
}
__name(itemVoluntario, "itemVoluntario");
function aplicarVoluntarios(html2, voluntarios, textos, imagens) {
  if (!Array.isArray(voluntarios) || !voluntarios.length) return html2;
  return html2.replace(/<ul class="voluntarios"[^>]*>[\s\S]*?<\/ul>/g, () => {
    const itens = voluntarios.map((id) => itemVoluntario(id, textos, imagens)).join("\n          ");
    return `<ul class="voluntarios" data-edit-key="lista.voluntarios" data-edit-type="volunteers">${itens}</ul>`;
  });
}
__name(aplicarVoluntarios, "aplicarVoluntarios");
function urlHttps(valor) {
  const url = String(valor || "").trim();
  if (!/^https:\/\/[^\s<>"']+$/i.test(url)) return "";
  return url;
}
__name(urlHttps, "urlHttps");
function aplicarAfiliados(html2, afiliados) {
  if (!html2.includes('data-edit-type="partners"')) return html2;
  const lista = Array.isArray(afiliados) ? afiliados : [];
  const validos = lista.filter((item) => urlHttps(item.url) && item.src);
  const cheios = validos.map((item) => {
    const url = escapar(urlHttps(item.url));
    const src = escapar(item.src);
    return `<li class="afiliado"><a class="afiliado-logo" href="${url}" target="_blank" rel="noopener noreferrer"><img src="${src}" alt=""></a></li>`;
  }).join("");
  const buracos = '<li class="afiliado-vazio"></li>'.repeat(Math.max(0, 4 - validos.length));
  return html2.replace(/<ul class="afiliados"[^>]*>[\s\S]*?<\/ul>/, `<ul class="afiliados" data-edit-key="lista.afiliados" data-edit-type="partners" aria-labelledby="afiliados-titulo">${cheios}${buracos}</ul>`);
}
__name(aplicarAfiliados, "aplicarAfiliados");
function aplicarConteudo(html2, estado2) {
  const textos = alinharTitulosDaNav(estado2.textos);
  const { imagens, galerias, voluntarios, afiliados } = estado2;
  let saida = aplicarAfiliados(html2, afiliados);
  saida = aplicarVoluntarios(saida, voluntarios, textos, imagens);
  saida = aplicarGalerias(saida, galerias, textos);
  saida = aplicarImagens(saida, imagens, textos);
  saida = aplicarTextos(saida, textos);
  saida = aplicarMeta(saida, textos);
  return saida;
}
__name(aplicarConteudo, "aplicarConteudo");

// ../painel/traducao.mjs
var NOMES = { en: "English", es: "Spanish", pt: "Portuguese (Brazil)", ko: "Korean", ja: "Japanese", zh: "Chinese (Simplified)" };
var DEEPL = { en: "EN", es: "ES", pt: "PT-BR", ko: "KO", ja: "JA", zh: "ZH" };
var GOOGLE = { en: "en", es: "es", pt: "pt", ko: "ko", ja: "ja", zh: "zh-CN" };
function detectarIdioma(texto2, fallback = "en") {
  const t = String(texto2 || "");
  if (/[\uac00-\ud7af]/.test(t)) return "ko";
  if (/[\u3040-\u30ff]/.test(t)) return "ja";
  if (/[\u4e00-\u9fff]/.test(t)) return "zh";
  if (/[ñ¿¡]|\b(el|la|los|las|ción|ciones)\b/i.test(t)) return "es";
  if (/[ãõ]|ção\b|\b(não|você)\b/i.test(t)) return "pt";
  if (/[a-z]/i.test(t)) return "en";
  return fallback;
}
__name(detectarIdioma, "detectarIdioma");
var MEMORIA = { en: "en", es: "es", pt: "pt", ko: "ko", ja: "ja", zh: "zh-CN" };
async function memoria(texto2, de, para) {
  const pedacos = [];
  let resto = String(texto2 || "");
  while (resto.length > 450) {
    let corte = resto.lastIndexOf(" ", 450);
    if (corte < 80) corte = 450;
    pedacos.push(resto.slice(0, corte));
    resto = resto.slice(corte).trimStart();
  }
  if (resto) pedacos.push(resto);
  const saida = [];
  for (const pedaco of pedacos) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(pedaco)}&langpair=${MEMORIA[de] || de}|${MEMORIA[para] || para}`;
    const resposta = await fetch(url, { signal: AbortSignal.timeout(15e3) });
    if (!resposta.ok) throw new Error("traducao");
    const json3 = await resposta.json();
    const valor = json3.responseData?.translatedText || "";
    if (!valor || /MYMEMORY WARNING/i.test(valor)) throw new Error("traducao");
    saida.push(valor);
  }
  return saida.join(" ");
}
__name(memoria, "memoria");
async function deepl(texto2, destino, env2) {
  const base = env2.DEEPL_URL || "https://api-free.deepl.com/v2/translate";
  const resposta = await fetch(base, {
    method: "POST",
    signal: AbortSignal.timeout(2e4),
    headers: { Authorization: `DeepL-Auth-Key ${env2.TRADUCAO_CHAVE}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text: [texto2], target_lang: DEEPL[destino] })
  });
  if (!resposta.ok) throw new Error("traducao");
  const json3 = await resposta.json();
  return json3.translations?.[0]?.text || "";
}
__name(deepl, "deepl");
async function google(texto2, destino, env2) {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(env2.TRADUCAO_CHAVE)}`;
  const resposta = await fetch(url, {
    method: "POST",
    signal: AbortSignal.timeout(2e4),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: texto2, target: GOOGLE[destino], format: "text" })
  });
  if (!resposta.ok) throw new Error("traducao");
  const json3 = await resposta.json();
  return json3.data?.translations?.[0]?.translatedText || "";
}
__name(google, "google");
async function anthropic(texto2, fonte, destinos, env2) {
  const lista = destinos.map((c) => `${c} (${NOMES[c] || c})`).join(", ");
  const resposta = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal: AbortSignal.timeout(3e4),
    headers: {
      "x-api-key": env2.TRADUCAO_CHAVE,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: env2.TRADUCAO_MODELO || "claude-sonnet-4-5",
      max_tokens: 4e3,
      messages: [{
        role: "user",
        content: `Translate the text from ${fonte} into ${lista}. Reply with JSON only, keys are the language codes, values are plain text. Do not add HTML.

${texto2}`
      }]
    })
  });
  if (!resposta.ok) throw new Error("traducao");
  const json3 = await resposta.json();
  const bruto = json3.content?.map((p) => p.text || "").join("") || "";
  const inicio = bruto.indexOf("{");
  const fim = bruto.lastIndexOf("}");
  if (inicio < 0 || fim < inicio) throw new Error("traducao");
  return JSON.parse(bruto.slice(inicio, fim + 1));
}
__name(anthropic, "anthropic");
function manterFormato(pares, visivel, html2, idiomaPagina = "en") {
  const fonte = detectarIdioma(visivel, idiomaPagina || "en");
  return pares.map((p) => p.idioma === fonte ? { ...p, valor: html2 } : p);
}
__name(manterFormato, "manterFormato");
async function traduzirTodos(texto2, fonte, idiomas2, env2 = process.env) {
  const saida = {};
  for (const idioma of idiomas2) {
    if (idioma === fonte) saida[idioma] = { valor: texto2, pendente: 0 };
    else saida[idioma] = { valor: texto2, pendente: 1 };
  }
  const provedor = (env2.TRADUCAO_PROVEDOR || "").toLowerCase();
  const destinos = idiomas2.filter((c) => c !== fonte);
  if (!provedor || !env2.TRADUCAO_CHAVE) {
    for (const idioma of destinos) {
      try {
        const valor = await memoria(texto2, fonte, idioma);
        if (valor) saida[idioma] = { valor, pendente: 0 };
      } catch {
        saida[idioma] = { valor: texto2, pendente: 1 };
      }
    }
    return saida;
  }
  try {
    if (provedor === "anthropic" || provedor === "claude") {
      const mapa = await anthropic(texto2, fonte, destinos, env2);
      for (const idioma of destinos) {
        if (typeof mapa[idioma] === "string" && mapa[idioma]) saida[idioma] = { valor: mapa[idioma], pendente: 0 };
      }
      return saida;
    }
    for (const idioma of destinos) {
      try {
        const valor = provedor === "google" ? await google(texto2, idioma, env2) : await deepl(texto2, idioma, env2);
        if (valor) saida[idioma] = { valor, pendente: 0 };
      } catch {
        saida[idioma] = { valor: texto2, pendente: 1 };
      }
    }
  } catch {
    return saida;
  }
  return saida;
}
__name(traduzirTodos, "traduzirTodos");

// ../painel/paginas.mjs
function casca(titulo, corpo) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>${escapar(titulo)}</title>
  <link rel="stylesheet" href="/panel/acesso.css">
</head>
<body>
  <main>
    <h1>${escapar(titulo)}</h1>
    ${corpo}
  </main>
</body>
</html>`;
}
__name(casca, "casca");
function alerta(texto2) {
  if (!texto2) return "";
  return `<p class="erro" role="alert">${escapar(texto2)}</p>`;
}
__name(alerta, "alerta");
function paginaRegistro(csrf, erro) {
  return casca("Create access", `
    <p>This page is used once. The email you save will be the only one that can edit the site.</p>
    ${alerta(erro)}
    <form method="post">
      <input type="hidden" name="csrf" value="${escapar(csrf)}">
      <label for="email">Email</label>
      <input id="email" name="email" type="email" autocomplete="username" required>
      <label for="senha">Password (at least 12 characters)</label>
      <input id="senha" name="senha" type="password" autocomplete="new-password" minlength="12" required>
      <label for="senha2">Repeat the password</label>
      <input id="senha2" name="senha2" type="password" autocomplete="new-password" minlength="12" required>
      <button type="submit">Save access</button>
    </form>`);
}
__name(paginaRegistro, "paginaRegistro");
function paginaLogin(csrf, erro) {
  return casca("Sign in to edit", `
    <p>Sign in with the email and password from registration. It works on any computer.</p>
    ${alerta(erro)}
    <form method="post" action="/panel/login">
      <input type="hidden" name="csrf" value="${escapar(csrf)}">
      <label for="email">Email</label>
      <input id="email" name="email" type="email" autocomplete="username" required>
      <label for="senha">Password</label>
      <input id="senha" name="senha" type="password" autocomplete="current-password" required>
      <button type="submit">Sign in</button>
    </form>
    <p><a href="/panel/olvide">I forgot my password</a></p>`);
}
__name(paginaLogin, "paginaLogin");

// ../painel/base-site.mjs
var IDIOMAS = [
  { code: "en", prefix: "" },
  { code: "es", prefix: "es" }
];
var PAGINAS = [
  { id: "home", rota: "" },
  { id: "sitemap", rota: "site-map" },
  { id: "educational", rota: "educational-trail" },
  { id: "sensory", rota: "sensory-trail" },
  { id: "volunteer", rota: "volunteer" },
  { id: "sponsors", rota: "sponsors" },
  { id: "donations", rota: "donations" },
  { id: "app", rota: "app" }
];
var MENU = [
  {
    id: "home",
    filhos: [
      { id: "home" },
      { id: "sitemap" },
      { id: "educational" },
      { id: "sensory" },
      { id: "volunteer", soMovel: true },
      { inscricao: true, soMovel: true },
      { id: "sponsors", soMovel: true },
      { id: "donations", soMovel: true },
      { id: "app", soMovel: true }
    ]
  },
  { id: "volunteer", soLargo: true, filhos: [{ id: "volunteer" }, { inscricao: true }] },
  {
    id: "sponsors",
    soLargo: true,
    filhos: [
      { id: "sponsors" },
      { id: "donations" }
    ]
  },
  { id: "app", filhos: [] }
];
var POR_ID = Object.fromEntries(PAGINAS.map((p) => [p.id, p]));
var OG_LOCALE = { en: "en_US", es: "es_PE", pt: "pt_BR", ko: "ko_KR", ja: "ja_JP", zh: "zh_CN" };
var GOOGLE_HL = { en: "en", es: "es", pt: "pt", ko: "ko", ja: "ja", zh: "zh-CN" };
function googleFormComIdioma(url, codigo) {
  if (!url) return "";
  try {
    const u = new URL(url);
    u.searchParams.set("embedded", "true");
    u.searchParams.set("hl", GOOGLE_HL[codigo] || "en");
    return u.href;
  } catch {
    return url;
  }
}
__name(googleFormComIdioma, "googleFormComIdioma");
function caminho(idioma, pagina2) {
  const partes = [idioma.prefix, pagina2.rota].filter(Boolean);
  return partes.length ? `/${partes.join("/")}/` : "/";
}
__name(caminho, "caminho");
function escapar2(texto2) {
  return String(texto2).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
__name(escapar2, "escapar");
function textoTravado(valor) {
  return `<span data-edit="locked">${escapar2(valor)}</span>`;
}
__name(textoTravado, "textoTravado");
function textoMenu(chave, valor) {
  const seguro = escapar2(valor).replaceAll("\n", "<br>");
  return `<span data-edit-key="${escapar2(chave)}" data-edit-type="text" data-edit-nav="1">${seguro}</span>`;
}
__name(textoMenu, "textoMenu");
function textoEditavel(chave, valor) {
  const seguro = escapar2(valor).replaceAll("\n", "<br>");
  if (chave.startsWith("t.nav.")) return textoTravado(valor);
  if (!/^(t\.|contas\.|contato\.)/.test(chave)) return seguro;
  return `<span data-edit-key="${escapar2(chave)}" data-edit-type="text">${seguro}</span>`;
}
__name(textoEditavel, "textoEditavel");
function editavelAqui(template, index) {
  const ate = template.slice(0, index);
  const fecha = ate.lastIndexOf(">");
  const abre = fecha >= 0 ? ate.lastIndexOf("<", fecha) : -1;
  if (abre >= 0 && ate.lastIndexOf("<") > fecha) return false;
  const tag = abre >= 0 ? ate.slice(abre, fecha + 1) : "";
  if (tag.includes("data-edit-key")) return false;
  const titulo = ate.lastIndexOf("<title");
  const tituloFim = ate.lastIndexOf("</title>");
  if (titulo > tituloFim) return false;
  return true;
}
__name(editavelAqui, "editavelAqui");
function buscar(obj, chave) {
  return chave.split(".").reduce((acc, parte) => acc == null ? void 0 : acc[parte], obj);
}
__name(buscar, "buscar");
function render(template, ctx) {
  return template.replace(/\{\{\{\s*([\w.]+)\s*\}\}\}|\{\{\s*([\w.]+)\s*\}\}/g, (trecho, cru, esc, offset) => {
    const chave = cru || esc;
    const valor = buscar(ctx, chave);
    if (valor === void 0) throw new Error(`Chave ausente no template: ${chave}`);
    if (cru) return String(valor);
    const texto2 = String(valor);
    if (!editavelAqui(template, offset)) return escapar2(texto2);
    return textoEditavel(chave, texto2);
  });
}
__name(render, "render");
function prepararGalerias(html2) {
  return html2.replace(/<ul class="galeria">([\s\S]*?)<\/ul>/g, (tudo, miolo, offset) => {
    const antes2 = html2.slice(Math.max(0, offset - 900), offset);
    const marcas = [...antes2.matchAll(/data-galeria="([^"]+)"/g)];
    const id = marcas.length ? marcas[marcas.length - 1][1] : "galeria";
    const abrir = (miolo.match(/aria-label="\{\{\s*([^}]+?)\s*\}\}/) || [])[1] || "";
    let n = 0;
    let corpo = miolo.replace(/<li class="galeria-item">/g, () => {
      n += 1;
      return `<li class="galeria-item" data-item-id="${id}-${n}">`;
    });
    corpo = corpo.replace(/data-legenda="\{\{\s*([^}]+?)\s*\}\}"/g, (_, chave) => {
      return `data-legenda="{{${chave}}}" data-legenda-chave="${chave}"`;
    });
    const abrirAttr = abrir ? ` data-abrir-chave="${abrir}"` : "";
    return `<ul class="galeria" data-edit-key="galeria.${id}" data-edit-type="gallery"${abrirAttr}>${corpo}</ul>`;
  });
}
__name(prepararGalerias, "prepararGalerias");
function interpolar(valor, vars) {
  if (typeof valor === "string") return valor.replace(/\{(\w+)\}/g, (m, k) => k in vars ? vars[k] : m);
  if (Array.isArray(valor)) return valor.map((v) => interpolar(v, vars));
  if (valor && typeof valor === "object") {
    return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, interpolar(v, vars)]));
  }
  return valor;
}
__name(interpolar, "interpolar");
function linkNav(t, idioma, id, paginaAtual, classe, extra) {
  if (extra && extra.inscricao) {
    const cls2 = classe ? ` class="${classe} nav-inscricao"` : ' class="nav-inscricao"';
    return `<a${cls2} href="${caminho(idioma, POR_ID.volunteer)}#inscricao">${textoMenu("t.volunteer.signNow", t.volunteer.signNow)}</a>`;
  }
  const pagina2 = POR_ID[id];
  const atual = id === paginaAtual.id ? ' aria-current="page"' : "";
  const cls = classe ? ` class="${classe}"` : "";
  return `<a${cls} href="${caminho(idioma, pagina2)}"${atual}>${textoMenu(`t.nav.${id}`, t.nav[id])}</a>`;
}
__name(linkNav, "linkNav");
function navHtml(t, idioma, paginaAtual) {
  return MENU.map((item) => {
    const filhos = item.filhos;
    if (!filhos.length) return `<li class="so-largo">${linkNav(t, idioma, item.id, paginaAtual, "maiusculas")}</li>`;
    const naSecao = item.id === paginaAtual.id || filhos.some((filho) => !filho.soMovel && filho.id === paginaAtual.id);
    const largo = item.soLargo ? " so-largo" : "";
    const secao = naSecao ? ` class="tem-menu secao-atual${largo}"` : ` class="tem-menu${largo}"`;
    const itens = filhos.map((filho) => {
      const classe = filho.soMovel ? ' class="so-movel"' : "";
      if (filho.inscricao) return `<li${classe}>${linkNav(t, idioma, "volunteer", paginaAtual, "", { inscricao: true })}</li>`;
      return `<li${classe}>${linkNav(t, idioma, filho.id, paginaAtual, "")}</li>`;
    }).join("");
    const rotulo = `${escapar2(t.nav.open)}: ${escapar2(t.nav[item.id])}`;
    return `<li${secao}>${linkNav(t, idioma, item.id, paginaAtual, "maiusculas")}<button class="submenu-botao" type="button" aria-expanded="false" aria-controls="submenu-${item.id}"><span class="oculto-visual">${rotulo}</span></button><ul class="submenu" id="submenu-${item.id}" aria-label="${escapar2(t.nav[item.id])}">${itens}</ul></li>`;
  }).join("\n          ");
}
__name(navHtml, "navHtml");
function idiomasHtml(traducoes, idiomaAtual, pagina2) {
  return IDIOMAS.map((idioma) => {
    const t = traducoes[idioma.code];
    const atual = idioma.code === idiomaAtual.code;
    const marca = atual ? ` aria-current="true"` : "";
    const nota = atual ? ` <span class="oculto-visual">${escapar2(t.lang.current)}</span>` : "";
    return `<li><a href="${caminho(idioma, pagina2)}" lang="${t.htmlLang}" hreflang="${t.hreflang}"${marca}>${escapar2(t.name)}${nota}</a></li>`;
  }).join("\n              ");
}
__name(idiomasHtml, "idiomasHtml");
function alternatesHtml(site, traducoes, pagina2) {
  const linhas = IDIOMAS.map((idioma) => {
    const t = traducoes[idioma.code];
    return `<link rel="alternate" hreflang="${t.hreflang}" href="${site.baseUrl}${caminho(idioma, pagina2)}">`;
  });
  linhas.push(`<link rel="alternate" hreflang="x-default" href="${site.baseUrl}${caminho(IDIOMAS[0], pagina2)}">`);
  return linhas.join("\n  ");
}
__name(alternatesHtml, "alternatesHtml");
function blocoHtml(item, chave) {
  if (typeof item === "string") return `<p>${textoEditavel(chave, item)}</p>`;
  if (item.lead) return `<p class="destaque">${textoEditavel(`${chave}.lead`, item.lead)}</p>`;
  if (item.list) return `<ul class="lista">${item.list.map((i, n) => `<li>${textoEditavel(`${chave}.list.${n}`, i)}</li>`).join("")}</ul>`;
  throw new Error(`Bloco de caixa desconhecido: ${JSON.stringify(item)}`);
}
__name(blocoHtml, "blocoHtml");
function caixaHtml(id, titulo, chaveTitulo, corpo) {
  return `<section class="caixa">
      <h2 class="caixa-titulo"><button class="caixa-botao" type="button" id="${id}-botao" aria-expanded="true" aria-controls="${id}">${textoEditavel(chaveTitulo, titulo)}</button></h2>
      <div class="caixa-painel" id="${id}" role="region" aria-labelledby="${id}-botao">
        ${corpo}
      </div>
    </section>`;
}
__name(caixaHtml, "caixaHtml");
function caixasTexto(pagina2, boxes) {
  return boxes.map(
    (caixa, i) => caixaHtml(
      `caixa-${pagina2.id}-${i + 1}`,
      caixa.title,
      `t.${pagina2.id}.boxes.${i}.title`,
      caixa.content.map((item, j) => blocoHtml(item, `t.${pagina2.id}.boxes.${i}.content.${j}`)).join("\n        ")
    )
  );
}
__name(caixasTexto, "caixasTexto");
var EMAILS_DA_PAGINA = {
  home: ["info"],
  sitemap: ["info"],
  educational: ["info"],
  sensory: ["info"],
  volunteer: ["info"],
  sponsors: ["info"],
  donations: ["info"],
  app: ["info"]
};
function contatoHtml(t, site, pagina2) {
  const c = t.contact;
  const emails = EMAILS_DA_PAGINA[pagina2.id].map(
    (chave) => `<li><span class="email" data-edit-key="contato.email.${chave}" data-edit-type="text">${escapar2(site.contato.emails[chave])}</span></li>`
  ).join("\n              ");
  return `<section class="contato" aria-labelledby="contato-titulo">
      <div class="contato-interno">
        <h2 id="contato-titulo">${textoEditavel("t.contact.heading", c.heading)}</h2>
        <dl class="contato-lista">
          <div>
            <dt>${textoEditavel("t.contact.placeLabel", c.placeLabel)}</dt>
            <dd>${textoEditavel("t.contact.place", c.place)}<br>
              <a class="botao botao-leve" href="${site.contato.mapa}" target="_blank" rel="noopener noreferrer">${textoEditavel("t.contact.mapButton", c.mapButton)} <span class="externo">${textoEditavel("t.external", t.external)}</span></a>
            </dd>
          </div>
          <div>
            <dt>${textoEditavel("t.contact.phoneLabel", c.phoneLabel)}</dt>
            <dd><a data-href-chave="contato.telefone" data-href-prefixo="tel:" href="tel:${site.contato.telefone.replaceAll(" ", "")}">${textoEditavel("contato.telefone", site.contato.telefone)}</a><br>
              <a href="${site.contato.whatsapp}" target="_blank" rel="noopener noreferrer">${textoEditavel("t.contact.whatsappLink", c.whatsappLink)} <span class="externo">${textoEditavel("t.external", t.external)}</span></a>
            </dd>
          </div>
          <div>
            <dt>${textoEditavel("t.contact.socialLabel", c.socialLabel)}</dt>
            <dd>Instagram: ${textoEditavel("t.contact.tbc", c.tbc)}<br>Facebook: ${textoEditavel("t.contact.tbc", c.tbc)}</dd>
          </div>
          <div>
            <dt>${textoEditavel("t.contact.emailsLabel", c.emailsLabel)}</dt>
            <dd><ul>${emails}</ul></dd>
          </div>
        </dl>
      </div>
    </section>`;
}
__name(contatoHtml, "contatoHtml");
function montarFontes(site, i18nPorCodigo, layout, templatesCrus) {
  const vars = { siteName: site.siteName, dominio: site.dominioPretendido };
  const traducoes = {};
  for (const idioma of IDIOMAS) traducoes[idioma.code] = interpolar(i18nPorCodigo[idioma.code], vars);
  const templates = {};
  for (const p of PAGINAS) templates[p.id] = prepararGalerias(templatesCrus[p.id]);
  return { site, traducoes, layout, templates };
}
__name(montarFontes, "montarFontes");
function gerarPaginaBase(fontes2, codigoIdioma, idPagina, ano) {
  const { site, traducoes, layout, templates } = fontes2;
  const idioma = IDIOMAS.find((i) => i.code === codigoIdioma);
  const pagina2 = POR_ID[idPagina];
  if (!idioma || !pagina2) throw new Error(`P\xE1gina desconhecida: ${codigoIdioma}/${idPagina}`);
  const t = traducoes[idioma.code];
  const robots = site.robotsNoindex ? '<meta name="robots" content="noindex">' : "";
  const recepcao = typeof site.recepcao === "string" ? site.recepcao.trim() : "";
  const formsAtivos = recepcao.includes("@");
  const formAction = formsAtivos ? `https://formsubmit.co/ajax/${recepcao}` : "";
  const googleFormBase = site.googleForms && typeof site.googleForms.voluntario === "string" ? site.googleForms.voluntario.trim() : "";
  const googleFormDoacaoBase = site.googleForms && typeof site.googleForms.doacao === "string" ? site.googleForms.doacao.trim() : "";
  const googleFormAfiliadoBase = site.googleForms && typeof site.googleForms.afiliado === "string" ? site.googleForms.afiliado.trim() : "";
  const ctx = {
    siteName: site.siteName,
    formAction,
    formsAtivos: String(formsAtivos),
    googleFormVoluntario: googleFormComIdioma(googleFormBase, idioma.code),
    googleFormDoacao: googleFormComIdioma(googleFormDoacaoBase, idioma.code),
    googleFormAfiliado: googleFormComIdioma(googleFormAfiliadoBase, idioma.code),
    contas: site.doacao,
    htmlLang: t.htmlLang,
    title: t[pagina2.id].title,
    titleKey: `t.${pagina2.id}.title`,
    description: t[pagina2.id].description,
    descriptionKey: `t.${pagina2.id}.description`,
    canonical: `${site.baseUrl}${caminho(idioma, pagina2)}`,
    ogImage: `${site.baseUrl}/img/og.png`,
    ogLocale: OG_LOCALE[idioma.code],
    robots,
    alternates: alternatesHtml(site, traducoes, pagina2),
    year: ano,
    t,
    url: Object.fromEntries(PAGINAS.map((p) => [p.id, caminho(idioma, p)])),
    paginaId: pagina2.id,
    navItems: navHtml(t, idioma, pagina2),
    langItems: idiomasHtml(traducoes, idioma, pagina2),
    contato: contatoHtml(t, site, pagina2),
    apelo: pagina2.id === "home" ? t.volunteer.boxes[0].content.map((item, j) => blocoHtml(item, `t.volunteer.boxes.0.content.${j}`)).join("\n          ") : "",
    caixa: caixasTexto(pagina2, t[pagina2.id].boxes || []),
    cartaz: {
      jpg: `/img/${site.cartaz.arquivo}.jpg`,
      webp: `/img/${site.cartaz.arquivo}.webp`,
      largura: site.cartaz.largura,
      altura: site.cartaz.altura
    },
    voluntarioAtivo: String(formsAtivos)
  };
  ctx.content = render(templates[pagina2.id], ctx);
  return render(layout, ctx);
}
__name(gerarPaginaBase, "gerarPaginaBase");

// ../painel/blake3.mjs
var IV = new Uint32Array([1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225]);
var PERMUTA = [2, 6, 3, 10, 7, 0, 4, 13, 1, 11, 12, 5, 9, 14, 15, 8];
var INICIO_CHUNK = 1;
var FIM_CHUNK = 2;
var PAI = 4;
var RAIZ = 8;
function g(v, a, b, c, d, mx, my) {
  v[a] = v[a] + v[b] + mx;
  v[d] = (v[d] ^ v[a]) >>> 16 | (v[d] ^ v[a]) << 16;
  v[c] = v[c] + v[d];
  v[b] = (v[b] ^ v[c]) >>> 12 | (v[b] ^ v[c]) << 20;
  v[a] = v[a] + v[b] + my;
  v[d] = (v[d] ^ v[a]) >>> 8 | (v[d] ^ v[a]) << 24;
  v[c] = v[c] + v[d];
  v[b] = (v[b] ^ v[c]) >>> 7 | (v[b] ^ v[c]) << 25;
}
__name(g, "g");
function comprimir(cv, bloco, contador, tamanho, flags2) {
  const v = new Uint32Array(16);
  for (let i = 0; i < 8; i++) v[i] = cv[i];
  for (let i = 0; i < 4; i++) v[8 + i] = IV[i];
  v[12] = contador >>> 0;
  v[13] = Math.floor(contador / 4294967296);
  v[14] = tamanho;
  v[15] = flags2;
  let m = bloco;
  for (let r = 0; r < 7; r++) {
    g(v, 0, 4, 8, 12, m[0], m[1]);
    g(v, 1, 5, 9, 13, m[2], m[3]);
    g(v, 2, 6, 10, 14, m[4], m[5]);
    g(v, 3, 7, 11, 15, m[6], m[7]);
    g(v, 0, 5, 10, 15, m[8], m[9]);
    g(v, 1, 6, 11, 12, m[10], m[11]);
    g(v, 2, 7, 8, 13, m[12], m[13]);
    g(v, 3, 4, 9, 14, m[14], m[15]);
    if (r < 6) {
      const n = new Uint32Array(16);
      for (let i = 0; i < 16; i++) n[i] = m[PERMUTA[i]];
      m = n;
    }
  }
  const saida = new Uint32Array(16);
  for (let i = 0; i < 8; i++) {
    saida[i] = v[i] ^ v[i + 8];
    saida[i + 8] = v[i + 8] ^ cv[i];
  }
  return saida;
}
__name(comprimir, "comprimir");
function palavrasLE(bytes) {
  const palavras = new Uint32Array(16);
  for (let i = 0; i < bytes.length; i++) palavras[i >> 2] |= bytes[i] << (i & 3) * 8;
  return palavras;
}
__name(palavrasLE, "palavrasLE");
function cvPai(esquerda, direita) {
  const bloco = new Uint32Array(16);
  for (let i = 0; i < 8; i++) {
    bloco[i] = esquerda[i];
    bloco[8 + i] = direita[i];
  }
  return comprimir(IV, bloco, 0, 64, PAI).subarray(0, 8);
}
__name(cvPai, "cvPai");
function blake3Hex(dados) {
  const n = dados.length;
  const numChunks = Math.max(1, Math.ceil(n / 1024));
  const pilha = [];
  let pendente = null;
  for (let c = 0; c < numChunks; c++) {
    const pedaco = dados.subarray(c * 1024, Math.min((c + 1) * 1024, n));
    const blocos = Math.max(1, Math.ceil(pedaco.length / 64));
    let cv = IV;
    for (let b = 0; b < blocos; b++) {
      const bb = pedaco.subarray(b * 64, Math.min((b + 1) * 64, pedaco.length));
      const palavras = palavrasLE(bb);
      const flags2 = (b === 0 ? INICIO_CHUNK : 0) | (b === blocos - 1 ? FIM_CHUNK : 0);
      if (c === numChunks - 1 && b === blocos - 1) {
        pendente = { cv, palavras, contador: c, tamanho: bb.length, flags: flags2 };
        break;
      }
      cv = comprimir(cv, palavras, c, bb.length, flags2).subarray(0, 8);
    }
    if (c < numChunks - 1) {
      let total = c + 1;
      while ((total & 1) === 0) {
        cv = cvPai(pilha.pop(), cv);
        total >>= 1;
      }
      pilha.push(cv);
    }
  }
  while (pilha.length) {
    const cv = comprimir(pendente.cv, pendente.palavras, pendente.contador, pendente.tamanho, pendente.flags).subarray(0, 8);
    const esquerda = pilha.pop();
    const bloco = new Uint32Array(16);
    for (let i = 0; i < 8; i++) {
      bloco[i] = esquerda[i];
      bloco[8 + i] = cv[i];
    }
    pendente = { cv: IV, palavras: bloco, contador: 0, tamanho: 64, flags: PAI };
  }
  const raiz = comprimir(pendente.cv, pendente.palavras, 0, pendente.tamanho, pendente.flags | RAIZ);
  let hex = "";
  for (let i = 0; i < 8; i++) {
    const w = raiz[i];
    hex += (w & 255).toString(16).padStart(2, "0") + (w >>> 8 & 255).toString(16).padStart(2, "0") + (w >>> 16 & 255).toString(16).padStart(2, "0") + (w >>> 24 & 255).toString(16).padStart(2, "0");
  }
  return hex;
}
__name(blake3Hex, "blake3Hex");
function hashArquivoPages(conteudo, extensao) {
  const base64 = Buffer.from(conteudo).toString("base64");
  const bytes = new TextEncoder().encode(base64 + extensao);
  return blake3Hex(bytes).slice(0, 32);
}
__name(hashArquivoPages, "hashArquivoPages");

// ../painel/manifesto-estatico.json
var manifesto_estatico_default = { versao: "19bb2032065f40026224de48c9e98001", arquivos: { "/css/style.css": { h: "b331ceda6587a336b05d41f47cd4ce7c", t: "text/css", b: 43662 }, "/fonts/LICENSE-OFL.txt": { h: "b716c74507ae9cb529f87f9be13b2918", t: "text/plain", b: 4509 }, "/fonts/montserrat-latin-ext-wght-normal.woff2": { h: "d8bb2fe6e338e2cce89d8de9b45bc111", t: "font/woff2", b: 70688 }, "/fonts/montserrat-latin-wght-normal.woff2": { h: "ce1a634703b3d7e02be66f52d3ba6cb8", t: "font/woff2", b: 37956 }, "/img/cabeca-afiliados.jpg": { h: "92c1419071a5f4335e9fa2e5bf926c58", t: "image/jpeg", b: 130087 }, "/img/cabeca-afiliados.webp": { h: "ade6da845ede04ccc9fcbbd32ee74996", t: "image/webp", b: 71392 }, "/img/cabeca-doacao.jpg": { h: "91f6adc762ac0e86fb3138da96c680bb", t: "image/jpeg", b: 211871 }, "/img/cabeca-doacao.webp": { h: "7d7a688375874caabaa6dfde1eb87054", t: "image/webp", b: 112518 }, "/img/cabeca-educativa.jpg": { h: "3f7408700793e15c1cedd486e0dedbf7", t: "image/jpeg", b: 132909 }, "/img/cabeca-educativa.webp": { h: "e55664b586f5b7776f7d56a871f9aedb", t: "image/webp", b: 44754 }, "/img/cabeca-sensorial.jpg": { h: "eb45726ca87f141da5374269fd267323", t: "image/jpeg", b: 95135 }, "/img/cabeca-sensorial.webp": { h: "6996b4a7e2e75830089dc6363d4a3b14", t: "image/webp", b: 39774 }, "/img/cartaz-inca-braille-trail.jpg": { h: "dbad5a197bc11908266bf571d4d5c404", t: "image/jpeg", b: 388370 }, "/img/cartaz-inca-braille-trail.webp": { h: "64e2c92f93e1da30ed8d725653685a0a", t: "image/webp", b: 288314 }, "/img/educativa-01.jpg": { h: "1b60cc7de4c9faa5be5706514eb6d878", t: "image/jpeg", b: 281177 }, "/img/educativa-01.webp": { h: "407edece144b0f3fcde73c0b5ad90845", t: "image/webp", b: 199980 }, "/img/educativa-02.jpg": { h: "dccc529da661e9aa64b2b9c34ca127cc", t: "image/jpeg", b: 255663 }, "/img/educativa-02.webp": { h: "4831afb319d6df0a24f15e661f833411", t: "image/webp", b: 184848 }, "/img/educativa-03.jpg": { h: "10be603f09ed1dfac73ed275a2a8ec70", t: "image/jpeg", b: 303553 }, "/img/educativa-03.webp": { h: "1dd7ed20dfb5fa6df8690a48541ddf4f", t: "image/webp", b: 232522 }, "/img/educativa-04.jpg": { h: "57da4d42128c7a960976b4bbba145aa6", t: "image/jpeg", b: 168825 }, "/img/educativa-04.webp": { h: "edb487536f504c6a81ed451e6d8c4d0a", t: "image/webp", b: 96798 }, "/img/educativa-05.jpg": { h: "43c482b95b8fc76f625e901925cac351", t: "image/jpeg", b: 447354 }, "/img/educativa-05.webp": { h: "6bd6cca44673567348596cbdddbcd677", t: "image/webp", b: 400636 }, "/img/educativa-06.jpg": { h: "06ece24a895104171163c4bc818235c4", t: "image/jpeg", b: 289678 }, "/img/educativa-06.webp": { h: "bf126198f728382291e3f005c69adac4", t: "image/webp", b: 223400 }, "/img/educativa-07.jpg": { h: "3f53af77a5600a5e9b0f8dae8ae89424", t: "image/jpeg", b: 287209 }, "/img/educativa-07.webp": { h: "1f15b70bfd261a6deb275b0e52f788f9", t: "image/webp", b: 215372 }, "/img/educativa-08.jpg": { h: "a061c1377a188a09826a282ccb5bd46c", t: "image/jpeg", b: 457660 }, "/img/educativa-08.webp": { h: "f4e36d6ff7a23dc83f7fac1e859f7cb3", t: "image/webp", b: 409568 }, "/img/educativa-09.jpg": { h: "1bc760f4ef1776d46ba5673257bed7aa", t: "image/jpeg", b: 152565 }, "/img/educativa-09.webp": { h: "f9f61e2c661d157feb880e884e68f725", t: "image/webp", b: 88572 }, "/img/educativa-10.jpg": { h: "7202dca8522df0bf086f0217887fb16a", t: "image/jpeg", b: 310052 }, "/img/educativa-10.webp": { h: "873c1ace3faf83df7bc8eb495c788728", t: "image/webp", b: 235904 }, "/img/educativa-11.jpg": { h: "4ad75b9d1c86340ee4d4354ddae2e670", t: "image/jpeg", b: 135637 }, "/img/educativa-11.webp": { h: "88ec0e3a421fd86f75241a8ba9ded5b4", t: "image/webp", b: 69690 }, "/img/educativa-12.jpg": { h: "01ced4f0bcb81d97f1844670b78bc829", t: "image/jpeg", b: 194900 }, "/img/educativa-12.webp": { h: "a74c65c49e0d3b4722047f8bac8b6d40", t: "image/webp", b: 117170 }, "/img/educativa-13.jpg": { h: "747e33b0f80e7e074e298bc939ee765a", t: "image/jpeg", b: 278315 }, "/img/educativa-13.webp": { h: "814f17c5ecc37f1bb27793d3595e5fe1", t: "image/webp", b: 209672 }, "/img/educativa-14.jpg": { h: "670b97de0de07597ed7ecfa73d80b02b", t: "image/jpeg", b: 184639 }, "/img/educativa-14.webp": { h: "994cc40d447a6ad96f21f0519c7d64f7", t: "image/webp", b: 112716 }, "/img/educativa-15.jpg": { h: "5c351f2b0ed362243ec2acbf421b1cfb", t: "image/jpeg", b: 269029 }, "/img/educativa-15.webp": { h: "b6759cfea669a3a89aa597ca03faa228", t: "image/webp", b: 200836 }, "/img/educativa-16.jpg": { h: "c02f050610f663fffb3e2da1772fd7b6", t: "image/jpeg", b: 88248 }, "/img/educativa-16.webp": { h: "ced39b4b986755afc142ff6d8643a8d2", t: "image/webp", b: 44628 }, "/img/educativa-17.jpg": { h: "933bbc52319d8f4f91a1c06ff0bea212", t: "image/jpeg", b: 348057 }, "/img/educativa-17.webp": { h: "07f6da98d88a98dee1649270a00d2a1f", t: "image/webp", b: 307190 }, "/img/logo-inca-braille-trail.png": { h: "eaba045dda294ab16692d9caff2da785", t: "image/png", b: 63068 }, "/img/mapa-do-sitio.jpg": { h: "9ec16630ae6b76ce2ae966aa354699c6", t: "image/jpeg", b: 3359128 }, "/img/og.png": { h: "a0076d39bb5becb93e6cb6283ff85dab", t: "image/png", b: 3633 }, "/img/sensorial-01.jpg": { h: "aba53a51052b6a51a153a4eed8e01f50", t: "image/jpeg", b: 225799 }, "/img/sensorial-01.webp": { h: "8f615ee2d54802e3cdbb1e7eeb233b28", t: "image/webp", b: 146220 }, "/img/sensorial-02.jpg": { h: "4939f0ff7079fb915130a1c80a9d9e8a", t: "image/jpeg", b: 108010 }, "/img/sensorial-02.webp": { h: "15fe83410f7df3d8359412e92c6620a5", t: "image/webp", b: 52024 }, "/img/sensorial-03.jpg": { h: "2e4500daed9ed5fc371b2a53ff93090c", t: "image/jpeg", b: 149380 }, "/img/sensorial-03.webp": { h: "531fff35723c195be220d87c6b3d73dc", t: "image/webp", b: 85144 }, "/img/sensorial-04.jpg": { h: "308d852bfc5e8222b55e1474811cbd4e", t: "image/jpeg", b: 144136 }, "/img/sensorial-04.webp": { h: "1e97a40739105464ff99c271c8296c56", t: "image/webp", b: 79428 }, "/img/sensorial-05.jpg": { h: "7c42aeada089831aab50f4283a33c2a4", t: "image/jpeg", b: 285582 }, "/img/sensorial-05.webp": { h: "7e628bc32377d65444851a325d2c83bc", t: "image/webp", b: 214086 }, "/img/sensorial-06.jpg": { h: "9a80a6e9976de201926e0117743a0b9c", t: "image/jpeg", b: 284051 }, "/img/sensorial-06.webp": { h: "2a25951d1f27d5b8daae1709fe2e1e01", t: "image/webp", b: 210568 }, "/img/sensorial-07.jpg": { h: "2169ea3cf291265565090b43d5cbeebc", t: "image/jpeg", b: 166782 }, "/img/sensorial-07.webp": { h: "b48d31c3ded7dbe209a866619c31ea9b", t: "image/webp", b: 95790 }, "/img/sensorial-08.jpg": { h: "4d1c6fce6d6ccea462797f1e5a0a2d35", t: "image/jpeg", b: 215285 }, "/img/sensorial-08.webp": { h: "21b128bdcce89886d0d9635e5aedb588", t: "image/webp", b: 132524 }, "/img/sensorial-09.jpg": { h: "e3ba7dfd00f40d4b03ea7abbbfeaee6e", t: "image/jpeg", b: 173663 }, "/img/sensorial-09.webp": { h: "92b6933630597ba9437fdcf4e9ccdb6c", t: "image/webp", b: 106446 }, "/img/sensorial-10.jpg": { h: "40869cb75d886c32e66a7bb2427ed5f3", t: "image/jpeg", b: 214721 }, "/img/sensorial-10.webp": { h: "6e015e8d74299403c033ba16927613e4", t: "image/webp", b: 136168 }, "/img/sensorial-11.jpg": { h: "737e82736a1eaa92df0aba2587e04fe2", t: "image/jpeg", b: 296302 }, "/img/sensorial-11.webp": { h: "178b8ba136ac2c99aba15bd82b2df382", t: "image/webp", b: 221682 }, "/img/sensorial-12.jpg": { h: "0373d7ff09a4ad3af4bad28911bb0555", t: "image/jpeg", b: 251794 }, "/img/sensorial-12.webp": { h: "9d159c863fc7016e557ecdd1b7e91671", t: "image/webp", b: 168952 }, "/img/sensorial-13.jpg": { h: "3f9f1c01a02bcdab4974212613b00f9e", t: "image/jpeg", b: 277692 }, "/img/sensorial-13.webp": { h: "388c43a830ee4fc861f562434d8c9a0b", t: "image/webp", b: 196942 }, "/img/sensorial-14.jpg": { h: "65036320362e376eaa3a7886f2d4fc03", t: "image/jpeg", b: 361363 }, "/img/sensorial-14.webp": { h: "1c8e1318124e15fc961cbeff2ada84d1", t: "image/webp", b: 295718 }, "/img/trabalho-equipe.jpg": { h: "e66c46c1e123b10b7232564d9b8c1f48", t: "image/jpeg", b: 406356 }, "/img/trabalho-equipe.webp": { h: "90670584b4817cb618f482285b176dc1", t: "image/webp", b: 350902 }, "/img/trabalho-ferramentas.jpg": { h: "556a905f01fa1c63e485f07b9721ad04", t: "image/jpeg", b: 114800 }, "/img/trabalho-ferramentas.webp": { h: "e6be08ab5d6d337d843616c6769289a2", t: "image/webp", b: 55706 }, "/img/trabalho-muro-1.jpg": { h: "a18c632e1a868ee7cd5604f89b5cb35d", t: "image/jpeg", b: 139461 }, "/img/trabalho-muro-1.webp": { h: "a6592116c6ceb771dd18d542574bca89", t: "image/webp", b: 89786 }, "/img/trabalho-muro-2.jpg": { h: "a475d23325b1ad71f5289da520475c46", t: "image/jpeg", b: 162353 }, "/img/trabalho-muro-2.webp": { h: "339074505ef9e8de62aae413f30d3abc", t: "image/webp", b: 115976 }, "/img/voluntario-cabeca.jpg": { h: "c0a120cf3bee3292d811c6b3738dda2b", t: "image/jpeg", b: 590874 }, "/img/voluntario-cabeca.webp": { h: "4b28160a2712ab894ffcb82df30111de", t: "image/webp", b: 371550 }, "/img/voluntario-matias-lopez.jpg": { h: "e59a555ffde02ad875277c3fadd9c055", t: "image/jpeg", b: 173165 }, "/img/voluntario-matias-lopez.webp": { h: "6607175d5ddd0c6080e5302255a65ce3", t: "image/webp", b: 120162 }, "/img/voluntario-nello-fraboni.jpg": { h: "cff73dd755a4ce5967aea08f9facd10b", t: "image/jpeg", b: 182734 }, "/img/voluntario-nello-fraboni.webp": { h: "ac927de14645fe0e1e4603d9ff6b9185", t: "image/webp", b: 141654 }, "/img/voluntario-pamella-garcia.jpg": { h: "b78959c84ddc4ce18ba11ac64c320a8e", t: "image/jpeg", b: 86194 }, "/img/voluntario-pamella-garcia.webp": { h: "5abb1b945087d5fd147e86785d407030", t: "image/webp", b: 37254 }, "/img/voluntario-patrick-de-vries.jpg": { h: "0cd5bae72b16eaf26f5ec826828f88dc", t: "image/jpeg", b: 172607 }, "/img/voluntario-patrick-de-vries.webp": { h: "165589be8572f407f0a9aea5d8587f10", t: "image/webp", b: 112710 }, "/interno/acesso.css": { h: "835f99e4d893e927cfac7766e8f0084d", t: "text/css", b: 1209 }, "/interno/editor.css": { h: "392e5bec34c59827e9f66b1ecdf7fd5e", t: "text/css", b: 4910 }, "/interno/editor.js": { h: "3a1f5dbff6a5434273d9ef3cf2f4b5d7", t: "application/javascript", b: 33047 }, "/interno/ver.js": { h: "d0a29c0e0f70bdbfe9189eab3a0b6169", t: "application/javascript", b: 864 }, "/interno/worker-bundle.js": { h: "79aac9e30805af0d05a2328df33a218a", t: "application/javascript", b: 344627 }, "/js/flag.js": { h: "ac88a44367f386cb1ff830a7a1911848", t: "application/javascript", b: 146 }, "/js/site.js": { h: "d23df848c7d5c6ad504ad96664d20fdf", t: "application/javascript", b: 29187 }, "/painel-semente.json": { h: "bfef990e8580031419b27971b55048fa", t: "application/json", b: 69844 }, "/robots.txt": { h: "6a5b96e7aeb2bbc2d21d528cddf02ab7", t: "text/plain", b: 91 }, "/sitemap.xml": { h: "3ceecf2b66c1f2e0d180f52f641d5da9", t: "application/xml", b: 6001 }, "/video/trabalho-trilha.mp4": { h: "e027d8d1ed04bdd80d48fa550b140630", t: "video/mp4", b: 6831258 } }, especiais: { headers: "/*\n  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://formspree.io https://formsubmit.co; form-action https://formspree.io https://formsubmit.co; frame-src https://docs.google.com; base-uri 'self'; object-src 'none'; frame-ancestors 'none'\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: DENY\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), interest-cohort=()\n  Strict-Transport-Security: max-age=31536000; includeSubDomains\n", redirects: "# Rotas antigas. Ingl\xEAs saiu de /en/ para a raiz. /trails/ abre a trilha educativa.\n/trails    /educational-trail/  301\n/trails/   /educational-trail/  301\n/trails/*  /educational-trail/  301\n/es/trails    /es/educational-trail/  301\n/es/trails/   /es/educational-trail/  301\n/es/trails/*  /es/educational-trail/  301\n/en/trails    /educational-trail/  301\n/en/trails/   /educational-trail/  301\n/en/trails/*  /educational-trail/  301\n/en     /  301\n/en/    /  301\n/en/*   /:splat  301\n/audio-video    /  301\n/audio-video/   /  301\n/es/audio-video    /es/  301\n/es/audio-video/   /es/  301\n", rotas: '{"version":1,"include":["/panel/*","/interno/*","/midia/*"],"exclude":[]}' } };

// ../painel/templates-site.json
var templates_site_default = { layout: '<!DOCTYPE html>\n<!-- layout.html \u2014 casca comum de toda p\xE1gina: head, cabe\xE7alho com navega\xE7\xE3o, main, contato e rodap\xE9 -->\n<html lang="{{htmlLang}}">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title data-edit-key="{{titleKey}}">{{title}}</title>\n  <meta name="description" data-edit-key="{{descriptionKey}}" content="{{description}}">\n  {{{robots}}}\n  <link rel="canonical" href="{{canonical}}">\n  {{{alternates}}}\n  <meta property="og:type" content="website">\n  <meta property="og:site_name" content="{{siteName}}">\n  <meta property="og:title" content="{{title}}">\n  <meta property="og:description" content="{{description}}">\n  <meta property="og:url" content="{{canonical}}">\n  <meta property="og:image" content="{{ogImage}}">\n  <meta property="og:locale" content="{{ogLocale}}">\n  <meta name="theme-color" content="#1b5e20">\n  <link rel="icon" href="/img/logo-inca-braille-trail.png" type="image/png">\n  <link rel="preload" href="/fonts/montserrat-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>\n  <link rel="stylesheet" href="/css/style.css">\n  <script src="/js/flag.js"><\/script>\n</head>\n<body class="pagina-{{paginaId}}">\n  <a class="pular" href="#contenido">{{t.skip}}</a>\n\n  <header class="cabecalho">\n    <div class="faixa" aria-hidden="true"></div>\n    <div class="cabecalho-interno">\n      <a class="marca" href="{{url.home}}"><img class="marca-logo" data-edit-key="img.logo" data-edit-type="image" data-alt-key="alt.img.logo" src="/img/logo-inca-braille-trail.png" alt="{{siteName}}" width="192" height="188"></a>\n\n      <button class="menu-botao maiusculas" type="button" aria-expanded="false" aria-controls="menu-principal">{{t.nav.menu}}</button>\n\n      <nav aria-label="{{t.nav.label}}">\n        <ul class="nav-lista" id="menu-principal">\n          {{{navItems}}}\n          <li class="idioma">\n            <button class="idioma-botao maiusculas" type="button" aria-expanded="false" aria-controls="lista-idiomas">\n              <span class="oculto-visual">{{t.lang.button}}: </span>{{t.name}}\n            </button>\n            <ul class="idioma-lista" id="lista-idiomas" aria-label="{{t.lang.list}}">\n              {{{langItems}}}\n            </ul>\n          </li>\n        </ul>\n      </nav>\n    </div>\n  </header>\n\n  <main id="contenido" tabindex="-1">\n{{{content}}}\n  </main>\n\n  <footer class="rodape">\n    <div class="faixa" aria-hidden="true"></div>\n    {{{contato}}}\n    <div class="afiliados-faixa">\n      <h2 class="afiliados-titulo" id="afiliados-titulo">{{t.sponsors.footerTitle}}</h2>\n      <ul class="afiliados" data-edit-key="lista.afiliados" data-edit-type="partners" aria-labelledby="afiliados-titulo">\n        <li class="afiliado-vazio"></li>\n        <li class="afiliado-vazio"></li>\n        <li class="afiliado-vazio"></li>\n        <li class="afiliado-vazio"></li>\n      </ul>\n    </div>\n  </footer>\n\n  <script src="/js/site.js" defer><\/script>\n</body>\n</html>\n', templates: { home: '<!-- home.html \u2014 p\xE1gina inicial: cartaz, aviso de constru\xE7\xE3o, chamado de volunt\xE1rios e tr\xEAs caixas -->\n    <div class="hero">\n      <div class="hero-interno">\n        <h1 class="oculto-visual">{{siteName}}</h1>\n        <div class="hero-cartaz entra">\n          <picture data-edit-key="img.home.cartaz" data-edit-type="image" data-alt-key="t.home.heroAlt">\n            <source type="image/webp" srcset="{{cartaz.webp}}">\n            <img src="{{cartaz.jpg}}" width="{{cartaz.largura}}" height="{{cartaz.altura}}" alt="{{t.home.heroAlt}}" fetchpriority="high">\n          </picture>\n          <a class="cabeca-inscricao hero-inscricao" href="{{url.volunteer}}#inscricao">{{t.volunteer.signNow}}</a>\n        </div>\n        <p class="hero-frase entra atraso-1">{{t.home.tagline}}</p>\n      </div>\n    </div>\n\n    <div class="conteudo miolo">\n      <div class="aviso entra atraso-1">\n        <div class="faixa" aria-hidden="true"></div>\n        <p>{{t.home.banner}}</p>\n      </div>\n      <div class="intro entra atraso-2">\n        {{{apelo}}}\n      </div>\n    </div>\n\n    <div class="caixas entra atraso-2">\n      {{{caixa.0}}}\n      {{{caixa.1}}}\n      {{{caixa.2}}}\n    </div>\n', sitemap: '<!-- sitemap.html \u2014 o mapa ocupa a p\xE1gina, com 1 cm de margem -->\n    <h1 class="oculto-visual">{{t.sitemap.h1}}</h1>\n    <figure class="mapa-pagina">\n      <picture data-edit-key="img.sitemap.mapa" data-edit-type="image" data-alt-key="t.sitemap.h1">\n        <img src="/img/mapa-do-sitio.jpg" width="5600" height="3732" alt="{{t.sitemap.h1}}">\n      </picture>\n    </figure>\n', educational: '<!-- educational.html \u2014 faixa com a foto, depois o texto da trilha -->\n    <header class="cabeca">\n      <picture class="cabeca-foto" data-edit-key="img.educational.cabeca" data-edit-type="image" data-alt-key="t.educational.heroAlt">\n        <source type="image/webp" srcset="/img/cabeca-educativa.webp">\n        <img src="/img/cabeca-educativa.jpg" width="1920" height="590" alt="{{t.educational.heroAlt}}">\n      </picture>\n      <div class="cabeca-texto">\n        <h1 class="cabeca-titulo">{{t.educational.h1}}</h1>\n        <p class="cabeca-frase">{{t.educational.heroLine}}</p>\n      </div>\n      <a class="cabeca-inscricao cabeca-inscricao-topo" href="{{url.volunteer}}#inscricao">{{t.volunteer.signNow}}</a>\n    </header>\n    <div class="galeria-linha" data-galeria="visor-educativa">\n      <button class="slide-seta slide-anterior galeria-linha-anterior" type="button" aria-label="{{t.educational.gallery.prev}}"></button>\n      <ul class="galeria">\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/educativa-01.jpg" data-legenda="{{t.educational.gallery.photo1}}" aria-label="{{t.educational.gallery.open}} 1">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-01.webp">\n                  <img src="/img/educativa-01.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-01.webp">\n                  <img src="/img/educativa-01.jpg" width="960" height="1280" alt="{{t.educational.gallery.photo1}}">\n                </picture>\n                <figcaption>{{t.educational.gallery.photo1}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/educativa-02.jpg" data-legenda="{{t.educational.gallery.photo2}}" aria-label="{{t.educational.gallery.open}} 2">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-02.webp">\n                  <img src="/img/educativa-02.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-02.webp">\n                  <img src="/img/educativa-02.jpg" width="960" height="1280" alt="{{t.educational.gallery.photo2}}">\n                </picture>\n                <figcaption>{{t.educational.gallery.photo2}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/educativa-03.jpg" data-legenda="{{t.educational.gallery.photo3}}" aria-label="{{t.educational.gallery.open}} 3">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-03.webp">\n                  <img src="/img/educativa-03.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-03.webp">\n                  <img src="/img/educativa-03.jpg" width="960" height="1280" alt="{{t.educational.gallery.photo3}}">\n                </picture>\n                <figcaption>{{t.educational.gallery.photo3}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/educativa-04.jpg" data-legenda="{{t.educational.gallery.photo4}}" aria-label="{{t.educational.gallery.open}} 4">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-04.webp">\n                  <img src="/img/educativa-04.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-04.webp">\n                  <img src="/img/educativa-04.jpg" width="960" height="1280" alt="{{t.educational.gallery.photo4}}">\n                </picture>\n                <figcaption>{{t.educational.gallery.photo4}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/educativa-05.jpg" data-legenda="{{t.educational.gallery.photo5}}" aria-label="{{t.educational.gallery.open}} 5">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-05.webp">\n                  <img src="/img/educativa-05.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-05.webp">\n                  <img src="/img/educativa-05.jpg" width="960" height="1280" alt="{{t.educational.gallery.photo5}}">\n                </picture>\n                <figcaption>{{t.educational.gallery.photo5}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/educativa-06.jpg" data-legenda="{{t.educational.gallery.photo6}}" aria-label="{{t.educational.gallery.open}} 6">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-06.webp">\n                  <img src="/img/educativa-06.jpg" width="1280" height="960" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-06.webp">\n                  <img src="/img/educativa-06.jpg" width="1280" height="960" alt="{{t.educational.gallery.photo6}}">\n                </picture>\n                <figcaption>{{t.educational.gallery.photo6}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/educativa-07.jpg" data-legenda="{{t.educational.gallery.photo7}}" aria-label="{{t.educational.gallery.open}} 7">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-07.webp">\n                  <img src="/img/educativa-07.jpg" width="1280" height="960" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-07.webp">\n                  <img src="/img/educativa-07.jpg" width="1280" height="960" alt="{{t.educational.gallery.photo7}}">\n                </picture>\n                <figcaption>{{t.educational.gallery.photo7}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/educativa-08.jpg" data-legenda="{{t.educational.gallery.photo8}}" aria-label="{{t.educational.gallery.open}} 8">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-08.webp">\n                  <img src="/img/educativa-08.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-08.webp">\n                  <img src="/img/educativa-08.jpg" width="960" height="1280" alt="{{t.educational.gallery.photo8}}">\n                </picture>\n                <figcaption>{{t.educational.gallery.photo8}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/educativa-09.jpg" data-legenda="{{t.educational.gallery.photo9}}" aria-label="{{t.educational.gallery.open}} 9">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-09.webp">\n                  <img src="/img/educativa-09.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-09.webp">\n                  <img src="/img/educativa-09.jpg" width="960" height="1280" alt="{{t.educational.gallery.photo9}}">\n                </picture>\n                <figcaption>{{t.educational.gallery.photo9}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/educativa-10.jpg" data-legenda="{{t.educational.gallery.photo10}}" aria-label="{{t.educational.gallery.open}} 10">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-10.webp">\n                  <img src="/img/educativa-10.jpg" width="1280" height="960" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-10.webp">\n                  <img src="/img/educativa-10.jpg" width="1280" height="960" alt="{{t.educational.gallery.photo10}}">\n                </picture>\n                <figcaption>{{t.educational.gallery.photo10}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/educativa-11.jpg" data-legenda="{{t.educational.gallery.photo11}}" aria-label="{{t.educational.gallery.open}} 11">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-11.webp">\n                  <img src="/img/educativa-11.jpg" width="1280" height="960" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-11.webp">\n                  <img src="/img/educativa-11.jpg" width="1280" height="960" alt="{{t.educational.gallery.photo11}}">\n                </picture>\n                <figcaption>{{t.educational.gallery.photo11}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/educativa-12.jpg" data-legenda="{{t.educational.gallery.photo12}}" aria-label="{{t.educational.gallery.open}} 12">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-12.webp">\n                  <img src="/img/educativa-12.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-12.webp">\n                  <img src="/img/educativa-12.jpg" width="960" height="1280" alt="{{t.educational.gallery.photo12}}">\n                </picture>\n                <figcaption>{{t.educational.gallery.photo12}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/educativa-13.jpg" data-legenda="{{t.educational.gallery.photo13}}" aria-label="{{t.educational.gallery.open}} 13">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-13.webp">\n                  <img src="/img/educativa-13.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-13.webp">\n                  <img src="/img/educativa-13.jpg" width="960" height="1280" alt="{{t.educational.gallery.photo13}}">\n                </picture>\n                <figcaption>{{t.educational.gallery.photo13}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/educativa-14.jpg" data-legenda="{{t.educational.gallery.photo14}}" aria-label="{{t.educational.gallery.open}} 14">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-14.webp">\n                  <img src="/img/educativa-14.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-14.webp">\n                  <img src="/img/educativa-14.jpg" width="960" height="1280" alt="{{t.educational.gallery.photo14}}">\n                </picture>\n                <figcaption>{{t.educational.gallery.photo14}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/educativa-15.jpg" data-legenda="{{t.educational.gallery.photo15}}" aria-label="{{t.educational.gallery.open}} 15">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-15.webp">\n                  <img src="/img/educativa-15.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-15.webp">\n                  <img src="/img/educativa-15.jpg" width="960" height="1280" alt="{{t.educational.gallery.photo15}}">\n                </picture>\n                <figcaption>{{t.educational.gallery.photo15}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/educativa-16.jpg" data-legenda="{{t.educational.gallery.photo16}}" aria-label="{{t.educational.gallery.open}} 16">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-16.webp">\n                  <img src="/img/educativa-16.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-16.webp">\n                  <img src="/img/educativa-16.jpg" width="960" height="1280" alt="{{t.educational.gallery.photo16}}">\n                </picture>\n                <figcaption>{{t.educational.gallery.photo16}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/educativa-17.jpg" data-legenda="{{t.educational.gallery.photo17}}" aria-label="{{t.educational.gallery.open}} 17">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-17.webp">\n                  <img src="/img/educativa-17.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/educativa-17.webp">\n                  <img src="/img/educativa-17.jpg" width="960" height="1280" alt="{{t.educational.gallery.photo17}}">\n                </picture>\n                <figcaption>{{t.educational.gallery.photo17}}</figcaption>\n              </figure>\n            </li>\n          </ul>\n      <button class="slide-seta slide-proximo galeria-linha-proximo" type="button" aria-label="{{t.educational.gallery.next}}"></button>\n    </div>\n\n    <div class="pagina-topo">\n      <div class="conteudo texto-trilha">\n        <h2 class="texto-trilha-titulo">{{t.educational.moreTitle}}</h2>\n        <p class="entra">{{t.educational.lead}}</p>\n        <p>{{t.educational.p1}}</p>\n        <p>{{t.educational.p2}}</p>\n        <p>{{t.educational.p3}}</p>\n      </div>\n    </div>\n\n    <div class="visor" id="visor-educativa" role="dialog" aria-modal="true" aria-labelledby="visor-educativa-legenda" hidden>\n      <div class="faixa" aria-hidden="true"></div>\n      <button class="visor-fechar" type="button"><span class="oculto-visual">{{t.educational.gallery.close}}</span></button>\n      <div class="visor-corpo">\n        <button class="slide-seta slide-anterior visor-anterior" type="button" aria-label="{{t.educational.gallery.prev}}"></button>\n        <figure class="visor-figura">\n          <img class="visor-foto" alt="" hidden>\n          <video class="visor-filme" controls playsinline hidden></video>\n          <figcaption class="visor-legenda" id="visor-educativa-legenda" aria-live="polite"></figcaption>\n        </figure>\n        <button class="slide-seta slide-proximo visor-proximo" type="button" aria-label="{{t.educational.gallery.next}}"></button>\n      </div>\n      <div class="visor-faixa" aria-label="{{t.educational.gallery.thumbs}}"></div>\n    </div>\n', sensory: '<!-- sensory.html \u2014 faixa com a foto e o texto \xE0 direita, depois o texto da trilha -->\n    <header class="cabeca cabeca-direita">\n      <picture class="cabeca-foto" data-edit-key="img.sensory.cabeca" data-edit-type="image" data-alt-key="t.sensory.heroAlt">\n        <source type="image/webp" srcset="/img/cabeca-sensorial.webp">\n        <img src="/img/cabeca-sensorial.jpg" width="1920" height="590" alt="{{t.sensory.heroAlt}}">\n      </picture>\n      <div class="cabeca-texto">\n        <h1 class="cabeca-titulo">{{t.sensory.h1}}</h1>\n        <p class="cabeca-frase">{{t.sensory.heroLine}}</p>\n      </div>\n      <a class="cabeca-inscricao cabeca-inscricao-topo" href="{{url.volunteer}}#inscricao">{{t.volunteer.signNow}}</a>\n    </header>\n    <div class="galeria-linha" data-galeria="visor-sensorial">\n      <button class="slide-seta slide-anterior galeria-linha-anterior" type="button" aria-label="{{t.sensory.gallery.prev}}"></button>\n      <ul class="galeria">\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/sensorial-01.jpg" data-legenda="{{t.sensory.gallery.photo1}}" aria-label="{{t.sensory.gallery.open}} 1">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-01.webp">\n                  <img src="/img/sensorial-01.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-01.webp">\n                  <img src="/img/sensorial-01.jpg" width="960" height="1280" alt="{{t.sensory.gallery.photo1}}">\n                </picture>\n                <figcaption>{{t.sensory.gallery.photo1}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/sensorial-02.jpg" data-legenda="{{t.sensory.gallery.photo2}}" aria-label="{{t.sensory.gallery.open}} 2">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-02.webp">\n                  <img src="/img/sensorial-02.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-02.webp">\n                  <img src="/img/sensorial-02.jpg" width="960" height="1280" alt="{{t.sensory.gallery.photo2}}">\n                </picture>\n                <figcaption>{{t.sensory.gallery.photo2}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/sensorial-03.jpg" data-legenda="{{t.sensory.gallery.photo3}}" aria-label="{{t.sensory.gallery.open}} 3">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-03.webp">\n                  <img src="/img/sensorial-03.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-03.webp">\n                  <img src="/img/sensorial-03.jpg" width="960" height="1280" alt="{{t.sensory.gallery.photo3}}">\n                </picture>\n                <figcaption>{{t.sensory.gallery.photo3}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/sensorial-04.jpg" data-legenda="{{t.sensory.gallery.photo4}}" aria-label="{{t.sensory.gallery.open}} 4">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-04.webp">\n                  <img src="/img/sensorial-04.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-04.webp">\n                  <img src="/img/sensorial-04.jpg" width="960" height="1280" alt="{{t.sensory.gallery.photo4}}">\n                </picture>\n                <figcaption>{{t.sensory.gallery.photo4}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/sensorial-05.jpg" data-legenda="{{t.sensory.gallery.photo5}}" aria-label="{{t.sensory.gallery.open}} 5">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-05.webp">\n                  <img src="/img/sensorial-05.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-05.webp">\n                  <img src="/img/sensorial-05.jpg" width="960" height="1280" alt="{{t.sensory.gallery.photo5}}">\n                </picture>\n                <figcaption>{{t.sensory.gallery.photo5}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/sensorial-06.jpg" data-legenda="{{t.sensory.gallery.photo6}}" aria-label="{{t.sensory.gallery.open}} 6">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-06.webp">\n                  <img src="/img/sensorial-06.jpg" width="1280" height="960" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-06.webp">\n                  <img src="/img/sensorial-06.jpg" width="1280" height="960" alt="{{t.sensory.gallery.photo6}}">\n                </picture>\n                <figcaption>{{t.sensory.gallery.photo6}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/sensorial-07.jpg" data-legenda="{{t.sensory.gallery.photo7}}" aria-label="{{t.sensory.gallery.open}} 7">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-07.webp">\n                  <img src="/img/sensorial-07.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-07.webp">\n                  <img src="/img/sensorial-07.jpg" width="960" height="1280" alt="{{t.sensory.gallery.photo7}}">\n                </picture>\n                <figcaption>{{t.sensory.gallery.photo7}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/sensorial-08.jpg" data-legenda="{{t.sensory.gallery.photo8}}" aria-label="{{t.sensory.gallery.open}} 8">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-08.webp">\n                  <img src="/img/sensorial-08.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-08.webp">\n                  <img src="/img/sensorial-08.jpg" width="960" height="1280" alt="{{t.sensory.gallery.photo8}}">\n                </picture>\n                <figcaption>{{t.sensory.gallery.photo8}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/sensorial-09.jpg" data-legenda="{{t.sensory.gallery.photo9}}" aria-label="{{t.sensory.gallery.open}} 9">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-09.webp">\n                  <img src="/img/sensorial-09.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-09.webp">\n                  <img src="/img/sensorial-09.jpg" width="960" height="1280" alt="{{t.sensory.gallery.photo9}}">\n                </picture>\n                <figcaption>{{t.sensory.gallery.photo9}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/sensorial-10.jpg" data-legenda="{{t.sensory.gallery.photo10}}" aria-label="{{t.sensory.gallery.open}} 10">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-10.webp">\n                  <img src="/img/sensorial-10.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-10.webp">\n                  <img src="/img/sensorial-10.jpg" width="960" height="1280" alt="{{t.sensory.gallery.photo10}}">\n                </picture>\n                <figcaption>{{t.sensory.gallery.photo10}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/sensorial-11.jpg" data-legenda="{{t.sensory.gallery.photo11}}" aria-label="{{t.sensory.gallery.open}} 11">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-11.webp">\n                  <img src="/img/sensorial-11.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-11.webp">\n                  <img src="/img/sensorial-11.jpg" width="960" height="1280" alt="{{t.sensory.gallery.photo11}}">\n                </picture>\n                <figcaption>{{t.sensory.gallery.photo11}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/sensorial-12.jpg" data-legenda="{{t.sensory.gallery.photo12}}" aria-label="{{t.sensory.gallery.open}} 12">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-12.webp">\n                  <img src="/img/sensorial-12.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-12.webp">\n                  <img src="/img/sensorial-12.jpg" width="960" height="1280" alt="{{t.sensory.gallery.photo12}}">\n                </picture>\n                <figcaption>{{t.sensory.gallery.photo12}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/sensorial-13.jpg" data-legenda="{{t.sensory.gallery.photo13}}" aria-label="{{t.sensory.gallery.open}} 13">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-13.webp">\n                  <img src="/img/sensorial-13.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-13.webp">\n                  <img src="/img/sensorial-13.jpg" width="960" height="1280" alt="{{t.sensory.gallery.photo13}}">\n                </picture>\n                <figcaption>{{t.sensory.gallery.photo13}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/sensorial-14.jpg" data-legenda="{{t.sensory.gallery.photo14}}" aria-label="{{t.sensory.gallery.open}} 14">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-14.webp">\n                  <img src="/img/sensorial-14.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/sensorial-14.webp">\n                  <img src="/img/sensorial-14.jpg" width="960" height="1280" alt="{{t.sensory.gallery.photo14}}">\n                </picture>\n                <figcaption>{{t.sensory.gallery.photo14}}</figcaption>\n              </figure>\n            </li>\n          </ul>\n      <button class="slide-seta slide-proximo galeria-linha-proximo" type="button" aria-label="{{t.sensory.gallery.next}}"></button>\n    </div>\n\n    <div class="pagina-topo">\n      <div class="conteudo texto-trilha">\n        <h2 class="texto-trilha-titulo">{{t.sensory.moreTitle}}</h2>\n        <p class="entra">{{t.sensory.lead}}</p>\n        <p>{{t.sensory.p1}}</p>\n        <p>{{t.sensory.p2}}</p>\n        <p>{{t.sensory.p3}}</p>\n      </div>\n    </div>\n\n    <div class="visor" id="visor-sensorial" role="dialog" aria-modal="true" aria-labelledby="visor-sensorial-legenda" hidden>\n      <div class="faixa" aria-hidden="true"></div>\n      <button class="visor-fechar" type="button"><span class="oculto-visual">{{t.sensory.gallery.close}}</span></button>\n      <div class="visor-corpo">\n        <button class="slide-seta slide-anterior visor-anterior" type="button" aria-label="{{t.sensory.gallery.prev}}"></button>\n        <figure class="visor-figura">\n          <img class="visor-foto" alt="" hidden>\n          <video class="visor-filme" controls playsinline hidden></video>\n          <figcaption class="visor-legenda" id="visor-sensorial-legenda" aria-live="polite"></figcaption>\n        </figure>\n        <button class="slide-seta slide-proximo visor-proximo" type="button" aria-label="{{t.sensory.gallery.next}}"></button>\n      </div>\n      <div class="visor-faixa" aria-label="{{t.sensory.gallery.thumbs}}"></div>\n    </div>\n', volunteer: '<!-- volunteer.html \u2014 cabe\xE7alho com foto, volunt\xE1rios, galeria e formul\xE1rio -->\n    <header class="cabeca">\n      <picture class="cabeca-foto" data-edit-key="img.volunteer.cabeca" data-edit-type="image" data-alt-key="t.volunteer.heroAlt">\n        <source type="image/webp" srcset="/img/voluntario-cabeca.webp">\n        <img src="/img/voluntario-cabeca.jpg" width="1920" height="1440" alt="{{t.volunteer.heroAlt}}">\n      </picture>\n      <div class="cabeca-texto">\n        <h1 class="cabeca-titulo">{{t.volunteer.h1}}</h1>\n        <p class="cabeca-frase">{{t.volunteer.heroLine}}</p>\n      </div>\n      <a class="cabeca-inscricao" href="#inscricao">{{t.volunteer.signNow}}</a>\n    </header>\n\n    <div class="conteudo conteudo-largo entra atraso-1">\n      <section class="tema voluntarios-secao">\n        <h2 class="secao-titulo">{{t.volunteer.media.title}}</h2>\n        <p class="voluntarios-intro">{{t.volunteer.media.intro}}</p>\n        <ul class="voluntarios" data-edit-key="lista.voluntarios" data-edit-type="volunteers">\n          <li class="voluntario">\n            <button class="voluntario-mini" type="button" aria-haspopup="dialog" aria-controls="visor-voluntarios" aria-label="{{t.volunteer.media.matias.name}}">\n              <picture data-edit-key="img.volunteer.matias" data-edit-type="image" data-alt-key="t.volunteer.media.matias.alt">\n                <source type="image/webp" srcset="/img/voluntario-matias-lopez.webp">\n                <img src="/img/voluntario-matias-lopez.jpg" width="768" height="1024" alt="{{t.volunteer.media.matias.alt}}">\n              </picture>\n              <span class="voluntario-dica">{{t.volunteer.media.click}}</span>\n            </button>\n            <h3 class="voluntario-nome">{{t.volunteer.media.matias.name}}</h3>\n            <div class="voluntario-bio">\n              <p>{{t.volunteer.media.matias.who}}</p>\n              <p>{{t.volunteer.media.matias.work}}</p>\n              <p>{{t.volunteer.media.matias.why}}</p>\n            </div>\n          </li>\n          <li class="voluntario">\n            <button class="voluntario-mini" type="button" aria-haspopup="dialog" aria-controls="visor-voluntarios" aria-label="{{t.volunteer.media.patrick.name}}">\n              <picture data-edit-key="img.volunteer.patrick" data-edit-type="image" data-alt-key="t.volunteer.media.patrick.alt">\n                <source type="image/webp" srcset="/img/voluntario-patrick-de-vries.webp">\n                <img src="/img/voluntario-patrick-de-vries.jpg" width="768" height="1024" alt="{{t.volunteer.media.patrick.alt}}">\n              </picture>\n              <span class="voluntario-dica">{{t.volunteer.media.click}}</span>\n            </button>\n            <h3 class="voluntario-nome">{{t.volunteer.media.patrick.name}}</h3>\n            <div class="voluntario-bio">\n              <p>{{t.volunteer.media.patrick.who}}</p>\n              <p>{{t.volunteer.media.patrick.work}}</p>\n              <p>{{t.volunteer.media.patrick.why}}</p>\n            </div>\n          </li>\n          <li class="voluntario">\n            <button class="voluntario-mini" type="button" aria-haspopup="dialog" aria-controls="visor-voluntarios" aria-label="{{t.volunteer.media.pamella.name}}">\n              <picture data-edit-key="img.volunteer.pamella" data-edit-type="image" data-alt-key="t.volunteer.media.pamella.alt">\n                <source type="image/webp" srcset="/img/voluntario-pamella-garcia.webp">\n                <img src="/img/voluntario-pamella-garcia.jpg" width="954" height="1024" alt="{{t.volunteer.media.pamella.alt}}">\n              </picture>\n              <span class="voluntario-dica">{{t.volunteer.media.click}}</span>\n            </button>\n            <h3 class="voluntario-nome">{{t.volunteer.media.pamella.name}}</h3>\n            <div class="voluntario-bio">\n              <p>{{t.volunteer.media.pamella.who}}</p>\n              <p>{{t.volunteer.media.pamella.work}}</p>\n              <p>{{t.volunteer.media.pamella.why}}</p>\n            </div>\n          </li>\n          <li class="voluntario">\n            <button class="voluntario-mini" type="button" aria-haspopup="dialog" aria-controls="visor-voluntarios" aria-label="{{t.volunteer.media.vegprtsmkl6.name}}">\n              <picture data-edit-key="img.volunteer.vegprtsmkl6" data-edit-type="image" data-alt-key="t.volunteer.media.vegprtsmkl6.alt">\n                <source type="image/webp" srcset="/img/voluntario-nello-fraboni.webp">\n                <img src="/img/voluntario-nello-fraboni.jpg" width="706" height="941" alt="{{t.volunteer.media.vegprtsmkl6.alt}}">\n              </picture>\n              <span class="voluntario-dica">{{t.volunteer.media.click}}</span>\n            </button>\n            <h3 class="voluntario-nome">{{t.volunteer.media.vegprtsmkl6.name}}</h3>\n            <div class="voluntario-bio">\n              <p>{{t.volunteer.media.vegprtsmkl6.who}}</p>\n              <p>{{t.volunteer.media.vegprtsmkl6.work}}</p>\n              <p>{{t.volunteer.media.vegprtsmkl6.why}}</p>\n            </div>\n          </li>\n        </ul>\n      </section>\n    </div>\n\n    <div class="visor visor-retrato" id="visor-voluntarios" role="dialog" aria-modal="true" aria-labelledby="visor-voluntario-nome" hidden>\n      <div class="faixa" aria-hidden="true"></div>\n      <button class="visor-fechar" type="button"><span class="oculto-visual">{{t.volunteer.work.close}}</span></button>\n      <div class="visor-corpo">\n        <button class="slide-seta slide-anterior visor-anterior" type="button" aria-label="{{t.volunteer.work.prev}}"></button>\n        <figure class="visor-figura">\n          <img class="visor-foto" alt="">\n        </figure>\n        <div class="visor-bio">\n          <h2 class="visor-bio-nome" id="visor-voluntario-nome"></h2>\n          <div class="visor-bio-texto"></div>\n        </div>\n        <button class="slide-seta slide-proximo visor-proximo" type="button" aria-label="{{t.volunteer.work.next}}"></button>\n      </div>\n    </div>\n\n    <div class="conteudo galeria-larga entra atraso-2">\n      <section class="caixa tema" id="trabalho" data-galeria="visor-trabalho">\n        <h2 class="caixa-titulo"><button class="caixa-botao" type="button" id="caixa-trabalho-botao" aria-expanded="true" aria-controls="caixa-trabalho">{{t.volunteer.work.title}}</button></h2>\n        <div class="caixa-painel" id="caixa-trabalho" role="region" aria-labelledby="caixa-trabalho-botao">\n          <p class="slide-lead">{{t.volunteer.work.lead}}</p>\n          <ul class="galeria">\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/trabalho-muro-1.jpg" data-legenda="{{t.volunteer.work.photo1}}" aria-label="{{t.volunteer.work.open}} 1">\n                <picture>\n                  <source type="image/webp" srcset="/img/trabalho-muro-1.webp">\n                  <img src="/img/trabalho-muro-1.jpg" width="1024" height="768" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/trabalho-muro-1.webp">\n                  <img src="/img/trabalho-muro-1.jpg" width="1024" height="768" alt="{{t.volunteer.work.photo1}}">\n                </picture>\n                <figcaption>{{t.volunteer.work.photo1}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/trabalho-muro-2.jpg" data-legenda="{{t.volunteer.work.photo2}}" aria-label="{{t.volunteer.work.open}} 2">\n                <picture>\n                  <source type="image/webp" srcset="/img/trabalho-muro-2.webp">\n                  <img src="/img/trabalho-muro-2.jpg" width="1024" height="768" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/trabalho-muro-2.webp">\n                  <img src="/img/trabalho-muro-2.jpg" width="1024" height="768" alt="{{t.volunteer.work.photo2}}">\n                </picture>\n                <figcaption>{{t.volunteer.work.photo2}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/trabalho-equipe.jpg" data-legenda="{{t.volunteer.work.photo3}}" aria-label="{{t.volunteer.work.open}} 3">\n                <picture>\n                  <source type="image/webp" srcset="/img/trabalho-equipe.webp">\n                  <img src="/img/trabalho-equipe.jpg" width="1280" height="960" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/trabalho-equipe.webp">\n                  <img src="/img/trabalho-equipe.jpg" width="1280" height="960" alt="{{t.volunteer.work.photo3}}">\n                </picture>\n                <figcaption>{{t.volunteer.work.photo3}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="imagem" data-src="/img/trabalho-ferramentas.jpg" data-legenda="{{t.volunteer.work.photo4}}" aria-label="{{t.volunteer.work.open}} 4">\n                <picture>\n                  <source type="image/webp" srcset="/img/trabalho-ferramentas.webp">\n                  <img src="/img/trabalho-ferramentas.jpg" width="960" height="1280" alt="">\n                </picture>\n              </button>\n              <figure class="galeria-cheia">\n                <picture>\n                  <source type="image/webp" srcset="/img/trabalho-ferramentas.webp">\n                  <img src="/img/trabalho-ferramentas.jpg" width="960" height="1280" alt="{{t.volunteer.work.photo4}}">\n                </picture>\n                <figcaption>{{t.volunteer.work.photo4}}</figcaption>\n              </figure>\n            </li>\n            <li class="galeria-item">\n              <button class="galeria-botao" type="button" data-tipo="video" data-src="/video/trabalho-trilha.mp4" data-legenda="{{t.volunteer.work.video}}" aria-label="{{t.volunteer.work.openVideo}}">\n                <video muted playsinline preload="metadata" tabindex="-1" aria-hidden="true">\n                  <source src="/video/trabalho-trilha.mp4#t=0.1" type="video/mp4">\n                </video>\n              </button>\n              <figure class="galeria-cheia">\n                <video controls playsinline preload="metadata" width="480" height="864" aria-label="{{t.volunteer.work.video}}">\n                  <source src="/video/trabalho-trilha.mp4" type="video/mp4">\n                </video>\n                <figcaption>{{t.volunteer.work.video}}</figcaption>\n              </figure>\n            </li>\n          </ul>\n        </div>\n      </section>\n    </div>\n\n    <div class="conteudo form-direto entra atraso-2">\n      <section class="caixa tema" id="inscricao">\n        <h2 class="caixa-titulo"><button class="caixa-botao" type="button" id="caixa-form-botao" aria-expanded="true" aria-controls="caixa-form">{{t.volunteer.form.heading}}</button></h2>\n        <div class="caixa-painel" id="caixa-form" role="region" aria-labelledby="caixa-form-botao">\n        <p class="tema-intro">{{t.volunteer.form.lead}}</p>\n        <!-- formul\xE1rio Google \u2014 respostas v\xE3o para a conta Forms do projeto -->\n        <iframe\n          class="form-google form-voluntario"\n          title="{{t.volunteer.form.heading}}"\n          src="{{googleFormVoluntario}}"\n        ></iframe>\n        </div>\n      </section>\n    </div>\n\n    <div class="visor" id="visor-trabalho" role="dialog" aria-modal="true" aria-labelledby="visor-legenda" hidden>\n      <div class="faixa" aria-hidden="true"></div>\n      <button class="visor-fechar" type="button"><span class="oculto-visual">{{t.volunteer.work.close}}</span></button>\n      <div class="visor-corpo">\n        <button class="slide-seta slide-anterior visor-anterior" type="button" aria-label="{{t.volunteer.work.prev}}"></button>\n        <figure class="visor-figura">\n          <img class="visor-foto" alt="" hidden>\n          <video class="visor-filme" controls playsinline hidden></video>\n          <figcaption class="visor-legenda" id="visor-legenda" aria-live="polite"></figcaption>\n        </figure>\n        <button class="slide-seta slide-proximo visor-proximo" type="button" aria-label="{{t.volunteer.work.next}}"></button>\n      </div>\n      <div class="visor-faixa" aria-label="{{t.volunteer.work.thumbs}}"></div>\n    </div>\n', sponsors: '<!-- sponsors.html \u2014 cabe\xE7alho, convite a parceiros e espa\xE7o do formul\xE1rio -->\n    <header class="cabeca">\n      <picture class="cabeca-foto" data-edit-key="img.sponsors.cabeca" data-edit-type="image" data-alt-key="t.sponsors.heroAlt">\n        <source type="image/webp" srcset="/img/cabeca-afiliados.webp">\n        <img src="/img/cabeca-afiliados.jpg" width="1920" height="590" alt="{{t.sponsors.heroAlt}}">\n      </picture>\n      <div class="cabeca-texto">\n        <h1 class="cabeca-titulo">{{t.sponsors.h1}}</h1>\n        <p class="cabeca-frase">{{t.sponsors.heroLine}}</p>\n      </div>\n    </header>\n\n    <div class="conteudo entra atraso-1">\n      <section class="tema">\n        <p class="tema-intro">{{t.sponsors.lead}}</p>\n        <p>{{t.sponsors.p1}}</p>\n        <p>{{t.sponsors.p2}}</p>\n        <p>{{t.sponsors.p3}}</p>\n      </section>\n    </div>\n\n    <div class="conteudo form-direto entra atraso-2">\n      <section class="caixa tema" id="parceiro">\n        <h2 class="caixa-titulo"><button class="caixa-botao" type="button" id="caixa-parceiro-botao" aria-expanded="true" aria-controls="caixa-parceiro">{{t.sponsors.boxTitle}}</button></h2>\n        <div class="caixa-painel" id="caixa-parceiro" role="region" aria-labelledby="caixa-parceiro-botao">\n          <iframe\n            class="form-google form-afiliado"\n            title="{{t.sponsors.boxTitle}}"\n            src="{{googleFormAfiliado}}"\n          ></iframe>\n        </div>\n      </section>\n    </div>\n', donations: '<!-- donations.html \u2014 cabe\xE7alho com foto, Google Form no box aberto e contas no centro -->\n    <header class="cabeca">\n      <picture class="cabeca-foto" data-edit-key="img.donations.cabeca" data-edit-type="image" data-alt-key="t.donations.heroAlt">\n        <source type="image/webp" srcset="/img/cabeca-doacao.webp">\n        <img src="/img/cabeca-doacao.jpg" width="1920" height="590" alt="{{t.donations.heroAlt}}">\n      </picture>\n      <div class="cabeca-texto">\n        <h1 class="cabeca-titulo">{{t.donations.h1}}</h1>\n        <p class="cabeca-frase">{{t.donations.heroLine}}</p>\n      </div>\n    </header>\n\n    <div class="pagina-topo">\n      <div class="conteudo">\n        <p class="entra atraso-1">{{t.donations.lead}}</p>\n        <p>{{t.donations.choice}}</p>\n        <p>{{t.donations.noneYet}}</p>\n      </div>\n    </div>\n\n    <div class="conteudo form-direto entra atraso-2">\n      <section class="caixa tema caixa-fix" id="formulario-doacao">\n        <h2 class="caixa-titulo caixa-titulo-fix">{{t.donations.form.heading}}</h2>\n        <div class="caixa-painel">\n          <iframe\n            class="form-google"\n            title="{{t.donations.form.heading}}"\n            src="{{googleFormDoacao}}"\n          ></iframe>\n        </div>\n      </section>\n\n      <section id="contas-doacao" class="contas-doacao" data-falha="{{t.donations.bank.copyFail}}">\n        <h2 id="contas-titulo" class="secao-titulo" tabindex="-1">{{t.donations.bank.revealed}}</h2>\n        <p id="copia-dica" class="dica">{{t.donations.bank.hint}}</p>\n        <p id="copia-estado" class="estado" aria-live="polite" hidden></p>\n\n        <h3>{{t.donations.bank.soles}}</h3>\n        <div class="copia-par" role="group" aria-label="{{t.donations.bank.groupSoles}}" aria-describedby="copia-dica">\n          <button class="botao botao-leve botao-copia" type="button" data-numero="{{contas.soles.bcp}}" data-numero-chave="contas.soles.bcp" data-copiado="{{t.donations.bank.copiedSolesBcp}}">\n            <span class="copia-banco">{{t.donations.bank.bcp}}</span>\n            <span class="copia-numero" data-edit-key="contas.soles.bcp" data-edit-type="text">{{contas.soles.bcp}}</span>\n          </button>\n          <button class="botao botao-leve botao-copia" type="button" data-numero="{{contas.soles.interbancaria}}" data-numero-chave="contas.soles.interbancaria" data-copiado="{{t.donations.bank.copiedSolesInter}}">\n            <span class="copia-banco">{{t.donations.bank.interbank}}</span>\n            <span class="copia-numero" data-edit-key="contas.soles.interbancaria" data-edit-type="text">{{contas.soles.interbancaria}}</span>\n          </button>\n        </div>\n\n        <h3>{{t.donations.bank.dolares}}</h3>\n        <div class="copia-par" role="group" aria-label="{{t.donations.bank.groupDollars}}" aria-describedby="copia-dica">\n          <button class="botao botao-leve botao-copia" type="button" data-numero="{{contas.dolares.bcp}}" data-numero-chave="contas.dolares.bcp" data-copiado="{{t.donations.bank.copiedDollarsBcp}}">\n            <span class="copia-banco">{{t.donations.bank.bcp}}</span>\n            <span class="copia-numero" data-edit-key="contas.dolares.bcp" data-edit-type="text">{{contas.dolares.bcp}}</span>\n          </button>\n          <button class="botao botao-leve botao-copia" type="button" data-numero="{{contas.dolares.interbancaria}}" data-numero-chave="contas.dolares.interbancaria" data-copiado="{{t.donations.bank.copiedDollarsInter}}">\n            <span class="copia-banco">{{t.donations.bank.interbank}}</span>\n            <span class="copia-numero" data-edit-key="contas.dolares.interbancaria" data-edit-type="text">{{contas.dolares.interbancaria}}</span>\n          </button>\n        </div>\n      </section>\n    </div>\n', app: '<!-- app.html \u2014 Inka Braille Trail App: o aplicativo que guia o percurso, com dois lugares para imagem -->\n    <div class="pagina-topo">\n      <div class="conteudo">\n        <h1 class="entra">{{t.app.h1}}</h1>\n        <p class="entra atraso-1">{{t.app.lead}}</p>\n        <p>{{t.app.p1}}</p>\n        <p>{{t.app.p2}}</p>\n        <p>{{t.app.p3}}</p>\n        <ul class="slots slots-duas" aria-label="{{t.app.slotsLabel}}">\n          <li>{{t.app.slot}}</li>\n          <li>{{t.app.slot}}</li>\n        </ul>\n      </div>\n    </div>\n' } };

// ../src/site.json
var site_default = {
  baseUrl: "https://incabrailletrail.org",
  siteName: "Inca Braille Trail",
  dominioPretendido: "incabrailletrail.org",
  formspreeId: "FORMSPREE_ID",
  formspreeDonacoesId: "FORMSPREE_DONACOES_ID",
  recepcao: "info.incabrailletrail@gmail.com",
  googleForms: {
    voluntario: "https://docs.google.com/forms/d/e/1FAIpQLSe-QFENxYj7xBP1UdejtaoieXUICTMhWHoDaLj7pbC6xdSxzw/viewform?embedded=true",
    doacao: "https://docs.google.com/forms/d/e/1FAIpQLSdr4ActDDrpEZxBswC57XBbFLvbZU6kFk3RzshjK1zCXpwhjw/viewform?embedded=true",
    afiliado: "https://docs.google.com/forms/d/e/1FAIpQLSflcADPJQVieoH134JqeMAYYJFyi2lCI5FFDSByU8yL4fCuqg/viewform?embedded=true"
  },
  robotsNoindex: false,
  contato: {
    telefone: "+51 914 015 544",
    whatsapp: "https://wa.me/51914015544",
    mapa: "https://www.google.com/maps/place/Azul+Tika/@-13.2684024,-72.1482081,15z/data=!4m10!1m2!2m1!1sAzul+Tika+Pumawanka+Urubamba+Sacred+Valley+of+the+Incas+Cusco+Peru!3m6!1s0x916ddde89df9040f:0x41dc7fd832bf736a!8m2!3d-13.2679743!4d-72.1293137!15sCkJBenVsIFRpa2EgUHVtYXdhbmthIFVydWJhbWJhIFNhY3JlZCBWYWxsZXkgb2YgdGhlIEluY2FzIEN1c2NvIFBlcnWSAQ53ZWxsbmVzc19ob3RlbOABAA!16s%2Fg%2F11z3mr_s6r?entry=ttu&g_ep=EgoyMDI2MTEwNC4wIKXMDSoASAFQAw%3D%3D",
    emails: {
      info: "info@incabrailletrail.org",
      bookings: "bookings@incabrailletrail.com",
      volunteers: "volunteers@incabrailletrail.com",
      donations: "donations@incabrailletrail.com",
      contact: "contact@incabrailletrail.com"
    }
  },
  doacao: {
    soles: {
      bcp: "2857096163099",
      interbancaria: "00228500709616309956"
    },
    dolares: {
      bcp: "2857096168159",
      interbancaria: "00228500709616815953"
    }
  },
  cartaz: {
    arquivo: "cartaz-inca-braille-trail",
    largura: 1856,
    altura: 576
  }
};

// ../src/i18n/en.json
var en_default = {
  htmlLang: "en",
  hreflang: "en",
  name: "English",
  skip: "Skip to content",
  external: "(opens in a new tab)",
  required: "required",
  inboxNote: "Messages from this page are sent to info.incabrailletrail@gmail.com.",
  formActivate: "Open info.incabrailletrail@gmail.com and click the confirmation link in the message from FormSubmit. Until that click, the message waits and is not delivered.",
  nav: {
    label: "Main navigation",
    menu: "Menu",
    home: "Home",
    sitemap: "Site Map",
    volunteer: "Volunteer",
    donations: "Donations",
    audiovideo: "Media",
    open: "Show pages",
    educational: "<b>Trail 1: </b><i>Educational Path</i>",
    sensory: '<b>Trail 2: </b><i><span class="tx-18"><span class="tx-20">Aromatic and Medicinal Path</span></span></i><br><i><span class="tx-18"><span class="tx-20"><br></span></span></i><br>',
    sponsors: "Affiliates Partners",
    app: "App Trail"
  },
  lang: {
    button: "Language",
    list: "Choose a language",
    current: "(current language)"
  },
  construction: {
    heading: "Site under construction",
    intro: "This is a working version. Still to be provided by the project owner:",
    items: [
      "The email addresses listed on this site have not been created yet.",
      "The volunteer form does not send messages until the Formspree account is confirmed.",
      "The donation form sends the details to the project email. The bank accounts stay visible on the page.",
      "Instagram and Facebook accounts to be confirmed.",
      "Donation transfers use the bank accounts visible on the page. The project owner will confirm whether both accounts stay.",
      "Audio and video of the trail to be received.",
      "Photos and videos of the volunteers to be received.",
      "Domain www.incabrailletrail.com to be registered."
    ]
  },
  contact: {
    heading: "Contact",
    placeLabel: "Where",
    place: "Azul Tika, Pumawanka, Urubamba, Sacred Valley of the Incas, Cusco, Peru",
    mapButton: "Open the map",
    phoneLabel: "Phone and WhatsApp",
    whatsappLink: "Message on WhatsApp",
    visitsLabel: "Visits",
    visitsValue: "By advance arrangement",
    socialLabel: "Social media",
    tbc: "to be confirmed",
    websiteLabel: "Intended website",
    websiteNote: "Domain registration pending.",
    emailsLabel: "Email",
    emailRoles: {
      info: "general enquiries",
      bookings: "tours and reservations",
      volunteers: "volunteer enquiries",
      donations: "sponsors and donations",
      contact: "proposed main contact"
    },
    emailsNote: "These addresses were requested by the project. The project owner still needs to create them, and they do not receive messages until that happens. Once they exist, only the final addresses, never passwords, are sent to be linked to this page."
  },
  footer: {
    text: "A sensory trail for blind and visually impaired people"
  },
  home: {
    title: "{siteName} \u2014 A sensory trail for blind and visually impaired people, Sacred Valley of the Incas",
    description: "An educational and sensory trail being developed for blind and visually impaired people, with their families, friends and companions, in the Sacred Valley of the Incas, Cusco, Peru.",
    heroAlt: "Poster of the project. A person in a knit hat and orange poncho walks with a white cane on a stone path beside a wooden fence, passing a two-story stone house where a woman and a child stand. Two people plant in a green field among chickens, and two rheas stand by a stone wall, with snow-capped mountains behind. The poster reads: INCA BRAILLE TRAIL \u2014 GUIDING YOUR STEPS THROUGH THE CYCLE OF LIFE. A sign says the project is under construction and that volunteers are urgently needed.",
    tagline: "First of its kind educational and sensory journey through the cycle of life and Andean agriculture\n\nDesigned for blind and visually impaired people.\n\nSighted visitors can choose to wear a blindfold for the trail. By briefly setting sight aside, they can tune in to the sounds, textures, and scents of the farm, discovering details they might usually miss and feeling more connected to the natural world.\n",
    banner: "This website is a project under construction.",
    boxes: [
      {
        title: "What Is the Inca Braille Trail?",
        content: [
          {
            lead: "A Journey Through Nature, Education and the Senses"
          },
          "Located in the beautiful Sacred Valley of the Incas, Cusco, Peru, the Inca Braille Trail is an educational and sensory experience being developed specifically for blind and visually impaired people, together with their families, friends and companions.",
          "Our vision is to create a welcoming place where visitors can enjoy nature, learn, explore and share meaningful experiences, free of charge through the support of sponsors and donations.",
          "The trail is designed to stimulate the senses through touch, smell, sound and taste. Visitors will discover the textures of plants, the fragrances of herbs and flowers, the sounds of nature and the many wonderful experiences the natural world has to offer."
        ]
      },
      {
        title: "The Cycle of Life \u2013 Learning from Pachamama",
        content: [
          "At the heart of our philosophy is respect for Pachamama, Mother Earth, and the understanding that all living things are connected.",
          "Through our educational journey, The Cycle of Life, visitors will discover how the needs of plants closely reflect our own.",
          "A tiny seed needs nourishment, water, warmth and care to grow, just as we need nutritious food, clean water, sunlight and a healthy environment to thrive.",
          "Plants draw nutrients from healthy soil and energy from sunlight, while we depend on the food they produce for our own energy, growth and wellbeing.",
          {
            lead: "Healthy soil nurtures healthy plants. Healthy plants nourish healthy people."
          },
          "Animals also play an essential role in this cycle. From honeybees pollinating flowers to birds spreading seeds, and farm animals providing natural manure that enriches the soil, every creature contributes to the balance of nature.",
          "These nutrients return to the earth, helping new plants grow and completing the beautiful cycle that connects plants, animals and people.",
          "Along the journey, visitors will explore traditional Andean and ancient Inca agricultural practices alongside modern sustainable farming. We emphasize the importance of preserving native seeds, composting, protecting biodiversity and growing nutritious food without relying on harmful agricultural chemicals.",
          "Our goal is to demonstrate that caring for the earth and producing healthy food can be simple, sustainable and accessible to everyone."
        ]
      },
      {
        title: "A Place for Everyone to Connect \u2013 The Spirit of Ayni",
        content: [
          "At the heart of the Inca Braille Trail is the ancient Andean principle of Ayni, meaning reciprocity \u2014 the belief that through giving, receiving and supporting one another, we create stronger, more compassionate communities.",
          "Our trail is more than an educational experience. It is a place where blind and visually impaired people, their families, friends and companions can come together, share experiences, build friendships and celebrate life.",
          "We also hope to encourage sighted visitors to better understand the everyday challenges faced by people with visual impairments, developing greater awareness, empathy and respect.",
          "Through shared experiences, we want people to recognize that everyone has something valuable to offer and that we all have something to learn from one another.",
          "Just as we nurture the earth and the earth nurtures us, through kindness, compassion and reciprocity, we nurture one another.",
          {
            lead: "This is the spirit of Ayni, and the heart of the Inca Braille Trail."
          }
        ]
      }
    ]
  },
  volunteer: {
    title: "Volunteers \u2014 {siteName}",
    description: "Volunteers urgently needed: clearing and shaping trails, moving stones, gardening and grounds maintenance. Meals provided; accommodation for full-day volunteers.",
    h1: "Volunteers",
    heroLine: "<b>Many hands put their heart into this project and make it possible. Meet them, and find the story of each hand that passed through.</b>",
    heroAlt: "Hands hold a bunch of tall green plants. More plants and a rocky slope surround them.",
    signNow: "Sign as a volunteer",
    lead: "Volunteers urgently needed to open the trail to blind and visually impaired visitors.",
    boxes: [
      {
        title: "Help build the trail",
        content: [
          '<b><span class="tx-centro"><span class="tx-40">WE NEED YOUR HELP!!!</span><br>Families are welcome!<br>Help bring the Inca Braille Trail to life<br>WHY ?</span></b><br>This Inca Braille Trail is the first of its kind with NFC/QR code technology to make education and sensory activities to the blind, general visually impaired and also to allow the general public with sight to enhance their other senses more intensely through sight deprivation.<br>Our hope is that once you experience this you will feel more compassion for those less fortunate and recognise your own sensitivity to your own inner magic.<br>Funds raised will go directly toward providing a free day at the Inca Braille Trail for people who are blind or have low vision, along with their families and carers. The day includes return transport from Cusco, lunch, and a gift to take home.<br>Often the careers and family are forgotten so lets celebrate this together by helping make this a fun and   ongoing event of a lifetime for all.',
          "Help needed:\n-Small stone paths\n-Basic fencing\n-Cooking\n-Social Media\n-General cleaning\n-Raking\n-planting aromatics\n",
          {
            list: [
              "Day volunteers: Lunch provided.",
              "Volunteers staying with us and working full days: Accommodation, breakfast, lunch and dinner provided.",
              "Transport: Available from an agreed collection point."
            ]
          },
          "Contact us to arrange dates and find tasks suited to your abilities."
        ]
      }
    ],
    work: {
      title: "Check out the work of the volunteers",
      lead: "We are working hard to build the trails. Here are a few pictures of our work.",
      prev: "Previous",
      next: "Next",
      position: "Image",
      close: "Close",
      open: "Open image",
      openVideo: "Open video",
      thumbs: "Thumbnails",
      photo1: "Three people build a stone wall on a dirt slope. A gray-bearded man kneels and holds a measuring tape. A bald man carries a long wooden log. Another person in a hat bends over the stones. A green container and mountains are behind them.",
      photo2: "The same stone wall. The gray-bearded man holds the measuring tape. The person in the hat works on the stones. The bald man, with a red glove, pulls a long-handled tool.",
      photo3: "Three men work beside a low stone wall. A gray-bearded man in a black shirt with an orange 23 and tall rubber boots smiles at the camera. A man in a wide hat points to the side. A bald man with red gloves bends over a rake. A green container, trees and mountains are behind them.",
      photo4: "Tools hang from a wire on a pale wall: a small cultivator, three trowels, two pairs of pliers and a handsaw. A garden fork stands on the dirt next to a blue tarp and an orange bag.",
      video: "The same work in motion: measuring the ground, setting the stone wall and moving timber, with mountains behind."
    },
    media: {
      title: "Meet the volunteers",
      intro: "The hands that build this project.",
      click: "Click to open",
      matias: {
        name: "Garth Warner Founder, General Maintenance",
        alt: "Matias Lopez crouches beside a rhea eating from a metal bowl. He has dark hair, a beard and glasses, and wears a dark shirt and work gloves. A blue canopy, a table and trees are behind him.",
        who: "55 From New Zealand, Fell in love with Peru 9 years ago and found a home where I can be of service to others.",
        work: "",
        why: ""
      },
      patrick: {
        name: "Patrick De Vries Customs Agent, Electrician<br><br>",
        alt: "Patrick De Vries smiles next to a large white dog on a stone path. He is bald, wears a grey shirt and holds a white mug with his name on it. Mountains and trees fill the background.",
        who: "Patrick De Vries is 55 and comes from the Netherlands. He is in Peru to explore the culture.",
        work: "He works in customs and logistics, and he is a handyman: electrician, carpentry and plumbing.",
        why: "Helping people is in his nature. He loves the idea of working on something new that benefits others."
      },
      pamella: {
        name: "Pamella Garcia Cyber Security, Web Design",
        alt: "Pamella Garcia smiles in the opening of a white canvas tent. She has short dark hair, a black shirt with a colorful skull, and a necklace. White curtains and a wooden beam frame her.",
        who: "Pamella Garcia is 31 and comes from Brazil. She has lived in Peru for 6 years because it feels like her new home.",
        work: "She is in charge of web design and software engineering for the project's apps.",
        why: "What she likes most about working on the project is that it is an initiative that comes from the heart, and from the wish to connect people with nature in a very beautiful way."
      },
      vegprtsmkl6: {
        name: "Nello Fraboni Musician, Plant Care",
        alt: "Nello Fraboni: smiles in a volunteer photo.",
        who: "Age 46 French American horticulturist passionate about plants, nature and sustainable agriculture.",
        work: "",
        why: "",
        p4: "He has extensive experience in plant cultivation, propagation and greenhouse management.",
        p5: "Currently in Peru, he is exploring permaculture and tropical growing systems.",
        p6: "You will experience the duality of how correct care of seeds, plants and animal life deeply relates to ourselves."
      },
      vliklxe9amd: {
        name: "Matias Lopez: Chef, Forestry Technician",
        alt: "Matias Lopez: Chef, Forestry Technician smiles in a volunteer photo.",
        who: "Matias Lopez is 38 and comes from Argentina. He is in Peru to travel and to know new places. He is a Forestry Technician and a chef with a specialty in breads.<br>He volunteers because the project is beautiful and the intention behind it is heartfelt.<br><br><br>"
      },
      vfx8wpyxmec: {
        name: "Leticia (Hampi Mama)",
        alt: "Leticia (Hampi Mama) smiles in a volunteer photo.",
        who: "From Cancha Cancha. A powerful plant medicine Practitioner.<br>Based in Huaran....Hampi Mama work shopI wanted to volunteer and support this project because I wanted to share my ancestry knowledge with the world."
      },
      vmkd7xnvg30: {
        name: "Omar",
        alt: "Omar smiles in a volunteer photo.",
        who: "34 Omar is from Urubamba.A  professional local Backhoe operator and Dump truck contractor.<br>An expert in his field of work and very honest guy.<br>As a volunteer to help with the project for future children to enjoy<br>"
      }
    },
    form: {
      heading: '<span class="tx-centro"><b>Join Here!</b></span>',
      lead: "To sign up as a volunteer, fill in the form below.",
      inactive: "This form is not active yet. It will work after the project owner confirms the Formspree email, in an inbox the site builder has no access to. Intended destination: info@incabrailletrail.com.",
      requiredNote: "All fields are required.",
      name: "Name",
      email: "Email address",
      task: "Task you would like to help with",
      taskChoose: "Choose a task",
      taskTrails: "Clearing and shaping trails",
      taskStones: "Moving stones",
      taskGardening: "Gardening",
      taskGrounds: "General grounds maintenance",
      message: "Message",
      honeypot: "Leave this field empty",
      submit: "Send message",
      sending: "Sending\u2026",
      success: "Thank you. We received your message and will contact you soon.",
      summary: "The form could not be sent. Please check the fields marked with an error.",
      errRequired: "This field is required.",
      errEmail: "Enter a valid email address, for example name@example.com.",
      errNetwork: "The message could not be sent. Check your connection and try again."
    }
  },
  donations: {
    title: "Donations \u2014 {siteName}",
    description: "Donations keep the trail free. The bank accounts are on this page, ready to copy.",
    h1: "Donations",
    heroLine: "Every gift keeps this path free for those who walk by touch and trust.",
    heroAlt: "A smiling man in a sun hat and blue glasses crouches on the forest floor and holds dry leaves in both hands.",
    lead: "Donations keep the trail free of charge for visitors.",
    choice: "You can publish your name and the amount, publish only your name, or give anonymously. Anonymous donations are welcome.",
    noneYet: "No name is published on this site yet.",
    form: {
      heading: "Donation details",
      intro: "The bank accounts are on this page. You can also send your details with this form.",
      name: "Full name",
      country: "Country",
      date: "Date the donation is sent",
      amount: "Amount you intend to donate",
      amountHint: "Include the currency, for example 50 USD.",
      legend: "What may we publish?",
      optBoth: "Publish my name and the amount",
      optName: "Publish only my name",
      optAnonymous: "Anonymous donation. Publish nothing.",
      honeypot: "Leave this field empty",
      submit: "Send donation details",
      sending: "Sending\u2026",
      success: "Thank you. We received your details.",
      summary: "The form could not be sent. Please check the fields marked with an error.",
      errRequired: "This field is required.",
      errDate: "Enter a real date.",
      errNetwork: "The message could not be sent. Check your connection and try again.",
      emailNote: "This form is not sending yet. The destination is info.incabrailletrail@gmail.com."
    },
    bank: {
      revealed: "Bank accounts",
      hint: "Click a button to copy the number to your clipboard.",
      soles: "Bank account in soles",
      dolares: "Bank account in dollars",
      bcp: "BCP",
      interbank: "Interbank",
      groupSoles: "Copy a soles account",
      groupDollars: "Copy a dollars account",
      copiedSolesBcp: "Copied the BCP soles account.",
      copiedSolesInter: "Copied the Interbank soles account.",
      copiedDollarsBcp: "Copied the BCP dollars account.",
      copiedDollarsInter: "Copied the Interbank dollars account.",
      copyFail: "Could not copy. The number is on the button. Select it and copy it by hand."
    }
  },
  audiovideo: {
    title: "Audio and video \u2014 {siteName}",
    description: "Audio and video of the Inca Braille Trail, with transcript, captions and audio description. Files still to be received.",
    h1: "Audio and video",
    lead: "Audio and video of the trail, with transcript, captions and audio description. The files have not been received yet.",
    boxes: [
      {
        title: "Audio of the visit",
        content: [
          "The audio recording of the visit has not been received yet. It will be published here when the project owner sends it."
        ]
      },
      {
        title: "Transcript",
        content: [
          "The transcript of the audio has not been received yet. It will be published here as text when the project owner sends it."
        ]
      },
      {
        title: "Video",
        content: [
          "The video of the trail has not been received yet. It will be published here when the project owner sends it."
        ]
      },
      {
        title: "Captions",
        content: [
          "The captions for the video have not been received yet. They will be published with the video when the project owner sends them."
        ]
      },
      {
        title: "Audio description",
        content: [
          "The audio description of the video has not been received yet. It will be published with the video when the project owner sends it."
        ]
      }
    ]
  },
  educational: {
    title: "Educational trail \u2014 {siteName}",
    description: "A walk that teaches how food grows, returns to the soil as compost, and becomes food again.",
    h1: '<b><span class="tx-32">Trail 1: </span></b><i>Educational Path</i>',
    heroLine: "Here you learn the whole path through the cycle of life.",
    heroAlt: "Two hands hold small green fruits among leaves. One fruit rests in an open palm.",
    moreTitle: "Know more about:",
    lead: '<i></i><i></i><i></i><i></i><span class="tx-esq"><i></i></span><i></i><i></i><i></i><i></i><i></i><i></i><span class="tx-esq"><i></i></span><i></i><span class="tx-esq"><i></i><span class="tx-centro"><i><span class="tx-24">Download the app: Then the experience begins....</span></i></span><span class="tx-centro"><i><span class="tx-24">Two options:</span></i><br><b>1: Visually Impaired: Audio version<br>2: Sighted: QR/NFC scan at stations..</b></span></span><br><br>All Junction points have Braille information cards.<br><b><span class="tx-centro">1. Visually Impaired: Audio version</span></b><span class="tx-esq">You will have a trained volunteer who will accompany you if you do not have a sighted guide. The guided audio will take you on a journey through 20 stations of information. There will be 4 rest points along the way. At each rest point you will have to answer 5 questions before moving to the next. A hand rail will help guide you along the path. A ball at the end of each hand rail will signify a change of hand rail from right to left or left to right. White cane detectable stone edges shall guide your direction on the path. A bell at the end of each rail will signify an easy to find seating area to answer your Q&amp;A.<br></span> <br><br><br>',
    p1: '<span class="tx-centro"><b></b></span><span class="tx-40"><span class="tx-centro"><b>Ecology:</b></span><span class="tx-esq"><span class="tx-centro"><i>Working together...</i></span></span><span class="tx-centro"><b>Important fun Facts on route</b></span><b></b></span><i><b>Culture and History: </b></i>Identifying cultural and historical foods and practices from Inca to us. <br><b><i>Seed preparation:</i> </b>cultivation, storage and why we must protect them for future generations. <br><i><b>Soil: </b></i>Soil preparation, Composting, Microbes and care.<br><i><b>Insects: </b></i>Pollination, Beneficial species and natural pest management.<br><b>Animal Input: </b>Sources from other beneficial animals.<br><i><b>Plant Care: </b>Plant relationships, </i>Identifying disease and management.<br><i><b>Replanting:  </b></i>Cycles of harvesting, helping the ecosystems, environmental help.<br><b><i>Harvesting: </i></b>When, why and how.<br><i><b>Global Impact:</b></i> Looking at new and old data to prepare for changes.<br><i><b>Water Management: </b></i>Water testing, Identifying problems, New solutions, Cleaning and maintenance, Preserve and protect. <br>Replanting: Cycles of harvesting, environmental help.<br><i><b>Animal Care: </b></i>Understanding how animals play a big role in supporting the cycle of life, from plowing the fields to animal waste. Learning to listen and sense their behaviors.<br><i><b>Community: </b></i>Working with others, relationships, Supporting and  sharing.<br><br><br>',
    p2: "<br>",
    p3: "Healthy soil grows healthy plants. Healthy plants feed healthy people. The educational trail is that idea, told as a path you can walk.",
    gallery: {
      title: "Would you like to know a little of what is on the trail?",
      prev: "Previous",
      next: "Next",
      close: "Close",
      open: "Open image",
      thumbs: "Thumbnails",
      photo1: "A young plant with wide leaves grows in a garden bed under shade cloth, with irrigation lines on the soil.",
      photo2: "A man in a sun hat and glasses crouches and holds a large white flower cluster among feathery green plants.",
      photo3: "A hand reaches over trays of red and green seedlings. Other trays still hold only soil.",
      photo4: "A man in a sun hat holds a plastic bottle connected by a hose to a blue barrel, beside a work table.",
      photo5: "A pile of wood chips and sawdust, ready to cover the soil.",
      photo6: "A man in a sun hat holds a handful of dark compost beside a perforated pipe in a mulched bed.",
      photo7: "Two turkeys stand side by side against a green mesh fence.",
      photo8: "Dry stems and plant waste piled together, the start of compost.",
      photo9: "Yellow flowers lean over a small pond of reddish water, with rocks behind.",
      photo10: "A man crouches on the grass between two alpacas, one brown and one white, holding their ropes.",
      photo11: "Open hands hold small green fruits still on the leafy branch.",
      photo12: "Young corn plants grow in rows on rocky ground, with mountains behind.",
      photo13: "A tall cactus rises among round barrel cacti on rocky ground.",
      photo14: "Rows of potato plants grow in dark soil, with rocks and a hillside behind.",
      photo15: "A dry-stone wall of rounded rocks, with trees and mountains under a blue sky.",
      photo16: "A cluster of bright pink flowers, close up, with green leaves behind.",
      photo17: "A wall of pale cut stone blocks fitted together."
    }
  },
  sensory: {
    title: "Sensory trail \u2014 {siteName}",
    description: "A walk of touch, scent, sound and the ground underfoot, for blind and visually impaired visitors and the people beside them.",
    h1: '<span class="tx-20"><span class="tx-centro"><span class="tx-32">Trail 2: </span></span></span><span class="tx-centro"><i><span class="tx-48">Aromatic and Medicinal Path</span></i></span><br>',
    heroLine: "On this path you learn to identify and use the plants. All downloaded as you go to use in the future.",
    heroAlt: "A bearded man leans close to leafy green plants, seen from the side. Only the lower edge of his glasses shows at the top.",
    moreTitle: "Know more about:",
    lead: "Download the app: Then the experience begins.Feel or see the Braille Map layout from beginning to end<br>Two options:<br>1: Visually Impaired: Audio version<br>2: SIghted: QR/NFC scan at stations..<br>All Junction points have Braille information cards.<br>Visually Impaired: Audio version<br><br>On this sensory path you will experience the many wonders and aromas the Apus (Mountain Spirits) and Pachamama (Mother Earth) nourish us with. There will also be QR/NFC markers provided with detailed information about individual plants, traditional, medicinal, culinary and personal care uses and how to prepare them.All this information you will be able to take away with you so you can refer to it at any time.<br>The main reason is that I personally have visited many information trails and wasn&#39;t able to retain the information or i wrote things down and  lost the information over time, but now you can refer to it when ever needed.<br>Enjoy :)<br><br><br><br><br><br>",
    p1: "On the sensory trail, people are invited to walk slowly and meet this place with the body. A rope handrail leads the way. Stone, wood, leaves and flowers are there to be touched. Herbs and damp earth offer scent. Water, birds and wind offer sound.",
    p2: "The ground changes under the feet, from stone to soil, so each step says where you are. Nothing on this walk depends on sight.",
    p3: "<br>",
    gallery: {
      title: "Would you like to know a little of what is on the trail?",
      prev: "Previous",
      next: "Next",
      close: "Close",
      open: "Open image",
      thumbs: "Thumbnails",
      photo1: "A hand rests on the soil among young green seedlings and an irrigation line.",
      photo2: "A man in a sun hat and glasses tastes a green leaf, close to the camera.",
      photo3: "A hand holds a stem of small green tomatoes, some still in flower.",
      photo4: "A man with glasses leans in to smell a dense bed of green leaves.",
      photo5: "A hand holds dark compost full of earthworms.",
      photo6: "A man in a sun hat crouches among the flowers and holds a small pale blossom. An orange flower fills the foreground.",
      photo7: "Round green water plants float on reddish water.",
      photo8: "A man sits at the base of a tree and holds a handful of dry leaves.",
      photo9: "A man holds two brown hens, one on each arm, with trees behind him.",
      photo10: "A hand touches clear water running over dark rocks.",
      photo11: "A smiling man in a sun hat hugs a tall leafy plant, with mountains behind him.",
      photo12: "A hand touches the leaves of a plant with red stems, in a bed of green crops.",
      photo13: "A thick cushion of moss grows against a rock, with small succulent leaves above.",
      photo14: "Moss and small plants grow between the stones of a wall."
    }
  },
  sponsors: {
    title: "Sponsors \u2014 {siteName}",
    description: "A brand or organization can walk with this project. With your agreement, your logo appears at the bottom of the pages.",
    h1: "Affiliates Partners",
    heroLine: "Get involved with this beautiful project by sending your support.",
    heroAlt: "Green water-hyacinth fruits and round leaves float together on brown water.",
    lead: "If you have a brand and want to stand with this trail, write to us.",
    p1: "A partner can contribute in the way that fits: with materials for the path, with work, with ideas, or by sponsoring the project.",
    p2: "If you have a brand or an organization and want to be our partner on this path, write to us and we will answer.",
    p3: "With your agreement, your logo appears at the bottom of the pages, among the affiliate partners.",
    boxTitle: "Be our partner",
    boxNote: "The form will be placed here.",
    footerTitle: "Affiliates partners:",
    logosLabel: "Spaces for partner logos",
    logoPending: "Space for a logo"
  },
  app: {
    title: "Inka Braille Trail App \u2014 {siteName}",
    description: "The Inka Braille Trail App guides blind and visually impaired visitors through the tour and tells the story of each station.",
    h1: "Inka Braille Trail App",
    lead: "This app brings the trail to blind and visually impaired people.",
    p1: "It guides the visitor through the tour. At each station it tells the story of that place, so the walk can be followed by listening.",
    p2: "The path stays within reach of someone who cannot see it. Each stop has a voice, and the story of the station shows the way.",
    p3: "Pictures of the app will be placed in the spaces below.",
    slotsLabel: "Spaces for pictures of the app",
    slot: "Space for a picture"
  },
  sitemap: {
    title: "Site Map \u2014 {siteName}",
    description: "Site map of the Inca Braille Trail.",
    h1: "Site Map"
  }
};

// ../src/i18n/es.json
var es_default = {
  htmlLang: "es",
  hreflang: "es",
  name: "Espa\xF1ol",
  skip: "Saltar al contenido",
  external: "(se abre en otra pesta\xF1a)",
  required: "obligatorio",
  inboxNote: "Los mensajes de esta p\xE1gina se env\xEDan a info.incabrailletrail@gmail.com.",
  formActivate: "Abre info.incabrailletrail@gmail.com y pulsa el enlace de confirmaci\xF3n del mensaje de FormSubmit. Hasta ese clic, el mensaje queda en espera y no se entrega.",
  nav: {
    label: "Navegaci\xF3n principal",
    menu: "Men\xFA",
    home: "Inicio",
    sitemap: "Mapa del sitio",
    volunteer: "Voluntariado",
    donations: "Donaciones",
    audiovideo: "Medios",
    open: "Mostrar p\xE1ginas",
    educational: "Sendero 1: Camino educativo",
    sensory: "Sendero 2: Camino arom\xE1tico y medicinal",
    sponsors: "Socios afiliados",
    app: "Aplicaci\xF3n"
  },
  lang: {
    button: "Idioma",
    list: "Elegir idioma",
    current: "(idioma actual)"
  },
  construction: {
    heading: "Sitio en construcci\xF3n",
    intro: "Esta es una versi\xF3n de trabajo. Falta que el due\xF1o del proyecto entregue:",
    items: [
      "Los correos electr\xF3nicos que aparecen en este sitio todav\xEDa no han sido creados.",
      "El formulario de voluntariado no env\xEDa mensajes hasta que se confirme la cuenta de Formspree.",
      "El formulario de donaci\xF3n env\xEDa los datos al correo del proyecto. Las cuentas bancarias quedan visibles en la p\xE1gina.",
      "Cuentas de Instagram y Facebook por confirmar.",
      "Las transferencias usan las cuentas visibles en la p\xE1gina. El due\xF1o del proyecto confirmar\xE1 si las dos cuentas se quedan.",
      "Audio y video del sendero por recibir.",
      "Fotos y videos de los voluntarios por recibir.",
      "Dominio www.incabrailletrail.com por registrar."
    ]
  },
  contact: {
    heading: "Contacto",
    placeLabel: "D\xF3nde",
    place: "Azul Tika, Pumawanka, Urubamba, Valle Sagrado de los Incas, Cusco, Per\xFA",
    mapButton: "Abrir el mapa",
    phoneLabel: "Tel\xE9fono y WhatsApp",
    whatsappLink: "Escribir por WhatsApp",
    visitsLabel: "Visitas",
    visitsValue: "Con cita previa",
    socialLabel: "Redes sociales",
    tbc: "por confirmar",
    websiteLabel: "Sitio web previsto",
    websiteNote: "Registro del dominio pendiente.",
    emailsLabel: "Correo electr\xF3nico",
    emailRoles: {
      info: "consultas generales",
      bookings: "visitas y reservas",
      volunteers: "consultas de voluntariado",
      donations: "patrocinadores y donaciones",
      contact: "contacto principal propuesto"
    },
    emailsNote: "Estas direcciones fueron las solicitadas por el proyecto. El due\xF1o del proyecto todav\xEDa debe crearlas, y no reciben mensajes hasta que eso ocurra. Cuando existan, solo se env\xEDan las direcciones finales, nunca las contrase\xF1as, para vincularlas a esta p\xE1gina."
  },
  footer: {
    text: "Un sendero sensorial para personas ciegas y con baja visi\xF3n"
  },
  home: {
    title: "{siteName} \u2014 Un sendero sensorial para personas ciegas y con baja visi\xF3n, Valle Sagrado de los Incas",
    description: "Un sendero educativo y sensorial en desarrollo para personas ciegas y con baja visi\xF3n, junto con sus familias, amigos y acompa\xF1antes, en el Valle Sagrado de los Incas, Cusco, Per\xFA.",
    heroAlt: "Afiche del proyecto. Una persona con gorro de lana y poncho naranja camina con bast\xF3n blanco por un sendero de piedra junto a una cerca de madera, al lado de una casa de piedra de dos pisos donde est\xE1n una mujer y un ni\xF1o. Dos personas siembran en un campo verde entre gallinas, y dos \xF1and\xFAes est\xE1n junto a un muro de piedra, con monta\xF1as nevadas al fondo. El afiche dice: INCA BRAILLE TRAIL \u2014 GUIDING YOUR STEPS THROUGH THE CYCLE OF LIFE. Un cartel dice que el proyecto est\xE1 en construcci\xF3n y que se necesitan voluntarios con urgencia.",
    tagline: "Un recorrido educativo y sensorial \xFAnico a trav\xE9s del ciclo de la vida y la agricultura andina\n\nDise\xF1ado para personas ciegas y con baja visi\xF3n.\n\nLos visitantes videntes pueden elegir usar una venda en el sendero. Al dejar la vista de lado un momento, pueden sintonizar con los sonidos, texturas y aromas de la granja, descubrir detalles que suelen pasar por alto y sentirse m\xE1s conectados con el mundo natural.",
    banner: "Este sitio es un proyecto en construcci\xF3n.",
    boxes: [
      {
        title: "\xBFQu\xE9 es el Inca Braille Trail?",
        content: [
          {
            lead: "Un recorrido por la naturaleza, la educaci\xF3n y los sentidos"
          },
          "Ubicado en el hermoso Valle Sagrado de los Incas, Cusco, Per\xFA, el Inca Braille Trail es una experiencia educativa y sensorial que se desarrolla espec\xEDficamente para personas ciegas y con baja visi\xF3n, junto con sus familias, amigos y acompa\xF1antes.",
          "Nuestra visi\xF3n es crear un lugar acogedor donde los visitantes puedan disfrutar de la naturaleza, aprender, explorar y compartir experiencias significativas, de forma gratuita gracias al apoyo de patrocinadores y donaciones.",
          "El sendero est\xE1 dise\xF1ado para estimular los sentidos a trav\xE9s del tacto, el olfato, el o\xEDdo y el gusto. Los visitantes descubrir\xE1n las texturas de las plantas, las fragancias de hierbas y flores, los sonidos de la naturaleza y las muchas experiencias maravillosas que el mundo natural ofrece."
        ]
      },
      {
        title: "El ciclo de la vida \u2013 Aprender de la Pachamama",
        content: [
          "En el centro de nuestra filosof\xEDa est\xE1 el respeto por la Pachamama, la Madre Tierra, y la comprensi\xF3n de que todos los seres vivos est\xE1n conectados.",
          "A trav\xE9s de nuestro recorrido educativo, El ciclo de la vida, los visitantes descubrir\xE1n c\xF3mo las necesidades de las plantas reflejan de cerca las nuestras.",
          "Una peque\xF1a semilla necesita alimento, agua, calor y cuidado para crecer, as\xED como nosotros necesitamos comida nutritiva, agua limpia, luz del sol y un ambiente sano para prosperar.",
          "Las plantas toman nutrientes de un suelo sano y energ\xEDa de la luz del sol, mientras que nosotros dependemos del alimento que producen para nuestra propia energ\xEDa, crecimiento y bienestar.",
          {
            lead: "Un suelo sano cr\xEDa plantas sanas. Las plantas sanas alimentan a personas sanas."
          },
          "Los animales tambi\xE9n cumplen un papel esencial en este ciclo. Desde las abejas que polinizan las flores hasta las aves que dispersan semillas, y los animales de granja que aportan abono natural que enriquece el suelo, cada criatura contribuye al equilibrio de la naturaleza.",
          "Estos nutrientes vuelven a la tierra, ayudan a crecer a nuevas plantas y completan el hermoso ciclo que une a plantas, animales y personas.",
          "A lo largo del recorrido, los visitantes explorar\xE1n las pr\xE1cticas agr\xEDcolas tradicionales andinas y las de los antiguos incas junto con la agricultura sostenible moderna. Destacamos la importancia de conservar las semillas nativas, hacer compost, proteger la biodiversidad y cultivar alimentos nutritivos sin depender de qu\xEDmicos agr\xEDcolas da\xF1inos.",
          "Nuestro objetivo es demostrar que cuidar la tierra y producir alimentos sanos puede ser simple, sostenible y accesible para todos."
        ]
      },
      {
        title: "Un lugar para que todos se conecten \u2013 El esp\xEDritu del Ayni",
        content: [
          "En el coraz\xF3n del Inca Braille Trail est\xE1 el antiguo principio andino del Ayni, que significa reciprocidad: la convicci\xF3n de que al dar, recibir y apoyarnos unos a otros creamos comunidades m\xE1s fuertes y m\xE1s compasivas.",
          "Nuestro sendero es m\xE1s que una experiencia educativa. Es un lugar donde las personas ciegas y con baja visi\xF3n, sus familias, amigos y acompa\xF1antes pueden reunirse, compartir experiencias, hacer amistades y celebrar la vida.",
          "Tambi\xE9n esperamos animar a los visitantes videntes a comprender mejor los desaf\xEDos cotidianos que enfrentan las personas con discapacidad visual, desarrollando mayor conciencia, empat\xEDa y respeto.",
          "A trav\xE9s de experiencias compartidas, queremos que las personas reconozcan que todos tenemos algo valioso que ofrecer y que todos tenemos algo que aprender de los dem\xE1s.",
          "As\xED como nosotros cuidamos la tierra y la tierra nos cuida, con bondad, compasi\xF3n y reciprocidad nos cuidamos unos a otros.",
          {
            lead: "Este es el esp\xEDritu del Ayni, y el coraz\xF3n del Inca Braille Trail."
          }
        ]
      }
    ]
  },
  volunteer: {
    title: "Voluntarios \u2014 {siteName}",
    description: "Se necesitan voluntarios con urgencia: despejar y dar forma a senderos, mover piedras, jardiner\xEDa y mantenimiento del terreno. Comidas incluidas; alojamiento para quienes trabajan jornadas completas.",
    h1: "Voluntarios",
    heroLine: "Muchas manos ponen el coraz\xF3n en este proyecto y lo hacen posible. Con\xF3celas y encuentra la historia de cada mano que pas\xF3 por aqu\xED.",
    heroAlt: "Unas manos sostienen un manojo de plantas verdes altas. Alrededor hay m\xE1s plantas y un cerro.",
    signNow: "Inscr\xEDbete como voluntario",
    lead: "Se necesitan voluntarios con urgencia para abrir el sendero a los visitantes ciegos y con baja visi\xF3n.",
    boxes: [
      {
        title: "Ayuda a construir el sendero",
        content: [
          "\xA1NECESITAMOS TU AYUDA!!!\n\xA1Las familias son bienvenidas!\nAyuda a dar vida al Inca Braille Trail\n\xBFPOR QU\xC9?\nEste Inca Braille Trail es el primero de su tipo con tecnolog\xEDa NFC/QR para ofrecer educaci\xF3n y actividades sensoriales a personas ciegas y con baja visi\xF3n, y tambi\xE9n para que el p\xFAblico con vista intensifique sus otros sentidos mediante la privaci\xF3n visual.\nNuestra esperanza es que, al vivirlo, sientas m\xE1s compasi\xF3n por quienes tienen menos oportunidades y reconozcas tu propia sensibilidad hacia tu magia interior.\nLos fondos recaudados ir\xE1n directamente a ofrecer un d\xEDa gratuito en el Inca Braille Trail a personas ciegas o con baja visi\xF3n, junto con sus familias y cuidadores. El d\xEDa incluye transporte de ida y vuelta desde Cusco, almuerzo y un regalo para llevar a casa.\nA menudo se olvida a cuidadores y familias: celebremos juntos ayudando a que esto sea un evento divertido y memorable para todos.",
          "Se necesita ayuda:\n-Peque\xF1os caminos de piedra\n-Cercado b\xE1sico\n-Cocina\n-Redes sociales\n-Limpieza general\n-Rastrillar\n-Plantar arom\xE1ticas",
          {
            list: [
              "Voluntarios por el d\xEDa: almuerzo incluido.",
              "Voluntarios que se alojan con nosotros y trabajan jornadas completas: alojamiento, desayuno, almuerzo y cena incluidos.",
              "Transporte: disponible desde un punto de recogida acordado."
            ]
          },
          "Cont\xE1ctanos para coordinar fechas y encontrar tareas adecuadas a tus capacidades."
        ]
      }
    ],
    work: {
      title: "Conozcan el trabajo de los voluntarios",
      lead: "Estamos trabajando duro para construir los senderos. Aqu\xED tienes algunas im\xE1genes de nuestro trabajo.",
      prev: "Anterior",
      next: "Siguiente",
      position: "Imagen",
      close: "Cerrar",
      open: "Abrir imagen",
      openVideo: "Abrir video",
      thumbs: "Miniaturas",
      photo1: "Tres personas construyen un muro de piedra en una ladera de tierra. Un hombre de barba canosa est\xE1 de rodillas y sostiene una cinta de medir. Un hombre calvo carga un tronco largo. Otra persona con sombrero se inclina sobre las piedras. Detr\xE1s hay un contenedor verde y monta\xF1as.",
      photo2: "El mismo muro de piedra. El hombre de barba canosa sostiene la cinta de medir. La persona del sombrero trabaja en las piedras. El hombre calvo, con un guante rojo, tira de una herramienta de mango largo.",
      photo3: "Tres hombres trabajan junto a un muro bajo de piedra. Un hombre de barba canosa, con una camiseta negra del n\xFAmero 23 y botas de goma, sonr\xEDe a la c\xE1mara. Un hombre de sombrero ancho se\xF1ala hacia un lado. Un hombre calvo, con guantes rojos, se inclina sobre un rastrillo. Detr\xE1s hay un contenedor verde, \xE1rboles y monta\xF1as.",
      photo4: "Herramientas cuelgan de un alambre en una pared clara: un cultivador peque\xF1o, tres palas de mano, dos alicates y un serrucho. Un bieldo est\xE1 en la tierra, junto a una lona azul y una bolsa naranja.",
      video: "El mismo trabajo en movimiento: miden el suelo, arman el muro de piedra y mueven la madera, con las monta\xF1as detr\xE1s."
    },
    media: {
      title: "Conozcan a los voluntarios",
      intro: "Las manos que construyen este proyecto.",
      click: "Clic para abrir",
      matias: {
        name: "Garth Warner, fundador, mantenimiento general",
        alt: "Matias Lopez est\xE1 en cuclillas junto a un \xF1and\xFA que come de un recipiente de metal. Tiene el pelo oscuro, barba y lentes, y lleva una camiseta oscura y guantes de trabajo. Detr\xE1s hay un toldo azul, una mesa y \xE1rboles.",
        who: "55 a\xF1os. De Nueva Zelanda. Se enamor\xF3 del Per\xFA hace 9 a\xF1os y encontr\xF3 un hogar donde puede servir a los dem\xE1s.",
        work: "",
        why: ""
      },
      patrick: {
        name: "Patrick De Vries, agente de aduanas, electricista",
        alt: "Patrick De Vries sonr\xEDe junto a un perro blanco grande en un camino de piedra. Es calvo, lleva una camiseta gris y sostiene una taza blanca con su nombre. Al fondo hay monta\xF1as y \xE1rboles.",
        who: "Patrick De Vries tiene 55 a\xF1os y es de los Pa\xEDses Bajos. Est\xE1 en el Per\xFA para explorar la cultura.",
        work: "Trabaja en aduanas y log\xEDstica, y tambi\xE9n es manitas: electricidad, carpinter\xEDa y plomer\xEDa.",
        why: "Ayudar a las personas est\xE1 en su naturaleza. Le encanta la idea de trabajar en algo nuevo y de beneficio, ayudando a otros."
      },
      pamella: {
        name: "Pamella Garcia, ciberseguridad, dise\xF1o web",
        alt: "Pamella Garcia sonr\xEDe en la entrada de una carpa blanca de lona. Tiene el pelo corto y oscuro, una camiseta negra con una calavera de colores y un collar. La enmarcan cortinas blancas y una viga de madera.",
        who: "Pamella Garcia tiene 31 a\xF1os y es de Brasil. Vive en el Per\xFA desde hace 6 a\xF1os porque siente que es su nueva casa.",
        work: "Est\xE1 a cargo del dise\xF1o web y de la ingenier\xEDa de software de las aplicaciones del proyecto.",
        why: "Lo que m\xE1s le gusta de trabajar en el proyecto es que se trata de una iniciativa que nace del coraz\xF3n y de la voluntad de conectar a las personas con la naturaleza de una manera muy bonita."
      },
      vegprtsmkl6: {
        name: "Nello Fraboni, m\xFAsico, cuidado de plantas",
        alt: "Nello Fraboni sonr\xEDe en una foto de voluntario.",
        who: "Tiene 46 a\xF1os. Horticultor franco-estadounidense, apasionado por las plantas, la naturaleza y la agricultura sostenible.",
        work: "",
        why: "",
        p4: "Tiene amplia experiencia en cultivo de plantas, propagaci\xF3n y manejo de invernaderos.",
        p5: "Actualmente en el Per\xFA, explora la permacultura y los sistemas de cultivo tropical.",
        p6: "Experimentar\xE1s la dualidad de c\xF3mo el cuidado correcto de semillas, plantas y vida animal se relaciona profundamente con nosotros mismos."
      },
      vliklxe9amd: {
        name: "Matias Lopez: chef, t\xE9cnico forestal",
        alt: "Matias Lopez, chef y t\xE9cnico forestal, sonr\xEDe en una foto de voluntario.",
        who: "Matias Lopez tiene 38 a\xF1os y es de Argentina. Est\xE1 en el Per\xFA para viajar y conocer lugares nuevos. Es t\xE9cnico forestal y chef, con especialidad en panes. Es voluntario porque el proyecto es hermoso y la intenci\xF3n que hay detr\xE1s es sincera."
      },
      vfx8wpyxmec: {
        name: "Leticia (Hampi Mama)",
        alt: "Leticia (Hampi Mama) sonr\xEDe en una foto de voluntario.",
        who: "De Cancha Cancha. Practicante de medicina de plantas. Vive en Huaran. Taller de Hampi Mama. Quise ser voluntaria y apoyar este proyecto para compartir con el mundo el conocimiento de mi ancestralidad."
      },
      vmkd7xnvg30: {
        name: "Omar",
        alt: "Omar sonr\xEDe en una foto de voluntario.",
        who: "34. Omar es de Urubamba. Operador profesional de retroexcavadora y contratista de volquete. Experto en su oficio y una persona muy honesta. Voluntario para ayudar con el proyecto, para que los ni\xF1os del futuro lo disfruten."
      }
    },
    form: {
      heading: "\xA1\xDAnete aqu\xED!",
      lead: "Para inscribirte como voluntario, completa el formulario de abajo.",
      inactive: "Este formulario todav\xEDa no est\xE1 activo. Funcionar\xE1 cuando el due\xF1o del proyecto confirme el correo de Formspree, en una bandeja a la que quien construye el sitio no tiene acceso. Destino previsto: info@incabrailletrail.com.",
      requiredNote: "Todos los campos son obligatorios.",
      name: "Nombre",
      email: "Correo electr\xF3nico",
      task: "Tarea con la que te gustar\xEDa ayudar",
      taskChoose: "Elige una tarea",
      taskTrails: "Despejar y dar forma a los senderos",
      taskStones: "Mover piedras",
      taskGardening: "Jardiner\xEDa",
      taskGrounds: "Mantenimiento general del terreno",
      message: "Mensaje",
      honeypot: "Deja este campo vac\xEDo",
      submit: "Enviar mensaje",
      sending: "Enviando\u2026",
      success: "Gracias. Recibimos tu mensaje y te contactaremos pronto.",
      summary: "No se pudo enviar el formulario. Revisa los campos marcados con error.",
      errRequired: "Este campo es obligatorio.",
      errEmail: "Escribe un correo electr\xF3nico v\xE1lido, por ejemplo nombre@ejemplo.com.",
      errNetwork: "No se pudo enviar el mensaje. Comprueba tu conexi\xF3n e int\xE9ntalo de nuevo."
    }
  },
  donations: {
    title: "Donaciones \u2014 {siteName}",
    description: "Las donaciones mantienen el sendero gratuito. Las cuentas bancarias est\xE1n en esta p\xE1gina, listas para copiar.",
    h1: "Donaciones",
    heroLine: "Cada donaci\xF3n mantiene este camino libre para quien camina con el tacto y la confianza.",
    heroAlt: "Un hombre sonriente con sombrero de sol y gafas azules se agacha en el suelo del bosque y sostiene hojas secas con ambas manos.",
    lead: "Las donaciones mantienen el sendero gratuito para quienes lo visitan.",
    choice: "Puedes publicar tu nombre y el monto, publicar solo tu nombre, o donar en anonimato. Las donaciones an\xF3nimas son bienvenidas.",
    noneYet: "Todav\xEDa no se publica ning\xFAn nombre en este sitio.",
    form: {
      heading: "Datos de la donaci\xF3n",
      intro: "Las cuentas bancarias est\xE1n en esta p\xE1gina. Tambi\xE9n puedes enviar tus datos con este formulario.",
      name: "Nombre completo",
      country: "Pa\xEDs",
      date: "Fecha de env\xEDo de la donaci\xF3n",
      amount: "Monto que pretendes donar",
      amountHint: "Incluye la moneda, por ejemplo 50 USD.",
      legend: "\xBFQu\xE9 podemos publicar?",
      optBoth: "Publicar mi nombre y el monto",
      optName: "Publicar solo mi nombre",
      optAnonymous: "Donaci\xF3n an\xF3nima. No publicar nada.",
      honeypot: "Deja este campo vac\xEDo",
      submit: "Enviar los datos de la donaci\xF3n",
      sending: "Enviando\u2026",
      success: "Gracias. Recibimos tus datos.",
      summary: "No se pudo enviar el formulario. Revisa los campos marcados con error.",
      errRequired: "Este campo es obligatorio.",
      errDate: "Escribe una fecha real.",
      errNetwork: "No se pudo enviar el mensaje. Revisa tu conexi\xF3n e int\xE9ntalo de nuevo.",
      emailNote: "Este formulario todav\xEDa no env\xEDa. El destino es info.incabrailletrail@gmail.com."
    },
    bank: {
      revealed: "Cuentas bancarias",
      hint: "Haz clic en un bot\xF3n para copiar el n\xFAmero.",
      soles: "Cuenta bancaria en soles",
      dolares: "Cuenta bancaria en d\xF3lares",
      bcp: "BCP",
      interbank: "Interbank",
      groupSoles: "Copiar una cuenta en soles",
      groupDollars: "Copiar una cuenta en d\xF3lares",
      copiedSolesBcp: "Se copi\xF3 la cuenta BCP en soles.",
      copiedSolesInter: "Se copi\xF3 la cuenta Interbank en soles.",
      copiedDollarsBcp: "Se copi\xF3 la cuenta BCP en d\xF3lares.",
      copiedDollarsInter: "Se copi\xF3 la cuenta Interbank en d\xF3lares.",
      copyFail: "No se pudo copiar. El n\xFAmero est\xE1 en el bot\xF3n. Selecci\xF3nalo y c\xF3pialo a mano."
    }
  },
  audiovideo: {
    title: "Audio y video \u2014 {siteName}",
    description: "Audio y video del Inca Braille Trail, con transcripci\xF3n, subt\xEDtulos y audiodescripci\xF3n. Archivos por recibir.",
    h1: "Audio y video",
    lead: "Audio y video del sendero, con transcripci\xF3n, subt\xEDtulos y audiodescripci\xF3n. Los archivos todav\xEDa no han sido recibidos.",
    boxes: [
      {
        title: "Audio de la visita",
        content: [
          "La grabaci\xF3n de audio de la visita todav\xEDa no ha sido recibida. Se publicar\xE1 aqu\xED cuando el due\xF1o del proyecto la env\xEDe."
        ]
      },
      {
        title: "Transcripci\xF3n",
        content: [
          "La transcripci\xF3n del audio todav\xEDa no ha sido recibida. Se publicar\xE1 aqu\xED como texto cuando el due\xF1o del proyecto la env\xEDe."
        ]
      },
      {
        title: "Video",
        content: [
          "El video del sendero todav\xEDa no ha sido recibido. Se publicar\xE1 aqu\xED cuando el due\xF1o del proyecto lo env\xEDe."
        ]
      },
      {
        title: "Subt\xEDtulos",
        content: [
          "Los subt\xEDtulos del video todav\xEDa no han sido recibidos. Se publicar\xE1n junto con el video cuando el due\xF1o del proyecto los env\xEDe."
        ]
      },
      {
        title: "Audiodescripci\xF3n",
        content: [
          "La audiodescripci\xF3n del video todav\xEDa no ha sido recibida. Se publicar\xE1 junto con el video cuando el due\xF1o del proyecto la env\xEDe."
        ]
      }
    ]
  },
  educational: {
    title: "Sendero educativo \u2014 {siteName}",
    description: "Una caminata que ense\xF1a c\xF3mo crece el alimento, vuelve a la tierra como compost y se convierte otra vez en comida.",
    h1: "Sendero 1: Camino educativo",
    heroLine: "Aqu\xED aprendes todo el camino por el ciclo de la vida.",
    heroAlt: "Dos manos sostienen frutos verdes peque\xF1os entre hojas. Un fruto descansa en una palma abierta.",
    moreTitle: "Conoce m\xE1s sobre:",
    lead: "Descarga la app: entonces comienza la experiencia. Dos opciones:\n1: Baja visi\xF3n / ceguera: versi\xF3n de audio\n2: Con vista: escaneo QR/NFC en las estaciones.\n\nTodos los puntos de uni\xF3n tienen tarjetas de informaci\xF3n en braille.\n1. Baja visi\xF3n / ceguera: versi\xF3n de audio\nTendr\xE1s un voluntario capacitado que te acompa\xF1ar\xE1 si no traes gu\xEDa vidente. El audio guiado te lleva por 20 estaciones de informaci\xF3n. Habr\xE1 4 puntos de descanso en el camino. En cada descanso deber\xE1s responder 5 preguntas antes de seguir. Una baranda te ayuda a orientarte. Una bola al final de cada baranda indica el cambio de mano (derecha a izquierda o al rev\xE9s). Bordes de piedra detectables con bast\xF3n blanco gu\xEDan la direcci\xF3n. Una campana al final de cada baranda marca un asiento f\xE1cil de encontrar para el Q&A.",
    p1: "Ecolog\xEDa: Trabajar juntos... Datos curiosos importantes en la ruta\nCultura e historia: identificar alimentos y pr\xE1cticas culturales e hist\xF3ricas desde los incas hasta nosotros.\nPreparaci\xF3n de semillas: cultivo, almacenamiento y por qu\xE9 debemos protegerlas para las generaciones futuras.\nSuelo: preparaci\xF3n del suelo, compostaje, microbios y cuidado.\nInsectos: polinizaci\xF3n, especies beneficiosas y manejo natural de plagas.\nAporte animal: fuentes de otros animales beneficiosos.\nCuidado de plantas: relaciones entre plantas, identificar enfermedades y manejo.\nReplantaci\xF3n: ciclos de cosecha, ayudar a los ecosistemas, apoyo ambiental.\nCosecha: cu\xE1ndo, por qu\xE9 y c\xF3mo.\nImpacto global: mirar datos nuevos y antiguos para prepararnos a los cambios.\nGesti\xF3n del agua: pruebas, identificar problemas, nuevas soluciones, limpieza y mantenimiento, preservar y proteger.\nReplantaci\xF3n: ciclos de cosecha, ayuda ambiental.\nCuidado animal: entender el gran papel de los animales en el ciclo de la vida, desde arar hasta el abono. Aprender a escuchar y sentir sus comportamientos.\nComunidad: trabajar con otros, relaciones, apoyar y compartir.",
    p2: "",
    p3: "Un suelo sano cr\xEDa plantas sanas. Las plantas sanas alimentan a personas sanas. El sendero educativo es esa idea, contada como un camino que se puede caminar.",
    gallery: {
      title: "\xBFQuieres conocer un poco de lo que hay en el sendero?",
      prev: "Anterior",
      next: "Siguiente",
      close: "Cerrar",
      open: "Abrir imagen",
      thumbs: "Miniaturas",
      photo1: "Una planta joven, de hojas anchas, crece en el cantero bajo la malla de sombra, con las mangueras de riego en la tierra.",
      photo2: "Un hombre con sombrero y lentes se agacha y sostiene un gran ramo blanco entre plantas de hojas finas.",
      photo3: "Una mano se extiende sobre bandejas de plantines rojos y verdes. Otras bandejas todav\xEDa tienen solo tierra.",
      photo4: "Un hombre con sombrero sostiene una botella de pl\xE1stico unida por una manguera a un tambor azul, junto a la mesa de trabajo.",
      photo5: "Un mont\xF3n de viruta y aserr\xEDn, listo para cubrir el suelo.",
      photo6: "Un hombre con sombrero sostiene un pu\xF1ado de compost oscuro junto a un tubo perforado, en un cantero cubierto de paja.",
      photo7: "Dos pavos, uno al lado del otro, contra una malla verde.",
      photo8: "Tallos secos y restos de planta amontonados, el comienzo del compost.",
      photo9: "Flores amarillas se inclinan sobre un peque\xF1o estanque de agua rojiza, con piedras detr\xE1s.",
      photo10: "Un hombre se agacha en el pasto entre dos alpacas, una marr\xF3n y una blanca, sosteniendo las cuerdas.",
      photo11: "Manos abiertas sostienen frutos verdes peque\xF1os, todav\xEDa en la rama con hojas.",
      photo12: "Plantas j\xF3venes de ma\xEDz crecen en hileras sobre un terreno pedregoso, con las monta\xF1as detr\xE1s.",
      photo13: "Un cactus alto se alza entre cactus redondos, en suelo de piedra.",
      photo14: "Hileras de papa crecen en la tierra oscura, con piedras y la ladera detr\xE1s.",
      photo15: "Un muro de piedra seca, de rocas redondeadas, con \xE1rboles y monta\xF1as bajo el cielo azul.",
      photo16: "Un ramo de flores rosa intenso, de cerca, con hojas verdes detr\xE1s.",
      photo17: "Un muro de bloques de piedra clara, encajados unos con otros."
    }
  },
  sensory: {
    title: "Sendero sensorial \u2014 {siteName}",
    description: "Una caminata de tacto, aroma, sonido y suelo, para personas ciegas o con baja visi\xF3n y para quienes las acompa\xF1an.",
    h1: "Sendero 2: Camino arom\xE1tico y medicinal",
    heroLine: "En este camino aprendes a identificar y usar las plantas. Todo se descarga mientras avanzas para usarlo en el futuro.",
    heroAlt: "Un hombre con barba se acerca a unas plantas verdes, visto de lado. Arriba solo se ve el borde de los lentes.",
    moreTitle: "Conoce m\xE1s sobre:",
    lead: "Descarga la app: entonces comienza la experiencia. Siente o ve el mapa braille de principio a fin.\nDos opciones:\n1: Baja visi\xF3n / ceguera: versi\xF3n de audio\n2: Con vista: escaneo QR/NFC en las estaciones.\nTodos los puntos de uni\xF3n tienen tarjetas de informaci\xF3n en braille.\nBaja visi\xF3n / ceguera: versi\xF3n de audio\n\nEn este camino sensorial vivir\xE1s las maravillas y aromas con los que los Apus (esp\xEDritus de la monta\xF1a) y la Pachamama (Madre Tierra) nos nutren. Tambi\xE9n habr\xE1 marcadores QR/NFC con informaci\xF3n detallada sobre cada planta: usos tradicionales, medicinales, culinarios y de cuidado personal, y c\xF3mo prepararlas. Podr\xE1s llevarte toda esa informaci\xF3n para consultarla cuando quieras.\nLa raz\xF3n principal es que yo mismo visit\xE9 muchos senderos informativos y no reten\xEDa lo aprendido, o anotaba y luego perd\xEDa las notas; ahora puedes consultarlo cuando lo necesites.\n\xA1Disfruta! :)",
    p1: "En el sendero sensorial, las personas est\xE1n invitadas a caminar despacio y encontrar este lugar con el cuerpo. Un pasamanos de cuerda marca el camino. Hay piedra, madera, hojas y flores para tocar. Las hierbas y la tierra h\xFAmeda ofrecen aroma. El agua, los p\xE1jaros y el viento ofrecen sonido.",
    p2: "El suelo cambia bajo los pies, de piedra a tierra, y cada paso dice d\xF3nde est\xE1s. Nada en esta caminata depende de la vista.",
    p3: "",
    gallery: {
      title: "\xBFQuieres conocer un poco de lo que hay en el sendero?",
      prev: "Anterior",
      next: "Siguiente",
      close: "Cerrar",
      open: "Abrir imagen",
      thumbs: "Miniaturas",
      photo1: "Una mano descansa en la tierra, entre plantines verdes y la manguera de riego.",
      photo2: "Un hombre con sombrero y lentes prueba una hoja verde, muy cerca de la c\xE1mara.",
      photo3: "Una mano sostiene un ramo de tomates verdes peque\xF1os, algunos todav\xEDa en flor.",
      photo4: "Un hombre con lentes se acerca para oler un cantero lleno de hojas verdes.",
      photo5: "Una mano sostiene compost oscuro, lleno de lombrices.",
      photo6: "Un hombre con sombrero se agacha entre las flores y sostiene una flor peque\xF1a y clara. Una flor naranja ocupa el frente.",
      photo7: "Plantas verdes y redondas flotan en el agua rojiza.",
      photo8: "Un hombre se sienta al pie de un \xE1rbol y sostiene un pu\xF1ado de hojas secas.",
      photo9: "Un hombre sostiene dos gallinas marrones, una en cada brazo, con \xE1rboles detr\xE1s.",
      photo10: "Una mano toca el agua clara que corre sobre piedras oscuras.",
      photo11: "Un hombre con sombrero sonr\xEDe y abraza una planta alta y frondosa, con las monta\xF1as detr\xE1s.",
      photo12: "Una mano toca las hojas de una planta de tallos rojos, en un cantero verde.",
      photo13: "Un coj\xEDn espeso de musgo crece junto a la piedra, con hojas suculentas arriba.",
      photo14: "Musgo y plantas peque\xF1as crecen entre las piedras de un muro."
    }
  },
  sponsors: {
    title: "Patrocinadores \u2014 {siteName}",
    description: "Una marca u organizaci\xF3n puede caminar con este proyecto. Con tu acuerdo, el logo aparece al final de las p\xE1ginas.",
    h1: "Socios afiliados",
    heroLine: "S\xFAmate a este lindo proyecto enviando tu apoyo.",
    heroAlt: "Frutos verdes de camalote y hojas redondas flotan juntos en el agua marr\xF3n.",
    lead: "Si tienes una marca y quieres acompa\xF1ar este sendero, escr\xEDbenos.",
    p1: "Un socio puede contribuir como le quede mejor: con materiales para el camino, con trabajo, con ideas o patrocinando el proyecto.",
    p2: "Si tienes una marca o una organizaci\xF3n y quieres ser nuestro socio en este camino, escr\xEDbenos y te responderemos.",
    p3: "Con tu acuerdo, tu logo aparece al final de las p\xE1ginas, entre los socios afiliados.",
    boxTitle: "S\xE9 nuestro socio",
    boxNote: "El formulario quedar\xE1 en este espacio.",
    footerTitle: "Socios afiliados:",
    logosLabel: "Espacios para logos de socios",
    logoPending: "Espacio para un logo"
  },
  app: {
    title: "Inka Braille Trail App \u2014 {siteName}",
    description: "Inka Braille Trail App gu\xEDa a las personas ciegas y con baja visi\xF3n por el recorrido y cuenta la historia de cada estaci\xF3n.",
    h1: "Inka Braille Trail App",
    lead: "Esta aplicaci\xF3n abre el sendero a las personas ciegas y con baja visi\xF3n.",
    p1: "Gu\xEDa a la visita por el recorrido. En cada estaci\xF3n cuenta la historia de ese lugar, para que el camino se pueda seguir escuchando.",
    p2: "El sendero queda al alcance de quien no puede verlo. Cada parada tiene una voz, y la historia de la estaci\xF3n marca el camino.",
    p3: "Las im\xE1genes de la aplicaci\xF3n ir\xE1n en los espacios de abajo.",
    slotsLabel: "Espacios para im\xE1genes de la aplicaci\xF3n",
    slot: "Espacio para una imagen"
  },
  sitemap: {
    title: "Mapa del sitio \u2014 {siteName}",
    description: "Mapa del sitio del Inca Braille Trail.",
    h1: "Mapa del sitio"
  }
};

// ../painel/publicar.mjs
var API = "https://api.cloudflare.com/client/v4";
var CONTA = "47fefac47b94a1d88bf43e36dc50b902";
var PROJETO = "incabrailletrail";
var D1_ID = "9783d82c-d1f7-463d-87e6-46389938503d";
var R2_NOME = "incabraille-midia";
var COMPAT_DATE = "2025-11-17";
var COMPAT_FLAGS = ["nodejs_compat"];
var PRAZO_MS = 3 * 60 * 1e3;
var LOTE_ARQUIVOS = 10;
var LOTE_BYTES = 25e5;
var MSG = {
  par: "The panel was updated and needs a manual deploy first. Ask the team.",
  curso: "A publish is already in progress. Wait a few minutes and try again.",
  estado: "This publish expired. Start again with the Publish button.",
  falha: "We could not publish. Try again in a few minutes."
};
function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow"
    }
  });
}
__name(json, "json");
var fontesCache = null;
function fontes() {
  if (!fontesCache) {
    fontesCache = montarFontes(
      site_default,
      { en: en_default, es: es_default },
      templates_site_default.layout,
      templates_site_default.templates
    );
  }
  return fontesCache;
}
__name(fontes, "fontes");
async function lerPublicacao(dbx) {
  const row = await dbx.get(`SELECT valor FROM meta WHERE chave = 'publicar'`);
  return row ? JSON.parse(row.valor) : null;
}
__name(lerPublicacao, "lerPublicacao");
async function gravarPublicacao(dbx, est) {
  await dbx.run(`INSERT INTO meta (chave, valor) VALUES ('publicar', ?)
    ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`, JSON.stringify(est));
}
__name(gravarPublicacao, "gravarPublicacao");
async function pegarJwt(env2) {
  const r = await fetch(`${API}/accounts/${CONTA}/pages/projects/${PROJETO}/upload-token`, {
    headers: { authorization: `Bearer ${env2.PUBLISH_TOKEN}` }
  });
  const d = await r.json();
  if (!r.ok || !d.success) throw new Error("upload-token");
  return d.result.jwt;
}
__name(pegarJwt, "pegarJwt");
async function apiAssets(rota, jwt, corpo) {
  const r = await fetch(`${API}${rota}`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${jwt}` },
    body: JSON.stringify(corpo)
  });
  const d = await r.json();
  if (!r.ok || d.success === false) throw new Error(`assets ${rota}`);
  return d.result;
}
__name(apiAssets, "apiAssets");
async function alinharBundle(request, env2) {
  const versaoObj = await env2.MIDIA.get("painel/worker-bundle.versao");
  const versaoR2 = versaoObj ? (await versaoObj.text()).trim() : "";
  if (versaoR2 === manifesto_estatico_default.versao) return true;
  const asset = await env2.ASSETS.fetch(new Request(new URL("/interno/worker-bundle.js", request.url)));
  if (!asset.ok) return false;
  const codigo = await asset.text();
  if (!codigo.includes("function")) return false;
  await env2.MIDIA.put("painel/worker-bundle", codigo);
  await env2.MIDIA.put("painel/worker-bundle.versao", manifesto_estatico_default.versao);
  return true;
}
__name(alinharBundle, "alinharBundle");
function todosOsHashes(est) {
  return [...Object.values(manifesto_estatico_default.arquivos).map((a) => a.h), ...Object.values(est.hashes)];
}
__name(todosOsHashes, "todosOsHashes");
async function iniciar(request, dbx, env2) {
  if (!env2.PUBLISH_TOKEN) return json(500, { erro: "config", mensagem: MSG.par });
  const corpo = await request.json().catch(() => ({}));
  const branch = corpo.branch === "publish-test" ? "publish-test" : "main";
  const alinhou = await alinharBundle(request, env2);
  if (!alinhou) return json(409, { erro: "par", mensagem: MSG.par });
  const agora = Date.now();
  const atual = await lerPublicacao(dbx);
  if (atual && atual.expira > agora) return json(409, { erro: "curso", mensagem: MSG.curso });
  const fila = [];
  for (const idioma of IDIOMAS) {
    for (const pagina2 of PAGINAS) fila.push({ i: idioma.code, p: pagina2.id, path: `${caminho(idioma, pagina2)}index.html` });
  }
  const est = { branch, expira: agora + PRAZO_MS, etapa: "paginas", fila, hashes: {}, faltam: null };
  await gravarPublicacao(dbx, est);
  return json(200, { ok: true, total: fila.length, etapa: "paginas" });
}
__name(iniciar, "iniciar");
async function pagina(dbx, env2, lerEstado) {
  const est = await lerPublicacao(dbx);
  if (!est || est.etapa !== "paginas" || est.expira < Date.now()) return json(409, { erro: "estado", mensagem: MSG.estado });
  const alvo = est.fila[0];
  const base = gerarPaginaBase(fontes(), alvo.i, alvo.p, (/* @__PURE__ */ new Date()).getFullYear());
  const estadoDb = await lerEstado(dbx, alvo.i);
  const html2 = aplicarConteudo(base, estadoDb);
  const hash = hashArquivoPages(Buffer.from(html2), "html");
  await env2.MIDIA.put(`painel/rascunho/${hash}`, html2);
  est.hashes[alvo.path] = hash;
  est.fila.shift();
  if (!est.fila.length) est.etapa = "enviar";
  est.expira = Date.now() + PRAZO_MS;
  await gravarPublicacao(dbx, est);
  const feitos = Object.keys(est.hashes).length;
  return json(200, { feitos, total: feitos + est.fila.length, etapa: est.etapa });
}
__name(pagina, "pagina");
async function enviar(request, dbx, env2) {
  const est = await lerPublicacao(dbx);
  if (!est || est.etapa !== "enviar" || est.expira < Date.now()) return json(409, { erro: "estado", mensagem: MSG.estado });
  est.expira = Date.now() + PRAZO_MS;
  if (est.faltam === null) {
    const jwt2 = await pegarJwt(env2);
    const faltam = await apiAssets("/pages/assets/check-missing", jwt2, { hashes: todosOsHashes(est) });
    est.faltam = Array.isArray(faltam) ? faltam : [];
    await gravarPublicacao(dbx, est);
    return json(200, { etapa: "enviar", faltam: est.faltam.length });
  }
  if (est.faltam.length) {
    const jwt2 = await pegarJwt(env2);
    const novoPorHash = {};
    for (const [path, h] of Object.entries(est.hashes)) novoPorHash[h] = path;
    const estaticoPorHash = {};
    for (const [path, info3] of Object.entries(manifesto_estatico_default.arquivos)) estaticoPorHash[info3.h] = { path, ...info3 };
    const lote = [];
    let bytes = 0;
    for (const h of est.faltam) {
      const tam = estaticoPorHash[h] ? estaticoPorHash[h].b : 1e5;
      if (lote.length && (bytes + tam > LOTE_BYTES || lote.length >= LOTE_ARQUIVOS)) break;
      lote.push(h);
      bytes += tam;
    }
    const payload = [];
    for (const h of lote) {
      let conteudo;
      let tipo;
      if (novoPorHash[h]) {
        const obj = await env2.MIDIA.get(`painel/rascunho/${h}`);
        if (!obj) return json(409, { erro: "estado", mensagem: MSG.estado });
        conteudo = await obj.arrayBuffer();
        tipo = "text/html";
      } else {
        const info3 = estaticoPorHash[h];
        if (!info3) return json(409, { erro: "estado", mensagem: MSG.estado });
        const resp = await env2.ASSETS.fetch(new Request(new URL(info3.path, request.url)));
        if (!resp.ok) return json(409, { erro: "estado", mensagem: MSG.falha });
        conteudo = await resp.arrayBuffer();
        tipo = info3.t;
      }
      payload.push({ key: h, value: Buffer.from(conteudo).toString("base64"), metadata: { contentType: tipo }, base64: true });
    }
    await apiAssets("/pages/assets/upload", jwt2, payload);
    est.faltam = est.faltam.filter((h) => !lote.includes(h));
    await gravarPublicacao(dbx, est);
    return json(200, { etapa: "enviar", faltam: est.faltam.length });
  }
  const jwt = await pegarJwt(env2);
  await apiAssets("/pages/assets/upsert-hashes", jwt, { hashes: todosOsHashes(est) });
  est.etapa = "concluir";
  await gravarPublicacao(dbx, est);
  return json(200, { etapa: "concluir", faltam: 0 });
}
__name(enviar, "enviar");
async function concluir(dbx, env2, auditar2, ip) {
  const est = await lerPublicacao(dbx);
  if (!est || est.etapa !== "concluir" || est.expira < Date.now()) return json(409, { erro: "estado", mensagem: MSG.estado });
  const bundleObj = await env2.MIDIA.get("painel/worker-bundle");
  if (!bundleObj) return json(409, { erro: "par", mensagem: MSG.par });
  const bundle = await bundleObj.text();
  const manifest = {};
  for (const [path, info3] of Object.entries(manifesto_estatico_default.arquivos)) manifest[path] = info3.h;
  for (const [path, h] of Object.entries(est.hashes)) manifest[path] = h;
  const metadata = {
    main_module: "_worker.js",
    bindings: [
      { name: "DB", type: "d1", id: D1_ID },
      { name: "MIDIA", type: "r2_bucket", bucket_name: R2_NOME }
    ],
    compatibility_date: COMPAT_DATE,
    compatibility_flags: COMPAT_FLAGS
  };
  const interno = new FormData();
  interno.set("metadata", JSON.stringify(metadata));
  interno.set("_worker.js", new File([bundle], "_worker.js", { type: "application/javascript+module" }));
  const blobInterno = await new Response(interno).blob();
  const form = new FormData();
  form.append("manifest", JSON.stringify(manifest));
  form.append("branch", est.branch);
  form.append("_headers", new File([manifesto_estatico_default.especiais.headers], "_headers"));
  form.append("_redirects", new File([manifesto_estatico_default.especiais.redirects], "_redirects"));
  form.append("_worker.bundle", new File([blobInterno], "_worker.bundle"));
  form.append("_routes.json", new File([manifesto_estatico_default.especiais.rotas], "_routes.json"));
  const r = await fetch(`${API}/accounts/${CONTA}/pages/projects/${PROJETO}/deployments`, {
    method: "POST",
    headers: { authorization: `Bearer ${env2.PUBLISH_TOKEN}` },
    body: form
  });
  const d = await r.json().catch(() => null);
  if (!r.ok || !d || !d.success) return json(502, { erro: "deploy", mensagem: MSG.falha });
  await env2.MIDIA.delete(Object.values(est.hashes).map((h) => `painel/rascunho/${h}`));
  await dbx.run(`DELETE FROM meta WHERE chave = 'publicar'`);
  await auditar2(dbx, "publicar", ip, `${est.branch} ${d.result.id || ""}`);
  return json(200, { ok: true, url: d.result.url || "", branch: est.branch });
}
__name(concluir, "concluir");
async function publicar(request, dbx, env2, rota, ip, deps) {
  if (request.method !== "POST") return json(404, { erro: "rota", mensagem: MSG.falha });
  try {
    if (rota === "/panel/api/publicar/iniciar") return await iniciar(request, dbx, env2);
    if (rota === "/panel/api/publicar/pagina") return await pagina(dbx, env2, deps.lerEstado);
    if (rota === "/panel/api/publicar/enviar") return await enviar(request, dbx, env2);
    if (rota === "/panel/api/publicar/concluir") return await concluir(dbx, env2, deps.auditar, ip);
  } catch {
    return json(502, { erro: "publicar", mensagem: MSG.falha });
  }
  return json(404, { erro: "rota", mensagem: MSG.falha });
}
__name(publicar, "publicar");

// ../site/painel-semente.json
var painel_semente_default = { idiomas: ["en", "es"], textos: { "t.htmlLang": { en: "en", es: "es" }, "t.hreflang": { en: "en", es: "es" }, "t.name": { en: "English", es: "Espa\xF1ol" }, "t.skip": { en: "Skip to content", es: "Saltar al contenido" }, "t.external": { en: "(opens in a new tab)", es: "(se abre en otra pesta\xF1a)" }, "t.required": { en: "required", es: "obligatorio" }, "t.inboxNote": { en: "Messages from this page are sent to info.incabrailletrail@gmail.com.", es: "Los mensajes de esta p\xE1gina se env\xEDan a info.incabrailletrail@gmail.com." }, "t.formActivate": { en: "Open info.incabrailletrail@gmail.com and click the confirmation link in the message from FormSubmit. Until that click, the message waits and is not delivered.", es: "Abre info.incabrailletrail@gmail.com y pulsa el enlace de confirmaci\xF3n del mensaje de FormSubmit. Hasta ese clic, el mensaje queda en espera y no se entrega." }, "t.nav.label": { en: "Main navigation", es: "Navegaci\xF3n principal" }, "t.nav.menu": { en: "Menu", es: "Men\xFA" }, "t.nav.home": { en: "Home", es: "Inicio" }, "t.nav.sitemap": { en: "Site Map", es: "Mapa del sitio" }, "t.nav.volunteer": { en: "Volunteer", es: "Voluntariado" }, "t.nav.donations": { en: "Donations", es: "Donaciones" }, "t.nav.audiovideo": { en: "Media", es: "Medios" }, "t.nav.open": { en: "Show pages", es: "Mostrar p\xE1ginas" }, "t.nav.educational": { en: "<b>Trail 1: </b><i>Educational Path</i>", es: "Sendero 1: Camino educativo" }, "t.nav.sensory": { en: '<b>Trail 2: </b><i><span class="tx-18"><span class="tx-20">Aromatic and Medicinal Path</span></span></i><br><i><span class="tx-18"><span class="tx-20"><br></span></span></i><br>', es: "Sendero 2: Camino arom\xE1tico y medicinal" }, "t.nav.sponsors": { en: "Affiliates Partners", es: "Socios afiliados" }, "t.nav.app": { en: "App Trail", es: "Aplicaci\xF3n" }, "t.lang.button": { en: "Language", es: "Idioma" }, "t.lang.list": { en: "Choose a language", es: "Elegir idioma" }, "t.lang.current": { en: "(current language)", es: "(idioma actual)" }, "t.construction.heading": { en: "Site under construction", es: "Sitio en construcci\xF3n" }, "t.construction.intro": { en: "This is a working version. Still to be provided by the project owner:", es: "Esta es una versi\xF3n de trabajo. Falta que el due\xF1o del proyecto entregue:" }, "t.construction.items.0": { en: "The email addresses listed on this site have not been created yet.", es: "Los correos electr\xF3nicos que aparecen en este sitio todav\xEDa no han sido creados." }, "t.construction.items.1": { en: "The volunteer form does not send messages until the Formspree account is confirmed.", es: "El formulario de voluntariado no env\xEDa mensajes hasta que se confirme la cuenta de Formspree." }, "t.construction.items.2": { en: "The donation form sends the details to the project email. The bank accounts stay visible on the page.", es: "El formulario de donaci\xF3n env\xEDa los datos al correo del proyecto. Las cuentas bancarias quedan visibles en la p\xE1gina." }, "t.construction.items.3": { en: "Instagram and Facebook accounts to be confirmed.", es: "Cuentas de Instagram y Facebook por confirmar." }, "t.construction.items.4": { en: "Donation transfers use the bank accounts visible on the page. The project owner will confirm whether both accounts stay.", es: "Las transferencias usan las cuentas visibles en la p\xE1gina. El due\xF1o del proyecto confirmar\xE1 si las dos cuentas se quedan." }, "t.construction.items.5": { en: "Audio and video of the trail to be received.", es: "Audio y video del sendero por recibir." }, "t.construction.items.6": { en: "Photos and videos of the volunteers to be received.", es: "Fotos y videos de los voluntarios por recibir." }, "t.construction.items.7": { en: "Domain www.incabrailletrail.com to be registered.", es: "Dominio www.incabrailletrail.com por registrar." }, "t.contact.heading": { en: "Contact", es: "Contacto" }, "t.contact.placeLabel": { en: "Where", es: "D\xF3nde" }, "t.contact.place": { en: "Azul Tika, Pumawanka, Urubamba, Sacred Valley of the Incas, Cusco, Peru", es: "Azul Tika, Pumawanka, Urubamba, Valle Sagrado de los Incas, Cusco, Per\xFA" }, "t.contact.mapButton": { en: "Open the map", es: "Abrir el mapa" }, "t.contact.phoneLabel": { en: "Phone and WhatsApp", es: "Tel\xE9fono y WhatsApp" }, "t.contact.whatsappLink": { en: "Message on WhatsApp", es: "Escribir por WhatsApp" }, "t.contact.visitsLabel": { en: "Visits", es: "Visitas" }, "t.contact.visitsValue": { en: "By advance arrangement", es: "Con cita previa" }, "t.contact.socialLabel": { en: "Social media", es: "Redes sociales" }, "t.contact.tbc": { en: "to be confirmed", es: "por confirmar" }, "t.contact.websiteLabel": { en: "Intended website", es: "Sitio web previsto" }, "t.contact.websiteNote": { en: "Domain registration pending.", es: "Registro del dominio pendiente." }, "t.contact.emailsLabel": { en: "Email", es: "Correo electr\xF3nico" }, "t.contact.emailRoles.info": { en: "general enquiries", es: "consultas generales" }, "t.contact.emailRoles.bookings": { en: "tours and reservations", es: "visitas y reservas" }, "t.contact.emailRoles.volunteers": { en: "volunteer enquiries", es: "consultas de voluntariado" }, "t.contact.emailRoles.donations": { en: "sponsors and donations", es: "patrocinadores y donaciones" }, "t.contact.emailRoles.contact": { en: "proposed main contact", es: "contacto principal propuesto" }, "t.contact.emailsNote": { en: "These addresses were requested by the project. The project owner still needs to create them, and they do not receive messages until that happens. Once they exist, only the final addresses, never passwords, are sent to be linked to this page.", es: "Estas direcciones fueron las solicitadas por el proyecto. El due\xF1o del proyecto todav\xEDa debe crearlas, y no reciben mensajes hasta que eso ocurra. Cuando existan, solo se env\xEDan las direcciones finales, nunca las contrase\xF1as, para vincularlas a esta p\xE1gina." }, "t.footer.text": { en: "A sensory trail for blind and visually impaired people", es: "Un sendero sensorial para personas ciegas y con baja visi\xF3n" }, "t.home.title": { en: "Inca Braille Trail \u2014 A sensory trail for blind and visually impaired people, Sacred Valley of the Incas", es: "Inca Braille Trail \u2014 Un sendero sensorial para personas ciegas y con baja visi\xF3n, Valle Sagrado de los Incas" }, "t.home.description": { en: "An educational and sensory trail being developed for blind and visually impaired people, with their families, friends and companions, in the Sacred Valley of the Incas, Cusco, Peru.", es: "Un sendero educativo y sensorial en desarrollo para personas ciegas y con baja visi\xF3n, junto con sus familias, amigos y acompa\xF1antes, en el Valle Sagrado de los Incas, Cusco, Per\xFA." }, "t.home.heroAlt": { en: "Poster of the project. A person in a knit hat and orange poncho walks with a white cane on a stone path beside a wooden fence, passing a two-story stone house where a woman and a child stand. Two people plant in a green field among chickens, and two rheas stand by a stone wall, with snow-capped mountains behind. The poster reads: INCA BRAILLE TRAIL \u2014 GUIDING YOUR STEPS THROUGH THE CYCLE OF LIFE. A sign says the project is under construction and that volunteers are urgently needed.", es: "Afiche del proyecto. Una persona con gorro de lana y poncho naranja camina con bast\xF3n blanco por un sendero de piedra junto a una cerca de madera, al lado de una casa de piedra de dos pisos donde est\xE1n una mujer y un ni\xF1o. Dos personas siembran en un campo verde entre gallinas, y dos \xF1and\xFAes est\xE1n junto a un muro de piedra, con monta\xF1as nevadas al fondo. El afiche dice: INCA BRAILLE TRAIL \u2014 GUIDING YOUR STEPS THROUGH THE CYCLE OF LIFE. Un cartel dice que el proyecto est\xE1 en construcci\xF3n y que se necesitan voluntarios con urgencia." }, "t.home.tagline": { en: "First of its kind educational and sensory journey through the cycle of life and Andean agriculture\n\nDesigned for blind and visually impaired people.\n\nSighted visitors can choose to wear a blindfold for the trail. By briefly setting sight aside, they can tune in to the sounds, textures, and scents of the farm, discovering details they might usually miss and feeling more connected to the natural world.\n", es: "Un recorrido educativo y sensorial \xFAnico a trav\xE9s del ciclo de la vida y la agricultura andina\n\nDise\xF1ado para personas ciegas y con baja visi\xF3n.\n\nLos visitantes videntes pueden elegir usar una venda en el sendero. Al dejar la vista de lado un momento, pueden sintonizar con los sonidos, texturas y aromas de la granja, descubrir detalles que suelen pasar por alto y sentirse m\xE1s conectados con el mundo natural." }, "t.home.banner": { en: "This website is a project under construction.", es: "Este sitio es un proyecto en construcci\xF3n." }, "t.home.boxes.0.title": { en: "What Is the Inca Braille Trail?", es: "\xBFQu\xE9 es el Inca Braille Trail?" }, "t.home.boxes.0.content.0.lead": { en: "A Journey Through Nature, Education and the Senses", es: "Un recorrido por la naturaleza, la educaci\xF3n y los sentidos" }, "t.home.boxes.0.content.1": { en: "Located in the beautiful Sacred Valley of the Incas, Cusco, Peru, the Inca Braille Trail is an educational and sensory experience being developed specifically for blind and visually impaired people, together with their families, friends and companions.", es: "Ubicado en el hermoso Valle Sagrado de los Incas, Cusco, Per\xFA, el Inca Braille Trail es una experiencia educativa y sensorial que se desarrolla espec\xEDficamente para personas ciegas y con baja visi\xF3n, junto con sus familias, amigos y acompa\xF1antes." }, "t.home.boxes.0.content.2": { en: "Our vision is to create a welcoming place where visitors can enjoy nature, learn, explore and share meaningful experiences, free of charge through the support of sponsors and donations.", es: "Nuestra visi\xF3n es crear un lugar acogedor donde los visitantes puedan disfrutar de la naturaleza, aprender, explorar y compartir experiencias significativas, de forma gratuita gracias al apoyo de patrocinadores y donaciones." }, "t.home.boxes.0.content.3": { en: "The trail is designed to stimulate the senses through touch, smell, sound and taste. Visitors will discover the textures of plants, the fragrances of herbs and flowers, the sounds of nature and the many wonderful experiences the natural world has to offer.", es: "El sendero est\xE1 dise\xF1ado para estimular los sentidos a trav\xE9s del tacto, el olfato, el o\xEDdo y el gusto. Los visitantes descubrir\xE1n las texturas de las plantas, las fragancias de hierbas y flores, los sonidos de la naturaleza y las muchas experiencias maravillosas que el mundo natural ofrece." }, "t.home.boxes.1.title": { en: "The Cycle of Life \u2013 Learning from Pachamama", es: "El ciclo de la vida \u2013 Aprender de la Pachamama" }, "t.home.boxes.1.content.0": { en: "At the heart of our philosophy is respect for Pachamama, Mother Earth, and the understanding that all living things are connected.", es: "En el centro de nuestra filosof\xEDa est\xE1 el respeto por la Pachamama, la Madre Tierra, y la comprensi\xF3n de que todos los seres vivos est\xE1n conectados." }, "t.home.boxes.1.content.1": { en: "Through our educational journey, The Cycle of Life, visitors will discover how the needs of plants closely reflect our own.", es: "A trav\xE9s de nuestro recorrido educativo, El ciclo de la vida, los visitantes descubrir\xE1n c\xF3mo las necesidades de las plantas reflejan de cerca las nuestras." }, "t.home.boxes.1.content.2": { en: "A tiny seed needs nourishment, water, warmth and care to grow, just as we need nutritious food, clean water, sunlight and a healthy environment to thrive.", es: "Una peque\xF1a semilla necesita alimento, agua, calor y cuidado para crecer, as\xED como nosotros necesitamos comida nutritiva, agua limpia, luz del sol y un ambiente sano para prosperar." }, "t.home.boxes.1.content.3": { en: "Plants draw nutrients from healthy soil and energy from sunlight, while we depend on the food they produce for our own energy, growth and wellbeing.", es: "Las plantas toman nutrientes de un suelo sano y energ\xEDa de la luz del sol, mientras que nosotros dependemos del alimento que producen para nuestra propia energ\xEDa, crecimiento y bienestar." }, "t.home.boxes.1.content.4.lead": { en: "Healthy soil nurtures healthy plants. Healthy plants nourish healthy people.", es: "Un suelo sano cr\xEDa plantas sanas. Las plantas sanas alimentan a personas sanas." }, "t.home.boxes.1.content.5": { en: "Animals also play an essential role in this cycle. From honeybees pollinating flowers to birds spreading seeds, and farm animals providing natural manure that enriches the soil, every creature contributes to the balance of nature.", es: "Los animales tambi\xE9n cumplen un papel esencial en este ciclo. Desde las abejas que polinizan las flores hasta las aves que dispersan semillas, y los animales de granja que aportan abono natural que enriquece el suelo, cada criatura contribuye al equilibrio de la naturaleza." }, "t.home.boxes.1.content.6": { en: "These nutrients return to the earth, helping new plants grow and completing the beautiful cycle that connects plants, animals and people.", es: "Estos nutrientes vuelven a la tierra, ayudan a crecer a nuevas plantas y completan el hermoso ciclo que une a plantas, animales y personas." }, "t.home.boxes.1.content.7": { en: "Along the journey, visitors will explore traditional Andean and ancient Inca agricultural practices alongside modern sustainable farming. We emphasize the importance of preserving native seeds, composting, protecting biodiversity and growing nutritious food without relying on harmful agricultural chemicals.", es: "A lo largo del recorrido, los visitantes explorar\xE1n las pr\xE1cticas agr\xEDcolas tradicionales andinas y las de los antiguos incas junto con la agricultura sostenible moderna. Destacamos la importancia de conservar las semillas nativas, hacer compost, proteger la biodiversidad y cultivar alimentos nutritivos sin depender de qu\xEDmicos agr\xEDcolas da\xF1inos." }, "t.home.boxes.1.content.8": { en: "Our goal is to demonstrate that caring for the earth and producing healthy food can be simple, sustainable and accessible to everyone.", es: "Nuestro objetivo es demostrar que cuidar la tierra y producir alimentos sanos puede ser simple, sostenible y accesible para todos." }, "t.home.boxes.2.title": { en: "A Place for Everyone to Connect \u2013 The Spirit of Ayni", es: "Un lugar para que todos se conecten \u2013 El esp\xEDritu del Ayni" }, "t.home.boxes.2.content.0": { en: "At the heart of the Inca Braille Trail is the ancient Andean principle of Ayni, meaning reciprocity \u2014 the belief that through giving, receiving and supporting one another, we create stronger, more compassionate communities.", es: "En el coraz\xF3n del Inca Braille Trail est\xE1 el antiguo principio andino del Ayni, que significa reciprocidad: la convicci\xF3n de que al dar, recibir y apoyarnos unos a otros creamos comunidades m\xE1s fuertes y m\xE1s compasivas." }, "t.home.boxes.2.content.1": { en: "Our trail is more than an educational experience. It is a place where blind and visually impaired people, their families, friends and companions can come together, share experiences, build friendships and celebrate life.", es: "Nuestro sendero es m\xE1s que una experiencia educativa. Es un lugar donde las personas ciegas y con baja visi\xF3n, sus familias, amigos y acompa\xF1antes pueden reunirse, compartir experiencias, hacer amistades y celebrar la vida." }, "t.home.boxes.2.content.2": { en: "We also hope to encourage sighted visitors to better understand the everyday challenges faced by people with visual impairments, developing greater awareness, empathy and respect.", es: "Tambi\xE9n esperamos animar a los visitantes videntes a comprender mejor los desaf\xEDos cotidianos que enfrentan las personas con discapacidad visual, desarrollando mayor conciencia, empat\xEDa y respeto." }, "t.home.boxes.2.content.3": { en: "Through shared experiences, we want people to recognize that everyone has something valuable to offer and that we all have something to learn from one another.", es: "A trav\xE9s de experiencias compartidas, queremos que las personas reconozcan que todos tenemos algo valioso que ofrecer y que todos tenemos algo que aprender de los dem\xE1s." }, "t.home.boxes.2.content.4": { en: "Just as we nurture the earth and the earth nurtures us, through kindness, compassion and reciprocity, we nurture one another.", es: "As\xED como nosotros cuidamos la tierra y la tierra nos cuida, con bondad, compasi\xF3n y reciprocidad nos cuidamos unos a otros." }, "t.home.boxes.2.content.5.lead": { en: "This is the spirit of Ayni, and the heart of the Inca Braille Trail.", es: "Este es el esp\xEDritu del Ayni, y el coraz\xF3n del Inca Braille Trail." }, "t.volunteer.title": { en: "Volunteers \u2014 Inca Braille Trail", es: "Voluntarios \u2014 Inca Braille Trail" }, "t.volunteer.description": { en: "Volunteers urgently needed: clearing and shaping trails, moving stones, gardening and grounds maintenance. Meals provided; accommodation for full-day volunteers.", es: "Se necesitan voluntarios con urgencia: despejar y dar forma a senderos, mover piedras, jardiner\xEDa y mantenimiento del terreno. Comidas incluidas; alojamiento para quienes trabajan jornadas completas." }, "t.volunteer.h1": { en: "Volunteers", es: "Voluntarios" }, "t.volunteer.heroLine": { en: "<b>Many hands put their heart into this project and make it possible. Meet them, and find the story of each hand that passed through.</b>", es: "Muchas manos ponen el coraz\xF3n en este proyecto y lo hacen posible. Con\xF3celas y encuentra la historia de cada mano que pas\xF3 por aqu\xED." }, "t.volunteer.heroAlt": { en: "Hands hold a bunch of tall green plants. More plants and a rocky slope surround them.", es: "Unas manos sostienen un manojo de plantas verdes altas. Alrededor hay m\xE1s plantas y un cerro." }, "t.volunteer.signNow": { en: "Sign as a volunteer", es: "Inscr\xEDbete como voluntario" }, "t.volunteer.lead": { en: "Volunteers urgently needed to open the trail to blind and visually impaired visitors.", es: "Se necesitan voluntarios con urgencia para abrir el sendero a los visitantes ciegos y con baja visi\xF3n." }, "t.volunteer.boxes.0.title": { en: "Help build the trail", es: "Ayuda a construir el sendero" }, "t.volunteer.boxes.0.content.0": { en: '<b><span class="tx-centro"><span class="tx-40">WE NEED YOUR HELP!!!</span><br>Families are welcome!<br>Help bring the Inca Braille Trail to life<br>WHY ?</span></b><br>This Inca Braille Trail is the first of its kind with NFC/QR code technology to make education and sensory activities to the blind, general visually impaired and also to allow the general public with sight to enhance their other senses more intensely through sight deprivation.<br>Our hope is that once you experience this you will feel more compassion for those less fortunate and recognise your own sensitivity to your own inner magic.<br>Funds raised will go directly toward providing a free day at the Inca Braille Trail for people who are blind or have low vision, along with their families and carers. The day includes return transport from Cusco, lunch, and a gift to take home.<br>Often the careers and family are forgotten so lets celebrate this together by helping make this a fun and   ongoing event of a lifetime for all.', es: "\xA1NECESITAMOS TU AYUDA!!!\n\xA1Las familias son bienvenidas!\nAyuda a dar vida al Inca Braille Trail\n\xBFPOR QU\xC9?\nEste Inca Braille Trail es el primero de su tipo con tecnolog\xEDa NFC/QR para ofrecer educaci\xF3n y actividades sensoriales a personas ciegas y con baja visi\xF3n, y tambi\xE9n para que el p\xFAblico con vista intensifique sus otros sentidos mediante la privaci\xF3n visual.\nNuestra esperanza es que, al vivirlo, sientas m\xE1s compasi\xF3n por quienes tienen menos oportunidades y reconozcas tu propia sensibilidad hacia tu magia interior.\nLos fondos recaudados ir\xE1n directamente a ofrecer un d\xEDa gratuito en el Inca Braille Trail a personas ciegas o con baja visi\xF3n, junto con sus familias y cuidadores. El d\xEDa incluye transporte de ida y vuelta desde Cusco, almuerzo y un regalo para llevar a casa.\nA menudo se olvida a cuidadores y familias: celebremos juntos ayudando a que esto sea un evento divertido y memorable para todos." }, "t.volunteer.boxes.0.content.1": { en: "Help needed:\n-Small stone paths\n-Basic fencing\n-Cooking\n-Social Media\n-General cleaning\n-Raking\n-planting aromatics\n", es: "Se necesita ayuda:\n-Peque\xF1os caminos de piedra\n-Cercado b\xE1sico\n-Cocina\n-Redes sociales\n-Limpieza general\n-Rastrillar\n-Plantar arom\xE1ticas" }, "t.volunteer.boxes.0.content.2.list.0": { en: "Day volunteers: Lunch provided.", es: "Voluntarios por el d\xEDa: almuerzo incluido." }, "t.volunteer.boxes.0.content.2.list.1": { en: "Volunteers staying with us and working full days: Accommodation, breakfast, lunch and dinner provided.", es: "Voluntarios que se alojan con nosotros y trabajan jornadas completas: alojamiento, desayuno, almuerzo y cena incluidos." }, "t.volunteer.boxes.0.content.2.list.2": { en: "Transport: Available from an agreed collection point.", es: "Transporte: disponible desde un punto de recogida acordado." }, "t.volunteer.boxes.0.content.3": { en: "Contact us to arrange dates and find tasks suited to your abilities.", es: "Cont\xE1ctanos para coordinar fechas y encontrar tareas adecuadas a tus capacidades." }, "t.volunteer.work.title": { en: "Check out the work of the volunteers", es: "Conozcan el trabajo de los voluntarios" }, "t.volunteer.work.lead": { en: "We are working hard to build the trails. Here are a few pictures of our work.", es: "Estamos trabajando duro para construir los senderos. Aqu\xED tienes algunas im\xE1genes de nuestro trabajo." }, "t.volunteer.work.prev": { en: "Previous", es: "Anterior" }, "t.volunteer.work.next": { en: "Next", es: "Siguiente" }, "t.volunteer.work.position": { en: "Image", es: "Imagen" }, "t.volunteer.work.close": { en: "Close", es: "Cerrar" }, "t.volunteer.work.open": { en: "Open image", es: "Abrir imagen" }, "t.volunteer.work.openVideo": { en: "Open video", es: "Abrir video" }, "t.volunteer.work.thumbs": { en: "Thumbnails", es: "Miniaturas" }, "t.volunteer.work.photo1": { en: "Three people build a stone wall on a dirt slope. A gray-bearded man kneels and holds a measuring tape. A bald man carries a long wooden log. Another person in a hat bends over the stones. A green container and mountains are behind them.", es: "Tres personas construyen un muro de piedra en una ladera de tierra. Un hombre de barba canosa est\xE1 de rodillas y sostiene una cinta de medir. Un hombre calvo carga un tronco largo. Otra persona con sombrero se inclina sobre las piedras. Detr\xE1s hay un contenedor verde y monta\xF1as." }, "t.volunteer.work.photo2": { en: "The same stone wall. The gray-bearded man holds the measuring tape. The person in the hat works on the stones. The bald man, with a red glove, pulls a long-handled tool.", es: "El mismo muro de piedra. El hombre de barba canosa sostiene la cinta de medir. La persona del sombrero trabaja en las piedras. El hombre calvo, con un guante rojo, tira de una herramienta de mango largo." }, "t.volunteer.work.photo3": { en: "Three men work beside a low stone wall. A gray-bearded man in a black shirt with an orange 23 and tall rubber boots smiles at the camera. A man in a wide hat points to the side. A bald man with red gloves bends over a rake. A green container, trees and mountains are behind them.", es: "Tres hombres trabajan junto a un muro bajo de piedra. Un hombre de barba canosa, con una camiseta negra del n\xFAmero 23 y botas de goma, sonr\xEDe a la c\xE1mara. Un hombre de sombrero ancho se\xF1ala hacia un lado. Un hombre calvo, con guantes rojos, se inclina sobre un rastrillo. Detr\xE1s hay un contenedor verde, \xE1rboles y monta\xF1as." }, "t.volunteer.work.photo4": { en: "Tools hang from a wire on a pale wall: a small cultivator, three trowels, two pairs of pliers and a handsaw. A garden fork stands on the dirt next to a blue tarp and an orange bag.", es: "Herramientas cuelgan de un alambre en una pared clara: un cultivador peque\xF1o, tres palas de mano, dos alicates y un serrucho. Un bieldo est\xE1 en la tierra, junto a una lona azul y una bolsa naranja." }, "t.volunteer.work.video": { en: "The same work in motion: measuring the ground, setting the stone wall and moving timber, with mountains behind.", es: "El mismo trabajo en movimiento: miden el suelo, arman el muro de piedra y mueven la madera, con las monta\xF1as detr\xE1s." }, "t.volunteer.media.title": { en: "Meet the volunteers", es: "Conozcan a los voluntarios" }, "t.volunteer.media.intro": { en: "The hands that build this project.", es: "Las manos que construyen este proyecto." }, "t.volunteer.media.click": { en: "Click to open", es: "Clic para abrir" }, "t.volunteer.media.matias.name": { en: "Garth Warner Founder, General Maintenance", es: "Garth Warner, fundador, mantenimiento general" }, "t.volunteer.media.matias.alt": { en: "Matias Lopez crouches beside a rhea eating from a metal bowl. He has dark hair, a beard and glasses, and wears a dark shirt and work gloves. A blue canopy, a table and trees are behind him.", es: "Matias Lopez est\xE1 en cuclillas junto a un \xF1and\xFA que come de un recipiente de metal. Tiene el pelo oscuro, barba y lentes, y lleva una camiseta oscura y guantes de trabajo. Detr\xE1s hay un toldo azul, una mesa y \xE1rboles." }, "t.volunteer.media.matias.who": { en: "55 From New Zealand, Fell in love with Peru 9 years ago and found a home where I can be of service to others.", es: "55 a\xF1os. De Nueva Zelanda. Se enamor\xF3 del Per\xFA hace 9 a\xF1os y encontr\xF3 un hogar donde puede servir a los dem\xE1s." }, "t.volunteer.media.matias.work": { en: "", es: "" }, "t.volunteer.media.matias.why": { en: "", es: "" }, "t.volunteer.media.patrick.name": { en: "Patrick De Vries Customs Agent, Electrician<br><br>", es: "Patrick De Vries, agente de aduanas, electricista" }, "t.volunteer.media.patrick.alt": { en: "Patrick De Vries smiles next to a large white dog on a stone path. He is bald, wears a grey shirt and holds a white mug with his name on it. Mountains and trees fill the background.", es: "Patrick De Vries sonr\xEDe junto a un perro blanco grande en un camino de piedra. Es calvo, lleva una camiseta gris y sostiene una taza blanca con su nombre. Al fondo hay monta\xF1as y \xE1rboles." }, "t.volunteer.media.patrick.who": { en: "Patrick De Vries is 55 and comes from the Netherlands. He is in Peru to explore the culture.", es: "Patrick De Vries tiene 55 a\xF1os y es de los Pa\xEDses Bajos. Est\xE1 en el Per\xFA para explorar la cultura." }, "t.volunteer.media.patrick.work": { en: "He works in customs and logistics, and he is a handyman: electrician, carpentry and plumbing.", es: "Trabaja en aduanas y log\xEDstica, y tambi\xE9n es manitas: electricidad, carpinter\xEDa y plomer\xEDa." }, "t.volunteer.media.patrick.why": { en: "Helping people is in his nature. He loves the idea of working on something new that benefits others.", es: "Ayudar a las personas est\xE1 en su naturaleza. Le encanta la idea de trabajar en algo nuevo y de beneficio, ayudando a otros." }, "t.volunteer.media.pamella.name": { en: "Pamella Garcia Cyber Security, Web Design", es: "Pamella Garcia, ciberseguridad, dise\xF1o web" }, "t.volunteer.media.pamella.alt": { en: "Pamella Garcia smiles in the opening of a white canvas tent. She has short dark hair, a black shirt with a colorful skull, and a necklace. White curtains and a wooden beam frame her.", es: "Pamella Garcia sonr\xEDe en la entrada de una carpa blanca de lona. Tiene el pelo corto y oscuro, una camiseta negra con una calavera de colores y un collar. La enmarcan cortinas blancas y una viga de madera." }, "t.volunteer.media.pamella.who": { en: "Pamella Garcia is 31 and comes from Brazil. She has lived in Peru for 6 years because it feels like her new home.", es: "Pamella Garcia tiene 31 a\xF1os y es de Brasil. Vive en el Per\xFA desde hace 6 a\xF1os porque siente que es su nueva casa." }, "t.volunteer.media.pamella.work": { en: "She is in charge of web design and software engineering for the project's apps.", es: "Est\xE1 a cargo del dise\xF1o web y de la ingenier\xEDa de software de las aplicaciones del proyecto." }, "t.volunteer.media.pamella.why": { en: "What she likes most about working on the project is that it is an initiative that comes from the heart, and from the wish to connect people with nature in a very beautiful way.", es: "Lo que m\xE1s le gusta de trabajar en el proyecto es que se trata de una iniciativa que nace del coraz\xF3n y de la voluntad de conectar a las personas con la naturaleza de una manera muy bonita." }, "t.volunteer.media.vegprtsmkl6.name": { en: "Nello Fraboni Musician, Plant Care", es: "Nello Fraboni, m\xFAsico, cuidado de plantas" }, "t.volunteer.media.vegprtsmkl6.alt": { en: "Nello Fraboni: smiles in a volunteer photo.", es: "Nello Fraboni sonr\xEDe en una foto de voluntario." }, "t.volunteer.media.vegprtsmkl6.who": { en: "Age 46 French American horticulturist passionate about plants, nature and sustainable agriculture.", es: "Tiene 46 a\xF1os. Horticultor franco-estadounidense, apasionado por las plantas, la naturaleza y la agricultura sostenible." }, "t.volunteer.media.vegprtsmkl6.work": { en: "", es: "" }, "t.volunteer.media.vegprtsmkl6.why": { en: "", es: "" }, "t.volunteer.media.vegprtsmkl6.p4": { en: "He has extensive experience in plant cultivation, propagation and greenhouse management.", es: "Tiene amplia experiencia en cultivo de plantas, propagaci\xF3n y manejo de invernaderos." }, "t.volunteer.media.vegprtsmkl6.p5": { en: "Currently in Peru, he is exploring permaculture and tropical growing systems.", es: "Actualmente en el Per\xFA, explora la permacultura y los sistemas de cultivo tropical." }, "t.volunteer.media.vegprtsmkl6.p6": { en: "You will experience the duality of how correct care of seeds, plants and animal life deeply relates to ourselves.", es: "Experimentar\xE1s la dualidad de c\xF3mo el cuidado correcto de semillas, plantas y vida animal se relaciona profundamente con nosotros mismos." }, "t.volunteer.media.vliklxe9amd.name": { en: "Matias Lopez: Chef, Forestry Technician", es: "Matias Lopez: chef, t\xE9cnico forestal" }, "t.volunteer.media.vliklxe9amd.alt": { en: "Matias Lopez: Chef, Forestry Technician smiles in a volunteer photo.", es: "Matias Lopez, chef y t\xE9cnico forestal, sonr\xEDe en una foto de voluntario." }, "t.volunteer.media.vliklxe9amd.who": { en: "Matias Lopez is 38 and comes from Argentina. He is in Peru to travel and to know new places. He is a Forestry Technician and a chef with a specialty in breads.<br>He volunteers because the project is beautiful and the intention behind it is heartfelt.<br><br><br>", es: "Matias Lopez tiene 38 a\xF1os y es de Argentina. Est\xE1 en el Per\xFA para viajar y conocer lugares nuevos. Es t\xE9cnico forestal y chef, con especialidad en panes. Es voluntario porque el proyecto es hermoso y la intenci\xF3n que hay detr\xE1s es sincera." }, "t.volunteer.media.vfx8wpyxmec.name": { en: "Leticia (Hampi Mama)", es: "Leticia (Hampi Mama)" }, "t.volunteer.media.vfx8wpyxmec.alt": { en: "Leticia (Hampi Mama) smiles in a volunteer photo.", es: "Leticia (Hampi Mama) sonr\xEDe en una foto de voluntario." }, "t.volunteer.media.vfx8wpyxmec.who": { en: "From Cancha Cancha. A powerful plant medicine Practitioner.<br>Based in Huaran....Hampi Mama work shopI wanted to volunteer and support this project because I wanted to share my ancestry knowledge with the world.", es: "De Cancha Cancha. Practicante de medicina de plantas. Vive en Huaran. Taller de Hampi Mama. Quise ser voluntaria y apoyar este proyecto para compartir con el mundo el conocimiento de mi ancestralidad." }, "t.volunteer.media.vmkd7xnvg30.name": { en: "Omar", es: "Omar" }, "t.volunteer.media.vmkd7xnvg30.alt": { en: "Omar smiles in a volunteer photo.", es: "Omar sonr\xEDe en una foto de voluntario." }, "t.volunteer.media.vmkd7xnvg30.who": { en: "34 Omar is from Urubamba.A  professional local Backhoe operator and Dump truck contractor.<br>An expert in his field of work and very honest guy.<br>As a volunteer to help with the project for future children to enjoy<br>", es: "34. Omar es de Urubamba. Operador profesional de retroexcavadora y contratista de volquete. Experto en su oficio y una persona muy honesta. Voluntario para ayudar con el proyecto, para que los ni\xF1os del futuro lo disfruten." }, "t.volunteer.form.heading": { en: '<span class="tx-centro"><b>Join Here!</b></span>', es: "\xA1\xDAnete aqu\xED!" }, "t.volunteer.form.lead": { en: "To sign up as a volunteer, fill in the form below.", es: "Para inscribirte como voluntario, completa el formulario de abajo." }, "t.volunteer.form.inactive": { en: "This form is not active yet. It will work after the project owner confirms the Formspree email, in an inbox the site builder has no access to. Intended destination: info@incabrailletrail.com.", es: "Este formulario todav\xEDa no est\xE1 activo. Funcionar\xE1 cuando el due\xF1o del proyecto confirme el correo de Formspree, en una bandeja a la que quien construye el sitio no tiene acceso. Destino previsto: info@incabrailletrail.com." }, "t.volunteer.form.requiredNote": { en: "All fields are required.", es: "Todos los campos son obligatorios." }, "t.volunteer.form.name": { en: "Name", es: "Nombre" }, "t.volunteer.form.email": { en: "Email address", es: "Correo electr\xF3nico" }, "t.volunteer.form.task": { en: "Task you would like to help with", es: "Tarea con la que te gustar\xEDa ayudar" }, "t.volunteer.form.taskChoose": { en: "Choose a task", es: "Elige una tarea" }, "t.volunteer.form.taskTrails": { en: "Clearing and shaping trails", es: "Despejar y dar forma a los senderos" }, "t.volunteer.form.taskStones": { en: "Moving stones", es: "Mover piedras" }, "t.volunteer.form.taskGardening": { en: "Gardening", es: "Jardiner\xEDa" }, "t.volunteer.form.taskGrounds": { en: "General grounds maintenance", es: "Mantenimiento general del terreno" }, "t.volunteer.form.message": { en: "Message", es: "Mensaje" }, "t.volunteer.form.honeypot": { en: "Leave this field empty", es: "Deja este campo vac\xEDo" }, "t.volunteer.form.submit": { en: "Send message", es: "Enviar mensaje" }, "t.volunteer.form.sending": { en: "Sending\u2026", es: "Enviando\u2026" }, "t.volunteer.form.success": { en: "Thank you. We received your message and will contact you soon.", es: "Gracias. Recibimos tu mensaje y te contactaremos pronto." }, "t.volunteer.form.summary": { en: "The form could not be sent. Please check the fields marked with an error.", es: "No se pudo enviar el formulario. Revisa los campos marcados con error." }, "t.volunteer.form.errRequired": { en: "This field is required.", es: "Este campo es obligatorio." }, "t.volunteer.form.errEmail": { en: "Enter a valid email address, for example name@example.com.", es: "Escribe un correo electr\xF3nico v\xE1lido, por ejemplo nombre@ejemplo.com." }, "t.volunteer.form.errNetwork": { en: "The message could not be sent. Check your connection and try again.", es: "No se pudo enviar el mensaje. Comprueba tu conexi\xF3n e int\xE9ntalo de nuevo." }, "t.donations.title": { en: "Donations \u2014 Inca Braille Trail", es: "Donaciones \u2014 Inca Braille Trail" }, "t.donations.description": { en: "Donations keep the trail free. The bank accounts are on this page, ready to copy.", es: "Las donaciones mantienen el sendero gratuito. Las cuentas bancarias est\xE1n en esta p\xE1gina, listas para copiar." }, "t.donations.h1": { en: "Donations", es: "Donaciones" }, "t.donations.heroLine": { en: "Every gift keeps this path free for those who walk by touch and trust.", es: "Cada donaci\xF3n mantiene este camino libre para quien camina con el tacto y la confianza." }, "t.donations.heroAlt": { en: "A smiling man in a sun hat and blue glasses crouches on the forest floor and holds dry leaves in both hands.", es: "Un hombre sonriente con sombrero de sol y gafas azules se agacha en el suelo del bosque y sostiene hojas secas con ambas manos." }, "t.donations.lead": { en: "Donations keep the trail free of charge for visitors.", es: "Las donaciones mantienen el sendero gratuito para quienes lo visitan." }, "t.donations.choice": { en: "You can publish your name and the amount, publish only your name, or give anonymously. Anonymous donations are welcome.", es: "Puedes publicar tu nombre y el monto, publicar solo tu nombre, o donar en anonimato. Las donaciones an\xF3nimas son bienvenidas." }, "t.donations.noneYet": { en: "No name is published on this site yet.", es: "Todav\xEDa no se publica ning\xFAn nombre en este sitio." }, "t.donations.form.heading": { en: "Donation details", es: "Datos de la donaci\xF3n" }, "t.donations.form.intro": { en: "The bank accounts are on this page. You can also send your details with this form.", es: "Las cuentas bancarias est\xE1n en esta p\xE1gina. Tambi\xE9n puedes enviar tus datos con este formulario." }, "t.donations.form.name": { en: "Full name", es: "Nombre completo" }, "t.donations.form.country": { en: "Country", es: "Pa\xEDs" }, "t.donations.form.date": { en: "Date the donation is sent", es: "Fecha de env\xEDo de la donaci\xF3n" }, "t.donations.form.amount": { en: "Amount you intend to donate", es: "Monto que pretendes donar" }, "t.donations.form.amountHint": { en: "Include the currency, for example 50 USD.", es: "Incluye la moneda, por ejemplo 50 USD." }, "t.donations.form.legend": { en: "What may we publish?", es: "\xBFQu\xE9 podemos publicar?" }, "t.donations.form.optBoth": { en: "Publish my name and the amount", es: "Publicar mi nombre y el monto" }, "t.donations.form.optName": { en: "Publish only my name", es: "Publicar solo mi nombre" }, "t.donations.form.optAnonymous": { en: "Anonymous donation. Publish nothing.", es: "Donaci\xF3n an\xF3nima. No publicar nada." }, "t.donations.form.honeypot": { en: "Leave this field empty", es: "Deja este campo vac\xEDo" }, "t.donations.form.submit": { en: "Send donation details", es: "Enviar los datos de la donaci\xF3n" }, "t.donations.form.sending": { en: "Sending\u2026", es: "Enviando\u2026" }, "t.donations.form.success": { en: "Thank you. We received your details.", es: "Gracias. Recibimos tus datos." }, "t.donations.form.summary": { en: "The form could not be sent. Please check the fields marked with an error.", es: "No se pudo enviar el formulario. Revisa los campos marcados con error." }, "t.donations.form.errRequired": { en: "This field is required.", es: "Este campo es obligatorio." }, "t.donations.form.errDate": { en: "Enter a real date.", es: "Escribe una fecha real." }, "t.donations.form.errNetwork": { en: "The message could not be sent. Check your connection and try again.", es: "No se pudo enviar el mensaje. Revisa tu conexi\xF3n e int\xE9ntalo de nuevo." }, "t.donations.form.emailNote": { en: "This form is not sending yet. The destination is info.incabrailletrail@gmail.com.", es: "Este formulario todav\xEDa no env\xEDa. El destino es info.incabrailletrail@gmail.com." }, "t.donations.bank.revealed": { en: "Bank accounts", es: "Cuentas bancarias" }, "t.donations.bank.hint": { en: "Click a button to copy the number to your clipboard.", es: "Haz clic en un bot\xF3n para copiar el n\xFAmero." }, "t.donations.bank.soles": { en: "Bank account in soles", es: "Cuenta bancaria en soles" }, "t.donations.bank.dolares": { en: "Bank account in dollars", es: "Cuenta bancaria en d\xF3lares" }, "t.donations.bank.bcp": { en: "BCP", es: "BCP" }, "t.donations.bank.interbank": { en: "Interbank", es: "Interbank" }, "t.donations.bank.groupSoles": { en: "Copy a soles account", es: "Copiar una cuenta en soles" }, "t.donations.bank.groupDollars": { en: "Copy a dollars account", es: "Copiar una cuenta en d\xF3lares" }, "t.donations.bank.copiedSolesBcp": { en: "Copied the BCP soles account.", es: "Se copi\xF3 la cuenta BCP en soles." }, "t.donations.bank.copiedSolesInter": { en: "Copied the Interbank soles account.", es: "Se copi\xF3 la cuenta Interbank en soles." }, "t.donations.bank.copiedDollarsBcp": { en: "Copied the BCP dollars account.", es: "Se copi\xF3 la cuenta BCP en d\xF3lares." }, "t.donations.bank.copiedDollarsInter": { en: "Copied the Interbank dollars account.", es: "Se copi\xF3 la cuenta Interbank en d\xF3lares." }, "t.donations.bank.copyFail": { en: "Could not copy. The number is on the button. Select it and copy it by hand.", es: "No se pudo copiar. El n\xFAmero est\xE1 en el bot\xF3n. Selecci\xF3nalo y c\xF3pialo a mano." }, "t.audiovideo.title": { en: "Audio and video \u2014 Inca Braille Trail", es: "Audio y video \u2014 Inca Braille Trail" }, "t.audiovideo.description": { en: "Audio and video of the Inca Braille Trail, with transcript, captions and audio description. Files still to be received.", es: "Audio y video del Inca Braille Trail, con transcripci\xF3n, subt\xEDtulos y audiodescripci\xF3n. Archivos por recibir." }, "t.audiovideo.h1": { en: "Audio and video", es: "Audio y video" }, "t.audiovideo.lead": { en: "Audio and video of the trail, with transcript, captions and audio description. The files have not been received yet.", es: "Audio y video del sendero, con transcripci\xF3n, subt\xEDtulos y audiodescripci\xF3n. Los archivos todav\xEDa no han sido recibidos." }, "t.audiovideo.boxes.0.title": { en: "Audio of the visit", es: "Audio de la visita" }, "t.audiovideo.boxes.0.content.0": { en: "The audio recording of the visit has not been received yet. It will be published here when the project owner sends it.", es: "La grabaci\xF3n de audio de la visita todav\xEDa no ha sido recibida. Se publicar\xE1 aqu\xED cuando el due\xF1o del proyecto la env\xEDe." }, "t.audiovideo.boxes.1.title": { en: "Transcript", es: "Transcripci\xF3n" }, "t.audiovideo.boxes.1.content.0": { en: "The transcript of the audio has not been received yet. It will be published here as text when the project owner sends it.", es: "La transcripci\xF3n del audio todav\xEDa no ha sido recibida. Se publicar\xE1 aqu\xED como texto cuando el due\xF1o del proyecto la env\xEDe." }, "t.audiovideo.boxes.2.title": { en: "Video", es: "Video" }, "t.audiovideo.boxes.2.content.0": { en: "The video of the trail has not been received yet. It will be published here when the project owner sends it.", es: "El video del sendero todav\xEDa no ha sido recibido. Se publicar\xE1 aqu\xED cuando el due\xF1o del proyecto lo env\xEDe." }, "t.audiovideo.boxes.3.title": { en: "Captions", es: "Subt\xEDtulos" }, "t.audiovideo.boxes.3.content.0": { en: "The captions for the video have not been received yet. They will be published with the video when the project owner sends them.", es: "Los subt\xEDtulos del video todav\xEDa no han sido recibidos. Se publicar\xE1n junto con el video cuando el due\xF1o del proyecto los env\xEDe." }, "t.audiovideo.boxes.4.title": { en: "Audio description", es: "Audiodescripci\xF3n" }, "t.audiovideo.boxes.4.content.0": { en: "The audio description of the video has not been received yet. It will be published with the video when the project owner sends it.", es: "La audiodescripci\xF3n del video todav\xEDa no ha sido recibida. Se publicar\xE1 junto con el video cuando el due\xF1o del proyecto la env\xEDe." }, "t.educational.title": { en: "Educational trail \u2014 Inca Braille Trail", es: "Sendero educativo \u2014 Inca Braille Trail" }, "t.educational.description": { en: "A walk that teaches how food grows, returns to the soil as compost, and becomes food again.", es: "Una caminata que ense\xF1a c\xF3mo crece el alimento, vuelve a la tierra como compost y se convierte otra vez en comida." }, "t.educational.h1": { en: '<b><span class="tx-32">Trail 1: </span></b><i>Educational Path</i>', es: "Sendero 1: Camino educativo" }, "t.educational.heroLine": { en: "Here you learn the whole path through the cycle of life.", es: "Aqu\xED aprendes todo el camino por el ciclo de la vida." }, "t.educational.heroAlt": { en: "Two hands hold small green fruits among leaves. One fruit rests in an open palm.", es: "Dos manos sostienen frutos verdes peque\xF1os entre hojas. Un fruto descansa en una palma abierta." }, "t.educational.moreTitle": { en: "Know more about:", es: "Conoce m\xE1s sobre:" }, "t.educational.lead": { en: '<i></i><i></i><i></i><i></i><span class="tx-esq"><i></i></span><i></i><i></i><i></i><i></i><i></i><i></i><span class="tx-esq"><i></i></span><i></i><span class="tx-esq"><i></i><span class="tx-centro"><i><span class="tx-24">Download the app: Then the experience begins....</span></i></span><span class="tx-centro"><i><span class="tx-24">Two options:</span></i><br><b>1: Visually Impaired: Audio version<br>2: Sighted: QR/NFC scan at stations..</b></span></span><br><br>All Junction points have Braille information cards.<br><b><span class="tx-centro">1. Visually Impaired: Audio version</span></b><span class="tx-esq">You will have a trained volunteer who will accompany you if you do not have a sighted guide. The guided audio will take you on a journey through 20 stations of information. There will be 4 rest points along the way. At each rest point you will have to answer 5 questions before moving to the next. A hand rail will help guide you along the path. A ball at the end of each hand rail will signify a change of hand rail from right to left or left to right. White cane detectable stone edges shall guide your direction on the path. A bell at the end of each rail will signify an easy to find seating area to answer your Q&amp;A.<br></span> <br><br><br>', es: "Descarga la app: entonces comienza la experiencia. Dos opciones:\n1: Baja visi\xF3n / ceguera: versi\xF3n de audio\n2: Con vista: escaneo QR/NFC en las estaciones.\n\nTodos los puntos de uni\xF3n tienen tarjetas de informaci\xF3n en braille.\n1. Baja visi\xF3n / ceguera: versi\xF3n de audio\nTendr\xE1s un voluntario capacitado que te acompa\xF1ar\xE1 si no traes gu\xEDa vidente. El audio guiado te lleva por 20 estaciones de informaci\xF3n. Habr\xE1 4 puntos de descanso en el camino. En cada descanso deber\xE1s responder 5 preguntas antes de seguir. Una baranda te ayuda a orientarte. Una bola al final de cada baranda indica el cambio de mano (derecha a izquierda o al rev\xE9s). Bordes de piedra detectables con bast\xF3n blanco gu\xEDan la direcci\xF3n. Una campana al final de cada baranda marca un asiento f\xE1cil de encontrar para el Q&A." }, "t.educational.p1": { en: '<span class="tx-centro"><b></b></span><span class="tx-40"><span class="tx-centro"><b>Ecology:</b></span><span class="tx-esq"><span class="tx-centro"><i>Working together...</i></span></span><span class="tx-centro"><b>Important fun Facts on route</b></span><b></b></span><i><b>Culture and History: </b></i>Identifying cultural and historical foods and practices from Inca to us. <br><b><i>Seed preparation:</i> </b>cultivation, storage and why we must protect them for future generations. <br><i><b>Soil: </b></i>Soil preparation, Composting, Microbes and care.<br><i><b>Insects: </b></i>Pollination, Beneficial species and natural pest management.<br><b>Animal Input: </b>Sources from other beneficial animals.<br><i><b>Plant Care: </b>Plant relationships, </i>Identifying disease and management.<br><i><b>Replanting:  </b></i>Cycles of harvesting, helping the ecosystems, environmental help.<br><b><i>Harvesting: </i></b>When, why and how.<br><i><b>Global Impact:</b></i> Looking at new and old data to prepare for changes.<br><i><b>Water Management: </b></i>Water testing, Identifying problems, New solutions, Cleaning and maintenance, Preserve and protect. <br>Replanting: Cycles of harvesting, environmental help.<br><i><b>Animal Care: </b></i>Understanding how animals play a big role in supporting the cycle of life, from plowing the fields to animal waste. Learning to listen and sense their behaviors.<br><i><b>Community: </b></i>Working with others, relationships, Supporting and  sharing.<br><br><br>', es: "Ecolog\xEDa: Trabajar juntos... Datos curiosos importantes en la ruta\nCultura e historia: identificar alimentos y pr\xE1cticas culturales e hist\xF3ricas desde los incas hasta nosotros.\nPreparaci\xF3n de semillas: cultivo, almacenamiento y por qu\xE9 debemos protegerlas para las generaciones futuras.\nSuelo: preparaci\xF3n del suelo, compostaje, microbios y cuidado.\nInsectos: polinizaci\xF3n, especies beneficiosas y manejo natural de plagas.\nAporte animal: fuentes de otros animales beneficiosos.\nCuidado de plantas: relaciones entre plantas, identificar enfermedades y manejo.\nReplantaci\xF3n: ciclos de cosecha, ayudar a los ecosistemas, apoyo ambiental.\nCosecha: cu\xE1ndo, por qu\xE9 y c\xF3mo.\nImpacto global: mirar datos nuevos y antiguos para prepararnos a los cambios.\nGesti\xF3n del agua: pruebas, identificar problemas, nuevas soluciones, limpieza y mantenimiento, preservar y proteger.\nReplantaci\xF3n: ciclos de cosecha, ayuda ambiental.\nCuidado animal: entender el gran papel de los animales en el ciclo de la vida, desde arar hasta el abono. Aprender a escuchar y sentir sus comportamientos.\nComunidad: trabajar con otros, relaciones, apoyar y compartir." }, "t.educational.p2": { en: "<br>", es: "" }, "t.educational.p3": { en: "Healthy soil grows healthy plants. Healthy plants feed healthy people. The educational trail is that idea, told as a path you can walk.", es: "Un suelo sano cr\xEDa plantas sanas. Las plantas sanas alimentan a personas sanas. El sendero educativo es esa idea, contada como un camino que se puede caminar." }, "t.educational.gallery.title": { en: "Would you like to know a little of what is on the trail?", es: "\xBFQuieres conocer un poco de lo que hay en el sendero?" }, "t.educational.gallery.prev": { en: "Previous", es: "Anterior" }, "t.educational.gallery.next": { en: "Next", es: "Siguiente" }, "t.educational.gallery.close": { en: "Close", es: "Cerrar" }, "t.educational.gallery.open": { en: "Open image", es: "Abrir imagen" }, "t.educational.gallery.thumbs": { en: "Thumbnails", es: "Miniaturas" }, "t.educational.gallery.photo1": { en: "A young plant with wide leaves grows in a garden bed under shade cloth, with irrigation lines on the soil.", es: "Una planta joven, de hojas anchas, crece en el cantero bajo la malla de sombra, con las mangueras de riego en la tierra." }, "t.educational.gallery.photo2": { en: "A man in a sun hat and glasses crouches and holds a large white flower cluster among feathery green plants.", es: "Un hombre con sombrero y lentes se agacha y sostiene un gran ramo blanco entre plantas de hojas finas." }, "t.educational.gallery.photo3": { en: "A hand reaches over trays of red and green seedlings. Other trays still hold only soil.", es: "Una mano se extiende sobre bandejas de plantines rojos y verdes. Otras bandejas todav\xEDa tienen solo tierra." }, "t.educational.gallery.photo4": { en: "A man in a sun hat holds a plastic bottle connected by a hose to a blue barrel, beside a work table.", es: "Un hombre con sombrero sostiene una botella de pl\xE1stico unida por una manguera a un tambor azul, junto a la mesa de trabajo." }, "t.educational.gallery.photo5": { en: "A pile of wood chips and sawdust, ready to cover the soil.", es: "Un mont\xF3n de viruta y aserr\xEDn, listo para cubrir el suelo." }, "t.educational.gallery.photo6": { en: "A man in a sun hat holds a handful of dark compost beside a perforated pipe in a mulched bed.", es: "Un hombre con sombrero sostiene un pu\xF1ado de compost oscuro junto a un tubo perforado, en un cantero cubierto de paja." }, "t.educational.gallery.photo7": { en: "Two turkeys stand side by side against a green mesh fence.", es: "Dos pavos, uno al lado del otro, contra una malla verde." }, "t.educational.gallery.photo8": { en: "Dry stems and plant waste piled together, the start of compost.", es: "Tallos secos y restos de planta amontonados, el comienzo del compost." }, "t.educational.gallery.photo9": { en: "Yellow flowers lean over a small pond of reddish water, with rocks behind.", es: "Flores amarillas se inclinan sobre un peque\xF1o estanque de agua rojiza, con piedras detr\xE1s." }, "t.educational.gallery.photo10": { en: "A man crouches on the grass between two alpacas, one brown and one white, holding their ropes.", es: "Un hombre se agacha en el pasto entre dos alpacas, una marr\xF3n y una blanca, sosteniendo las cuerdas." }, "t.educational.gallery.photo11": { en: "Open hands hold small green fruits still on the leafy branch.", es: "Manos abiertas sostienen frutos verdes peque\xF1os, todav\xEDa en la rama con hojas." }, "t.educational.gallery.photo12": { en: "Young corn plants grow in rows on rocky ground, with mountains behind.", es: "Plantas j\xF3venes de ma\xEDz crecen en hileras sobre un terreno pedregoso, con las monta\xF1as detr\xE1s." }, "t.educational.gallery.photo13": { en: "A tall cactus rises among round barrel cacti on rocky ground.", es: "Un cactus alto se alza entre cactus redondos, en suelo de piedra." }, "t.educational.gallery.photo14": { en: "Rows of potato plants grow in dark soil, with rocks and a hillside behind.", es: "Hileras de papa crecen en la tierra oscura, con piedras y la ladera detr\xE1s." }, "t.educational.gallery.photo15": { en: "A dry-stone wall of rounded rocks, with trees and mountains under a blue sky.", es: "Un muro de piedra seca, de rocas redondeadas, con \xE1rboles y monta\xF1as bajo el cielo azul." }, "t.educational.gallery.photo16": { en: "A cluster of bright pink flowers, close up, with green leaves behind.", es: "Un ramo de flores rosa intenso, de cerca, con hojas verdes detr\xE1s." }, "t.educational.gallery.photo17": { en: "A wall of pale cut stone blocks fitted together.", es: "Un muro de bloques de piedra clara, encajados unos con otros." }, "t.sensory.title": { en: "Sensory trail \u2014 Inca Braille Trail", es: "Sendero sensorial \u2014 Inca Braille Trail" }, "t.sensory.description": { en: "A walk of touch, scent, sound and the ground underfoot, for blind and visually impaired visitors and the people beside them.", es: "Una caminata de tacto, aroma, sonido y suelo, para personas ciegas o con baja visi\xF3n y para quienes las acompa\xF1an." }, "t.sensory.h1": { en: '<span class="tx-20"><span class="tx-centro"><span class="tx-32">Trail 2: </span></span></span><span class="tx-centro"><i><span class="tx-48">Aromatic and Medicinal Path</span></i></span><br>', es: "Sendero 2: Camino arom\xE1tico y medicinal" }, "t.sensory.heroLine": { en: "On this path you learn to identify and use the plants. All downloaded as you go to use in the future.", es: "En este camino aprendes a identificar y usar las plantas. Todo se descarga mientras avanzas para usarlo en el futuro." }, "t.sensory.heroAlt": { en: "A bearded man leans close to leafy green plants, seen from the side. Only the lower edge of his glasses shows at the top.", es: "Un hombre con barba se acerca a unas plantas verdes, visto de lado. Arriba solo se ve el borde de los lentes." }, "t.sensory.moreTitle": { en: "Know more about:", es: "Conoce m\xE1s sobre:" }, "t.sensory.lead": { en: "Download the app: Then the experience begins.Feel or see the Braille Map layout from beginning to end<br>Two options:<br>1: Visually Impaired: Audio version<br>2: SIghted: QR/NFC scan at stations..<br>All Junction points have Braille information cards.<br>Visually Impaired: Audio version<br><br>On this sensory path you will experience the many wonders and aromas the Apus (Mountain Spirits) and Pachamama (Mother Earth) nourish us with. There will also be QR/NFC markers provided with detailed information about individual plants, traditional, medicinal, culinary and personal care uses and how to prepare them.All this information you will be able to take away with you so you can refer to it at any time.<br>The main reason is that I personally have visited many information trails and wasn&#39;t able to retain the information or i wrote things down and  lost the information over time, but now you can refer to it when ever needed.<br>Enjoy :)<br><br><br><br><br><br>", es: "Descarga la app: entonces comienza la experiencia. Siente o ve el mapa braille de principio a fin.\nDos opciones:\n1: Baja visi\xF3n / ceguera: versi\xF3n de audio\n2: Con vista: escaneo QR/NFC en las estaciones.\nTodos los puntos de uni\xF3n tienen tarjetas de informaci\xF3n en braille.\nBaja visi\xF3n / ceguera: versi\xF3n de audio\n\nEn este camino sensorial vivir\xE1s las maravillas y aromas con los que los Apus (esp\xEDritus de la monta\xF1a) y la Pachamama (Madre Tierra) nos nutren. Tambi\xE9n habr\xE1 marcadores QR/NFC con informaci\xF3n detallada sobre cada planta: usos tradicionales, medicinales, culinarios y de cuidado personal, y c\xF3mo prepararlas. Podr\xE1s llevarte toda esa informaci\xF3n para consultarla cuando quieras.\nLa raz\xF3n principal es que yo mismo visit\xE9 muchos senderos informativos y no reten\xEDa lo aprendido, o anotaba y luego perd\xEDa las notas; ahora puedes consultarlo cuando lo necesites.\n\xA1Disfruta! :)" }, "t.sensory.p1": { en: "On the sensory trail, people are invited to walk slowly and meet this place with the body. A rope handrail leads the way. Stone, wood, leaves and flowers are there to be touched. Herbs and damp earth offer scent. Water, birds and wind offer sound.", es: "En el sendero sensorial, las personas est\xE1n invitadas a caminar despacio y encontrar este lugar con el cuerpo. Un pasamanos de cuerda marca el camino. Hay piedra, madera, hojas y flores para tocar. Las hierbas y la tierra h\xFAmeda ofrecen aroma. El agua, los p\xE1jaros y el viento ofrecen sonido." }, "t.sensory.p2": { en: "The ground changes under the feet, from stone to soil, so each step says where you are. Nothing on this walk depends on sight.", es: "El suelo cambia bajo los pies, de piedra a tierra, y cada paso dice d\xF3nde est\xE1s. Nada en esta caminata depende de la vista." }, "t.sensory.p3": { en: "<br>", es: "" }, "t.sensory.gallery.title": { en: "Would you like to know a little of what is on the trail?", es: "\xBFQuieres conocer un poco de lo que hay en el sendero?" }, "t.sensory.gallery.prev": { en: "Previous", es: "Anterior" }, "t.sensory.gallery.next": { en: "Next", es: "Siguiente" }, "t.sensory.gallery.close": { en: "Close", es: "Cerrar" }, "t.sensory.gallery.open": { en: "Open image", es: "Abrir imagen" }, "t.sensory.gallery.thumbs": { en: "Thumbnails", es: "Miniaturas" }, "t.sensory.gallery.photo1": { en: "A hand rests on the soil among young green seedlings and an irrigation line.", es: "Una mano descansa en la tierra, entre plantines verdes y la manguera de riego." }, "t.sensory.gallery.photo2": { en: "A man in a sun hat and glasses tastes a green leaf, close to the camera.", es: "Un hombre con sombrero y lentes prueba una hoja verde, muy cerca de la c\xE1mara." }, "t.sensory.gallery.photo3": { en: "A hand holds a stem of small green tomatoes, some still in flower.", es: "Una mano sostiene un ramo de tomates verdes peque\xF1os, algunos todav\xEDa en flor." }, "t.sensory.gallery.photo4": { en: "A man with glasses leans in to smell a dense bed of green leaves.", es: "Un hombre con lentes se acerca para oler un cantero lleno de hojas verdes." }, "t.sensory.gallery.photo5": { en: "A hand holds dark compost full of earthworms.", es: "Una mano sostiene compost oscuro, lleno de lombrices." }, "t.sensory.gallery.photo6": { en: "A man in a sun hat crouches among the flowers and holds a small pale blossom. An orange flower fills the foreground.", es: "Un hombre con sombrero se agacha entre las flores y sostiene una flor peque\xF1a y clara. Una flor naranja ocupa el frente." }, "t.sensory.gallery.photo7": { en: "Round green water plants float on reddish water.", es: "Plantas verdes y redondas flotan en el agua rojiza." }, "t.sensory.gallery.photo8": { en: "A man sits at the base of a tree and holds a handful of dry leaves.", es: "Un hombre se sienta al pie de un \xE1rbol y sostiene un pu\xF1ado de hojas secas." }, "t.sensory.gallery.photo9": { en: "A man holds two brown hens, one on each arm, with trees behind him.", es: "Un hombre sostiene dos gallinas marrones, una en cada brazo, con \xE1rboles detr\xE1s." }, "t.sensory.gallery.photo10": { en: "A hand touches clear water running over dark rocks.", es: "Una mano toca el agua clara que corre sobre piedras oscuras." }, "t.sensory.gallery.photo11": { en: "A smiling man in a sun hat hugs a tall leafy plant, with mountains behind him.", es: "Un hombre con sombrero sonr\xEDe y abraza una planta alta y frondosa, con las monta\xF1as detr\xE1s." }, "t.sensory.gallery.photo12": { en: "A hand touches the leaves of a plant with red stems, in a bed of green crops.", es: "Una mano toca las hojas de una planta de tallos rojos, en un cantero verde." }, "t.sensory.gallery.photo13": { en: "A thick cushion of moss grows against a rock, with small succulent leaves above.", es: "Un coj\xEDn espeso de musgo crece junto a la piedra, con hojas suculentas arriba." }, "t.sensory.gallery.photo14": { en: "Moss and small plants grow between the stones of a wall.", es: "Musgo y plantas peque\xF1as crecen entre las piedras de un muro." }, "t.sponsors.title": { en: "Sponsors \u2014 Inca Braille Trail", es: "Patrocinadores \u2014 Inca Braille Trail" }, "t.sponsors.description": { en: "A brand or organization can walk with this project. With your agreement, your logo appears at the bottom of the pages.", es: "Una marca u organizaci\xF3n puede caminar con este proyecto. Con tu acuerdo, el logo aparece al final de las p\xE1ginas." }, "t.sponsors.h1": { en: "Affiliates Partners", es: "Socios afiliados" }, "t.sponsors.heroLine": { en: "Get involved with this beautiful project by sending your support.", es: "S\xFAmate a este lindo proyecto enviando tu apoyo." }, "t.sponsors.heroAlt": { en: "Green water-hyacinth fruits and round leaves float together on brown water.", es: "Frutos verdes de camalote y hojas redondas flotan juntos en el agua marr\xF3n." }, "t.sponsors.lead": { en: "If you have a brand and want to stand with this trail, write to us.", es: "Si tienes una marca y quieres acompa\xF1ar este sendero, escr\xEDbenos." }, "t.sponsors.p1": { en: "A partner can contribute in the way that fits: with materials for the path, with work, with ideas, or by sponsoring the project.", es: "Un socio puede contribuir como le quede mejor: con materiales para el camino, con trabajo, con ideas o patrocinando el proyecto." }, "t.sponsors.p2": { en: "If you have a brand or an organization and want to be our partner on this path, write to us and we will answer.", es: "Si tienes una marca o una organizaci\xF3n y quieres ser nuestro socio en este camino, escr\xEDbenos y te responderemos." }, "t.sponsors.p3": { en: "With your agreement, your logo appears at the bottom of the pages, among the affiliate partners.", es: "Con tu acuerdo, tu logo aparece al final de las p\xE1ginas, entre los socios afiliados." }, "t.sponsors.boxTitle": { en: "Be our partner", es: "S\xE9 nuestro socio" }, "t.sponsors.boxNote": { en: "The form will be placed here.", es: "El formulario quedar\xE1 en este espacio." }, "t.sponsors.footerTitle": { en: "Affiliates partners:", es: "Socios afiliados:" }, "t.sponsors.logosLabel": { en: "Spaces for partner logos", es: "Espacios para logos de socios" }, "t.sponsors.logoPending": { en: "Space for a logo", es: "Espacio para un logo" }, "t.app.title": { en: "Inka Braille Trail App \u2014 Inca Braille Trail", es: "Inka Braille Trail App \u2014 Inca Braille Trail" }, "t.app.description": { en: "The Inka Braille Trail App guides blind and visually impaired visitors through the tour and tells the story of each station.", es: "Inka Braille Trail App gu\xEDa a las personas ciegas y con baja visi\xF3n por el recorrido y cuenta la historia de cada estaci\xF3n." }, "t.app.h1": { en: "Inka Braille Trail App", es: "Inka Braille Trail App" }, "t.app.lead": { en: "This app brings the trail to blind and visually impaired people.", es: "Esta aplicaci\xF3n abre el sendero a las personas ciegas y con baja visi\xF3n." }, "t.app.p1": { en: "It guides the visitor through the tour. At each station it tells the story of that place, so the walk can be followed by listening.", es: "Gu\xEDa a la visita por el recorrido. En cada estaci\xF3n cuenta la historia de ese lugar, para que el camino se pueda seguir escuchando." }, "t.app.p2": { en: "The path stays within reach of someone who cannot see it. Each stop has a voice, and the story of the station shows the way.", es: "El sendero queda al alcance de quien no puede verlo. Cada parada tiene una voz, y la historia de la estaci\xF3n marca el camino." }, "t.app.p3": { en: "Pictures of the app will be placed in the spaces below.", es: "Las im\xE1genes de la aplicaci\xF3n ir\xE1n en los espacios de abajo." }, "t.app.slotsLabel": { en: "Spaces for pictures of the app", es: "Espacios para im\xE1genes de la aplicaci\xF3n" }, "t.app.slot": { en: "Space for a picture", es: "Espacio para una imagen" }, "t.sitemap.title": { en: "Site Map \u2014 Inca Braille Trail", es: "Mapa del sitio \u2014 Inca Braille Trail" }, "t.sitemap.description": { en: "Site map of the Inca Braille Trail.", es: "Mapa del sitio del Inca Braille Trail." }, "t.sitemap.h1": { en: "Site Map", es: "Mapa del sitio" }, "alt.img.logo": { en: "Inca Braille Trail", es: "Inca Braille Trail" }, "contato.telefone": { en: "+51 914 015 544", es: "+51 914 015 544" }, "contas.soles.bcp": { en: "2857096163099", es: "2857096163099" }, "contas.soles.interbancaria": { en: "00228500709616309956", es: "00228500709616309956" }, "contas.dolares.bcp": { en: "2857096168159", es: "2857096168159" }, "contas.dolares.interbancaria": { en: "00228500709616815953", es: "00228500709616815953" }, "contato.email.info": { en: "info@incabrailletrail.org", es: "info@incabrailletrail.org" }, "contato.email.bookings": { en: "bookings@incabrailletrail.com", es: "bookings@incabrailletrail.com" }, "contato.email.volunteers": { en: "volunteers@incabrailletrail.com", es: "volunteers@incabrailletrail.com" }, "contato.email.donations": { en: "donations@incabrailletrail.com", es: "donations@incabrailletrail.com" }, "contato.email.contact": { en: "contact@incabrailletrail.com", es: "contact@incabrailletrail.com" } }, imagens: [{ chave: "img.logo", src: "/img/logo-inca-braille-trail.png", webp: "", altChave: "alt.img.logo", largura: 192, altura: 188 }, { chave: "img.home.cartaz", src: "/img/cartaz-inca-braille-trail.jpg", webp: "/img/cartaz-inca-braille-trail.webp", altChave: "t.home.heroAlt", largura: 1856, altura: 576 }, { chave: "img.sitemap.mapa", src: "/img/mapa-do-sitio.jpg", webp: "", altChave: "t.sitemap.h1", largura: 5600, altura: 3732 }, { chave: "img.educational.cabeca", src: "/img/cabeca-educativa.jpg", webp: "/img/cabeca-educativa.webp", altChave: "t.educational.heroAlt", largura: 1920, altura: 590 }, { chave: "img.sensory.cabeca", src: "/img/cabeca-sensorial.jpg", webp: "/img/cabeca-sensorial.webp", altChave: "t.sensory.heroAlt", largura: 1920, altura: 590 }, { chave: "img.volunteer.cabeca", src: "/img/voluntario-cabeca.jpg", webp: "/img/voluntario-cabeca.webp", altChave: "t.volunteer.heroAlt", largura: 1920, altura: 1440 }, { chave: "img.volunteer.matias", src: "/img/voluntario-matias-lopez.jpg", webp: "/img/voluntario-matias-lopez.webp", altChave: "t.volunteer.media.matias.alt", largura: 768, altura: 1024 }, { chave: "img.volunteer.patrick", src: "/img/voluntario-patrick-de-vries.jpg", webp: "/img/voluntario-patrick-de-vries.webp", altChave: "t.volunteer.media.patrick.alt", largura: 768, altura: 1024 }, { chave: "img.volunteer.pamella", src: "/img/voluntario-pamella-garcia.jpg", webp: "/img/voluntario-pamella-garcia.webp", altChave: "t.volunteer.media.pamella.alt", largura: 954, altura: 1024 }, { chave: "img.volunteer.vegprtsmkl6", src: "/img/voluntario-nello-fraboni.jpg", webp: "/img/voluntario-nello-fraboni.webp", altChave: "t.volunteer.media.vegprtsmkl6.alt", largura: 706, altura: 941 }, { chave: "img.sponsors.cabeca", src: "/img/cabeca-afiliados.jpg", webp: "/img/cabeca-afiliados.webp", altChave: "t.sponsors.heroAlt", largura: 1920, altura: 590 }, { chave: "img.donations.cabeca", src: "/img/cabeca-doacao.jpg", webp: "/img/cabeca-doacao.webp", altChave: "t.donations.heroAlt", largura: 1920, altura: 590 }], galerias: [{ chave: "galeria.visor-educativa", abrir: "t.educational.gallery.open", itens: [{ id: "visor-educativa-1", tipo: "imagem", src: "/img/educativa-01.jpg", webp: "/img/educativa-01.webp", poster: "", legenda: "t.educational.gallery.photo1", largura: 960, altura: 1280 }, { id: "visor-educativa-2", tipo: "imagem", src: "/img/educativa-02.jpg", webp: "/img/educativa-02.webp", poster: "", legenda: "t.educational.gallery.photo2", largura: 960, altura: 1280 }, { id: "visor-educativa-3", tipo: "imagem", src: "/img/educativa-03.jpg", webp: "/img/educativa-03.webp", poster: "", legenda: "t.educational.gallery.photo3", largura: 960, altura: 1280 }, { id: "visor-educativa-4", tipo: "imagem", src: "/img/educativa-04.jpg", webp: "/img/educativa-04.webp", poster: "", legenda: "t.educational.gallery.photo4", largura: 960, altura: 1280 }, { id: "visor-educativa-5", tipo: "imagem", src: "/img/educativa-05.jpg", webp: "/img/educativa-05.webp", poster: "", legenda: "t.educational.gallery.photo5", largura: 960, altura: 1280 }, { id: "visor-educativa-6", tipo: "imagem", src: "/img/educativa-06.jpg", webp: "/img/educativa-06.webp", poster: "", legenda: "t.educational.gallery.photo6", largura: 1280, altura: 960 }, { id: "visor-educativa-7", tipo: "imagem", src: "/img/educativa-07.jpg", webp: "/img/educativa-07.webp", poster: "", legenda: "t.educational.gallery.photo7", largura: 1280, altura: 960 }, { id: "visor-educativa-8", tipo: "imagem", src: "/img/educativa-08.jpg", webp: "/img/educativa-08.webp", poster: "", legenda: "t.educational.gallery.photo8", largura: 960, altura: 1280 }, { id: "visor-educativa-9", tipo: "imagem", src: "/img/educativa-09.jpg", webp: "/img/educativa-09.webp", poster: "", legenda: "t.educational.gallery.photo9", largura: 960, altura: 1280 }, { id: "visor-educativa-10", tipo: "imagem", src: "/img/educativa-10.jpg", webp: "/img/educativa-10.webp", poster: "", legenda: "t.educational.gallery.photo10", largura: 1280, altura: 960 }, { id: "visor-educativa-11", tipo: "imagem", src: "/img/educativa-11.jpg", webp: "/img/educativa-11.webp", poster: "", legenda: "t.educational.gallery.photo11", largura: 1280, altura: 960 }, { id: "visor-educativa-12", tipo: "imagem", src: "/img/educativa-12.jpg", webp: "/img/educativa-12.webp", poster: "", legenda: "t.educational.gallery.photo12", largura: 960, altura: 1280 }, { id: "visor-educativa-13", tipo: "imagem", src: "/img/educativa-13.jpg", webp: "/img/educativa-13.webp", poster: "", legenda: "t.educational.gallery.photo13", largura: 960, altura: 1280 }, { id: "visor-educativa-14", tipo: "imagem", src: "/img/educativa-14.jpg", webp: "/img/educativa-14.webp", poster: "", legenda: "t.educational.gallery.photo14", largura: 960, altura: 1280 }, { id: "visor-educativa-15", tipo: "imagem", src: "/img/educativa-15.jpg", webp: "/img/educativa-15.webp", poster: "", legenda: "t.educational.gallery.photo15", largura: 960, altura: 1280 }, { id: "visor-educativa-16", tipo: "imagem", src: "/img/educativa-16.jpg", webp: "/img/educativa-16.webp", poster: "", legenda: "t.educational.gallery.photo16", largura: 960, altura: 1280 }, { id: "visor-educativa-17", tipo: "imagem", src: "/img/educativa-17.jpg", webp: "/img/educativa-17.webp", poster: "", legenda: "t.educational.gallery.photo17", largura: 960, altura: 1280 }] }, { chave: "galeria.visor-sensorial", abrir: "t.sensory.gallery.open", itens: [{ id: "visor-sensorial-1", tipo: "imagem", src: "/img/sensorial-01.jpg", webp: "/img/sensorial-01.webp", poster: "", legenda: "t.sensory.gallery.photo1", largura: 960, altura: 1280 }, { id: "visor-sensorial-2", tipo: "imagem", src: "/img/sensorial-02.jpg", webp: "/img/sensorial-02.webp", poster: "", legenda: "t.sensory.gallery.photo2", largura: 960, altura: 1280 }, { id: "visor-sensorial-3", tipo: "imagem", src: "/img/sensorial-03.jpg", webp: "/img/sensorial-03.webp", poster: "", legenda: "t.sensory.gallery.photo3", largura: 960, altura: 1280 }, { id: "visor-sensorial-4", tipo: "imagem", src: "/img/sensorial-04.jpg", webp: "/img/sensorial-04.webp", poster: "", legenda: "t.sensory.gallery.photo4", largura: 960, altura: 1280 }, { id: "visor-sensorial-5", tipo: "imagem", src: "/img/sensorial-05.jpg", webp: "/img/sensorial-05.webp", poster: "", legenda: "t.sensory.gallery.photo5", largura: 960, altura: 1280 }, { id: "visor-sensorial-6", tipo: "imagem", src: "/img/sensorial-06.jpg", webp: "/img/sensorial-06.webp", poster: "", legenda: "t.sensory.gallery.photo6", largura: 1280, altura: 960 }, { id: "visor-sensorial-7", tipo: "imagem", src: "/img/sensorial-07.jpg", webp: "/img/sensorial-07.webp", poster: "", legenda: "t.sensory.gallery.photo7", largura: 960, altura: 1280 }, { id: "visor-sensorial-8", tipo: "imagem", src: "/img/sensorial-08.jpg", webp: "/img/sensorial-08.webp", poster: "", legenda: "t.sensory.gallery.photo8", largura: 960, altura: 1280 }, { id: "visor-sensorial-9", tipo: "imagem", src: "/img/sensorial-09.jpg", webp: "/img/sensorial-09.webp", poster: "", legenda: "t.sensory.gallery.photo9", largura: 960, altura: 1280 }, { id: "visor-sensorial-10", tipo: "imagem", src: "/img/sensorial-10.jpg", webp: "/img/sensorial-10.webp", poster: "", legenda: "t.sensory.gallery.photo10", largura: 960, altura: 1280 }, { id: "visor-sensorial-11", tipo: "imagem", src: "/img/sensorial-11.jpg", webp: "/img/sensorial-11.webp", poster: "", legenda: "t.sensory.gallery.photo11", largura: 960, altura: 1280 }, { id: "visor-sensorial-12", tipo: "imagem", src: "/img/sensorial-12.jpg", webp: "/img/sensorial-12.webp", poster: "", legenda: "t.sensory.gallery.photo12", largura: 960, altura: 1280 }, { id: "visor-sensorial-13", tipo: "imagem", src: "/img/sensorial-13.jpg", webp: "/img/sensorial-13.webp", poster: "", legenda: "t.sensory.gallery.photo13", largura: 960, altura: 1280 }, { id: "visor-sensorial-14", tipo: "imagem", src: "/img/sensorial-14.jpg", webp: "/img/sensorial-14.webp", poster: "", legenda: "t.sensory.gallery.photo14", largura: 960, altura: 1280 }] }, { chave: "galeria.visor-trabalho", abrir: "t.volunteer.work.open", itens: [{ id: "visor-trabalho-1", tipo: "imagem", src: "/img/trabalho-muro-1.jpg", webp: "/img/trabalho-muro-1.webp", poster: "", legenda: "t.volunteer.work.photo1", largura: 1024, altura: 768 }, { id: "visor-trabalho-2", tipo: "imagem", src: "/img/trabalho-muro-2.jpg", webp: "/img/trabalho-muro-2.webp", poster: "", legenda: "t.volunteer.work.photo2", largura: 1024, altura: 768 }, { id: "visor-trabalho-3", tipo: "imagem", src: "/img/trabalho-equipe.jpg", webp: "/img/trabalho-equipe.webp", poster: "", legenda: "t.volunteer.work.photo3", largura: 1280, altura: 960 }, { id: "visor-trabalho-4", tipo: "imagem", src: "/img/trabalho-ferramentas.jpg", webp: "/img/trabalho-ferramentas.webp", poster: "", legenda: "t.volunteer.work.photo4", largura: 960, altura: 1280 }, { id: "visor-trabalho-5", tipo: "video", src: "/video/trabalho-trilha.mp4", webp: "", poster: "", legenda: "t.volunteer.work.video", largura: 480, altura: 864 }] }] };

// ../painel/nuvem.mjs
var SITE_NAME = "Inca Braille Trail";
var SESSAO_MS = 4 * 60 * 60 * 1e3;
var LIMITE_IMAGEM = 8 * 1024 * 1024;
var LIMITE_VIDEO = 20 * 1024 * 1024;
var PEDACO = 500 * 1024;
var MSG2 = {
  curto: "The password needs at least 12 characters.",
  distinta: "The two passwords do not match.",
  correo: "Check the email. It does not look valid.",
  grande: "The file is too large.",
  formato: "That file will not work. For photos use JPG, PNG, WebP, or SVG.",
  video: "The video is too large or the format will not work. Use MP4 or WebM up to 20 MB.",
  guardar: "We could not save. Try again.",
  sessao: "Your session ended. Sign in again.",
  csrf: "This page is out of date. Reload and try again.",
  bloqueio: "Too many attempts. Wait a few minutes.",
  credencial: "The email or the password is not correct.",
  cheio: "There is no room for more files. Delete some photos or videos and try again."
};
var TETO_BYTES = 9 * 1024 * 1024 * 1024;
var falso = null;
async function hashFalso() {
  if (!falso) falso = await hashSenhaNuvem("painel-enchimento-nao-e-senha");
  return falso;
}
__name(hashFalso, "hashFalso");
function banco(env2) {
  const d1 = env2.DB;
  const ligar = /* @__PURE__ */ __name((sql, args) => args.length ? d1.prepare(sql).bind(...args) : d1.prepare(sql), "ligar");
  return {
    async get(sql, ...args) {
      return await ligar(sql, args).first() ?? null;
    },
    async all(sql, ...args) {
      const r = await ligar(sql, args).all();
      return r.results || [];
    },
    async run(sql, ...args) {
      const r = await ligar(sql, args).run();
      return { changes: r.meta?.changes ?? 0 };
    },
    async batch(itens) {
      if (!itens.length) return;
      const lote = 40;
      for (let i = 0; i < itens.length; i += lote) {
        const fatia = itens.slice(i, i + lote);
        await d1.batch(fatia.map(([sql, args]) => ligar(sql, args || [])));
      }
    }
  };
}
__name(banco, "banco");
function cookiesDe(request) {
  const saida = {};
  for (const parte of (request.headers.get("cookie") || "").split(";")) {
    const i = parte.indexOf("=");
    if (i > 0) saida[parte.slice(0, i).trim()] = decodeURIComponent(parte.slice(i + 1).trim());
  }
  return saida;
}
__name(cookiesDe, "cookiesDe");
function cookie(nome, valor, maxAge, httpOnly = true) {
  const partes = [`${nome}=${encodeURIComponent(valor)}`, "Path=/", "SameSite=Strict", "Secure"];
  if (httpOnly) partes.push("HttpOnly");
  if (maxAge != null) partes.push(`Max-Age=${maxAge}`);
  return partes.join("; ");
}
__name(cookie, "cookie");
function cabecas(extra) {
  const h = new Headers(extra || {});
  h.set("content-security-policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self'; connect-src 'self' https://formspree.io https://formsubmit.co; form-action 'self' https://formspree.io https://formsubmit.co; frame-src https://docs.google.com; base-uri 'self'; object-src 'none'; frame-ancestors 'none'");
  h.set("x-content-type-options", "nosniff");
  h.set("x-frame-options", "DENY");
  h.set("referrer-policy", "strict-origin-when-cross-origin");
  h.set("x-robots-tag", "noindex, nofollow");
  h.set("cache-control", "no-store");
  return h;
}
__name(cabecas, "cabecas");
function html(status, corpo, cookies = []) {
  const h = cabecas({ "content-type": "text/html; charset=utf-8" });
  for (const c of cookies) h.append("set-cookie", c);
  return new Response(corpo, { status, headers: h });
}
__name(html, "html");
function json2(status, obj, cookies = []) {
  const h = cabecas({ "content-type": "application/json; charset=utf-8" });
  for (const c of cookies) h.append("set-cookie", c);
  return new Response(JSON.stringify(obj), { status, headers: h });
}
__name(json2, "json");
function ir(destino, cookies) {
  const h = cabecas({ location: destino });
  for (const c of cookies) h.append("set-cookie", c);
  return new Response(null, { status: 303, headers: h });
}
__name(ir, "ir");
function texto(status, corpo) {
  return new Response(corpo, { status, headers: cabecas({ "content-type": "text/plain; charset=utf-8" }) });
}
__name(texto, "texto");
async function sha256(valor, segredo) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${segredo}\0${valor}`));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(sha256, "sha256");
function aleatorio() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
__name(aleatorio, "aleatorio");
async function senhaOk(dono, email, senha) {
  const hash = dono ? dono.senha_hash : await hashFalso();
  const ok = await senhaConfereHash(String(senha ?? ""), hash);
  if (!dono || !ok) return false;
  const a = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(dono.email));
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email));
  const ua = new Uint8Array(a);
  const ub = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < ua.length; i++) diff |= ua[i] ^ ub[i];
  return diff === 0;
}
__name(senhaOk, "senhaOk");
async function criarSessao(db, segredo) {
  const token = aleatorio();
  const csrf = aleatorio();
  const agora = Date.now();
  await db.run(`DELETE FROM sessao WHERE tipo = 'plena'`);
  await db.run("INSERT INTO sessao (token_hash, tipo, csrf, expira, criada) VALUES (?, ?, ?, ?, ?)", await sha256(token, segredo), "plena", csrf, agora + SESSAO_MS, agora);
  return { token, csrf };
}
__name(criarSessao, "criarSessao");
async function lerSessao(db, token, segredo) {
  if (!token || !segredo) return null;
  const row = await db.get("SELECT * FROM sessao WHERE token_hash = ? AND tipo = ?", await sha256(token, segredo), "plena");
  if (!row || row.expira < Date.now()) return null;
  return row;
}
__name(lerSessao, "lerSessao");
async function auditar(db, acao, ip, detalhe) {
  await db.run("INSERT INTO auditoria (quando, acao, ip, detalhe) VALUES (?, ?, ?, ?)", Date.now(), acao, String(ip || ""), String(detalhe || "").slice(0, 300));
}
__name(auditar, "auditar");
async function bloqueado(db, chave) {
  const row = await db.get("SELECT bloqueado_ate FROM limite WHERE chave = ?", chave);
  return !!(row && row.bloqueado_ate > Date.now());
}
__name(bloqueado, "bloqueado");
async function falha(db, chave) {
  const agora = Date.now();
  const janela = 15 * 60 * 1e3;
  const row = await db.get("SELECT * FROM limite WHERE chave = ?", chave);
  if (!row || agora - row.janela > janela) {
    await db.run(`INSERT INTO limite (chave, falhas, janela, bloqueado_ate) VALUES (?, 1, ?, 0)
      ON CONFLICT(chave) DO UPDATE SET falhas = 1, janela = excluded.janela, bloqueado_ate = 0`, chave, agora);
    return false;
  }
  const n = row.falhas + 1;
  const ate = n >= 5 ? agora + janela : 0;
  await db.run("UPDATE limite SET falhas = ?, bloqueado_ate = ? WHERE chave = ?", n, ate, chave);
  return ate > agora;
}
__name(falha, "falha");
async function zerar(db, chave) {
  await db.run("DELETE FROM limite WHERE chave = ?", chave);
}
__name(zerar, "zerar");
async function temDono(db) {
  return !!await db.get("SELECT id FROM dono WHERE id = 1");
}
__name(temDono, "temDono");
async function lerDono(db) {
  return db.get("SELECT id, email, senha_hash FROM dono WHERE id = 1");
}
__name(lerDono, "lerDono");
async function criarDono(db, email, senhaHash) {
  const r = await db.run(`INSERT INTO dono (id, email, senha_hash, criado)
    SELECT 1, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM dono WHERE id = 1)`, email, senhaHash, Date.now());
  return r.changes === 1;
}
__name(criarDono, "criarDono");
async function semear(env2) {
  const dbx = banco(env2);
  const marca = `${Object.keys(painel_semente_default.textos || {}).length}:${(painel_semente_default.imagens || []).length}:${(painel_semente_default.galerias || []).length}`;
  const ja = await dbx.get(`SELECT valor FROM meta WHERE chave = 'semeada'`);
  const gravada = await dbx.get(`SELECT valor FROM meta WHERE chave = 'semente_marca'`);
  if (ja && gravada?.valor === marca) return;
  const itens = [];
  for (const im of painel_semente_default.imagens || []) {
    itens.push(["INSERT OR IGNORE INTO imagem (chave, src, webp, alt_chave, largura, altura) VALUES (?, ?, ?, ?, ?, ?)", [im.chave, im.src, im.webp || "", im.altChave || "", im.largura || 0, im.altura || 0]]);
  }
  for (const [chave, porIdioma] of Object.entries(painel_semente_default.textos || {})) {
    for (const [idioma, valor] of Object.entries(porIdioma)) {
      itens.push(["INSERT OR IGNORE INTO texto (chave, idioma, valor, pendente) VALUES (?, ?, ?, 0)", [chave, idioma, String(valor)]]);
    }
  }
  if (ja) {
    if (itens.length) await dbx.batch(itens);
    await dbx.run(`INSERT INTO meta (chave, valor) VALUES ('semente_marca', ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`, marca);
    return;
  }
  const idiomas2 = painel_semente_default.idiomas.join(",");
  itens.push([`INSERT INTO meta (chave, valor) VALUES ('idiomas', ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`, [idiomas2]]);
  for (const g2 of painel_semente_default.galerias || []) {
    itens.push(["INSERT OR IGNORE INTO galeria (chave, abrir_chave) VALUES (?, ?)", [g2.chave, g2.abrir || ""]]);
    g2.itens.forEach((it, i) => {
      itens.push([`INSERT OR IGNORE INTO galeria_item (id, galeria, ordem, tipo, src, webp, poster, legenda_chave, largura, altura) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [it.id, g2.chave, i + 1, it.tipo, it.src, it.webp || "", it.poster || "", it.legenda, it.largura || 0, it.altura || 0]]);
    });
  }
  itens.push([`INSERT INTO meta (chave, valor) VALUES ('semeada', '1') ON CONFLICT(chave) DO NOTHING`, []]);
  itens.push([`INSERT INTO meta (chave, valor) VALUES ('semente_marca', ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`, [marca]]);
  await dbx.batch(itens);
}
__name(semear, "semear");
async function listaVoluntarios(dbx) {
  const row = await dbx.get(`SELECT valor FROM meta WHERE chave = 'voluntarios'`);
  if (row?.valor) {
    try {
      const lista = JSON.parse(row.valor);
      if (Array.isArray(lista) && lista.length) return lista.filter((id) => /^[a-z][a-z0-9-]{0,40}$/.test(id));
    } catch {
    }
  }
  const imgs = await dbx.all(`SELECT chave FROM imagem WHERE chave LIKE 'img.volunteer.%' AND chave != 'img.volunteer.cabeca'`);
  const ids = imgs.map((r) => String(r.chave).replace(/^img\.volunteer\./, "")).filter((id) => /^[a-z][a-z0-9-]{0,40}$/.test(id));
  const ordem = ["matias", "patrick", "pamella"];
  ids.sort((a, b) => {
    const ia = ordem.indexOf(a);
    const ib = ordem.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  if (ids.length) {
    await dbx.run(`INSERT INTO meta (chave, valor) VALUES ('voluntarios', ?)
      ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`, JSON.stringify(ids));
  }
  return ids;
}
__name(listaVoluntarios, "listaVoluntarios");
async function listaAfiliados(dbx) {
  const row = await dbx.get(`SELECT valor FROM meta WHERE chave = 'afiliados'`);
  if (!row?.valor) return [];
  try {
    const lista = JSON.parse(row.valor);
    if (!Array.isArray(lista)) return [];
    return lista.filter((item) => item && typeof item.src === "string" && typeof item.url === "string").slice(0, 24);
  } catch {
    return [];
  }
}
__name(listaAfiliados, "listaAfiliados");
async function estado(dbx, idioma) {
  const textos = {};
  for (const row of await dbx.all("SELECT chave, valor FROM texto WHERE idioma = ?", idioma)) textos[row.chave] = row.valor;
  const imagens = {};
  for (const row of await dbx.all("SELECT * FROM imagem")) imagens[row.chave] = row;
  const galerias = [];
  for (const g2 of await dbx.all("SELECT * FROM galeria")) {
    galerias.push({ ...g2, itens: await dbx.all("SELECT * FROM galeria_item WHERE galeria = ? ORDER BY ordem, id", g2.chave) });
  }
  return { textos, imagens, galerias, voluntarios: await listaVoluntarios(dbx), afiliados: await listaAfiliados(dbx) };
}
__name(estado, "estado");
async function fotografar(dbx) {
  return {
    textos: await dbx.all("SELECT chave, idioma, valor, pendente FROM texto"),
    imagens: await dbx.all("SELECT chave, src, webp, alt_chave, largura, altura FROM imagem"),
    galerias: await dbx.all("SELECT chave, abrir_chave FROM galeria"),
    itens: await dbx.all("SELECT id, galeria, ordem, tipo, src, webp, poster, legenda_chave, largura, altura FROM galeria_item"),
    meta: await dbx.all(`SELECT chave, valor FROM meta WHERE chave IN ('voluntarios', 'afiliados', 'bytes_midia')`)
  };
}
__name(fotografar, "fotografar");
async function antes(dbx, acao) {
  const snap = JSON.stringify(await fotografar(dbx));
  await dbx.run("INSERT INTO versao (quando, acao, snapshot) VALUES (?, ?, ?)", Date.now(), acao, snap);
  await dbx.run("DELETE FROM versao WHERE id NOT IN (SELECT id FROM versao ORDER BY id DESC LIMIT 30)");
}
__name(antes, "antes");
async function restaurar(dbx, snap) {
  const itens = [
    ["DELETE FROM texto", []],
    ["DELETE FROM imagem", []],
    ["DELETE FROM galeria_item", []],
    ["DELETE FROM galeria", []]
  ];
  for (const t of snap.textos) itens.push(["INSERT INTO texto (chave, idioma, valor, pendente) VALUES (?, ?, ?, ?)", [t.chave, t.idioma, t.valor, t.pendente || 0]]);
  for (const im of snap.imagens) itens.push(["INSERT INTO imagem (chave, src, webp, alt_chave, largura, altura) VALUES (?, ?, ?, ?, ?, ?)", [im.chave, im.src, im.webp || "", im.alt_chave || "", im.largura || 0, im.altura || 0]]);
  for (const g2 of snap.galerias) itens.push(["INSERT INTO galeria (chave, abrir_chave) VALUES (?, ?)", [g2.chave, g2.abrir_chave || ""]]);
  for (const it of snap.itens) itens.push([`INSERT INTO galeria_item (id, galeria, ordem, tipo, src, webp, poster, legenda_chave, largura, altura) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [it.id, it.galeria, it.ordem, it.tipo, it.src, it.webp || "", it.poster || "", it.legenda_chave, it.largura || 0, it.altura || 0]]);
  for (const m of snap.meta || []) {
    itens.push([`INSERT INTO meta (chave, valor) VALUES (?, ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`, [m.chave, m.valor]]);
  }
  await dbx.batch(itens);
}
__name(restaurar, "restaurar");
async function bytesUsados(dbx) {
  const row = await dbx.get(`SELECT valor FROM meta WHERE chave = 'bytes_midia'`);
  const n = Number(row?.valor || 0);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}
__name(bytesUsados, "bytesUsados");
async function somarBytes(dbx, delta) {
  const atual = await bytesUsados(dbx);
  const proximo = Math.max(0, atual + delta);
  await dbx.run(`INSERT INTO meta (chave, valor) VALUES ('bytes_midia', ?)
    ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`, String(proximo));
}
__name(somarBytes, "somarBytes");
async function guardarMidia(env2, dbx, ext, buffer, tipo) {
  if (!env2.MIDIA) return { erro: "guardar" };
  if (await bytesUsados(dbx) + buffer.length > TETO_BYTES) return { erro: "cheio" };
  const nome = nomeAleatorio(ext);
  try {
    await env2.MIDIA.put(nome, buffer, { httpMetadata: { contentType: tipo } });
  } catch {
    return { erro: "guardar" };
  }
  await somarBytes(dbx, buffer.length);
  return { src: `/midia/${nome}` };
}
__name(guardarMidia, "guardarMidia");
async function apagarMidia(dbx, env2, src) {
  if (!src || !src.startsWith("/midia/")) return;
  const nome = src.slice("/midia/".length);
  if (!/^[\da-f]{32}\.[a-z0-9]+$/.test(nome)) return;
  const usoA = await dbx.get("SELECT COUNT(*) AS n FROM galeria_item WHERE src = ? OR webp = ? OR poster = ?", src, src, src);
  const usoB = await dbx.get("SELECT COUNT(*) AS n FROM imagem WHERE src = ? OR webp = ?", src, src);
  if ((usoA?.n || 0) + (usoB?.n || 0) > 0) return;
  let tamanho = 0;
  if (env2.MIDIA) {
    const obj = await env2.MIDIA.head(nome);
    tamanho = obj?.size || 0;
    await env2.MIDIA.delete(nome);
  }
  if (tamanho) await somarBytes(dbx, -tamanho);
  await dbx.run("DELETE FROM midia WHERE nome = ?", nome);
}
__name(apagarMidia, "apagarMidia");
async function gravarTextos(dbx, chave, pares) {
  await dbx.batch(pares.map((p) => [`INSERT INTO texto (chave, idioma, valor, pendente) VALUES (?, ?, ?, ?)
    ON CONFLICT(chave, idioma) DO UPDATE SET valor = excluded.valor, pendente = excluded.pendente`, [chave, p.idioma, p.valor, p.pendente ? 1 : 0]]));
}
__name(gravarTextos, "gravarTextos");
async function idiomas(dbx) {
  const row = await dbx.get(`SELECT valor FROM meta WHERE chave = 'idiomas'`);
  return row ? row.valor.split(",").filter(Boolean) : ["en", "es"];
}
__name(idiomas, "idiomas");
var LOTE_PENDENTE = 6;
async function repetirPendentes(dbx, env2) {
  const fila = await dbx.all("SELECT chave, idioma FROM texto WHERE pendente = 1 LIMIT ?", LOTE_PENDENTE);
  let feitos = 0;
  for (const row of fila) {
    const todos = await dbx.all("SELECT idioma, valor, pendente FROM texto WHERE chave = ?", row.chave);
    const fonte = todos.find((item) => !item.pendente && item.valor);
    if (!fonte) continue;
    const mapa = await traduzirTodos(fonte.valor, fonte.idioma, [row.idioma], env2);
    const info3 = mapa[row.idioma];
    if (!info3 || info3.pendente) continue;
    await gravarTextos(dbx, row.chave, [{ idioma: row.idioma, valor: info3.valor, pendente: 0 }]);
    feitos += 1;
  }
  return feitos;
}
__name(repetirPendentes, "repetirPendentes");
async function chaveExiste(dbx, chave) {
  return !!await dbx.get("SELECT 1 AS n FROM texto WHERE chave = ? LIMIT 1", chave);
}
__name(chaveExiste, "chaveExiste");
async function paresTraducao(env2, valor, idiomaPagina) {
  const lista = await idiomas(banco(env2));
  const fonte = detectarIdioma(valor, idiomaPagina || "en");
  const mapa = await traduzirTodos(valor, lista.includes(fonte) ? fonte : idiomaPagina || "en", lista, env2);
  return Object.entries(mapa).map(([idioma, info3]) => ({ idioma, valor: info3.valor, pendente: info3.pendente }));
}
__name(paresTraducao, "paresTraducao");
async function exigir(dbx, request, env2) {
  const cookies = cookiesDe(request);
  const sessao = await lerSessao(dbx, cookies.painel_sessao, env2.SESSION_SECRET);
  if (!sessao) return { erro: json2(401, { erro: "sessao", mensagem: MSG2.sessao }) };
  if (request.method !== "GET" && request.method !== "HEAD") {
    const header = request.headers.get("x-csrf") || "";
    if (!segredoIgual(header, sessao.csrf) || !segredoIgual(cookies.painel_csrf || "", sessao.csrf)) {
      return { erro: json2(403, { erro: "csrf", mensagem: MSG2.csrf }) };
    }
  }
  return { sessao, cookies };
}
__name(exigir, "exigir");
async function corpoBytes(request, max) {
  const buf = Buffer.from(await request.arrayBuffer());
  if (buf.length > max) {
    const erro = new Error("grande");
    erro.codigo = "grande";
    throw erro;
  }
  return buf;
}
__name(corpoBytes, "corpoBytes");
async function atender(context2) {
  const { request, env: env2 } = context2;
  const url = new URL(request.url);
  const caminho2 = url.pathname;
  try {
    if (caminho2.startsWith("/midia/")) return await servirMidia(env2, caminho2);
    if (caminho2 === "/interno/worker-bundle.js") return texto(404, "Not found");
    if (caminho2.startsWith("/interno/") || caminho2.startsWith("/panel")) {
      if (!env2.DB || !env2.SESSION_SECRET || !env2.SETUP_TOKEN) return texto(500, "The panel is not configured");
      const dbx = banco(env2);
      await semear(env2);
      return await painel(context2, dbx, url);
    }
    return context2.next();
  } catch (erro) {
    if (erro.codigo === "grande") return json2(413, { erro: "grande", mensagem: MSG2.grande });
    return json2(500, { erro: "guardar", mensagem: MSG2.guardar });
  }
}
__name(atender, "atender");
async function servirMidia(env2, caminho2) {
  const nome = caminho2.slice("/midia/".length);
  if (!/^[\da-f]{32}\.[a-z0-9]+$/.test(nome) || !env2.MIDIA) return texto(404, "Not found");
  const obj = await env2.MIDIA.get(nome);
  if (!obj) return texto(404, "Not found");
  const tipo = obj.httpMetadata?.contentType || "application/octet-stream";
  const headers = cabecas({ "content-type": tipo, "cache-control": "public, max-age=86400" });
  if (nome.endsWith(".svg")) headers.set("content-security-policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox");
  return new Response(obj.body, { status: 200, headers });
}
__name(servirMidia, "servirMidia");
async function painel(context2, dbx, url) {
  const { request, env: env2 } = context2;
  const caminho2 = url.pathname;
  const metodo = request.method;
  const ip = request.headers.get("cf-connecting-ip") || "";
  const cookies = cookiesDe(request);
  if (caminho2 === "/panel/acesso.css" || caminho2 === "/interno/acesso.css") {
    const asset = await context2.env.ASSETS.fetch(new Request(new URL("/interno/acesso.css", request.url)));
    return asset;
  }
  if (caminho2 === "/panel/editor.js" || caminho2 === "/panel/editor.css" || caminho2 === "/panel/ver.js") {
    const sessao = await lerSessao(dbx, cookies.painel_sessao, env2.SESSION_SECRET);
    if (!sessao) return texto(404, "Not found");
    const nome = caminho2.endsWith(".css") ? "editor.css" : caminho2.endsWith("ver.js") ? "ver.js" : "editor.js";
    if (nome === "editor.js") {
      try {
        await repetirPendentes(dbx, env2);
      } catch {
      }
    }
    const asset = await env2.ASSETS.fetch(new Request(new URL(`/interno/${nome}`, request.url)));
    const headers = new Headers(asset.headers);
    headers.set("cache-control", "no-store");
    return new Response(asset.body, { status: asset.status, headers });
  }
  if (caminho2 === "/panel/login") return login(request, dbx, env2, ip, cookies);
  if (caminho2 === "/panel/logout" && metodo === "POST") return sair(request, dbx, env2, ip, cookies);
  if (caminho2.startsWith("/panel/setup/")) return registro(request, dbx, env2, ip, caminho2);
  if (caminho2.startsWith("/panel/api/")) return api(request, dbx, env2, url, ip);
  return texto(404, "Not found");
}
__name(painel, "painel");
async function login(request, dbx, env2, ip, cookies) {
  if (request.method === "GET") {
    const csrf2 = aleatorio();
    return html(200, paginaLogin(csrf2, ""), [cookie("painel_csrf", csrf2, 1800)]);
  }
  const form = Object.fromEntries(new URLSearchParams(await request.text()));
  if (!segredoIgual(form.csrf || "", cookies.painel_csrf || "")) {
    const csrf2 = aleatorio();
    return html(403, paginaLogin(csrf2, ""), [cookie("painel_csrf", csrf2, 1800)]);
  }
  const email = emailValido(form.email);
  const trava = await bloqueado(dbx, `ip:${ip}`) || email && await bloqueado(dbx, `email:${email}`);
  const dono = await lerDono(dbx);
  const ok = !trava && !!email && await senhaOk(dono, email, form.senha);
  if (ok) {
    await zerar(dbx, `ip:${ip}`);
    await zerar(dbx, `email:${email}`);
    const sessao = await criarSessao(dbx, env2.SESSION_SECRET);
    await auditar(dbx, "login", ip, "sesi\xF3n abierta");
    try {
      await repetirPendentes(dbx, env2);
    } catch {
    }
    return ir("/", [
      cookie("painel_sessao", sessao.token, SESSAO_MS / 1e3),
      cookie("painel_csrf", sessao.csrf, SESSAO_MS / 1e3, false)
    ]);
  }
  if (email) await falha(dbx, `email:${email}`);
  await falha(dbx, `ip:${ip}`);
  await auditar(dbx, "login-falha", ip, "credencial rechazada");
  const csrf = aleatorio();
  return html(401, paginaLogin(csrf, trava ? MSG2.bloqueio : MSG2.credencial), [cookie("painel_csrf", csrf, 1800)]);
}
__name(login, "login");
async function sair(request, dbx, env2, ip, cookies) {
  const sessao = await lerSessao(dbx, cookies.painel_sessao, env2.SESSION_SECRET);
  if (!sessao || !segredoIgual(request.headers.get("x-csrf") || "", sessao.csrf)) return json2(401, { erro: "sessao", mensagem: MSG2.sessao });
  await dbx.run("DELETE FROM sessao WHERE token_hash = ?", await sha256(cookies.painel_sessao, env2.SESSION_SECRET));
  await auditar(dbx, "logout", ip, "sesi\xF3n cerrada");
  return ir("/panel/login", [cookie("painel_sessao", "", 0), cookie("painel_csrf", "", 0)]);
}
__name(sair, "sair");
async function registro(request, dbx, env2, ip, caminho2) {
  const token = decodeURIComponent(caminho2.slice("/panel/setup/".length).replace(/\/$/, ""));
  if (!segredoIgual(token, env2.SETUP_TOKEN) || await temDono(dbx)) return texto(404, "Not found");
  if (request.method === "GET") {
    const csrf = aleatorio();
    return html(200, paginaRegistro(csrf, ""), [cookie("painel_csrf", csrf, 1800)]);
  }
  const form = Object.fromEntries(new URLSearchParams(await request.text()));
  const cookies = cookiesDe(request);
  if (!segredoIgual(form.csrf || "", cookies.painel_csrf || "")) return texto(403, "Not allowed");
  const email = emailValido(form.email);
  if (!email) return html(400, paginaRegistro(form.csrf, MSG2.correo));
  if (String(form.senha || "").length < 12) return html(400, paginaRegistro(form.csrf, MSG2.curto));
  if (form.senha !== form.senha2) return html(400, paginaRegistro(form.csrf, MSG2.distinta));
  const criou = await criarDono(dbx, email, await hashSenhaNuvem(form.senha));
  if (!criou) return texto(404, "Not found");
  await auditar(dbx, "registro", ip, "due\xF1o creado");
  return ir("/panel/login", [cookie("painel_csrf", "", 0)]);
}
__name(registro, "registro");
async function replica(request, dbx, env2) {
  const caminho2 = new URL(request.url).searchParams.get("caminho") || "/";
  if (!caminho2.startsWith("/") || caminho2.includes("..") || caminho2.startsWith("//")) return texto(404, "Not found");
  if (caminho2.startsWith("/panel") || caminho2.startsWith("/interno") || caminho2.startsWith("/midia")) return texto(404, "Not found");
  const idioma = caminho2 === "/es" || caminho2.startsWith("/es/") ? "es" : "en";
  const assetUrl = new URL(caminho2, request.url);
  assetUrl.search = "";
  const asset = await env2.ASSETS.fetch(new Request(assetUrl.toString(), { method: "GET" }));
  const tipo = asset.headers.get("content-type") || "";
  if (!asset.ok || !tipo.includes("html")) return texto(404, "Not found");
  const html2 = aplicarConteudo(await asset.text(), await estado(dbx, idioma));
  return new Response(html2, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }
  });
}
__name(replica, "replica");
async function api(request, dbx, env2, url, ip) {
  const porta = await exigir(dbx, request, env2);
  if (porta.erro) return porta.erro;
  const rota = url.pathname;
  if (rota.startsWith("/panel/api/publicar/")) return publicar(request, dbx, env2, rota, ip, { lerEstado: estado, auditar });
  if (rota === "/panel/api/replica" && request.method === "GET") return replica(request, dbx, env2);
  if (request.method === "POST") {
    try {
      await repetirPendentes(dbx, env2);
    } catch {
    }
  }
  if (rota === "/panel/api/texto" && request.method === "GET") {
    const chave = url.searchParams.get("chave") || "";
    if (!chaveValida(chave) || !await chaveExiste(dbx, chave)) return json2(404, { erro: "guardar", mensagem: MSG2.guardar });
    const mapa = {};
    for (const row of await dbx.all("SELECT idioma, valor, pendente FROM texto WHERE chave = ?", chave)) mapa[row.idioma] = { valor: row.valor, pendente: row.pendente };
    return json2(200, { chave, idiomas: mapa });
  }
  if (rota === "/panel/api/texto" && request.method === "POST") {
    const corpo = await request.json();
    const plano = textoRico(corpo.valor);
    if (!chaveValida(corpo.chave) || !await chaveExiste(dbx, corpo.chave) || plano.erro) return json2(400, { erro: "guardar", mensagem: MSG2.guardar });
    const limpo = aplicarPadraoTexto(corpo.chave, plano.valor);
    await antes(dbx, `texto:${corpo.chave}`);
    const visivel = textoVisivel(limpo);
    const pares = manterFormato(await paresTraducao(env2, visivel, corpo.idiomaPagina), visivel, limpo, corpo.idiomaPagina).map((p) => ({ ...p, valor: aplicarPadraoTexto(corpo.chave, p.valor) }));
    await gravarTextos(dbx, corpo.chave, pares);
    const tituloChave = chaveTituloDaNav(corpo.chave);
    if (tituloChave && await chaveExiste(dbx, tituloChave)) {
      await gravarTextos(dbx, tituloChave, pares.map((p) => ({
        idioma: p.idioma,
        valor: tituloAPartirDaNav(textoVisivel(p.valor), SITE_NAME),
        pendente: p.pendente
      })));
    }
    await auditar(dbx, "texto", ip, corpo.chave);
    const pendente = pares.some((p) => p.pendente);
    return json2(200, { ok: true, pendente, mensagem: pendente ? "Saved. The translation is still pending." : "Saved." });
  }
  if (rota === "/panel/api/correcao" && request.method === "POST") {
    const corpo = await request.json();
    const plano = textoPlano(corpo.valor);
    const lista = await idiomas(dbx);
    if (!chaveValida(corpo.chave) || !lista.includes(corpo.idioma) || !await chaveExiste(dbx, corpo.chave) || plano.erro) return json2(400, { erro: "guardar", mensagem: MSG2.guardar });
    await antes(dbx, `correcao:${corpo.chave}`);
    await gravarTextos(dbx, corpo.chave, [{ idioma: corpo.idioma, valor: plano.valor, pendente: 0 }]);
    await auditar(dbx, "correcao", ip, `${corpo.chave}:${corpo.idioma}`);
    return json2(200, { ok: true, mensagem: "Translation saved." });
  }
  if (rota === "/panel/api/imagem" && request.method === "POST") {
    const chave = request.headers.get("x-chave") || "";
    const imagem = chaveValida(chave) ? await dbx.get("SELECT * FROM imagem WHERE chave = ?", chave) : null;
    if (!imagem) return json2(404, { erro: "guardar", mensagem: MSG2.guardar });
    const buffer = await corpoBytes(request, LIMITE_IMAGEM);
    const pronto = await processarImagemNuvem(buffer, LIMITE_IMAGEM);
    if (pronto.erro) return json2(400, { erro: pronto.erro, mensagem: pronto.erro === "grande" ? MSG2.grande : MSG2.formato });
    const guardado = await guardarMidia(env2, dbx, pronto.ext, pronto.buffer, pronto.tipo);
    if (guardado.erro) return json2(400, { erro: guardado.erro, mensagem: guardado.erro === "cheio" ? MSG2.cheio : MSG2.guardar });
    const src = guardado.src;
    await antes(dbx, `imagem:${chave}`);
    const anterior = imagem.src;
    await dbx.run("UPDATE imagem SET src = ?, webp = ?, largura = ?, altura = ? WHERE chave = ?", src, "", pronto.largura || 0, pronto.altura || 0, chave);
    await apagarMidia(dbx, env2, anterior);
    const alt = request.headers.get("x-alt") ? decodeURIComponent(request.headers.get("x-alt")) : "";
    if (alt && imagem.alt_chave && await chaveExiste(dbx, imagem.alt_chave)) {
      const plano = textoPlano(alt);
      if (!plano.erro) await gravarTextos(dbx, imagem.alt_chave, await paresTraducao(env2, plano.valor, request.headers.get("x-idioma") || "en"));
    }
    await auditar(dbx, "imagem", ip, chave);
    return json2(200, { ok: true, mensagem: "Imagen guardada." });
  }
  if (rota === "/panel/api/afiliado" && request.method === "POST") {
    const url2 = decodeURIComponent(request.headers.get("x-url") || "").trim();
    if (!/^https:\/\/[^\s<>"']+$/i.test(url2) || url2.length > 300) return json2(400, { erro: "guardar", mensagem: "Use a full https link." });
    const buffer = await corpoBytes(request, LIMITE_IMAGEM);
    const pronto = await processarImagemNuvem(buffer, LIMITE_IMAGEM);
    if (pronto.erro) return json2(400, { erro: pronto.erro, mensagem: pronto.erro === "grande" ? MSG2.grande : MSG2.formato });
    const guardado = await guardarMidia(env2, dbx, pronto.ext, pronto.buffer, pronto.tipo);
    if (guardado.erro) return json2(400, { erro: guardado.erro, mensagem: guardado.erro === "cheio" ? MSG2.cheio : MSG2.guardar });
    const lista = await listaAfiliados(dbx);
    if (lista.length >= 24) return json2(400, { erro: "cheio", mensagem: MSG2.cheio });
    await antes(dbx, "afiliados");
    lista.push({ id: `a${aleatorio().slice(0, 8).toLowerCase().replace(/[^a-z0-9]/g, "x")}`, src: guardado.src, url: url2 });
    await dbx.run(`INSERT INTO meta (chave, valor) VALUES ('afiliados', ?)
      ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`, JSON.stringify(lista));
    await auditar(dbx, "afiliado", ip, guardado.src);
    return json2(200, { ok: true, mensagem: "Partner added." });
  }
  if (rota === "/panel/api/voluntario" && request.method === "POST") {
    const nomePlano = textoPlano(decodeURIComponent(request.headers.get("x-nome") || ""), 120);
    const bio = textoRico(decodeURIComponent(request.headers.get("x-bio") || ""));
    const idiomaPagina = request.headers.get("x-idioma") || "en";
    if (nomePlano.erro || !nomePlano.valor.trim() || bio.erro) return json2(400, { erro: "guardar", mensagem: MSG2.guardar });
    const buffer = await corpoBytes(request, LIMITE_IMAGEM);
    const pronto = await processarImagemNuvem(buffer, LIMITE_IMAGEM);
    if (pronto.erro) return json2(400, { erro: pronto.erro, mensagem: pronto.erro === "grande" ? MSG2.grande : MSG2.formato });
    const guardado = await guardarMidia(env2, dbx, pronto.ext, pronto.buffer, pronto.tipo);
    if (guardado.erro) return json2(400, { erro: guardado.erro, mensagem: guardado.erro === "cheio" ? MSG2.cheio : MSG2.guardar });
    const id = `v${aleatorio().slice(0, 10).toLowerCase().replace(/[^a-z0-9]/g, "x")}`;
    const chaveImg = `img.volunteer.${id}`;
    const base = `t.volunteer.media.${id}`;
    await antes(dbx, `voluntario:${id}`);
    const lista = await listaVoluntarios(dbx);
    lista.push(id);
    await dbx.run(`INSERT INTO meta (chave, valor) VALUES ('voluntarios', ?)
      ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor`, JSON.stringify(lista));
    await dbx.run(
      "INSERT INTO imagem (chave, src, webp, alt_chave, largura, altura) VALUES (?, ?, ?, ?, ?, ?)",
      chaveImg,
      guardado.src,
      "",
      `${base}.alt`,
      pronto.largura || 0,
      pronto.altura || 0
    );
    const alt = `${nomePlano.valor.trim()} smiles in a volunteer photo.`;
    await gravarTextos(dbx, `${base}.name`, await paresTraducao(env2, nomePlano.valor.trim(), idiomaPagina));
    await gravarTextos(dbx, `${base}.alt`, await paresTraducao(env2, alt, idiomaPagina));
    const visivel = textoVisivel(bio.valor);
    await gravarTextos(dbx, `${base}.who`, manterFormato(await paresTraducao(env2, visivel, idiomaPagina), visivel, bio.valor, idiomaPagina));
    const vazio = (await idiomas(dbx)).map((idioma) => ({ idioma, valor: "", pendente: 0 }));
    await gravarTextos(dbx, `${base}.work`, vazio);
    await gravarTextos(dbx, `${base}.why`, vazio);
    await auditar(dbx, "voluntario", ip, id);
    return json2(200, { ok: true, id, mensagem: "Volunteer added." });
  }
  if (rota === "/panel/api/voluntario/paragrafo" && request.method === "POST") {
    const corpo = await request.json().catch(() => null);
    const id = String(corpo?.id || "");
    if (!/^[a-zA-Z0-9]+$/.test(id)) return json2(400, { erro: "guardar", mensagem: MSG2.guardar });
    const lista = await listaVoluntarios(dbx);
    if (!lista.includes(id)) return json2(404, { erro: "guardar", mensagem: MSG2.guardar });
    const base = `t.volunteer.media.${id}.p`;
    const rows = await dbx.all("SELECT chave FROM texto WHERE chave LIKE ?", `${base}%`);
    let n = 4;
    for (const row of rows) {
      const achado = String(row.chave).match(/\.p(\d+)$/);
      if (achado) n = Math.max(n, Number(achado[1]) + 1);
    }
    const chave = `${base}${n}`;
    const vazio = (await idiomas(dbx)).map((idioma) => ({ idioma, valor: "", pendente: 0 }));
    await gravarTextos(dbx, chave, vazio);
    await auditar(dbx, "voluntario-paragrafo", ip, chave);
    return json2(200, { ok: true, chave, mensagem: "Paragraph added." });
  }
  if (rota === "/panel/api/galeria/excluir" && request.method === "POST") {
    const corpo = await request.json();
    if (!chaveValida(corpo.galeria) || !chaveValida(corpo.id)) return json2(400, { erro: "guardar", mensagem: MSG2.guardar });
    const item = await dbx.get("SELECT * FROM galeria_item WHERE id = ? AND galeria = ?", corpo.id, corpo.galeria);
    if (!item) return json2(404, { erro: "guardar", mensagem: MSG2.guardar });
    await antes(dbx, `excluir:${corpo.id}`);
    await dbx.run("DELETE FROM galeria_item WHERE id = ?", corpo.id);
    const restantes = await dbx.all("SELECT id FROM galeria_item WHERE galeria = ? ORDER BY ordem, id", corpo.galeria);
    await dbx.batch(restantes.map((row, i) => ["UPDATE galeria_item SET ordem = ? WHERE id = ?", [i + 1, row.id]]));
    for (const src of [item.src, item.webp, item.poster]) await apagarMidia(dbx, env2, src);
    await auditar(dbx, "galeria-excluir", ip, corpo.id);
    return json2(200, { ok: true, mensagem: "Item removed. You can undo." });
  }
  if (rota === "/panel/api/galeria/arquivo" && request.method === "POST") {
    const galeria = request.headers.get("x-galeria") || "";
    const depois = request.headers.get("x-depois") || "";
    if (!chaveValida(galeria) || !await dbx.get("SELECT 1 AS n FROM galeria WHERE chave = ?", galeria)) return json2(400, { erro: "guardar", mensagem: MSG2.guardar });
    const buffer = await corpoBytes(request, LIMITE_IMAGEM);
    const pronto = await processarImagemNuvem(buffer, LIMITE_IMAGEM);
    if (pronto.erro) return json2(400, { erro: pronto.erro, mensagem: pronto.erro === "grande" ? MSG2.grande : MSG2.formato });
    const guardado = await guardarMidia(env2, dbx, pronto.ext, pronto.buffer, pronto.tipo);
    if (guardado.erro) return json2(400, { erro: guardado.erro, mensagem: guardado.erro === "cheio" ? MSG2.cheio : MSG2.guardar });
    const src = guardado.src;
    const id = `novo-${aleatorio().slice(0, 12)}`;
    const legenda = `galeria.${galeria}.${id}`.replace(/[^a-zA-Z0-9._-]/g, "");
    await antes(dbx, `galeria:${galeria}`);
    await gravarTextos(dbx, legenda, (await idiomas(dbx)).map((idioma) => ({ idioma, valor: "", pendente: 0 })));
    await inserirDepois(dbx, { id, galeria, tipo: "imagem", src, legenda, largura: pronto.largura || 0, altura: pronto.altura || 0 }, depois);
    await auditar(dbx, "galeria-novo", ip, id);
    return json2(200, { ok: true, mensagem: "Photo added." });
  }
  if (rota === "/panel/api/upload/iniciar" && request.method === "POST") {
    const corpo = await request.json();
    const tamanho = Number(corpo.tamanho);
    if (!chaveValida(corpo.galeria) || !await dbx.get("SELECT 1 AS n FROM galeria WHERE chave = ?", corpo.galeria)) return json2(400, { erro: "guardar", mensagem: MSG2.guardar });
    if (!Number.isFinite(tamanho) || tamanho <= 0 || tamanho > LIMITE_VIDEO) return json2(400, { erro: "grande", mensagem: MSG2.video });
    if (await bytesUsados(dbx) + tamanho > TETO_BYTES) return json2(400, { erro: "cheio", mensagem: MSG2.cheio });
    const id = nomeAleatorio("").slice(0, 32);
    return json2(200, { id, partes: Math.ceil(tamanho / PEDACO), parte: PEDACO, galeria: corpo.galeria, depoisDe: corpo.depoisDe || "" });
  }
  if (rota === "/panel/api/upload/parte" && request.method === "PUT") {
    const id = url.searchParams.get("id") || "";
    const indice = Number(url.searchParams.get("i"));
    if (!/^[\da-f]{32}$/.test(id) || !Number.isInteger(indice)) return json2(400, { erro: "guardar", mensagem: MSG2.guardar });
    const buffer = await corpoBytes(request, PEDACO + 1024);
    await env2.MIDIA.put(`partes/${id}/${indice}`, buffer);
    return json2(200, { ok: true });
  }
  if (rota === "/panel/api/upload/concluir" && request.method === "POST") {
    const corpo = await request.json();
    const id = corpo.id || "";
    if (!/^[\da-f]{32}$/.test(id)) return json2(400, { erro: "guardar", mensagem: MSG2.video });
    const pedacos = [];
    for (let i = 0; i < 80; i++) {
      const parte = await env2.MIDIA.get(`partes/${id}/${i}`);
      if (!parte) break;
      pedacos.push(Buffer.from(await parte.arrayBuffer()));
    }
    if (!pedacos.length) return json2(400, { erro: "formato", mensagem: MSG2.video });
    const buffer = Buffer.concat(pedacos);
    const video = validarVideoNuvem(buffer, LIMITE_VIDEO);
    if (video.erro) return json2(400, { erro: video.erro, mensagem: MSG2.video });
    const guardado = await guardarMidia(env2, dbx, video.ext, buffer, video.tipo);
    if (guardado.erro) return json2(400, { erro: guardado.erro, mensagem: guardado.erro === "cheio" ? MSG2.cheio : MSG2.video });
    const src = guardado.src;
    let poster = "";
    if (corpo.poster) {
      const cru = Buffer.from(String(corpo.poster).replace(/^data:image\/\w+;base64,/, ""), "base64");
      const img = await processarImagemNuvem(cru, LIMITE_IMAGEM);
      if (!img.erro) {
        const mini = await guardarMidia(env2, dbx, img.ext, img.buffer, img.tipo);
        if (mini.src) poster = mini.src;
      }
    }
    const galeria = corpo.galeria;
    const depois = corpo.depoisDe || "";
    if (!chaveValida(galeria)) return json2(400, { erro: "guardar", mensagem: MSG2.guardar });
    const itemId = `novo-${aleatorio().slice(0, 12)}`;
    const legenda = `galeria.${galeria}.${itemId}`.replace(/[^a-zA-Z0-9._-]/g, "");
    await antes(dbx, `video:${galeria}`);
    await gravarTextos(dbx, legenda, (await idiomas(dbx)).map((idioma) => ({ idioma, valor: "", pendente: 0 })));
    await inserirDepois(dbx, { id: itemId, galeria, tipo: "video", src, poster, legenda, largura: 0, altura: 0 }, depois);
    for (let i = 0; i < pedacos.length; i++) await env2.MIDIA.delete(`partes/${id}/${i}`);
    await auditar(dbx, "galeria-video", ip, itemId);
    return json2(200, { ok: true, mensagem: "Video added." });
  }
  if (rota === "/panel/api/desfazer" && request.method === "POST") {
    const row = await dbx.get("SELECT id, snapshot FROM versao ORDER BY id DESC LIMIT 1");
    if (!row) return json2(400, { ok: false, mensagem: "There is nothing to undo." });
    await restaurar(dbx, JSON.parse(row.snapshot));
    await dbx.run("DELETE FROM versao WHERE id = ?", row.id);
    await auditar(dbx, "desfazer", ip, "restaurado");
    return json2(200, { ok: true, mensagem: "Change undone." });
  }
  if (rota === "/panel/api/historico" && request.method === "GET") {
    const lista = (await dbx.all("SELECT id, quando, acao FROM versao ORDER BY id DESC LIMIT 30")).map((v) => ({ id: v.id, quando: new Date(v.quando).toISOString(), acao: v.acao }));
    return json2(200, { lista });
  }
  if (rota === "/panel/api/restaurar" && request.method === "POST") {
    const corpo = await request.json();
    const row = await dbx.get("SELECT id, snapshot FROM versao WHERE id = ?", Number(corpo.id));
    if (!row) return json2(404, { erro: "guardar", mensagem: MSG2.guardar });
    await antes(dbx, "antes-de-restaurar");
    await restaurar(dbx, JSON.parse(row.snapshot));
    await auditar(dbx, "restaurar", ip, String(corpo.id));
    return json2(200, { ok: true, mensagem: "Version restored." });
  }
  return texto(404, "Not found");
}
__name(api, "api");
async function inserirDepois(dbx, item, depoisDe) {
  const atuais = (await dbx.all("SELECT id FROM galeria_item WHERE galeria = ? ORDER BY ordem, id", item.galeria)).map((r) => r.id);
  const idx = atuais.indexOf(depoisDe);
  atuais.splice(idx === -1 ? atuais.length : idx + 1, 0, item.id);
  await dbx.run(`INSERT INTO galeria_item (id, galeria, ordem, tipo, src, webp, poster, legenda_chave, largura, altura) VALUES (?, ?, 0, ?, ?, '', ?, ?, ?, ?)`, item.id, item.galeria, item.tipo, item.src, item.poster || "", item.legenda, item.largura || 0, item.altura || 0);
  await dbx.batch(atuais.map((id, i) => ["UPDATE galeria_item SET ordem = ? WHERE id = ?", [i + 1, id]]));
}
__name(inserirDepois, "inserirDepois");

// _middleware.js
async function onRequest(context2) {
  return atender(context2);
}
__name(onRequest, "onRequest");

// ../.wrangler/tmp/pages-AJiZK2/functionsRoutes-0.5194619129929716.mjs
var routes = [
  {
    routePath: "/",
    mountPath: "/",
    method: "",
    middlewares: [onRequest],
    modules: []
  }
];

// ../node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count3 = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count3--;
          if (count3 === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count3++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count3)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function getOriginalPathPrefix(requestPath, normalizedPrefix) {
  let end = 0;
  for (let index = 0; index < normalizedPrefix.length; index++) {
    end++;
    if (normalizedPrefix[index] === "/") {
      while (requestPath[end] === "/") {
        end++;
      }
    }
  }
  return requestPath.slice(0, end);
}
__name(getOriginalPathPrefix, "getOriginalPathPrefix");
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  const normalizedRequestPath = requestPath.replace(/\/+/g, "/");
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath) || routeMatcher(normalizedRequestPath);
    const originalMountMatch = mountMatcher(requestPath);
    const mountMatchResult = originalMountMatch || mountMatcher(normalizedRequestPath);
    if (matchResult && mountMatchResult) {
      const path = originalMountMatch ? originalMountMatch.path : getOriginalPathPrefix(requestPath, mountMatchResult.path);
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env2, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context2 = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env: env2,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context2);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env2["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error3) {
      if (isFailOpen) {
        const response = await env2["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error3;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
