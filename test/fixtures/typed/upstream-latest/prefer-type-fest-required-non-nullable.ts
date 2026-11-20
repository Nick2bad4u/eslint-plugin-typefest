export type Present<Input> = {
    [Field in keyof Input]-?: NonNullable<Input[Field]>;
};

export type PresentObject<Source extends object = { value?: string | null }> = {
    [Property in keyof Source]-?: NonNullable<Source[Property]>;
};
