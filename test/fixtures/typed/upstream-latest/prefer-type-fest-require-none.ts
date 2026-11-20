export type Forbidden<Keys extends PropertyKey> = {
    [Field in Keys]?: never;
};

export type ForbiddenByDefault<Fields extends PropertyKey = "debug"> = {
    [Field in Fields]+?: never;
};
