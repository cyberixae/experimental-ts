/**
 * @since 0.0.1
 */

import { NonEmptyGeneratorFunction } from './NonEmptyGeneratorFunction'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.0.1
 */
export type InfiniteGeneratorFunction<A> = () => Generator<A, never, undefined>

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @category constructors
 * @since 0.0.1
 */
export const repeat = <A>(a: A): InfiniteGeneratorFunction<A> =>
  function* () {
    while (true) {
      yield a
    }
  }

/**
 * @category constructors
 * @since 0.0.1
 */
export const cycle = <A>(a: NonEmptyGeneratorFunction<A>): InfiniteGeneratorFunction<A> =>
  function* () {
    while (true) {
      yield* a()
    }
  }

/**
 * @category constructors
 * @since 0.0.1
 */
export const prepend = <A>(head: A) => (tail: InfiniteGeneratorFunction<A>): InfiniteGeneratorFunction<A> =>
  function* () {
    yield head
    const end = yield* tail()
    return end
  }

/**
 * @category constructors
 * @since 0.0.1
 */
export const append = <A>(_end: A) => (init: InfiniteGeneratorFunction<A>): InfiniteGeneratorFunction<A> => init
