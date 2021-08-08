/**
 * @since 0.0.1
 */

import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray'
import { InfiniteGeneratorFunction } from './InfiniteGeneratorFunction'
import { NonEmptyGeneratorFunction, report } from './NonEmptyGeneratorFunction'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.0.1
 */
export type GeneratorFunction<A> = () => Generator<A, unknown, undefined>

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * An empty generator function
 *
 * @category constructors
 * @since 0.0.1
 */
export const empty: GeneratorFunction<never> = function* () {
  return
}

/**
 * @category constructors
 * @since 0.0.1
 */
export const generatorFunction = <A>(as: GeneratorFunction<A>) => as

/**
 * @category constructors
 * @since 0.0.1
 */
export const prepend = <A>(head: A) => (tail: GeneratorFunction<A>): NonEmptyGeneratorFunction<A> =>
  function* () {
    yield head
    yield* tail()
    return report(head)
  }

/**
 * @category constructors
 * @since 0.0.1
 */
export const append = <A>(end: A) => (init: GeneratorFunction<A>): NonEmptyGeneratorFunction<A> =>
  function* () {
    yield* init()
    yield end
    return report(end)
  }

/**
 * @category constructors
 * @since 0.0.1
 */
export const takeLeft = <A>(count: number) => (as: GeneratorFunction<A>): GeneratorFunction<A> =>
  function* () {
    let i = 0
    for (const a of as()) {
      yield a
      if (i + 1 === count) {
        return
      }
      i += 1
    }
  }

/**
 * @category constructors
 * @since 0.0.1
 */
export const fromArray = <A>(as: ReadonlyArray<A>): GeneratorFunction<A> => fromIterable(as)

/**
 * @category constructors
 * @since 0.0.1
 */
export const fromIterable = <A>(as: Iterable<A>): GeneratorFunction<A> =>
  function* () {
    for (const a of as) {
      yield a
    }
  }

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

type Index = number

/**
 * @category FunctorWithIndex
 * @since 0.0.1
 */
export const mapWithIndex: <A, B>(f: (i: Index, a: A) => B) => (fa: GeneratorFunction<A>) => GeneratorFunction<B> = (
  f,
) => (fa) => {
  return function* () {
    let i = 0
    for (const a of fa()) {
      yield f(i, a)
      i += 1
    }
  }
}

/**
 * @category destructors
 * @since 0.0.1
 */
export function toIterable<A>(as: GeneratorFunction<A>): Iterable<A> {
  return {
    [Symbol.iterator]: as,
  }
}

/**
 * @category destructors
 * @since 0.0.1
 */
export function toArray<A>(as: InfiniteGeneratorFunction<A>): never
export function toArray<A>(as: NonEmptyGeneratorFunction<A>): ReadonlyNonEmptyArray<A>
export function toArray<A>(as: GeneratorFunction<A>): ReadonlyArray<A>
export function toArray<A>(as: GeneratorFunction<A>): ReadonlyArray<A> {
  return Array.from(toIterable(as))
}
