import { MatchValue, RandomConstant, ArrayMatchType } from "../types";
import { Any } from "./comparators";
import { seek } from "./utils";

export const merge = <T, E extends MatchValue<T>>(item: T, matched: E): E extends RandomConstant ? T : E => {
    if (item === null || item instanceof Date) {
        return matched === Any ? item : matched as any;
    }
    if (Array.isArray(matched)) {
        const copyArray = [...matched];
        return copyArray.map((part, i) => (part === Any && (item as any)[i] !== undefined)
            ? merge((item as any)[i], part)
            : part
        ) as any;
    } else if (typeof matched === 'object') {
        const copyObject = { ...(matched as any) };
        if (Array.isArray(item)) {
            const key = Object.keys(copyObject)[0] as ArrayMatchType;
            switch (key) {
                case 'last':
                    copyObject.last = (merge([...item].reverse(), copyObject.last.reverse()) as any).reverse();
                    return copyObject;
                case 'seek':
                    const found = seek(item, copyObject);
                    copyObject.seek = merge(found, copyObject.seek);
                    return copyObject;
                case 'any':
                case 'some':
                    copyObject.some = merge(item, copyObject.some as any) as any;
                    return copyObject;
            }
        }
        if (typeof item === 'object') {
            Object.entries(copyObject).forEach(([key, value]) => {
                if ((item as any)[key] !== undefined) {
                    copyObject[key] = merge((item as any)[key], value as any) as any;
                }
            });
            return copyObject;
        }
    }
    return (matched === Any ? item : matched) as any;
};