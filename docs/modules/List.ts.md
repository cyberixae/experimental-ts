---
title: List.ts
nav_order: 1
parent: Modules
---

## List overview

Added in v0.0.1

---

<h2 class="text-delta">Table of contents</h2>

- [FunctorWithIndex](#functorwithindex)
  - [mapWithIndex](#mapwithindex)
- [constructor](#constructor)
  - [linear](#linear)
  - [roundRobin](#roundrobin)
- [constructors](#constructors)
  - [append](#append)
  - [empty](#empty)
  - [fromArray](#fromarray)
  - [lazyHead](#lazyhead)
  - [prepend](#prepend)
  - [staticHead](#statichead)
  - [takeLeft](#takeleft)
- [destructors](#destructors)
  - [heads](#heads)
  - [toArray](#toarray)
  - [toIterable](#toiterable)
  - [toIterables](#toiterables)
- [model](#model)
  - [Empty (type alias)](#empty-type-alias)
  - [EmptyFiniteList (type alias)](#emptyfinitelist-type-alias)
  - [EmptyInfiniteList (type alias)](#emptyinfinitelist-type-alias)
  - [EmptyList (type alias)](#emptylist-type-alias)
  - [FiniteHead (type alias)](#finitehead-type-alias)
  - [FiniteList (type alias)](#finitelist-type-alias)
  - [Head (type alias)](#head-type-alias)
  - [InfiniteHead (type alias)](#infinitehead-type-alias)
  - [InfiniteList (type alias)](#infinitelist-type-alias)
  - [LazyHead (type alias)](#lazyhead-type-alias)
  - [List (type alias)](#list-type-alias)
  - [NonEmptyFiniteList (type alias)](#nonemptyfinitelist-type-alias)
  - [NonEmptyInfiniteList (type alias)](#nonemptyinfinitelist-type-alias)
  - [NonEmptyList (type alias)](#nonemptylist-type-alias)
  - [Pointer (type alias)](#pointer-type-alias)
  - [StaticHead (type alias)](#statichead-type-alias)
  - [Strategy (type alias)](#strategy-type-alias)
- [utils](#utils)
  - [find](#find)
  - [ii](#ii)

---

# FunctorWithIndex

## mapWithIndex

**Signature**

```ts
export declare const mapWithIndex: <A, B>(f: (i: Index, a: A) => B) => (fa: List<A>) => List<B>
```

Added in v0.0.1

# constructor

## linear

**Signature**

```ts
export declare const linear: Strategy
```

Added in v0.0.1

## roundRobin

**Signature**

```ts
export declare const roundRobin: Strategy
```

Added in v0.0.1

# constructors

## append

**Signature**

```ts
export declare const append: <A>(end: A) => (init: List<A>) => NonEmptyList<A>
```

Added in v0.0.1

## empty

**Signature**

```ts
export declare const empty: Empty<never>
```

Added in v0.0.1

## fromArray

**Signature**

```ts
export declare const fromArray: <A>(as: readonly A[]) => FiniteList<A>
```

Added in v0.0.1

## lazyHead

**Signature**

```ts
export declare const lazyHead: <A, R extends void>(
  items: () => Generator<A, R, undefined>,
  next?: List<A>
) => LazyHead<A, R>
```

Added in v0.0.1

## prepend

**Signature**

```ts
export declare const prepend: <A>(head: A) => (tail: List<A>) => NonEmptyList<A>
```

Added in v0.0.1

## staticHead

**Signature**

```ts
export declare function staticHead<A>(items: RNEA.ReadonlyNonEmptyArray<A>, next?: FiniteList<A>): NonEmptyFiniteList<A>
export declare function staticHead<A>(items: RNEA.ReadonlyNonEmptyArray<A>, next: List<A>): StaticHead<A>
```

Added in v0.0.1

## takeLeft

**Signature**

```ts
export declare const takeLeft: <A>(count: number) => (as: List<A>) => List<A>
```

Added in v0.0.1

# destructors

## heads

**Signature**

```ts
export declare function heads<A>(list: List<A>): ReadonlyArray<Head<A>>
```

Added in v0.0.1

## toArray

**Signature**

```ts
export declare function toArray<A>(as: InfiniteList<A>): never
export declare function toArray<A>(as: List<A>): ReadonlyArray<A>
```

Added in v0.0.1

## toIterable

**Signature**

```ts
export declare function toIterable<A>(strategy: Strategy): (as: List<A>) => Iterable<A>
```

Added in v0.0.1

## toIterables

**Signature**

```ts
export declare function toIterables<A>(as: List<A>): ReadonlyArray<Iterable<A>>
```

Added in v0.0.1

# model

## Empty (type alias)

**Signature**

```ts
export type Empty<A> = {
  readonly _tag: 'Empty'
  readonly items: ReadonlyArray<A> & []
}
```

Added in v0.0.1

## EmptyFiniteList (type alias)

**Signature**

```ts
export type EmptyFiniteList<A> = Empty<A>
```

Added in v0.0.1

## EmptyInfiniteList (type alias)

**Signature**

```ts
export type EmptyInfiniteList<_A> = never
```

Added in v0.0.1

## EmptyList (type alias)

**Signature**

```ts
export type EmptyList<A> = Empty<A>
```

Added in v0.0.1

## FiniteHead (type alias)

**Signature**

```ts
export type FiniteHead<A> = StaticHead<A> & {
  readonly next: FiniteList<A>
}
```

Added in v0.0.1

## FiniteList (type alias)

**Signature**

```ts
export type FiniteList<A> = FiniteHead<A> | Empty<A>
```

Added in v0.0.1

## Head (type alias)

**Signature**

```ts
export type Head<A> = StaticHead<A> | LazyHead<A, void> | LazyHead<A, never>
```

Added in v0.0.1

## InfiniteHead (type alias)

**Signature**

```ts
export type InfiniteHead<A> =
  | LazyHead<A, never>
  | (LazyHead<A, void> & {
      readonly next: InfiniteList<A>
    })
```

Added in v0.0.1

## InfiniteList (type alias)

**Signature**

```ts
export type InfiniteList<A> = InfiniteHead<A>
```

Added in v0.0.1

## LazyHead (type alias)

**Signature**

```ts
export type LazyHead<A, R extends void | never> = {
  readonly _tag: 'LazyHead'
  readonly items: () => Generator<A, R, undefined>
  readonly next: List<A>
}
```

Added in v0.0.1

## List (type alias)

**Signature**

```ts
export type List<A> = Head<A> | Empty<A>
```

Added in v0.0.1

## NonEmptyFiniteList (type alias)

**Signature**

```ts
export type NonEmptyFiniteList<A> = FiniteHead<A>
```

Added in v0.0.1

## NonEmptyInfiniteList (type alias)

**Signature**

```ts
export type NonEmptyInfiniteList<A> = InfiniteList<A>
```

Added in v0.0.1

## NonEmptyList (type alias)

**Signature**

```ts
export type NonEmptyList<A> =
  | StaticHead<A>
  | LazyHead<A, never>
  | (LazyHead<A, void> & { readonly next: NonEmptyList<A> })
```

Added in v0.0.1

## Pointer (type alias)

**Signature**

```ts
export type Pointer<A> = {
  readonly list: List<A>
  readonly index: Index
  readonly item: A
}
```

Added in v0.0.1

## StaticHead (type alias)

**Signature**

```ts
export type StaticHead<A> = {
  readonly _tag: 'StaticHead'
  readonly items: RNEA.ReadonlyNonEmptyArray<A>
  readonly next: List<A>
}
```

Added in v0.0.1

## Strategy (type alias)

**Signature**

```ts
export type Strategy = <A>(is: ReadonlyArray<Iterable<A>>) => Iterable<A>
```

Added in v0.0.1

# utils

## find

**Signature**

```ts
export declare function find<A>(a: A): (as: List<A>) => List<Pointer<A>>
```

Added in v0.0.1

## ii

Immediate Invocation of a Function Expression

**Signature**

```ts
export declare function ii<A>(fe: () => A): A
```

Added in v0.0.1
