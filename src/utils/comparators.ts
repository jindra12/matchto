import { RandomConstant, ModCompare, SimpleCompare, MultiCompare, DateCompareType } from "../types";

export const Any: RandomConstant = 'any_random_constant';

export const mod: ModCompare<number> = (mod, equals = 0) => value => value % mod === equals;
export const less: SimpleCompare<number> = than => value => value < than;
export const more: SimpleCompare<number> = than => value => value > than;
export const lessOrEqual: SimpleCompare<number> = than => value => value <= than;
export const moreOrEqual: SimpleCompare<number> = than => value => value >= than;
export const between: MultiCompare<number> = (a, b) => value => value >= a && value <= b;

const normalizeCompare = (received: DateCompareType): number => typeof received === 'string'
    ? new Date(received).getTime()
    : (
        received instanceof Date
            ? received.getTime()
            : received
    );

export const before: SimpleCompare<DateCompareType, Date> = than => value => value.getTime() < normalizeCompare(than);
export const after: SimpleCompare<DateCompareType, Date> = than => value => value.getTime() > normalizeCompare(than);
export const beforeOrNow: SimpleCompare<DateCompareType, Date> = than => value => value.getTime() <= normalizeCompare(than);
export const afterOrNow: SimpleCompare<DateCompareType, Date> = than => value => value.getTime() >= normalizeCompare(than);
export const around: MultiCompare<DateCompareType, Date> = (a, b) => value => value.getTime() >= normalizeCompare(a) && value.getTime() <= normalizeCompare(b);