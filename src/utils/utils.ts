import { RandomConstant, AllowedTo, MatchValue, MatchStore, KindOfMatch } from "../types";

export const Any: RandomConstant = 'any_random_constant';

export const matchAll = <T extends AllowedTo, E>(to: T, store: MatchStore<T, E>, kind: KindOfMatch) => (
    kind === 'last' ? store.reverse() : store
).reduce((p: E[], c) => {
    let shouldContinue = true;
    if (p.length === 1 && (kind === 'last' || kind === 'first')) {
        shouldContinue = false;
    }
    if (shouldContinue && matcher(to, c.item) && (!c.guard || c.guard(to))) {
        if (kind === 'break' && p.length > 0) {
            throw Error('Cannot match more than one item on "break" mode.')
        }
        p.push(typeof c.then === 'function' ? (c.then as any)(to) : c.then);
    }
    return p;
}, []);

const matcher = <T extends AllowedTo>(to: T, item: MatchValue<T>): boolean => {
    if (to instanceof Date) {
        if (item instanceof Date) {
            return to.getTime() === item.getTime();
        }
        if (item instanceof RegExp) {
            return item.test(to.toISOString());
        }
        if (typeof item === 'string') {
            return item === Any || item === to.toISOString();
        }
        if (typeof item === 'number') {
            return item === to.getTime();
        }
        throw Error('No valid Date comparison found!');
    }
    if (Array.isArray(to)) {
        if (!Array.isArray(item)) {
            if ((item as any).any !== undefined) {
                return to.find(part => matcher(part, (item as any).any));
            }
            throw Error('Cannot compare an array to non-array');
        }
        return to
            .map((part, i) => item[i] === undefined ? true : matcher(part, item[i]))
            .reduce((p, c) => !p ? false : c, true);
    }
    switch (typeof to) {
        case 'string':
            if (typeof item === 'string') {
                return to === item || item === 'any_random_constant';
            }
            if (item instanceof RegExp) {
                return item.test(to as any);
            }
            throw Error('Could not find anything to compare "to"');
        case 'boolean':
        case 'number':
        case 'bigint':
            return to === item || item === 'any_random_constant';
        case 'undefined':
            throw Error('Cannot compare to undefined!');
        case 'object':
            return item === 'any_random_constant' || Boolean(
                Object
                    .entries(to)
                    .filter(([key, _]) => (item as { [i: string]: any })[key] !== undefined)
                    .map(([key, value]) => matcher(value, (item as { [i: string]: any })[key]))
                    .reduce((p, c) => !p ? false : c, true)
                );
    }
};
