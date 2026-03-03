export type DiffPath = (string | number)[];

export type DiffTarget = Record<string, unknown> | unknown[];

export interface DiffOptions {
    detectCycles: boolean;
}

export interface DiffCreate {
    type: "CREATE";
    path: DiffPath;
    value: unknown;
}

export interface DiffRemove {
    type: "REMOVE";
    path: DiffPath;
    oldValue: unknown;
}

export interface DiffChange {
    type: "CHANGE";
    path: DiffPath;
    value: unknown;
    oldValue: unknown;
}

export type Diff = DiffCreate | DiffRemove | DiffChange;
