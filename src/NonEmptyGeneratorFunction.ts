/**
 * @since 0.0.1
 */

import { Applicative1 } from 'fp-ts/Applicative'
import { Ord } from 'fp-ts/Ord'
import { pipe } from 'fp-ts/function'
import * as SG from 'fp-ts/Semigroup'
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'

import * as GF from './GeneratorFunction'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.0.1
 */
export type Report<A> = {
  readonly sample: A
}

/**
 * @category model
 * @since 0.0.1
 */
export function report<A>(sample: A): Report<A> {
  return {
    sample,
  }
}

/**
 * @category model
 * @since 0.0.1
 */
export type NonEmptyGeneratorFunction<A> = () => Generator<A, Report<A>, undefined>

/**
 * @category constructors
 * @since 0.0.1
 */
export const fromArray = <A>(as: RNEA.ReadonlyNonEmptyArray<A>): NonEmptyGeneratorFunction<A> =>
  function* () {
    yield* as
    return report(RNEA.head(as))
  }

/**
 * @category Applicative
 * @since 0.0.1
 */
export const of: Applicative1<URI>['of'] = (a) =>
  function* () {
    yield a
    return report(a)
  }

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 0.0.1
 */
export const URI = 'NonEmptyGeneratorFunction'

/**
 * @category instances
 * @since 0.0.1
 */
export type URI = typeof URI

declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    readonly [URI]: NonEmptyGeneratorFunction<A>
  }
}

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 0.0.1
 */
export function head<A>(as: NonEmptyGeneratorFunction<A>): A {
  const r = as().next()
  if (r.done === true) {
    throw new Error('NonEmptyGeneratorFunction should not be empty')
  }
  return r.value
}

/**
 * @since 0.0.1
 */
export function tail<A>(as: NonEmptyGeneratorFunction<A>): GF.GeneratorFunction<A> {
  return function* () {
    const g = as()
    g.next() // discard head
    yield* g
  }
}

/**
 * @since 0.0.1
 */
export function min<A>(ord: Ord<A>): (negf: NonEmptyGeneratorFunction<A>) => A {
  const S = SG.min(ord)
  return (negf) => pipe(tail(negf), GF.reduce(head(negf), S.concat))
}

/**
 * @since 0.0.1
 */
export function max<A>(ord: Ord<A>): (negf: NonEmptyGeneratorFunction<A>) => A {
  const S = SG.max(ord)
  return (negf) => pipe(tail(negf), GF.reduce(head(negf), S.concat))
}

/**
 * @category combinators
 * @since 0.0.1
 */
export function sort<B>(O: Ord<B>): <A extends B>(negf: NonEmptyGeneratorFunction<A>) => NonEmptyGeneratorFunction<A> {
  return (negf) =>
    function* () {
      let current = min(O)(negf)
      let next = current
      while (true) {
        const g = negf()
        for (const a of g) {
          switch (O.compare(a, current)) {
            case -1:
              // a < current
              break
            case 0:
              // current === a
              yield a
              break
            case 1:
              // current < a
              switch (O.compare(a, next)) {
                case -1:
                  // current < a < next
                  next = a
                  break
                case 0:
                  // current < a === next
                  break
                case 1:
                  if (O.compare(next, current) === 0) {
                    // current === next < a
                    next = a
                  }
                  break
              }
              break
          }
        }
        if (O.compare(next, current) === 0) {
          const r = g.next()
          if (r.done !== true) {
            throw new Error('g fully consumed, yet contains items')
          }
          return r.value
        }
        current = next
      }
    }
}
