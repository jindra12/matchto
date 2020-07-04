import match, { Any } from "../../src";

interface ComplexTestObject {
    id: number;
    name: string;
    address: string;
    phone?: [string, string]
    dateOfBirth: Date;
    workStatistics?: {
        isAlive: boolean;
        worksFromHome: boolean;
        jobTitle: string;    
    }
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
});