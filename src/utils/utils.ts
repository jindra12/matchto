import { AllowedTo, MatchValue, MatchStore, KindOfMatch, ArrayMatchType, InnerMatch, IdentityMap } from "../types";
import { Any } from "./comparators";
import { recursive } from "./recursive";
import { Identity, resolveIdentities, accessIdentity } from "./identity";


export const matchAll = <T extends AllowedTo, E>(to: T, store: MatchStore<T, E>, kind: KindOfMatch, rematch: InnerMatch<T, any>) => (
    kind === 'last' ? store.reverse() : store
).reduce((p: E[], c) => {
    let shouldContinue = true;
    if (p.length === 1 && (c.cut || kind === 'last' || kind === 'first')) {
        shouldContinue = false;
    }
    if (shouldContinue) {
        const identities: IdentityMap = {};
        const matched = matcher(to, c.item, identities);
        if ((matched && !c.not || !matched && c.not) && (!c.guard || c.guard(to)) && resolveIdentities(identities)) {
            if (kind === 'break' && p.length > 0) {
                throw Error('Cannot match more than one item on "break" mode.')
            }
            p.push(typeof c.then === 'function' ? (c.then as any)(to, c.item, recursive(rematch), accessIdentity(identities)) : c.then);    
        }
    }
    return p;
}, []);

export const seek = <T extends AllowedTo>(to: T, item: MatchValue<T>): any[] | null => {
    const seekLength = (item as any).seek.length;
    for (let i = 0; i < (to as []).length; i++) {
        const subArray: any[] = (to as []).slice(i, i + seekLength) as any;
        if (subArray.length === seekLength) {
            const res = subArray
                .reduce((p, c, j) => !p ? false : matcher(c, (item as any).seek[j], null), true);
            if (res) {
                return subArray;
            }
        }
    }
    return null;
}

const matcher = <T extends AllowedTo>(to: T, item: MatchValue<T>, identities: IdentityMap | null): boolean => {
    if (item instanceof Identity) {
        if (!identities) {
            return true;
        }
        item.addValue(to);
        identities[item.getId()] = item;
        return true;
    }

    if (item === Any) {
        return true;
    }
    
    if (to === null) {
        return item === null;
    }

    if (to instanceof Date) {
        if (item instanceof Date) {
            return to.getTime() === item.getTime();
        }
        if (item instanceof RegExp) {
            return item.test(to.toISOString());
        }
        if (typeof item === 'string') {
            return item === to.toISOString();
        }
        if (typeof item === 'number') {
            return item === to.getTime();
        }
        if (typeof item === 'function') {
            return (item as any)(to);
        }
        return false;
    }

    if (Array.isArray(to)) {
        if (Array.isArray(item)) {
            return to
                .reduce((p, c, i) => !p ? false : (item[i] === undefined ? true : matcher(c, item[i], identities)), true);
        }
        if (typeof item === 'object') {
            const key = Object.keys(item)[0] as ArrayMatchType;
            switch (key) {
                case 'any':
                    return to.find(part => matcher(part, (item as any).any, identities));
                case 'seek':
                    return seek(to, item) !== null;
                case 'last':
                    const reversedItem = [...(item as any).last].reverse();
                    return [...to].reverse().reduce((p, part, i) => !p ? false : (i >= reversedItem.length || matcher(part, reversedItem[i], identities)), true);
                case 'some':
                    return (item as any).some.reduce((p: boolean, c: any) => !p ? false : matcher(to, { 'any': c } as any, identities), true);
                default:
                    return false;
            }
        }
        return false;
    }
    switch (typeof to) {
        case 'string':
            if (typeof item === 'function') {
                return (item as any)(to);
            }
            if (typeof item === 'string') {
                return to === item as any;
            }
            if (item instanceof RegExp) {
                return item.test(to as any);
            }
            return false;
        case 'number':
            if (typeof item === 'number') {
                return to === item as any;
            } else if (typeof item === 'function') {
                return (item as any)(to);
            }
            return false;
        case 'boolean':
        case 'bigint':
        case 'undefined':
            return to === item as any;
        case 'function':
            return true;
        case 'object':
            return Boolean(
                typeof item === 'object' && Object
                    .entries(to)
                    .reduce(
                        (p, [key, value]) => !p
                            ? false
                            : ((item as any)[key] === undefined || matcher(value, (item as any)[key], identities)),
                        true,
                    )
                );
    }
};
