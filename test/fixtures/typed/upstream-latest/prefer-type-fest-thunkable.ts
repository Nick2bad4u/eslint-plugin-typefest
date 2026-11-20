export type Lazy<Value> = Value | (() => Value);

export type Deferred<T extends number = 0> = (() => T) | T;
