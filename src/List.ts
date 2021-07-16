/**
 * @since 0.0.1
 */
import { absurd, pipe } from 'fp-ts/function'
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'
import * as RA from 'fp-ts/ReadonlyArray'
import { fold } from 'fp-ts/Option'

/**
 * Immediate Invocation of a Function Expression
 *
 * @category utils
 * @since 0.0.1
 */
export function ii<A>(fe: () => A): A {
  return fe()
}

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.0.1
 */
export type StaticHead<A> = [RNEA.ReadonlyNonEmptyArray<A>, ...List<A>]

/**
 * @category model
 * @since 0.0.1
 */
export type FiniteHead<A> = StaticHead<A> & [unknown, ...FiniteList<A>]

/**
 * @category model
 * @since 0.0.1
 */
export type LazyHead<A, R extends void | never> = [() => Generator<A, R, undefined>, ...List<A>]

/**
 * @category model
 * @since 0.0.1
 */
export type InfiniteHead<A> =
  | LazyHead<A, never>
  | (LazyHead<A, void> & [unknown, ...InfiniteList<A>]

/**
 * @category model
 * @since 0.0.1
 */
export type Empty<A> = ReadonlyArray<Head<A>> & []

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
  | (LazyHead<A, void> & [unknown, NonEmptyList<A>])

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
  readonly list: List<A>
  readonly index: Index
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
    for (const item of pipe(as, toIterable(linear))) {
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
export const fromArray = <A>(as: ReadonlyArray<A>): FiniteList<A> =>
  pipe(
    RNEA.fromReadonlyArray(as),
    fold(
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
export function toIterable<A>(strategy: Strategy): (as: List<A>) => Iterable<A> {
  return (as) => pipe(as, toIterables, strategy)
}

type Index = { readonly root: List<unknown>; readonly offset: number }

/**
 * @category FunctorWithIndex
 * @since 0.0.1
 */
export const mapWithIndex: <A, B>(f: (i: Index, a: A) => B) => (fa: List<A>) => List<B> = (f) => (fa) => {
  switch (fa._tag) {
    case 'Empty':
      return fa
    case 'StaticHead':
      return lazyHead(function* () {
        let offset = 0
        for (const item of fa.items) {
          yield f({ root: fa, offset }, item)
          offset += 1
        }
      }, mapWithIndex(f)(fa.next))
    case 'LazyHead':
      return lazyHead(function* () {
        let offset = 0
        for (const item of fa.items()) {
          yield f({ root: fa, offset }, item)
          offset += 1
        }
      }, mapWithIndex(f)(fa.next))
  }
  return absurd(fa)
}

/**
 * @category model
 * @since 0.0.1
 */
export type Strategy = <A>(is: ReadonlyArray<Iterable<A>>) => Iterable<A>

/**
 * @category constructor
 * @since 0.0.1
 */
export const linear: Strategy = (iterables) => {
  return ii(function* () {
    for (const iterable of iterables) {
      yield* iterable
    }
  })
}

/**
 * @category constructor
 * @since 0.0.1
 */
export const roundRobin: Strategy = (iterables) => {
  return ii(function* () {
    const iterators = iterables.map((iterator) => iterator[Symbol.iterator]())

    let dones = 0
    while (dones < iterators.length) {
      dones = 0
      for (const iterator of iterators) {
        const ret = iterator.next()
        if (ret.done === true) {
          dones += 1
        } else {
          yield ret.value
        }
      }
    }
  })
}

/**
 * @category destructors
 * @since 0.0.1
 */
export function toArray<A>(as: InfiniteList<A>): never
export function toArray<A>(as: List<A>): ReadonlyArray<A>
export function toArray<A>(as: List<A>): ReadonlyArray<A> {
  return pipe(as, toIterable(linear), Array.from, (x: Array<A>) => x)
}

/**
 * @category destructors
 * @since 0.0.1
 */
export function heads<A>(list: List<A>): ReadonlyArray<Head<A>> {
  let nodes = []
  let node = list
  while (node._tag !== 'Empty') {
    nodes.push(node)
    node = node.next
  }
  return nodes
}

/**
 * @category destructors
 * @since 0.0.1
 */
export function toIterables<A>(as: List<A>): ReadonlyArray<Iterable<A>> {
  return pipe(
    heads(as),
    RA.map(({ items }) => (typeof items === 'function' ? items() : items)),
  )
}

/**
 * @since 0.0.1
 */
export function find<A>(a: A): (as: List<A>) => List<Pointer<A>> {
  return (as) =>
    pipe(
      as,
      mapWithIndex(
        (index: Index, a: A): Pointer<A> => ({
          list: as,
          item: a,
          index,
        }),
      ),
      toIterables,
      roundRobin,
      (pointers) =>
        lazyHead(function* () {
          for (const pointer of pointers) {
            if (pointer.item === a) {
              yield pointer
            }
          }
        }),
    )
}
