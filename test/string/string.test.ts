import match, { Any, less, more, between } from "../../src";

describe("Can match string arrays, objects and values", () => {
    test("Can match a string to a string", () => {
        expect(match('Hello').to('Hello', 'right').to('World', 'wrong').solve()).toBe('right');
        expect(match('Hello').to(Any, 'right').to('World', 'wrong').solve()).toBe('right');
        expect(match('Helllllo').to(/^Hel*o$/, 'right').to('World', 'wrong').solve()).toBe('right');
        expect(match('Helllllo').to(new RegExp('^Hel*o$'), 'right').to('World', 'wrong').solve()).toBe('right');
    });
    test("Can match a string array", () => {
        expect(match(['Hello', 'Helllo']).to(['Hello', Any], 'right').to(['World', Any], 'wrong').solve()).toBe('right');
        expect(match(['Hello', 'Helllo']).to({ 'any': /^Hel*o$/ }, 'right').solve()).toBe('right');
        expect(match(['Hello', 'World', 'No']).to([/^Hel*o$/, /W.*/], 'right').solve()).toBe('right');
        expect(match(['Hello', 'World', 'No']).to([/^Hel*o$/, 'No'], 'wrong').to([/^Hel*o$/], 'right').solve()).toBe('right');
    });
    test("Can match a string inside an object", () => {
        expect(match({ Hello: 'Hello', World: { No: 'World', Yes: 'Yes' } }).to({ Hello: 'No' }, 'wrong').to({ World: { No: /W.*/ } }, 'right').solve()).toBe('right');
    });
    test("Can match a string with guard condition", () => {
        expect(match('Wooorld').to(/W.*/, 'wrong').guard(s => s.length === 3).to(/Wo*rld/, 'right').guard(s => s === 'Wooorld').solve()).toBe('right');
    });
    test("Can match a string with alphabetical comparison", () => {
        expect(match('Carl', 'all')
            .to(less('Adam'), 'wrong')
            .to(more('Adam'), 'right')
            .to(between('Adam', 'Zeta'), 'right')
            .solve()).toEqual(['right', 'right']);
    });
});