# Matchto documentation

Easy to use, typed, no dependency library which takes care of pattern matching, with appropriately typed API.

## Basic matching modes:

1) Will return first passed match: 'first' - default
2) Will throw an error if there is more than one match: 'break'
3) Will return last passed match: 'last'
4) Will return all matches in array: 'all'

## Possible comparison modes for each data type:

1) string: Can compare to 'Any'*, another string or regex
2) number: Can compare to 'Any'*, or another number (same for boolean or bigint)
3) object: Can compare with (partial) object or 'Any'*
4) Date: Can compare with another date, 'Any'*, string, regex or number (will use ISO string format)


*Any is a pre-made constant used for 'Dont care' option. If you leave a field in compared object as undefined, it will have the same effect.

Typing for each comparison correctly matches the possible comparsion types explained above.
This library supports the use of guard conditions. The guard condition is counted as a part of the match expression,
which means that 'first', 'last' or 'break' mode will treat a matched expression with failed guard as unmatched.

The library will not compare functions.

## Examples (from unit tests)

### Simple numerical comparison

```typescript

expect(match(2).to(1, 'wrong').to(2, 'right').solve()).toBe('right');
expect(match([1, 2, 3]).to({ 'any': 2 }, 'right').to({ 'any': 4 }, 'wrong').solve()).toBe('right'); // 'any' means match any of arrays elements
expect(match([1, 2, 3]).to([Any, Any, 3], 'right').to([Any, Any, 4], 'wrong').solve()).toBe('right');
expect(match({ one: 1, two: 2, three: { four: 4 } }).to({ one: 1 }, ({ item }) => item.one).to({ one: 5 }, 'wrong').solve()).toBe(1);

```

### String/Regex comparison

```typescript

expect(match('Hello').to('Hello', 'right').to('World', 'wrong').solve()).toBe('right');
expect(match('Hello').to(Any, 'right').to('World', 'wrong').solve()).toBe('right');
expect(match('Helllllo').to(/^Hel*o$/, 'right').to('World', 'wrong').solve()).toBe('right');
expect(match('Helllllo').to(new RegExp('^Hel*o$'), 'right').to('World', 'wrong').solve()).toBe('right');

expect(match('Wooorld').to(/W.*/, 'wrong').guard(s => s.length === 3).to(/Wo*rld/, 'right').guard(s => s === 'Wooorld').solve()).toBe('right');

```

### Date comparison

```typescript

expect(match([dateO, dateR]).to({ 'any': dateR.getTime() }, 'right').to({ 'any': dateW.getTime() }, 'wrong').solve()).toBe('right');
expect(match({ date: dateR }, 'all').to({ date: /2020/ }, 'right').to({ date: /2021/ }, 'wrong').solve()).toEqual(['right']);

```

### Example of null/undefined checks

```typescript

const arrays = [
    [1, 2, 3],
    [4, 5, 6],
    null,
    undefined
];
expect(match(arrays[0]).to(undefined, '1').to([1, Any, 3], '2').solve()).toBe('2');
expect(match(arrays[1]).to(null, '1').to([4, Any, 6], '2').solve()).toBe('2');
expect(match(arrays[2]).to([1, Any, 3], '1').to(null, '2').solve()).toBe('2');
expect(match(arrays[3]).to([1, Any, 3], '1').to(undefined, '2').solve()).toBe('2');

```

### Example of complex object matching

```typescript

const testObject1: ComplexTestObject = {
    id: 1,
    name: 'Oswald',
    address: 'Prague, Charles square',
    phone: ['+420', '555 111 222'],
    dateOfBirth: new Date(1990, 0, 2),
    workStatistics: {
        isAlive: true,
        worksFromHome: false,
        jobTitle: 'Plumber',
    },
    mail: 'oswald@gmail.com',
};

expect(match(testObject1).to({
    address: /Ostrava/,
    dateOfBirth: /1990/,
    workStatistics: {
        isAlive: true,
    }
}, 'wrong').to({
    address: /Prague/,
    dateOfBirth: new Date(1990, 0, 2).toISOString(),
    phone: { 'any': '+420' },
    name: 'Oswald',
    workStatistics: {
        worksFromHome: Any,
        jobTitle: /P.*/
    }
}, ({ item }) => item.id).solve()).toBe(1);

```

### Example of utilities function pattern matching


```typescript

expect(match({ a: 2, b: 3, c: 4, d: { e: 5 } }).to({
    a: mod(2, 1),
    b: less(4),
    c: moreOrEqual(1),
    d: { e: lessOrEqual(6) }
}, 'wrong').to({
    a: mod(2),
    b: less(4),
    c: moreOrEqual(1),
    d: { e: lessOrEqual(6) }
}, 'right').solve()).toBe('right');

// Pattern matching with dates enhanced by functions
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

expect(match('Carl', 'all')
    .to(less('Adam'), 'wrong')
    .to(more('Adam'), 'right')
    .to(between('Adam', 'Zeta'), 'right')
    .solve()).toEqual(['right', 'right']);

```

### Example of advanced pattern matching in arrays

```typescript

expect(match([4, 5, { one: 7 }, 8, 7, 9])
    .to({ seek: [{ one: 7 }, 7, 8] }, 'wrong')
    .to({ seek: [5, { one: 7 }, 8] }, 'right').solve()).toBe('right');

expect(match([1, 2, 3, 4]).to({ 'last': [2, 3] }, 'wrong').to({ 'last': [3, 4] }, 'right').solve()).toBe('right');

expect(match([1, 2, { one: 7 }, 9]).to({ 'some': [2, 7] }, 'wrong').to({ 'some': [{ one: 7 }, 1] }, 'right').solve()).toBe('right');

```

### Example of pattern matching with getting which match was found

