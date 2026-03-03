import type { Diff, DiffTarget } from "./types.js";
import { DIFF_TYPE } from "./types.js";

export function patch(obj: DiffTarget, diffs: Diff[]): void {
    for (const diff of diffs) {
        if (diff.path.length === 0) {
            continue;
        }

        let parent = obj;
        for (let i = 0; i < diff.path.length - 1; i++) {
            const parentRecord = parent as Record<string, unknown>;
            parent = parentRecord[diff.path[i]!] as DiffTarget;
        }

        const lastKey = diff.path.at(-1)!;
        const parentRecord = parent as Record<string, unknown>;
        if (
            parentRecord[lastKey] === undefined &&
            diff.type !== DIFF_TYPE.CREATE
        ) {
            throw new Error(`Path ${String(diff.path)} doesn't exist`);
        }

        switch (diff.type) {
            case DIFF_TYPE.CREATE:
            case DIFF_TYPE.CHANGE:
                parentRecord[lastKey] = diff.value;
                break;
            case DIFF_TYPE.REMOVE:
                if (Array.isArray(parent)) {
                    parent.splice(lastKey as number, 1);
                } else {
                    delete parentRecord[lastKey];
                }
                break;
        }
    }
}
