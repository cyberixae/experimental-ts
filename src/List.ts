/**
 * @since 0.0.1
 */
import { absurd, pipe } from 'fp-ts/lib/function'
import * as RNEA from 'fp-ts/lib/ReadonlyNonEmptyArray'
import * as O from 'fp-ts/lib/Option'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.0.1
 */
export type StaticHead<A> = {
  readonly _tag: 'StaticHead'
  readonly items: RNEA.ReadonlyNonEmptyArray<A>
  readonly next: List<A>
}

/**
 * @category model
 * @since 0.0.1
 */
export type FiniteHead<A> = StaticHead<A> & {
  readonly next: FiniteList<A>
}

/**
 * @category model
 * @since 0.0.1
 */
export type LazyHead<A, R extends void | never> = {
  readonly _tag: 'LazyHead'
  readonly items: () => Generator<A, R, undefined>
  readonly next: List<A>
}

/**
 * @category model
 * @since 0.0.1
 */
export type InfiniteHead<A> =
  | LazyHead<A, never>
  | (LazyHead<A, void> & {
      readonly next: InfiniteList<A>
    })

/**
 * @category model
 * @since 0.0.1
 */
export type Empty<A> = {
  readonly _tag: 'Empty'
  readonly items: ReadonlyArray<A> & []
}

/* possibly infinite */

/**
 * @category model
 * @since 0.0.1
 */
export type Head<A> = StaticHead<A> | LazyHead<A, void> | LazyHead<A, never>

/**
 * @category model
 * @since 0.0.1
 */
export type List<A> = Head<A> | Empty<A>

/**
 * @category model
 * @since 0.0.1
 */
export type EmptyList<A> = Empty<A>

/**
 * @category model
 * @since 0.0.1
 */
export type NonEmptyList<A> =
  | StaticHead<A>
  | LazyHead<A, never>
  | (LazyHead<A, void> & { readonly next: NonEmptyList<A> })

/* provably infinite */

/**
 * @category model
 * @since 0.0.1
 */
export type InfiniteList<A> = InfiniteHead<A>

/**
 * @category model
 * @since 0.0.1
 */
export type EmptyInfiniteList<_A> = never

/**
 * @category model
 * @since 0.0.1
 */
export type NonEmptyInfiniteList<A> = InfiniteList<A>

/* provably finite */

/**
 * @category model
 * @since 0.0.1
 */
export type FiniteList<A> = FiniteHead<A> | Empty<A>

/**
 * @category model
 * @since 0.0.1
 */
export type EmptyFiniteList<A> = Empty<A>

/**
 * @category model
 * @since 0.0.1
 */
export type NonEmptyFiniteList<A> = FiniteHead<A>

/**
 * @category model
 * @since 0.0.1
 */
export type Pointer<A> = {
  readonly root: List<A>
  readonly head: Head<A>
  readonly offset: number
  readonly item: A
}

/**
 * @category constructors
 * @since 0.0.1
 */
export const empty: Empty<never> = {
  _tag: 'Empty',
  items: [] as any,
}

/**
 * @category constructors
 * @since 0.0.1
 */
export function staticHead<A>(items: RNEA.ReadonlyNonEmptyArray<A>, next?: FiniteList<A>): NonEmptyFiniteList<A>
export function staticHead<A>(items: RNEA.ReadonlyNonEmptyArray<A>, next: List<A>): StaticHead<A>
export function staticHead<A>(items: RNEA.ReadonlyNonEmptyArray<A>, next: List<A> = empty): StaticHead<A> {
  return {
    _tag: 'StaticHead',
    items,
    next,
  }
}

/**
 * @category constructors
 * @since 0.0.1
 */
export const lazyHead = <A, R extends void | never>(
  items: () => Generator<A, R, undefined>,
  next: List<A> = empty,
): LazyHead<A, R> => ({
  _tag: 'LazyHead',
  items,
  next,
})

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 0.0.1
 */
export const prepend = <A>(head: A) => (tail: List<A>): NonEmptyList<A> => staticHead(RNEA.of(head), tail)

/**
 * @category constructors
 * @since 0.0.1
 */
export const append = <A>(end: A) => (init: List<A>): NonEmptyList<A> => {
  switch (init._tag) {
    case 'Empty':
      return staticHead(RNEA.of(end), init)
    case 'StaticHead':
      return {
        _tag: init._tag,
        items: init.items,
        next: append(end)(init.next),
      }
    case 'LazyHead':
      return {
        _tag: init._tag,
        items: init.items,
        next: append(end)(init.next),
      }
  }
  return absurd(init)
}

/**
 * @category constructors
 * @since 0.0.1
 */
export const takeLeft = <A>(count: number) => (as: List<A>): List<A> => {
  return lazyHead(function* () {
    let i = 0
    for (const item of toIterable(as)) {
      yield item
      i += 1
      if (i >= count) {
        return
      }
    }
  })
}

/**
 * @category constructors
 * @since 0.0.1
 */
export const fromArray = <A>(as: Array<A>): FiniteList<A> =>
  pipe(
    RNEA.fromArray(as),
    O.fold(
      (): FiniteList<A> => empty,
      (neas): FiniteList<A> => staticHead(neas),
    ),
  )

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

/**
 * @category destructors
 * @since 0.0.1
 */
export function toIterable<A>(as: List<A>): Iterable<A> {
  return {
    [Symbol.iterator]: function* () {
      switch (as._tag) {
        case 'Empty':
          yield* as.items
          return
        case 'StaticHead':
          yield* as.items
          yield* toIterable(as.next)
          return
        case 'LazyHead':
          yield* as.items()
          yield* toIterable(as.next)
          return
      }
      return absurd<void>(as)
    },
  }
}

/**
 * @category destructors
 * @since 0.0.1
 */
export function toIterableRR<A>(as: List<A>): Iterable<Pointer<A>> {
  return {
    [Symbol.iterator]: function* () {
      const rawHeads: Array<Head<A>> = heads(as)
      const iterators: Array<Iterator<A, void, undefined>> = rawHeads.map(({ items }) =>
        (typeof items === 'function' ? items() : items)[Symbol.iterator](),
      )
      let dones = 0
      let offset = 0
      while (dones < iterators.length) {
        let i = 0
        dones = 0
        for (const iterator of iterators) {
          const { value, done } = iterator.next()
          if (done === true) {
            dones += 1
          } else {
            const pointer: Pointer<A> = {
              root: as,
              head: rawHeads[i],
              offset,
              item: value as A,
            }
            yield pointer
          }
          i += 1
        }
        offset += 1
      }
    },
  }
}

/**
 * @category destructors
 * @since 0.0.1
 */
export function toArray<A>(as: InfiniteList<A>): never
export function toArray<A>(as: List<A>): Array<A>
export function toArray<A>(as: List<A>): Array<A> {
  return Array.from(toIterable(as))
}

/**
 * @category destructors
 * @since 0.0.1
 */
export function heads<A>(list: List<A>): Array<Head<A>> {
  let nodes = []
  let node = list
  while (node._tag !== 'Empty') {
    nodes.push(node)
    node = node.next
  }
  return nodes
}

/**
 * @since 0.0.1
 */
export function find<A>(a: A): (as: List<A>) => List<Pointer<A>> {
  return (as) =>
    lazyHead(function* () {
      for (const pointer of toIterableRR(as)) {
        if (pointer.item === a) {
          yield pointer
        }
      }
    })
}
