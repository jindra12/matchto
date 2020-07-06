import { RandomConstant, DateCompareType } from "../types";

export const Any: RandomConstant = 'any_random_constant';

export const mod = (mod: number, equals: number = 0) => (value: number) => value % mod === equals;
export const less = <T extends number | string, E = (T extends number ? number : string)>(than: E) => (value: E) => value < than;
export const more = <T extends number | string, E = (T extends number ? number : string)>(than: E) => (value: E) => value > than;
export const lessOrEqual = <T extends number | string, E = (T extends number ? number : string)>(than: E) => (value: E) => value <= than;
export const moreOrEqual = <T extends number | string, E = (T extends number ? number : string)>(than: E) => (value: E) => value >= than;
export const between = <T extends number | string, E = (T extends number ? number : string)>(a: E, b: E) => (value: E) => value >= a && value <= b;

const normalizeCompare = (received: DateCompareType): number => typeof received === 'string'
    ? new Date(received).getTime()
    : (
        received instanceof Date
            ? received.getTime()
            : received
    );

export const before = (than: DateCompareType) => (value: Date) => value.getTime() < normalizeCompare(than);
export const after = (than: DateCompareType) => (value: Date) => value.getTime() > normalizeCompare(than);
export const beforeOrNow = (than: DateCompareType) => (value: Date) => value.getTime() <= normalizeCompare(than);
export const afterOrNow = (than: DateCompareType) => (value: Date) => value.getTime() >= normalizeCompare(than);
export const around = (a: DateCompareType, b: DateCompareType) => (value: Date) => value.getTime() >= normalizeCompare(a) && (value as Date).getTime() <= normalizeCompare(b);