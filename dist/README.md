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
expect(match({ one: 1, two: 2, three: { four: 4 } }).to({ one: 1 }, item => item.one).to({ one: 5 }, 'wrong').solve()).toBe(1);

```

### String/Regex comparison

```typescript

expect(match('Hello').to('Hello', 'right').to('World', 'wrong').solve()).toBe('right');
expect(match('Hello').to(Any, 'right').to('World', 'wrong').solve()).toBe('right');
expect(match('Helllllo').to(/^Hel*o$/, 'right').to('World', 'wrong').solve()).toBe('right');
expect(match('Helllllo').to(new RegExp('^Hel*o$'), 'right').to('World', 'wrong').solve()).toBe('right');

// Third parameter is a guard condition
expect(match('Wooorld').to(/W.*/, 'wrong', s => s.length === 3).to(/Wo*rld/, 'right', s => s === 'Wooorld').solve()).toBe('right');

```

### Date comparison

```typescript

expect(match([dateO, dateR]).to({ 'any': dateR.getTime() }, 'right').to({ 'any': dateW.getTime() }, 'wrong').solve()).toBe('right');
expect(match({ date: dateR }, 'all').to({ date: /2020/ }, 'right').to({ date: /2021/ }, 'wrong').solve()).toEqual(['right']);

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
}, obj => obj.id).solve()).toBe(1);

```

If you notice any bugs or errors, do not hesitate to create an issue or a pull request!
