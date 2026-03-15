import type { Diff, DiffTarget } from "./types.js";
import { DIFF_TYPE } from "./types.js";

export function patch(obj: DiffTarget, diffs: Diff[]): void {
    const orderedDiffs = [...diffs].sort((left, right) => {
        const leftIsArrayRemove =
            left.type === DIFF_TYPE.REMOVE &&
            typeof left.path.at(-1) === "number";
        const rightIsArrayRemove =
            right.type === DIFF_TYPE.REMOVE &&
            typeof right.path.at(-1) === "number";

        if (leftIsArrayRemove && rightIsArrayRemove) {
            const minLength = Math.min(left.path.length, right.path.length);
            for (let i = 0; i < minLength; i += 1) {
                const l = left.path[i];
                const r = right.path[i];
                if (l === r) {
                    continue;
                }
                if (typeof l === "number" && typeof r === "number") {
                    return r - l;
                }
                return String(l).localeCompare(String(r));
            }
            if (left.path.length !== right.path.length) {
                return left.path.length - right.path.length;
            }
        }

        return 0;
    });

    for (const diff of orderedDiffs) {
        const { path, type } = diff;

        if (path.length === 0) {
            continue;
        }

        let parent = obj;
        for (let i = 0; i < path.length - 1; i += 1) {
            const parentRecord = parent as Record<string, unknown>;
            parent = parentRecord[diff.path[i]!] as DiffTarget;
        }

        const lastKey = path[path.length - 1]!;
        const parentRecord = parent as Record<string, unknown>;
        if (parentRecord[lastKey] === undefined && type !== DIFF_TYPE.CREATE) {
            throw new Error(`Path ${String(path)} doesn't exist`);
        }

        if (type === DIFF_TYPE.REMOVE) {
            if (Array.isArray(parent)) {
                parent.splice(lastKey as number, 1);
            } else {
                delete parentRecord[lastKey];
            }
            continue;
        }

        parentRecord[lastKey] = diff.value;
    }
}
