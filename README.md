# micro-diff-patch

A small, fast, zero-dependency library for deep object diffing and patching. Rewritten in modern TypeScript from [microdiff](https://github.com/AsyncBanana/microdiff) and [micropatch](https://github.com/AsyncBanana/micropatch), with various bug fixes and improvements.

## Features

- More than double the speed of other object deep diff libraries
- Extremely lightweight, ~1kb minified
- TypeScript-first support
- Very easy to use, having a `diff` and `patch` function only
- Full support for rich objects such as `Date` and `RegExp`

## Install

```bash
npm install z3lx/micro-diff-patch
```

## Usage

```ts
import { diff, patch } from "micro-diff-patch";

const original = { name: "Alice", age: 20, active: true };
const updated = { name: "Alice", age: 21, role: "admin" };

const changes = diff(original, updated);
// [
//     { type: "CHANGE", path: ["age"], value: 21, oldValue: 20 },
//     { type: "REMOVE", path: ["active"], oldValue: true },
//     { type: "CREATE", path: ["role"], value: "admin" },
// ]

patch(original, changes);
// original is now { name: "Alice", age: 20, role: "admin" }
```

Works with nested objects and arrays:

```ts
const changes = diff(
    { users: [{ name: "Alice" }] },
    { users: [{ name: "Bob" }] },
);
// [{ type: "CHANGE", path: ["users", 0, "name"], value: "Bob", oldValue: "Alice" }]
```

### Options

| Option         | Type      | Default | Description                                               |
| -------------- | --------- | ------- | --------------------------------------------------------- |
| `detectCycles` | `boolean` | `true`  | Detect circular references to prevent infinite recursion. |

```ts
diff(obj, newObj, { detectCycles: false }); // skip cycle detection for performance
```

## Attribution

This library is a rewrite of:

- [microdiff](https://github.com/AsyncBanana/microdiff) by AsyncBanana (MIT License)
- [micropatch](https://github.com/AsyncBanana/micropatch) by AsyncBanana (MIT License)

Original licenses are preserved in the [`third-party/`](./third-party) directory.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
