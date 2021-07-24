---
title: Tombstone.ts
nav_order: 4
parent: Modules
---

## Tombstone overview

```ts
class Tombstone<A> {}
```

`Tombstone<A>` represents a value of type A without providing a reference to that value.
Tombstone does not hold any references to the value and should not prevent garbage collection.

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [tombstone](#tombstone)
- [model](#model)
  - [Tombstone (class)](#tombstone-class)
    - [toString (method)](#tostring-method)

---

# constructors

## tombstone

creates a tombstone to represent input

**Signature**

```ts
export declare function tombstone<A>(value: A): Tombstone<A>
```

**Example**

```ts
import { Tombstone, tombstone } from 'experimental-ts/Tombstone'

type Example = { id: number }
const stone: Tombstone<Example> = (() => {
  const example: Example = { id: 123 }
  return tombstone(example)
})()
assert.strictEqual(stone instanceof Tombstone, true)
```

Added in v0.0.1

# model

## Tombstone (class)

**Signature**

```ts
export declare class Tombstone<A> {
  constructor(_sample: A)
}
```

Added in v0.0.1

### toString (method)

**Signature**

```ts
toString()
```

Added in v0.0.1
