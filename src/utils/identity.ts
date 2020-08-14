import { IdentityMap } from "../types";

export const id = (id: string) => new Identity(id);

export class Identity {
    private id: string;
    private value: any;
    constructor(id: string) {
        this.id = id;
    }
    public addValue = (value: any) => this.value = value;
    public compare = (identity: Identity) => exact(this.value, identity.value);
    public getId = () => this.id;
    public getValue = () => this.value;
}

export const resolveIdentities = (map: IdentityMap) => {
    const items = Object.values(map);
    return items.reduce((p: boolean, c) => !p ? false : c.compare(items[0]), true);
};

export const accessIdentity = (identities: IdentityMap) => (index: string) => identities[index]?.getValue();

const exact = (a: any, b: any): boolean => {
    if (typeof a !== typeof b) {
        if (a instanceof Array && b instanceof Array) {
            return a.length === b.length && a.reduce((p: boolean, c, i) => !p ? false : exact(c, b[i]), true);
        }
        if (a instanceof Date && b instanceof Date) {
            return a.getTime() === b.getTime();
        }
        switch (typeof a) {
            case 'bigint':
            case 'boolean':
            case 'number':
            case 'string':
            case 'symbol':
            case 'undefined':
                return a === b;
            case 'function':
                return true;
            case 'object':
                if (a === null || b === null) {
                    return a === b;
                }
                return Object.entries(a).reduce((p: boolean, [key, value]) => !p ? false : exact(value, b[key]), false);
        }
    }
    return false;
}