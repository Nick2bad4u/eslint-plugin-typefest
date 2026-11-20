import type { IsEqual, ReadonlyDate } from "type-fest";

declare global {
    interface Date {
        typefestCalendarLabel: string;
        setTypefestCalendarLabel(label: string): void;
    }
}

export type CalendarDate = Readonly<Omit<Date, `set${string}`>>;
type Assert<T extends true> = T;
export type SameDate = Assert<IsEqual<CalendarDate, ReadonlyDate>>;
export type PreservesReader = Assert<
    IsEqual<ReadonlyDate["typefestCalendarLabel"], string>
>;
export type OmitsAddedSetter = Assert<
    IsEqual<Extract<keyof ReadonlyDate, "setTypefestCalendarLabel">, never>
>;
