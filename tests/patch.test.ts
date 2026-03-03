import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { type Diff, diff, DIFF_TYPE, patch } from "../src/index.js";

describe("basic patches", () => {
    test("create property", () => {
        const obj = { test: true };
        const diffs = [
            {
                path: ["test2"],
                type: DIFF_TYPE.CREATE,
                value: "test",
            },
        ] as Diff[];
        const expectedObj = { test: true, test2: "test" };
        patch(obj, diffs);
        assert.deepStrictEqual(obj, expectedObj);
    });

    test("change property", () => {
        const obj = { test: true };
        const diffs = [
            {
                path: ["test"],
                type: DIFF_TYPE.CHANGE,
                value: false,
                oldValue: true,
            },
        ] as Diff[];
        const expectedObj = { test: false };
        patch(obj, diffs);
        assert.deepStrictEqual(obj, expectedObj);
    });

    test("remove property", () => {
        const obj = { test: true, bananas: true };
        const diffs = [
            {
                path: ["test"],
                type: DIFF_TYPE.REMOVE,
                oldValue: true,
            },
        ] as Diff[];
        const expectedObj = { bananas: true };
        patch(obj, diffs);
        assert.deepStrictEqual(obj, expectedObj);
    });

    test("nested patch", () => {
        const obj = {
            test: true,
            bananas: {
                stock: {
                    geneva: true,
                    stockholm: false,
                },
            },
        };
        const diffs = [
            {
                path: ["bananas", "stock", "stockholm"],
                type: DIFF_TYPE.REMOVE,
                oldValue: false,
            },
        ] as Diff[];
        const expectedObj = {
            test: true,
            bananas: {
                stock: {
                    geneva: true,
                },
            },
        };
        patch(obj, diffs);
        assert.deepStrictEqual(obj, expectedObj);
    });

    test("nested create", () => {
        const obj = { a: { b: 1 } };
        const diffs = [
            {
                path: ["a", "c"],
                type: DIFF_TYPE.CREATE,
                value: 2,
            },
        ] as Diff[];
        const expectedObj = { a: { b: 1, c: 2 } };
        patch(obj, diffs);
        assert.deepStrictEqual(obj, expectedObj);
    });

    test("nested change", () => {
        const obj = { a: { b: 1 } };
        const diffs = [
            {
                path: ["a", "b"],
                type: DIFF_TYPE.CHANGE,
                value: 2,
                oldValue: 1,
            },
        ] as Diff[];
        const expectedObj = { a: { b: 2 } };
        patch(obj, diffs);
        assert.deepStrictEqual(obj, expectedObj);
    });

    test("multiple diffs", () => {
        const obj = { a: 1, b: 2, c: 3 };
        const diffs = [
            {
                path: ["b"],
                type: DIFF_TYPE.CHANGE,
                value: 5,
                oldValue: 2,
            },
            {
                path: ["c"],
                type: DIFF_TYPE.REMOVE,
                oldValue: 3,
            },
            {
                path: ["d"],
                type: DIFF_TYPE.CREATE,
                value: 4,
            },
        ] as Diff[];
        const expectedObj = { a: 1, b: 5, d: 4 };
        patch(obj, diffs);
        assert.deepStrictEqual(obj, expectedObj);
    });
});

describe("array patches", () => {
    test("top level array", () => {
        const obj = ["one", "two"];
        const diffs = [
            {
                path: [1],
                type: DIFF_TYPE.REMOVE,
                oldValue: "two",
            },
        ] as Diff[];
        const expectedObj = ["one"];
        patch(obj, diffs);
        assert.deepStrictEqual(obj, expectedObj);
    });

    test("nested array", () => {
        const obj: unknown[] = ["one", ["two-one", "two-two"]];
        const diffs = [
            {
                path: [1, 2],
                type: DIFF_TYPE.CREATE,
                value: "two-three",
            },
        ] as Diff[];
        const expectedObj = ["one", ["two-one", "two-two", "two-three"]];
        patch(obj, diffs);
        assert.deepStrictEqual(obj, expectedObj);
    });

    test("array inside object", () => {
        const obj = { main: ["one", "two"] };
        const diffs = [
            {
                path: ["main", 1],
                type: DIFF_TYPE.CHANGE,
                value: "three",
                oldValue: "two",
            },
        ] as Diff[];
        const expectedObj = { main: ["one", "three"] };
        patch(obj, diffs);
        assert.deepStrictEqual(obj, expectedObj);
    });

    test("deeply nested array", () => {
        const obj = {
            test: true,
            bananas: { items: ["one", "two", "three"] },
        };
        const diffs = [
            {
                path: ["bananas", "items", 1],
                type: DIFF_TYPE.REMOVE,
                oldValue: "two",
            },
        ] as Diff[];
        const expectedObj = {
            test: true,
            bananas: { items: ["one", "three"] },
        };
        patch(obj, diffs);
        assert.deepStrictEqual(obj, expectedObj);
    });

    test("create in top level array", () => {
        const obj = ["one", "two"];
        const diffs = [
            {
                path: [2],
                type: DIFF_TYPE.CREATE,
                value: "three",
            },
        ] as Diff[];
        const expectedObj = ["one", "two", "three"];
        patch(obj, diffs);
        assert.deepStrictEqual(obj, expectedObj);
    });

    test("change in top level array", () => {
        const obj = ["one", "two"];
        const diffs = [
            {
                path: [0],
                type: DIFF_TYPE.CHANGE,
                value: "zero",
                oldValue: "one",
            },
        ] as Diff[];
        const expectedObj = ["zero", "two"];
        patch(obj, diffs);
        assert.deepStrictEqual(obj, expectedObj);
    });
});

describe("error patches", () => {
    test("error when patching at nonexistent path", () => {
        const obj = ["one", "two"];
        const diffs = [
            {
                path: [3],
                type: DIFF_TYPE.REMOVE,
                oldValue: "x",
            },
        ] as Diff[];
        assert.throws(() => patch(obj, diffs));
    });
});

describe("diff-patch integration", () => {
    test("diff-patch object roundtrip", () => {
        const target = { one: true, two: true, three: "false" };
        const obj = { one: false, four: true };
        const diffs = diff(obj, target);
        const expectedObj = target;
        patch(obj, diffs);
        assert.deepStrictEqual(obj, expectedObj);
    });

    test("diff-patch array roundtrip", () => {
        const target = [0, "one", "two", "three"];
        const obj = ["one", "four"];
        const diffs = diff(obj, target);
        const expectedObj = target;
        patch(obj, diffs);
        assert.deepStrictEqual(obj, expectedObj);
    });
});
