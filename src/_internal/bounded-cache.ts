/**
 * @packageDocumentation
 * Shared bounded-cache helpers with lightweight LRU semantics for hot-path
 * parser/type-analysis caches.
 */

import { isSafeInteger } from "ts-extras";

const isSameValueZero = <Value>(left: Value, right: Value): boolean =>
    left === right ||
    (typeof left === "number" &&
        typeof right === "number" &&
        Number.isNaN(left) &&
        Number.isNaN(right));

/**
 * Result shape returned by bounded-cache lookups.
 */
export type BoundedCacheLookupResult<Value> =
    | Readonly<{
          found: false;
      }>
    | Readonly<{
          found: true;
          value: Value;
      }>;

/**
 * Read a cache entry and mark it as most-recently-used.
 *
 * @param cache - Mutable cache map.
 * @param key - Entry key.
 *
 * @returns Lookup result describing whether an entry was found. When found,
 *   includes the cached value (which can itself be `undefined`/`null`).
 */
export const getBoundedCacheValue = <Key, Value>(
    cache: Map<Key, Value>,
    key: Key
): BoundedCacheLookupResult<Value> => {
    for (const [entryKey, value] of cache) {
        if (isSameValueZero(entryKey, key)) {
            cache.delete(key);
            cache.set(key, value);

            return {
                found: true,
                value,
            };
        }
    }

    return {
        found: false,
    };
};

/**
 * Insert or update a cache entry and evict least-recently-used entries beyond
 * the configured max size.
 *
 * @param options - Bounded-cache insertion options.
 *
 *   - `cache`: Mutable cache map.
 *   - `key`: Entry key.
 *   - `maxEntries`: Maximum number of cache entries to retain.
 *   - `value`: Entry value.
 */
export const setBoundedCacheValue = <Key, Value>({
    cache,
    key,
    maxEntries,
    value,
}: Readonly<{
    cache: Map<Key, Value>;
    key: Key;
    maxEntries: number;
    value: Value;
}>): void => {
    if (!isSafeInteger(maxEntries) || maxEntries < 1) {
        return;
    }

    if (cache.has(key)) {
        cache.delete(key);
    }

    cache.set(key, value);

    while (cache.size > maxEntries) {
        const oldestEntry = cache.keys().next();

        if (oldestEntry.done === true) {
            return;
        }

        cache.delete(oldestEntry.value);
    }
};
