import match, { Any, merge } from "../../src";

interface ComplexTestObject {
    id: number;
    name: string;
    address: string;
    phone?: [string | null, string]
    dateOfBirth: Date;
    workStatistics?: {
        isAlive: boolean;
        worksFromHome: boolean;
        jobTitle: string | null;    
    } | null;
    mail?: string;
}

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

const testObject2: ComplexTestObject = {
    id: 1,
    name: 'Oswald',
    address: 'Prague, Charles square',
    phone: ['+420', '555 111 222'],
    dateOfBirth: new Date(1990, 0, 2),
    workStatistics: null,
    mail: 'oswald@gmail.com',
};

const testObject3: ComplexTestObject = {
    id: 1,
    name: 'Oswald',
    address: 'Prague, Charles square',
    phone: [null, '555 111 222'],
    dateOfBirth: new Date(1990, 0, 2),
    workStatistics: {
        isAlive: true,
        worksFromHome: false,
        jobTitle: 'Plumber',
    },
    mail: 'oswald@gmail.com',
};

describe("Can match a complex object", () => {
    test("Match to an 'identity' object", () => {
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
    });
    test("Match to object with nullable properties", () => {
        expect(match(testObject2).to({
            name: 'Oswald',
            address: /Ostrava/,
            dateOfBirth: /1990/,
            workStatistics: {
                isAlive: true,
                jobTitle: null,
            }
        }, 'wrong').to({
            address: /Prague/,
            dateOfBirth: new Date(1990, 0, 2).toISOString(),
            phone: { 'any': '+420' },
            workStatistics: null,
        }, obj => obj.id).solve()).toBe(1);
        expect(match(testObject3).to({
            phone: [Any, '555 666 777'],
        }, 'wrong').to({
            phone: [null, Any]
        }, 'right').solve()).toBe('right');
    });
    test("Can use merger function", () => {
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
            one: Any,
            two: { 'last': [Any, 7] },
            three: { four: Any, five: Any },
            four: { date: /2020/ },
            five: Any,
            six: Any,
            seven: [1, Any, 3],
            eight: {
                nine: { 'seek': [5, Any, 7] },
                ten: { 'some': [Any, 5, 1, Any] },
            },
        }, (item, matched) => merge(item, matched)).solve()).toEqual({
            one: 1,
            two: { 'last': [6, 7] },
            three: { four: [1], five: { value: "6" } },
            four: { date: /2020/ },
            five: "simpleString",
            six: new Date(2020, 6, 6),
            seven: [1, 2, 3],
            eight: {
                nine: { seek: [5, 6, 7] },
                ten: { some: [5, 5, 1, 2] }, // Not recommended to use 'some' when merging
            },
        });
        expect(match('anyString').to(Any, (item, matched) => merge(item, matched)).solve()).toBe('anyString');
        expect(match(1).to(Any, (item, matched) => merge(item, matched)).solve()).toBe(1);
    });
});