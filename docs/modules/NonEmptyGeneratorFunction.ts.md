---
title: NonEmptyGeneratorFunction.ts
nav_order: 3
parent: Modules
---

## NonEmptyGeneratorFunction overview

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [model](#model)
  - [NonEmptyGeneratorFunction (type alias)](#nonemptygeneratorfunction-type-alias)
  - [Report (type alias)](#report-type-alias)
  - [report](#report)

---

# model

## NonEmptyGeneratorFunction (type alias)

**Signature**

```ts
export type NonEmptyGeneratorFunction<A> = () => Generator<A, Report<A>, undefined>
```

Added in v0.0.1

## Report (type alias)

**Signature**

```ts
export type Report<A> = {
  readonly sample: A
}
```

Added in v0.0.1

## report

**Signature**

```ts
export declare function report<A>(sample: A): Report<A>
```

Added in v0.0.1
