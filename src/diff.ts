import type { Diff, DiffOptions, DiffTarget } from "./types.js";
import { DIFF_TYPE } from "./types.js";

const RICH_TYPES: ReadonlySet<string> = new Set([
    "Date",
    "RegExp",
    "String",
    "Number",
]);

function isRichType(value: object): boolean {
    const name: unknown = Object.getPrototypeOf(value)?.constructor?.name;
    return typeof name === "string" && RICH_TYPES.has(name);
}

export function diff(
    oldObj: DiffTarget,
    newObj: DiffTarget,
    options: Partial<DiffOptions> = {},
): Diff[] {
    const resolved: DiffOptions = { detectCycles: true, ...options };
    return diffRecursive(oldObj, newObj, resolved, []);
}

function diffRecursive(
    oldObj: DiffTarget,
    newObj: DiffTarget,
    options: DiffOptions,
    stack: object[],
): Diff[] {
    const diffs: Diff[] = [];
    const oldObjRecord = oldObj as Record<string, unknown>;
    const newObjRecord = newObj as Record<string, unknown>;

    const isOldObjArray = Array.isArray(oldObj);
    for (const key in oldObjRecord) {
        const path: string | number = isOldObjArray ? +key : key;

        const oldObjValue = oldObjRecord[key];
        if (!(key in newObjRecord)) {
            diffs.push({
                type: DIFF_TYPE.REMOVE,
                path: [path],
                oldValue: oldObjValue,
            });
            continue;
        }

        const newObjValue = newObjRecord[key];
        if (
            typeof oldObjValue === "object" &&
            oldObjValue !== null &&
            typeof newObjValue === "object" &&
            newObjValue !== null &&
            Array.isArray(oldObjValue) === Array.isArray(newObjValue)
        ) {
            // Non-null objects of the same kind
            if (
                !(isRichType(oldObjValue) || isRichType(newObjValue)) &&
                !(options.detectCycles && stack.includes(oldObjValue))
            ) {
                // Plain object or array
                const nestedDiffs = diffRecursive(
                    oldObjValue as DiffTarget,
                    newObjValue as DiffTarget,
                    options,
                    options.detectCycles ? [...stack, oldObjValue] : [],
                );
                for (const nestedDiff of nestedDiffs) {
                    nestedDiff.path.unshift(path);
                }
                diffs.push(...nestedDiffs);
            } else {
                // Rich type or cyclic reference
                const coercedEqual = Number.isNaN(Number(oldObjValue))
                    ? String(oldObjValue) === String(newObjValue)
                    : Number(oldObjValue) === Number(newObjValue);
                if (!coercedEqual) {
                    diffs.push({
                        type: DIFF_TYPE.CHANGE,
                        path: [path],
                        value: newObjValue,
                        oldValue: oldObjValue,
                    });
                }
            }
        } else if (
            oldObjValue !== newObjValue &&
            !(Number.isNaN(oldObjValue) && Number.isNaN(newObjValue))
        ) {
            // Primitive or incompatible types changed
            diffs.push({
                type: DIFF_TYPE.CHANGE,
                path: [path],
                value: newObjValue,
                oldValue: oldObjValue,
            });
        }
    }

    const isNewObjArray = Array.isArray(newObj);
    for (const key in newObjRecord) {
        if (!(key in oldObjRecord)) {
            diffs.push({
                type: DIFF_TYPE.CREATE,
                path: [isNewObjArray ? +key : key],
                value: newObjRecord[key],
            });
        }
    }

    return diffs;
}
