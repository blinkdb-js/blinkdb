/**
 * Allows registering multiple callbacks
 * and calling all of them at the same time.
 */
export class Dispatcher<T = void> {
  private callbacks: Set<Callback<T>> = new Set();

  /**
   * register a function to be called when the event emits.
   *
   * @returns a function that can be called to remove the registered callback.
   */
  public register(cb: Callback<T>): () => void {
    this.callbacks.add(cb);
    return () => {
      this.callbacks.delete(cb);
    };
  }

  /**
   * call all registered callbacks with the provided data.
   */
  public async dispatch(data: T): Promise<void> {
    this.callbacks.forEach((cb) => cb(data));
  }

  /**
   * Returns true if this dispatcher has listeners.
   * If this returns false, then you can skip calling `dispatch` for performance optimizations.
   */
  public hasListeners(): boolean {
    return this.callbacks.size > 0;
  }
}

type Callback<T> = (data: T) => Promise<void> | void;
