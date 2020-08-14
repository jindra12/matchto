import { exact } from '../../src/utils/identity';

describe("Testing inner function of exact match of objects", () => {
    test("Numerical equality", () => {
        expect(exact(2, 2)).toBe(true);
        expect(exact(2, 3)).toBe(false);
    });
    test("String equality", () => {
        expect(exact("2", "2")).toBe(true);
        expect(exact("2", "3")).toBe(false);
    });
    test("Boolean equality", () => {
        expect(exact(true, true)).toBe(true);
        expect(exact(true, false)).toBe(false);
    });
    test("Date equality", () => {
        const date = new Date();
        const date1 = new Date();
        date.setFullYear(1111);
        expect(exact(date, date)).toBe(true);
        expect(exact(date, date1)).toBe(false);
    });
    test("Array equality", () => {
        expect(exact([2, 2], [2, 2])).toBe(true);
        expect(exact([2], [3])).toBe(false);
        expect(exact([2, 3], [3])).toBe(false);
        expect(exact([2], [3, 2])).toBe(false);
    });
    test("Object equality", () => {
        expect(exact({ a: 5 }, { a: 5 })).toBe(true);
        expect(exact({ b: 5 }, { a: 5 })).toBe(false);
        expect(exact({ a: 5 }, { a: 6 })).toBe(false);
    });
});