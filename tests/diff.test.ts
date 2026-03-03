import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { type Diff, DIFF_TYPE, diff } from "../src/index.js";

describe("basic diffs", () => {
    test("identical objects", () => {
        const oldObj = { a: 1, b: "two" };
        const newObj = { a: 1, b: "two" };
        const expectedDiffs = [] as Diff[];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("new value", () => {
        const oldObj = { test: true };
        const newObj = { test: true, test2: true };
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CREATE,
                path: ["test2"],
                value: true,
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("value to other value", () => {
        const oldObj = { test: true };
        const newObj = { test: false };
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CHANGE,
                path: ["test"],
                value: false,
                oldValue: true,
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("remove value", () => {
        const oldObj = { test: true, test2: true };
        const newObj = { test: true };
        const expectedDiffs = [
            {
                type: DIFF_TYPE.REMOVE,
                path: ["test2"],
                oldValue: true,
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("replace object with null", () => {
        const oldObj = { object: { test: true } };
        const newObj = { object: null };
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CHANGE,
                path: ["object"],
                value: null,
                oldValue: { test: true },
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("replace object with other value", () => {
        const oldObj = { object: { test: true } };
        const newObj = { object: "string" };
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CHANGE,
                path: ["object"],
                value: "string",
                oldValue: { test: true },
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("nested object", () => {
        const oldObj = { a: { b: 1 } };
        const newObj = { a: { b: 2 } };
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CHANGE,
                path: ["a", "b"],
                value: 2,
                oldValue: 1,
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("replace null with object", () => {
        const oldObj = { object: null };
        const newObj = { object: { test: true } };
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CHANGE,
                path: ["object"],
                value: { test: true },
                oldValue: null,
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("multiple changes", () => {
        const oldObj = { a: 1, b: 2, c: 3 };
        const newObj = { a: 1, b: 5, d: 4 };
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CHANGE,
                path: ["b"],
                value: 5,
                oldValue: 2,
            },
            {
                type: DIFF_TYPE.REMOVE,
                path: ["c"],
                oldValue: 3,
            },
            {
                type: DIFF_TYPE.CREATE,
                path: ["d"],
                value: 4,
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("equal null prototype objects", () => {
        const oldObj = Object.create(null);
        const newObj = Object.create(null);
        const expectedDiffs = [] as Diff[];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("unequal null prototype objects", () => {
        const oldObj = Object.create(null);
        const newObj = Object.create(null);
        newObj.test = true;
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CREATE,
                path: ["test"],
                value: true,
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });
});

describe("arrays diffs", () => {
    test("top level array", () => {
        const oldObj = ["test", "testing"];
        const newObj = ["test"];
        const expectedDiffs = [
            {
                type: DIFF_TYPE.REMOVE,
                path: [1],
                oldValue: "testing",
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("nested array", () => {
        const oldObj = ["test", ["test"]];
        const newObj = ["test", ["test", "test2"]];
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CREATE,
                path: [1, 1],
                value: "test2",
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("object in array in object", () => {
        const oldObj = { test: ["test", { test2: true }] };
        const newObj = { test: ["test", { test2: false }] };
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CHANGE,
                path: ["test", 1, "test2"],
                value: false,
                oldValue: true,
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("array to object", () => {
        const oldObj = { data: [] };
        const newObj = { data: { val: "test" } };
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CHANGE,
                path: ["data"],
                value: { val: "test" },
                oldValue: [],
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("object to array", () => {
        const oldObj = { data: { val: "test" } };
        const newObj = { data: [] };
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CHANGE,
                path: ["data"],
                value: [],
                oldValue: { val: "test" },
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });
});

describe("primitive diffs", () => {
    test("equal strings", () => {
        const oldObj = { string: "hi" };
        const newObj = { string: "hi" };
        const expectedDiffs = [] as Diff[];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("unequal strings", () => {
        const oldObj = { string: "hi" };
        const newObj = { string: "hello" };
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CHANGE,
                path: ["string"],
                value: "hello",
                oldValue: "hi",
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("equal numbers", () => {
        const oldObj = { number: 1 };
        const newObj = { number: 1 };
        const expectedDiffs = [] as Diff[];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("unequal numbers", () => {
        const oldObj = { number: 1 };
        const newObj = { number: 2 };
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CHANGE,
                path: ["number"],
                value: 2,
                oldValue: 1,
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });
});

describe("cyclic diffs", () => {
    test("recursive references", () => {
        const oldObj = {} as Record<string, unknown>;
        oldObj.a = oldObj;
        const newObj = oldObj;
        const expectedDiffs = [] as Diff[];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("nested recursive references", () => {
        const oldObj = { a: {} };
        (oldObj.a as Record<string, unknown>).b = oldObj;
        const newObj = oldObj;
        const expectedDiffs = [] as Diff[];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("detectCycles disabled", () => {
        const oldObj = { a: 1, b: { c: 2 } };
        const newObj = { a: 1, b: { c: 3 } };
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CHANGE,
                path: ["b", "c"],
                value: 3,
                oldValue: 2,
            },
        ];
        const diffs = diff(oldObj, newObj, { detectCycles: false });
        assert.deepStrictEqual(diffs, expectedDiffs);
    });
});

describe("date diffs", () => {
    test("equal dates", () => {
        const oldObj = { date: new Date(1) };
        const newObj = { date: new Date(1) };
        const expectedDiffs = [] as Diff[];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("unequal dates", () => {
        const oldObj = { date: new Date(1) };
        const newObj = { date: new Date(2) };
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CHANGE,
                path: ["date"],
                value: new Date(2),
                oldValue: new Date(1),
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("date to primitive", () => {
        const oldObj = { date: new Date(1) };
        const newObj = { date: "not date" };
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CHANGE,
                path: ["date"],
                value: "not date",
                oldValue: new Date(1),
            },
        ];
        assert.deepStrictEqual(diff(oldObj, newObj), expectedDiffs);
    });

    test("primitive to date", () => {
        const oldObj = { date: "not date" };
        const newObj = { date: new Date(1) };
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CHANGE,
                path: ["date"],
                value: new Date(1),
                oldValue: "not date",
            },
        ];
        assert.deepStrictEqual(diff(oldObj, newObj), expectedDiffs);
    });

    test("date to object", () => {
        const oldObj = { date: new Date(1) };
        const newObj = { date: { time: 1 } };
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CHANGE,
                path: ["date"],
                value: { time: 1 },
                oldValue: new Date(1),
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("object to date", () => {
        const oldObj = { date: { time: 1 } };
        const newObj = { date: new Date(1) };
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CHANGE,
                path: ["date"],
                value: new Date(1),
                oldValue: { time: 1 },
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });
});

describe("regex diffs", () => {
    test("equal regex", () => {
        const oldObj = { regex: /a/ };
        const newObj = { regex: /a/ };
        const expectedDiffs = [] as Diff[];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("unequal regex", () => {
        const oldObj = { regex: /a/ };
        const newObj = { regex: /b/ };
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CHANGE,
                path: ["regex"],
                value: /b/,
                oldValue: /a/,
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("regex to object", () => {
        const oldObj = { regex: /a/ };
        const newObj = { regex: { pattern: "a" } };
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CHANGE,
                path: ["regex"],
                value: { pattern: "a" },
                oldValue: /a/,
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("object to regex", () => {
        const oldObj = { regex: { pattern: "a" } };
        const newObj = { regex: /a/ };
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CHANGE,
                path: ["regex"],
                value: /a/,
                oldValue: { pattern: "a" },
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });
});

describe("NaN diffs", () => {
    test("NaN value in identical objects", () => {
        const oldObj = { testNaN: NaN };
        const newObj = { testNaN: NaN };
        const expectedDiffs = [] as Diff[];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("new NaN value in object", () => {
        const oldObj = {};
        const newObj = { testNaN: NaN };
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CREATE,
                path: ["testNaN"],
                value: NaN,
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("change NaN value in object", () => {
        const oldObj = { testNaN: NaN };
        const newObj = { testNaN: 0 };
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CHANGE,
                path: ["testNaN"],
                value: 0,
                oldValue: NaN,
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("remove NaN value in object", () => {
        const oldObj = { testNaN: NaN };
        const newObj = {};
        const expectedDiffs = [
            {
                type: DIFF_TYPE.REMOVE,
                path: ["testNaN"],
                oldValue: NaN,
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("NaN value in identical arrays", () => {
        const oldObj = [NaN];
        const newObj = [NaN];
        const expectedDiffs = [] as Diff[];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("new NaN value in array", () => {
        const oldObj = [] as unknown[];
        const newObj = [NaN];
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CREATE,
                path: [0],
                value: NaN,
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("change NaN value in array", () => {
        const oldObj = [NaN];
        const newObj = [0];
        const expectedDiffs = [
            {
                type: DIFF_TYPE.CHANGE,
                path: [0],
                value: 0,
                oldValue: NaN,
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });

    test("remove NaN value in array", () => {
        const oldObj = [NaN];
        const newObj = [] as unknown[];
        const expectedDiffs = [
            {
                type: DIFF_TYPE.REMOVE,
                path: [0],
                oldValue: NaN,
            },
        ];
        const diffs = diff(oldObj, newObj);
        assert.deepStrictEqual(diffs, expectedDiffs);
    });
});
