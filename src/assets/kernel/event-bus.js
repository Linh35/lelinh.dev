/*
 * event-bus.js — signal-style pub/sub. Topics remember their latest value
 * and replay it to new subscribers in a microtask, so init order doesn't matter.
 * Dependencies: none. Default export is a shared singleton.
 * Invariants: emit-before-subscribe still delivers (cached last value).
 *             Handler errors are caught — one bad listener can't crash the bus.
 *             on() returns an unsubscribe function.
 * Non-goals: not a state store; no async iteration; no priority queues.
 */

class EventBus {
  #handlers = new Map();
  #latest = new Map();

  #dispatch(fn, value) {
    try { fn(value); } catch (e) { console.error('[bus]', e); }
  }

  on(topic, handler) {
    if (!this.#handlers.has(topic)) this.#handlers.set(topic, new Set());
    this.#handlers.get(topic).add(handler);
    // Replay last value to late subscribers — init order doesn't matter.
    if (this.#latest.has(topic)) queueMicrotask(() => this.#dispatch(handler, this.#latest.get(topic)));
    return () => this.off(topic, handler);
  }

  off(topic, handler) { this.#handlers.get(topic)?.delete(handler); }

  emit(topic, value) {
    this.#latest.set(topic, value);
    for (const fn of this.#handlers.get(topic) ?? []) this.#dispatch(fn, value);
  }
}

export const bus = new EventBus();
export default bus;