```typescript

expect(match([1, 2, 3], 'all')
    .to({ any: 2 }, ({ matched }) => matched.any)
    .to({ any: 3 }, ({ matched }) => matched.any).solve()
).toEqual([2, 3]);

```

### Pattern matching using not() function

```typescript

expect(match({ one: 1, two: 2, three: [3, 4] })
    .to({ one: 1, two: 2 }, 'wrong').not()
    .to({ three: { 'last': [4, 3] } }, 'right').not().solve()
).toBe('right');

```

### Example of using the util function 'merge' to create new objects based on patterns

```typescript
expect(match('anyString').to(Any, ({ item, matched }) => merge(item, matched)).solve()).toBe('anyString');
expect(match(1).to(Any, ({ item, matched }) => merge(item, matched)).solve()).toBe(1);

expect(match({
    one: 1,
    two: [5, 6, 7],
    three: { four: [1], five: { value: "6" } },
    four: { date: new Date(2020, 6, 6) },
    five: "simpleString",
    six: new Date(2020, 6, 6),
    seven: [1, 2, 3],
    eight: {
        nine: [4, 5, 6, 7],
        ten: [5, 5, 3, 2, 1],
    },
}).to({
    one: Any, // Any will be converted by merger function into whatever value was passed into it
    two: { 'last': [Any, 7] },
    three: { four: Any, five: Any },
    four: { date: new Date(2020, 6, 6) },
    five: /simple/, // <--- regex will now be converted into "simpleString" by merger function
    six: Any,
    seven: [1, Any, less(5)], // <--- less(5) will now be converted into 3 by merger function
    eight: {
        nine: { 'seek': [5, Any, 7] },
        ten: { 'some': [Any, 5, 1, Any] },
    },
}, ({ item, matched }) => merge(item, matched)).solve()).toEqual({
    one: 1,
    two: { 'last': [6, 7] },
    three: { four: [1], five: { value: "6" } },
    four: { date: new Date(2020, 6, 6) },
    five: "simpleString",
    six: new Date(2020, 6, 6),
    seven: [1, 2, 3],
    eight: {
        nine: { seek: [5, 6, 7] },
        ten: { some: [5, 5, 1, 2] }, // Not recommended to use 'some' when merging
    },
});

```

### Example of pattern matching using end-tail recursion

```typescript

test("Can use pattern matching to create factorial", () => {
    expect(
        match(5)
            .to(1, 1)
            .to(Any, ({ item, rematch }) => item * rematch(item - 1))
            .solve()
    ).toBe(120);
});
test("Can use pattern matching to create fibonacci sequence", () => {
    expect(
        match([0, 1, 5])
            .to([Any, Any, 0], ({ item }) => [item[0], item[1]])
            .to(Any, ({ item, rematch }) => rematch([item[1], item[0] + item[1], item[2] - 1]))
            .solve()
    ).toEqual([5, 8]);
});

```

### Example of using 'cut' function for red/green cuts and defining prolog-like variables

```typescript

test("Can use 'identity' to define prolog-like facts and queries", () => {
    /* Example from: http://www.learnprolognow.org/lpnpage.php?pagetype=html&pageid=lpn-htmlse44
        max(X,Y,Y)  :-  X  =<  Y,!.
        max(X,Y,X). 
        */
    expect(
        match([2, 5, 5], 'all')
            .to([id("X"), id("Y"), id("Y")]).guard(item => item[0] <= item[1]).cut()
            .to([id("X"), id("Y"), id("X")])
            .solve()
            .find(result => Boolean(result))
    ).toBe(true);
    expect(
        match([2, 3, 5], 'all')
            .to([id("X"), id("Y"), id("Y")]).guard(item => item[0] <= item[1]).cut()
            .to([id("X"), id("Y"), id("X")])
            .solve()
    ).toEqual([]);
});
test("Can still merge even when using identity", () => {
    expect(
        match([1, 2, 2])
            .to([Any, id("X"), id("X")], ({ item, matched }) => merge(item, matched))
            .solve()
    ).toEqual([1, 2, 2])
});
test("Can extract identity value", () => {
    expect(
        match([1, 2, 3, 3])
            .to([1, id("Y"), id("X"), id("X")], ({ id }) => (id("X") + id("Y")) as number)
            .solve()
    ).toBe(5);
});

```

### Use pattern matching to do instanceof operation

```typescript

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

```

### Can match based on primitive values by using constructors

```typescript

type Arbitrary = { value: string | number };
const test: Arbitrary = { value: 5 };
expect(match(test, 'all')
    .to({ value: Number }, '1')
    .to({ value: String }, '2')
    .to({ value: 5 }, '3')
    .solve()).toEqual(['1', '3']);

```

### Can merge item with matched value by using constructors

```typescript

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

```

### Can use plugins to further customize pattern matching -- CAUTION: EXPERIMENTAL, USE AT OWN RISK

If a plugin function returns true, match is valid. If false, invalid. If undefined, match continues as-is.

```typescript

expect(match({
    a: 5,
    b: 7,
    c: {
        d: [1],
    }
}, "first", [(a, b) => (Array.isArray(a) && Array.isArray(b) ? true : undefined)]).to({ c: { d: [5] } }).solve()).toBeTruthy();

```

### Can use functors as objects during match

If you create a functor with enumerable properties, it will match as if it was an object

```typescript

const f1 = functorFactory(() => 5, { a: 5, b: 6 }); // creates a functor with properties a: 5 and b: 6
const f2 = functorFactory(() => 6, { b: 6 });
const f3 = functorFactory(() => 7, { b: 7 });
expect(match(f1).to(f2).solve()).toBeTruthy();
expect(match(f3).to(f2).solve()).toBeFalsy();

```

## Footer

If you notice any bugs or errors, do not hesitate to create an issue or a pull request!
