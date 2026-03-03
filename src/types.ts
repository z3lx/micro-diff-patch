export const DIFF_TYPE = {
    CREATE: "CREATE",
    REMOVE: "REMOVE",
    CHANGE: "CHANGE",
} as const;

export type DiffPath = (string | number)[];

export type DiffTarget = Record<string, unknown> | unknown[];

export interface DiffOptions {
    detectCycles: boolean;
}

export interface DiffCreate {
    type: typeof DIFF_TYPE.CREATE;
    path: DiffPath;
    value: unknown;
}

export interface DiffRemove {
    type: typeof DIFF_TYPE.REMOVE;
    path: DiffPath;
    oldValue: unknown;
}

export interface DiffChange {
    type: typeof DIFF_TYPE.CHANGE;
    path: DiffPath;
    value: unknown;
    oldValue: unknown;
}

export type Diff = DiffCreate | DiffRemove | DiffChange;
