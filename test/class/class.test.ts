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
});