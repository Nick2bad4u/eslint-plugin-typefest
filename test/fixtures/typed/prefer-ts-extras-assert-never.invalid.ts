type Fruit = "apple" | "banana" | "cherry";

function describe(fruit: Fruit): string {
    switch (fruit) {
        case "apple": {
            return "a crunchy red fruit";
        }

        case "banana": {
            return "a yellow tropical fruit";
        }

        case "cherry": {
            return "a small stone fruit";
        }

        default: {
            const _exhaustiveCheck: never = fruit;
            return _exhaustiveCheck;
        }
    }
}

String(describe("apple"));

export const __typedFixtureModule = "typed-fixture-module";
