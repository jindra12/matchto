import match, { Any, mod, less, moreOrEqual, lessOrEqual, between, more } from '../../src/index';

describe("Can match numeric arrays, objects and values", () => {
    test("Can match an item to an item", () => {
        expect(match(2).to(1, 'wrong').to(2, 'right').solve()).toBe('right');
        expect(match(2).to(2, 'right').to(2, 'wrong').solve()).toBe('right'); 
    });
    test("Can match to an array", () => {
        expect(match([1, 2, 3]).to([2], 'wrong').to([1], 'right').solve()).toBe('right');
        expect(match([1, 2, 3]).to({ 'any': 2 }, 'right').to({ 'any': 4 }, 'wrong').solve()).toBe('right');
        expect(match([1, 2, 3]).to([Any, Any, 3], 'right').to([Any, Any, 4], 'wrong').solve()).toBe('right');
    });
    test("Can match to an object", () => {
        expect(match({ one: 1, two: 2, three: { four: 4 } }).to({ one: 1, two: Any, three: { four: Any } }, 'right').solve()).toBe('right');
        expect(match({ one: 1, two: 2, three: { four: 4 } }).to({ one: Any, two: 2, three: { four: 4 } }, 'right').solve()).toBe('right');
        expect(match({ one: 1, two: 2, three: { four: 4 } }).to({ one: 1, two: Any, three: { four: Any } }, 'right').solve()).toBe('right');
        expect(match({ one: 1, two: 2, three: { four: 4 } }).to({ one: 1, two: Any, three: { four: Any } }, 'right').solve()).toBe('right');
        expect(match({ one: 1, two: 2, three: { four: 4 } }).to({ one: 1 }, 'right').to({ one: 2 }, 'wrong').solve()).toBe('right');
        expect(match({ one: 1, two: 2, three: { four: 4 } }).to({ one: 1 }, 'right').to({ one: 3 }, 'wrong').solve()).toBe('right');
        expect(match({ one: 1, two: 2, three: { four: 4 } }).to({ one: 1 }, 'right').to({ one: 4 }, 'wrong').solve()).toBe('right');
        expect(match({ one: 1, two: 2, three: { four: 4 } }).to({ one: 1 }, item => item.one).to({ one: 5 }, 'wrong').solve()).toBe(1);
    });
    test("Can match all conditions", () => {
        expect(match(2, 'all').to(2, 'right').to(2, 'right').to(3, 'wrong').solve()).toEqual(['right', 'right']);
        expect(match(2, 'all').to(2, 'right').to(2, 'right').to(3, 'wrong').solve()).toEqual(['right', 'right']);
        expect(match({ two: 2 }, 'all').to({ two: Any }, 'right').to({ two: 2 }, 'right').to({ two: 3 }, 'wrong').solve()).toEqual(['right', 'right']);
    });
    test("Can match last condition", () => {
        expect(match(2, 'last').to(2, 'wrong').to(2, 'right').to(3, 'wrong').solve()).toEqual('right');
        expect(match(2, 'last').to(2, 'wrong').to(2, 'right').to(3, 'wrong').solve()).toEqual('right');
        expect(match({ two: 2 }, 'last').to({ two: Any }, 'wrong').to({ two: 2 }, 'right').to({ two: 3 }, 'wrong').solve()).toEqual('right');
    });
    test("Won't break in break mode if one condition is true", () => {
        expect(match(2, 'break').to(2, 'right').to(3, 'wrong').solve()).toEqual('right');
        expect(match(2, 'break').to(2, 'right').to(3, 'wrong').solve()).toEqual('right');
        expect(match({ two: 2 }, 'break').to({ two: 2 }, 'right').to({ two: 3 }, 'wrong').solve()).toEqual('right');
    });
    test("Guard condition test", () => {
        expect(match(2, 'break').to(2, 'right').to(2, 'wrong', c => c > 3).to(3, 'wrong').solve()).toEqual('right');
        expect(match(2, 'last').to(2, 'wrong').to(2, 'right').to(2, 'right', c => c === 2).to(2, 'wrong', c => c !== 2).to(3, 'wrong').solve()).toEqual('right');
        expect(match(2, 'all').to(2, 'right', c => c % 2 === 0).to(2, 'right', c => c === 2).to(3, 'wrong', c => c === 2).solve()).toEqual(['right', 'right']);
    });
    test("Can match with provided number comparison functions", () => {
        expect(match({ a: 2, b: 3, c: 4, d: { e: 5 }, f: 3 }).to({
            a: mod(2, 1),
            b: less(4),
            c: moreOrEqual(1),
            d: { e: lessOrEqual(6) }
        }, 'wrong').to({
            a: mod(2),
            b: less(4),
            c: moreOrEqual(1),
            d: { e: lessOrEqual(6) },
            f: between(2, 3),
        }, 'right').solve()).toBe('right');
    });
    test("Can seek a particular sequence in array", () => {
        expect(match([4, 5, { one: 7 }, 8, 7, 9])
            .to({ seek: [{ one: 7 }, 7, 8] }, 'wrong')
            .to({ seek: [5, { one: 7 }, 8] }, 'right').solve()).toBe('right');
        expect(match([4, 5, { one: 7 }, 8, 7, 9])
            .to({ seek: [{ one: 7 }, 7, 8] }, 'wrong')
            .to({ seek: [4, 5, { one: more(6) }, 8, 7, 9] }, 'right').solve()).toBe('right');
    });
    test("Can find exactly what was matched in 'all' mode", () => {
        expect(match([1, 2, 3], 'all')
            .to({ any: 2 }, (_, matched) => matched.any)
            .to({ any: 3 }, (_, matched) => matched.any).solve()
        ).toEqual([2, 3])
    });
    test("Can find ending sequence in an array", () => {
        expect(match([1, 2, 3, 4]).to({ 'last': [2, 3] }, 'wrong').to({ 'last': [3, 4] }, 'right').solve()).toBe('right');
    });
    test("Can find sequence scattered in array", () => {
        expect(match([1, 2, { one: 7 }, 9]).to({ 'some': [2, 7] }, 'wrong').to({ 'some': [{ one: 7 }, 1] }, 'right').solve()).toBe('right');
    });
    test("Can use negation in match", () => {
        expect(match({ one: 1, two: 2, three: [3, 4] })
            .to({ one: 1, two: 2 }, 'wrong').not()
            .to({ three: { 'last': [4, 3] } }, 'right').not().solve()
        ).toBe('right');
    });
    test("Can use pattern matching to create factorial", () => {
        expect(
            match(5)
                .to(1, 1)
                .to(Any, (item, _, rematch) => item * rematch(item - 1))
                .solve()
        ).toBe(120);
    });
    test("Can use pattern matching to create fibonacci sequence", () => {
        expect(
            match([0, 1, 5])
                .to([Any, Any, 0], item => [item[0], item[1]])
                .to(Any, (item, _, rematch) => rematch([item[1], item[0] + item[1], item[2] - 1]))
                .solve()
        ).toEqual([5, 8]);
    });
});