import type { Diff, DiffTarget } from "./types.js";

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
        if (parentRecord[lastKey] === undefined && diff.type !== "CREATE") {
            throw new Error(`Path ${String(diff.path)} doesn't exist`);
        }

        switch (diff.type) {
            case "CREATE":
            case "CHANGE":
                parentRecord[lastKey] = diff.value;
                break;
            case "REMOVE":
                if (Array.isArray(parent)) {
                    parent.splice(lastKey as number, 1);
                } else {
                    delete parentRecord[lastKey];
                }
                break;
        }
    }
}
