import match, { Any, around, before, after, beforeOrNow, afterOrNow } from "../../src";

const dateR = new Date(2020, 6, 4, 16, 44, 32, 0);
const dateW = new Date(2020, 6, 4, 16, 44, 33, 0);
const date1 = new Date(2020, 6, 4, 16, 44, 34, 0);
const date2 = new Date(2020, 6, 4, 16, 44, 35, 0);
const date3 = new Date(2020, 6, 4, 16, 44, 36, 0);
const date4 = new Date(2020, 6, 4, 16, 44, 37, 0);

describe("Can match Date with string, numerical, regex and object representation", () => {
    test("Can match a Date to a Date", () => {
        expect(match(dateR).to(dateR, ({ item }) => item.getTime()).to(dateW, 'wrong').solve()).toBe(dateR.getTime());
    });
    test("Can match a Date array", () => {
        expect(match([date1, dateR]).to({ 'any': dateR.getTime() }, 'right').to({ 'any': dateW.getTime() }, 'wrong').solve()).toBe('right');
        expect(match([date1, dateR]).to([date1, dateR], 'right').solve()).toBe('right');
        expect(match([date1, dateR]).to([Any, dateR], 'right').solve()).toBe('right');
    });
    test("Can match a Date inside an object", () => {
        expect(match({ date: dateR }, 'all').to({ date: /2020/ }, 'right').to({ date: /2021/ }, 'wrong').solve()).toEqual(['right']);
    });
    test("Can match a Date with guard condition", () => {
        expect(match(dateR)
            .to(dateR.toISOString(), 'wrong').guard(date => date.getTime() === dateW.getTime())
            .to(dateR.toISOString(), 'right').guard(date => date.getTime() === dateR.getTime()).solve()).toEqual('right');
    });
    test("Can match dates with comparator functions", () => {
        expect(match(date2)
            .to(around(date3.toISOString(), date4.getTime()), 'wrong')
            .to(around(date1, date3), 'right').solve()).toBe('right');
        expect(match({ d: date3 })
            .to({ d: before(date1) }, 'wrong')
            .to({ d: before(date4.getTime()) }, 'right').solve()).toBe('right');
        expect(match({ d: date3 })
            .to({ d: after(date4.toISOString()) }, 'wrong')
            .to({ d: after(date1) }, 'right').solve()).toBe('right');
        expect(match({ d: date3 }, 'all')
            .to({ d: beforeOrNow(date1) }, 'wrong')
            .to({ d: beforeOrNow(date4.getTime()) }, 'right')
            .to({ d: beforeOrNow(date3.toISOString()) }, 'right').solve()).toEqual(['right', 'right']);
        expect(match({ d: date3 }, 'all')
            .to({ d: afterOrNow(date4) }, 'wrong')
            .to({ d: afterOrNow(date1) }, 'right')
            .to({ d: afterOrNow(date3) }, 'right').solve()).toEqual(['right', 'right']);
    });
});