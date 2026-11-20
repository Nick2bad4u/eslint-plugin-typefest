export type DeferredAction = () => Promise<void> | void;

export interface LifecycleHooks {
    onReady: () => Promise<void> | void;
}

export type Resolver<TValue> = (value: TValue) => Promise<TValue> | TValue;
