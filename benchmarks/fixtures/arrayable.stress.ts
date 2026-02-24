type MetricSet0 = number | number[];
type MetricSet1 = string | string[];
type MetricSet2 = boolean | boolean[];
type MetricSet3 = Date | Date[];
type MetricSet4 = bigint | bigint[];
type MetricSet5 = symbol | symbol[];
type MetricSet6 = number | number[];
type MetricSet7 = string | string[];
type MetricSet8 = boolean | boolean[];
type MetricSet9 = Date | Date[];
type MetricSet10 = bigint | bigint[];
type MetricSet11 = symbol | symbol[];

declare const now: Date;
declare const id: symbol;

declare function record0(value: MetricSet0): void;
declare function record1(value: MetricSet1): void;
declare function record2(value: MetricSet2): void;
declare function record3(value: MetricSet3): void;
declare function record4(value: MetricSet4): void;
declare function record5(value: MetricSet5): void;
declare function record6(value: MetricSet6): void;
declare function record7(value: MetricSet7): void;
declare function record8(value: MetricSet8): void;
declare function record9(value: MetricSet9): void;
declare function record10(value: MetricSet10): void;
declare function record11(value: MetricSet11): void;

record0(1);
record1("alpha");
record2(true);
record3(now);
record4(1n);
record5(id);
record6([
    1,
    2,
    3,
]);
record7(["bravo", "charlie"]);
record8([false, true]);
record9([now]);
record10([2n, 3n]);
record11([id]);

export const arrayableStressFixture = "benchmark-arrayable";
