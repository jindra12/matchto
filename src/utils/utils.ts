import { RandomConstant, AllowedTo, MatchValue, MatchStore, KindOfMatch, MultiCompare, SimpleCompare, ModCompare } from "../types";

export const Any: RandomConstant = 'any_random_constant';
export const mod: ModCompare = (mod: number, equals: number = 0) => value => value % mod === equals;
export const less: SimpleCompare = (than: number) => value => value < than;
export const more: SimpleCompare = (than: number) => value => value < than;
export const lessOrEqual: SimpleCompare = (than: number) => value => value <= than;
export const moreOrEqual: SimpleCompare = (than: number) => value => value >= than;
export const between: MultiCompare = (a: number, b: number) => value => value >= a && value <= b;

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
        p.push(typeof c.then === 'function' ? (c.then as any)(to, c.item) : c.then);
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
        return false;
    }
    if (Array.isArray(to)) {
        if (!Array.isArray(item)) {
            if ((item as any).any !== undefined) {
                return to.find(part => matcher(part, (item as any).any));
            }
            if ((item as any).seek !== undefined) {
                const seekLength = (item as any).seek.length;
                for (let i = 0; i < to.length; i++) {
                    const subArray: any[] = to.slice(i, i + seekLength) as any;
                    if (subArray.length === seekLength) {
                        const res = subArray
                            .reduce((p, c, j) => !p ? false : matcher(c, (item as any).seek[j]), true);
                        if (res) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
        return to
            .reduce((p, c, i) => !p ? false : item[i] === undefined ? true : matcher(c, item[i]), true);
    }
    switch (typeof to) {
        case 'string':
            if (typeof item === 'string') {
                return to === item || item === Any;
            }
            if (item instanceof RegExp) {
                return item.test(to as any);
            }
            return false;
        case 'number':
            if (typeof item === 'number' || typeof item === 'string') {
                return to === item || item === Any;
            } else if (typeof item === 'function') {
                return (item as any)(to);
            }
            return false;
        case 'boolean':
        case 'bigint':
        case 'undefined':
            return to === item || item === Any;
        case 'function':
            return true;
        case 'object':
            return item === Any || Boolean(
                Object
                    .entries(to)
                    .reduce(
                        (p, [key, value]) => !p
                            ? false
                            : ((item as any)[key] === undefined || matcher(value, (item as any)[key])),
                        true,
                    )
                );
    }
};
