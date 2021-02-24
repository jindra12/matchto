import match from "../../src";

describe("Can use plugins to customize pattern matching", () => {
    test("Ignores plugin fn when returns undefined", () => {
        expect(match({
            a: 5,
            b: 7,
            c: {
                d: [1],
            }
        }, "first", [(_, __) => undefined]).to({ b: 7 }).solve()).toBeTruthy();
    });
    test("When plugin returns true, match is valid", () => {
        expect(match({
            a: 5,
            b: 7,
            c: {
                d: [1],
            }
        }, "first", [(a, b) => (Array.isArray(a) && Array.isArray(b) ? true : undefined)]).to({ c: { d: [5] } }).solve()).toBeTruthy();
    });
    test("When plugin returns false, match is invalid", () => {
        expect(match({
            a: 5,
            b: 7,
            c: {
                d: [1],
            }
        }, "first", [(a, b) => (Array.isArray(a) && Array.isArray(b) ? false : undefined)]).to({ c: { d: [1] } }).solve()).toBeFalsy();
    });
});