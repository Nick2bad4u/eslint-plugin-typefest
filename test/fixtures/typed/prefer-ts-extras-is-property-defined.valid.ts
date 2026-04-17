import { isPropertyDefined } from "ts-extras";

interface User {
    readonly id: number;
    readonly name: string | undefined;
    readonly email: string | undefined;
}

declare const users: readonly User[];

const namedUsers = users.filter(isPropertyDefined("name"));
const usersWithEmail = users.filter(isPropertyDefined("email"));

String(namedUsers.length + usersWithEmail.length);

export const __typedFixtureModule = "typed-fixture-module";
