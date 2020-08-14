import { RandomConstant, DateCompareType } from "../types";

export const Any: RandomConstant = 'any_random_constant';

/**
 * Will match if the value % mod === equals
 * @param mod use this mod
 * @param equals value after mod equals this
 */
export const mod = (mod: number, equals: number = 0) => (value: number) => value % mod === equals;
/**
 * Is the value matched less than?
 * @param than the limit
 */
export const less = <T extends number | string, E = (T extends number ? number : string)>(than: E) => (value: E) => value < than;
/**
 * Is the value matched more than?
 * @param than the limit
 */
export const more = <T extends number | string, E = (T extends number ? number : string)>(than: E) => (value: E) => value > than;
/**
 * Is the value matched less or equal than?
 * @param than the limit
 */
export const lessOrEqual = <T extends number | string, E = (T extends number ? number : string)>(than: E) => (value: E) => value <= than;
/**
 * Is the value matched more or equal than?
 * @param than the limit
 */
export const moreOrEqual = <T extends number | string, E = (T extends number ? number : string)>(than: E) => (value: E) => value >= than;
/**
 * Is the value matched between
 * @param a lower limit (>=)
 * @param b upper limit (<=)
 */
export const between = <T extends number | string, E = (T extends number ? number : string)>(a: E, b: E) => (value: E) => value >= a && value <= b;

const normalizeCompare = (received: DateCompareType): number => typeof received === 'string'
    ? new Date(received).getTime()
    : (
        received instanceof Date
            ? received.getTime()
            : received
    );

/**
 * Is the date value matched before?
 * @param than the limit
 */
export const before = (than: DateCompareType) => (value: Date) => value.getTime() < normalizeCompare(than);
/**
 * Is the date value matched after?
 * @param than the limit
 */
export const after = (than: DateCompareType) => (value: Date) => value.getTime() > normalizeCompare(than);
/**
 * Is the date value matched before or same?
 * @param than the limit
 */
export const beforeOrNow = (than: DateCompareType) => (value: Date) => value.getTime() <= normalizeCompare(than);
/**
 * Is the date value matched after or same?
 * @param than the limit
 */
export const afterOrNow = (than: DateCompareType) => (value: Date) => value.getTime() >= normalizeCompare(than);
/**
 * Is the date value matched between?
 * @param a lower limit (>=)
 * @param b upper limit (<=)
 */
export const around = (a: DateCompareType, b: DateCompareType) => (value: Date) => value.getTime() >= normalizeCompare(a) && (value as Date).getTime() <= normalizeCompare(b);