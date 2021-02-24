import { AllowedTo, MatchValue, MatchStore, KindOfMatch, ArrayMatchType, InnerMatch, IdentityMap, PluginFn } from "../types";
import { Any } from "./comparators";
import { recursive } from "./recursive";
import { Identity, resolveIdentities, accessIdentity } from "./identity";

const variableClasses = [
    String,
    Number,
    Boolean,
    BigInt,
    Symbol,
    Date,
    Object,
    Array,
];

export const isVariableClass = (item: any) => variableClasses.find(c => c === item);

export const matchAll = <T extends AllowedTo, E>(to: T, store: MatchStore<T, E>, kind: KindOfMatch, rematch: InnerMatch<T, any>, plugins: PluginFn[]) => {
    let hasBeenCut = false;
    return (
        kind === 'last' ? store.reverse() : store
    ).reduce((p: E[], c) => {
        if (hasBeenCut || (p.length === 1 && (kind === 'first' || kind === 'last'))) {
            return p;
        }
        const identities: IdentityMap = {};
        const matched = matcher(to, c.item, identities, plugins);
        if ((matched && !c.not || !matched && c.not) && (!c.guard || c.guard(to)) && resolveIdentities(identities)) {
            if (kind === 'break' && p.length > 0) {
                throw Error('Cannot match more than one item on "break" mode.')
            }
            p.push(typeof c.then === 'function' ? (c.then as any)({ item: to, matched: c.item, rematch: recursive(rematch), id: accessIdentity(identities) }) : c.then);
            if (c.cut) {
                hasBeenCut = true;
            }
        }
        return p;
    }, []);
};

export const seek = <T extends AllowedTo>(to: T, item: MatchValue<T>, plugins: PluginFn[]): any[] | null => {
    const seekLength = (item as any).seek.length;
    for (let i = 0; i < (to as []).length; i++) {
        const subArray: any[] = (to as []).slice(i, i + seekLength) as any;
        if (subArray.length === seekLength) {
            const res = subArray
                .reduce((p, c, j) => !p ? false : matcher(c, (item as any).seek[j], null, plugins), true);
            if (res) {
                return subArray;
            }
        }
    }
    return null;
}

const matcher = <T extends AllowedTo>(to: T, item: MatchValue<T>, identities: IdentityMap | null, plugins: PluginFn[]): boolean => {
    for (let i = 0; i < plugins.length; i++) {
        const pluginResolve = plugins[i](to, item);
        if (pluginResolve === true) {
            return true;
        }
        if (pluginResolve === false) {
            return false;
        }
    }
    if (item === Any) {
        return true;
    }
    
    if (to === null) {
        return item === null;
    }

    if (item instanceof Identity) {
        if (!identities) {
            return true;
        }
        item.addValue(to);
        if (!identities[item.getId()]) {
            identities[item.getId()] = [];
        }
        identities[item.getId()].push(item);
        return true;
    }
    switch (typeof to) {
        case 'string':
            if (item === String) {
                return true;
            }
            if (isVariableClass(item)) {
                return false;
            }
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
            if (item === Number) {
                return true;
            }
            if (isVariableClass(item)) {
                return false;
            }
            if (typeof item === 'number') {
                return to === item as any;
            } else if (typeof item === 'function') {
                return (item as any)(to);
            }
            return false;
        case 'boolean':
            return item === Boolean || (item as any) === to;
        case 'bigint':
            return item === BigInt || (item as BigInt)?.toString() === to?.toString();
        case 'symbol':
            return item === Symbol || to?.toString() === item?.toString();
        case 'undefined':
            return to === item as any;
        case 'function':
            const toKeys = Object.keys(to);
            const itemKeys = typeof item === "object" || typeof item === "function" ? Object.keys(item as any) : [];
            if (toKeys.length && itemKeys.length) {
                const functorPartTo = toKeys.reduce((p: any, c) => {
                    p[c] = (to as any)[c];
                    return p;
                }, {});
                const functorPartItem = itemKeys.reduce((p: any, c) => {
                    p[c] = (item as any)[c];
                    return p;
                }, {});
                return matcher(functorPartTo, functorPartItem, identities, plugins);
            } 
            return true;
        case 'object':
            if (to instanceof Date) {
                if (item === Date) {
                    return true;
                }
                if (isVariableClass(item)) {
                    return false;
                }
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
                if (item === Array) {
                    return true;
                }
                if (isVariableClass(item)) {
                    return false;
                }
                if (Array.isArray(item)) {
                    return item.length <= to.length && to
                        .reduce(
                            (p: boolean, c, i) => !p ? false : (item[i] === undefined ? true : matcher(c, item[i], identities, plugins)), true
                        );
                }
                if (typeof item === 'object' && Boolean(item)) {
                    const key = Object.keys(item!)[0] as ArrayMatchType;
                    switch (key) {
                        case 'any':
                            return Boolean(to.find(part => (matcher as any)(part, (item as any).any, identities, plugins)));
                        case 'seek':
                            return seek(to, item, plugins) !== null;
                        case 'last':
                            const reversedItem = [...(item as any).last].reverse();
                            return reversedItem.length <= to.length && [...to]
                                .reverse()
                                .reduce(
                                    (p, part, i) => !p ? false : (i >= reversedItem.length || matcher(part, reversedItem[i], identities, plugins)) as any, true
                                );
                        case 'some':
                            return (item as any).some.reduce((p: boolean, c: any) => !p ? false : matcher(to, { 'any': c } as any, identities, plugins), true);
                        default:
                            return false;
                    }
                }
                return false;
            }
            if (item === Object) {
                return true;
            }
            if (typeof item === 'function') {
                return to instanceof item;
            }
            if (typeof item === 'object' && Boolean(item)) {
                const itemKeys = Object.keys(item as any);
                const toEntries = Object.entries(to as any);
                const toKeys = Object.keys(to as any);
                if (!itemKeys.every(key => toKeys.includes(key))) {
                    return false;
                }
                if (toEntries.length >= itemKeys.length) {
                    return Boolean(toEntries.reduce(
                            (p, [key, value]) => !p
                                ? false
                                : ((item as any)[key] === undefined || (matcher as any)(value, (item as any)[key], identities, plugins)),
                            true,
                        )
                    );
                }
            }
            return false;
    }
};
