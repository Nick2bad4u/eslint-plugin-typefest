import type { StringToArray } from "type-fest";

type EventName = "user.created";
type EventNameLength = StringToArray<EventName>["length"];
