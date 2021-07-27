---
title: GeneratorFunction.ts
nav_order: 1
parent: Modules
---

## GeneratorFunction overview

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [FunctorWithIndex](#functorwithindex)
  - [mapWithIndex](#mapwithindex)
- [constructors](#constructors)
  - [append](#append)
  - [empty](#empty)
  - [fromArray](#fromarray)
  - [fromIterable](#fromiterable)
  - [generatorFunction](#generatorfunction)
  - [prepend](#prepend)
  - [takeLeft](#takeleft)
- [destructors](#destructors)
  - [toArray](#toarray)
  - [toIterable](#toiterable)
- [model](#model)
  - [GeneratorFunction (type alias)](#generatorfunction-type-alias)

---

# FunctorWithIndex

## mapWithIndex

**Signature**

```ts
export declare const mapWithIndex: <A, B>(
  f: (i: Index, a: A) => B
) => (fa: GeneratorFunction<A>) => GeneratorFunction<B>
```

Added in v0.0.1

# constructors

## append

**Signature**

```ts
export declare const append: <A>(end: A) => (init: GeneratorFunction<A>) => NonEmptyGeneratorFunction<A>
```

Added in v0.0.1

## empty

An empty generator function

**Signature**

```ts
export declare const empty: GeneratorFunction<never>
```

Added in v0.0.1

## fromArray

**Signature**

```ts
export declare const fromArray: <A>(as: readonly A[]) => GeneratorFunction<A>
```

Added in v0.0.1

## fromIterable

**Signature**

```ts
export declare const fromIterable: <A>(as: Iterable<A>) => GeneratorFunction<A>
```

Added in v0.0.1

## generatorFunction

**Signature**

```ts
export declare const generatorFunction: <A>(as: GeneratorFunction<A>) => GeneratorFunction<A>
```

Added in v0.0.1

## prepend

**Signature**

```ts
export declare const prepend: <A>(head: A) => (tail: GeneratorFunction<A>) => NonEmptyGeneratorFunction<A>
```

Added in v0.0.1

## takeLeft

**Signature**

```ts
export declare const takeLeft: <A>(count: number) => (as: GeneratorFunction<A>) => GeneratorFunction<A>
```

Added in v0.0.1

# destructors

## toArray

**Signature**

```ts
export declare function toArray<A>(as: InfiniteGeneratorFunction<A>): never
export declare function toArray<A>(as: GeneratorFunction<A>): ReadonlyArray<A>
```

Added in v0.0.1

## toIterable

**Signature**

```ts
export declare function toIterable<A>(as: GeneratorFunction<A>): Iterable<A>
```

Added in v0.0.1

# model

## GeneratorFunction (type alias)

**Signature**

```ts
export type GeneratorFunction<A> = () => Generator<A, unknown, undefined>
```

Added in v0.0.1
