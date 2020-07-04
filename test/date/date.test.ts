import match, { Any } from "../../src";

const dateR = new Date(2020, 6, 4, 16, 44, 32, 0);
const dateW = new Date(2020, 6, 4, 16, 44, 33, 0);
const dateO = new Date(2020, 6, 4, 16, 44, 34, 0);

describe("Can match Date with string, numerical, regex and object representation", () => {
    test("Can match a Date to a Date", () => {
        expect(match(dateR).to(dateR, date => date.getTime()).to(dateW, 'wrong').solve()).toBe(dateR.getTime());
    });
    test("Can match a Date array", () => {
        expect(match([dateO, dateR]).to({ 'any': dateR.getTime() }, 'right').to({ 'any': dateW.getTime() }, 'wrong').solve()).toBe('right');
        expect(match([dateO, dateR]).to([dateO, dateR], 'right').solve()).toBe('right');
        expect(match([dateO, dateR]).to([Any, dateR], 'right').solve()).toBe('right');
    });
    test("Can match a Date inside an object", () => {
        expect(match({ date: dateR }, 'all').to({ date: /2020/ }, 'right').to({ date: /2021/ }, 'wrong').solve()).toEqual(['right']);
    });
    test("Can match a Date with guard condition", () => {
        expect(match(dateR)
            .to(dateR.toISOString(), 'wrong', date => date.getTime() === dateW.getTime())
            .to(dateR.toISOString(), 'right', date => date.getTime() === dateR.getTime()).solve()).toEqual('right');
    });
});