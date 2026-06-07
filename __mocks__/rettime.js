/**
 * __mocks__/rettime.js
 * CJS stub for the `rettime` package which is ESM-only.
 * MSW's experimental/define-network.js uses `new Emitter()` from rettime.
 * We provide a minimal EventEmitter-compatible Emitter class.
 */
class Emitter {
  constructor() {
    this._listeners = new Map();
    this.hooks = {
      on: () => {},
      removeListener: () => {},
    };
  }
  on(type, listener, options) {
    if (!this._listeners.has(type)) this._listeners.set(type, []);
    this._listeners.get(type).push(listener);
    if (options && options.once) {
      const original = listener;
      const wrapper = (...args) => {
        this.removeListener(type, wrapper);
        return original(...args);
      };
      this._listeners.get(type).pop();
      this._listeners.get(type).push(wrapper);
    }
  }
  once(type, listener, options) {
    this.on(type, listener, { ...options, once: true });
  }
  removeListener(type, listener) {
    const listeners = this._listeners.get(type);
    if (listeners) {
      const idx = listeners.indexOf(listener);
      if (idx !== -1) listeners.splice(idx, 1);
    }
  }
  emit(type, ...args) {
    const listeners = this._listeners.get(type) || [];
    for (const listener of [...listeners]) {
      listener(...args);
    }
  }
}

class TypedEvent extends MessageEvent {}

module.exports = { Emitter, TypedEvent };
