interface User {
    readonly id: number;
    readonly name: string | undefined;
    readonly email: string | undefined;
}

declare const users: readonly User[];

const namedUsers = users.filter((user) => user.name !== undefined);
const usersWithEmail = users.filter((user) => user.email !== undefined);
const strictTypeof = users.filter((user) => typeof user.name !== "undefined");

String(namedUsers.length + usersWithEmail.length + strictTypeof.length);

export const __typedFixtureModule = "typed-fixture-module";
