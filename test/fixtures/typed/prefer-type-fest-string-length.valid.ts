import type { StringLength, StringToArray } from "type-fest";

type EventName = "user.created";
type EventNameLength = StringLength<EventName>;
type EventNameParts = StringToArray<EventName>;
type NonLiteralParts = StringToArray<
    string,
    { mapNonLiteralsDirectly: true }
>["length"];
