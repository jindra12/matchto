import match, { merge, Any } from "../../src";

class Man {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
}

class Woman {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
}

class Bob extends Man {
    constructor() {
        super('Bob');
    }
}

class John extends Man {
    constructor() {
        super('John');
    }
}

describe("Can match to a class by instance type", () => {
    test("Can identify and match class instances", () => {
        expect(match(new John())
            .to(Bob, false)
            .to(Woman, false)
            .to((() => ({})) as any, false)
            .to(John, true)
            .solve()).toBe(true);
        expect(match(new John())
            .to(Bob, false)
            .to(Woman, false)
            .to(Man, true)
            .solve()).toBe(true);        
    });
    test("Can identify class instances inside complex objects", () => {
        expect(match({
            one: new John(),
            two: new Bob(),
        }, 'all').to({
            one: Man,
        }, 'man').to({
            two: Woman,
        }, 'woman').to({
            two: Bob,
        }, 'Bob').to({
            one: new Man('John'),
        }, 'new').solve()).toEqual(['man', 'Bob', 'new']);
    });
    test("Can use merger function with matching over class instances", () => {
        expect(match(new John()).to(Man, ({ item, matched }) => merge(item, matched).name).solve()).toBe('John')
        expect(match({
            one: {
                two: new John(),
                three: [new Bob(), new Woman('Anne')],
            }
        }).to({
            one: {
                two: Man,
                three: [Bob, Any],
            }
        }, ({ item, matched }) => {
            const merged = merge(item, matched);
            return [merged.one.two.name, merged.one.three[0].name, merged.one.three[1].name];
        }).solve()).toEqual(['John', 'Bob', 'Anne']);
    });
    test("Can match to primitives", () => {
        type Arbitrary = { value: string | number };
        const test: Arbitrary = { value: 5 };
        expect(match(test, 'all')
            .to({ value: Number }, '1')
            .to({ value: String }, '2')
            .to({ value: 5 }, '3')
            .solve()).toEqual(['1', '3']);
    });
    test("Can identify an array or object based on construtor", () => {
        type Arbitrary = { value: Array<Arbitrary> | ({ item: string }) };
        const test: Arbitrary = {
            value: [
                {
                    value: [
                        {
                            value: {
                                item: 'First'
                            }
                        }
                    ]
                },
                {
                    value: {
                        item: 'Second'
                    }
                }
            ]
        };
        expect(match(test, 'all')
            .to({ value: Array }, ({ item, rematch }) => (item.value as []).map(rematch)).guard((item) => (item.value as []).length > 0)
            .to({ value: { item: String } }, ({ item }) => (item.value as { item: string }).item)
            .solve()
        ).toEqual([[['First'], 'Second']]);
    });
    test("Can match bigint and symbols", () => {
        expect(match(Symbol('4'), 'all')
            .to(Symbol('4'), '1')
            .to(Symbol('5'), '2')
            .to(Symbol, '3')
            .solve()).toEqual(['1', '3']);
        expect(match(BigInt(54), 'all')
            .to(BigInt(54), '1')
            .to(BigInt(55), '2')
            .to(BigInt, '3')
            .solve()).toEqual(['1', '3'])
    });
    test("Can merge primitive classes", () => {
        const date = new Date();
        expect(
            match({
                str: '1',
                bool: true,
                num: 1,
                date,
                object: {},
                array: [],
            }).to({
                str: String,
                bool: Boolean,
                num: Number,
                date: Date,
                object: Object,
                array: Array,
            }, ({ item, matched }) => merge(item, matched)).solve()
        ).toEqual({
            str: '1',
            bool: true,
            num: 1,
            date,
            object: {},
            array: [],
        });
    });
});