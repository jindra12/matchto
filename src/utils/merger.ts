import { MatchValue, ArrayMatchType, MergerType, PluginFn } from "../types";
import { Any } from "./comparators";
import { seek, isVariableClass } from "./match";
import { Identity } from "./identity";

export const merge = <T, E extends MatchValue<T>>(item: T, matched: E, plugins: PluginFn[] = []): MergerType<T, E> => {
    if (matched instanceof Identity || matched instanceof RegExp || isVariableClass(matched)) {
        return item as any;
    }
    if (item === null) {
        return matched === Any ? item : matched as any;
    }
    if (
        typeof item === 'string'
            || typeof item === 'number'
            || item instanceof Date
    ) {
        return matched === Any || matched instanceof Function ? item : matched as any;
    }
    if (typeof matched === 'function' && typeof item === 'object') {
        return item as any;
    }
    if (Array.isArray(matched)) {
        const copyArray = [...matched];
        return copyArray.map((part, i) => (item as any)[i] !== undefined
            ? merge((item as any)[i], part, plugins)
            : part
        ) as any;
    } else if (typeof matched === 'object') {
        const copyObject = { ...(matched as any) };
        if (Array.isArray(item)) {
            const key = Object.keys(copyObject)[0] as ArrayMatchType;
            switch (key) {
                case 'last':
                    copyObject.last = (merge([...item].reverse(), copyObject.last.reverse(), plugins) as any).reverse();
                    return copyObject;
                case 'seek':
                    const found = seek(item, copyObject, plugins);
                    copyObject.seek = merge(found, copyObject.seek, plugins);
                    return copyObject;
                case 'any':
                case 'some':
                    copyObject.some = merge(item, copyObject.some as any, plugins) as any;
                    return copyObject;
            }
        }
        if (typeof item === 'object') {
            Object.entries(copyObject).forEach(([key, value]) => {
                if ((item as any)[key] !== undefined) {
                    copyObject[key] = merge((item as any)[key], value as any, plugins) as any;
                }
            });
            return copyObject;
        }
    }
    return (matched === Any ? item : matched) as any;
};