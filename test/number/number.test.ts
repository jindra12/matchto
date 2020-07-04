import match, { Any } from '../../src/index';

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
});