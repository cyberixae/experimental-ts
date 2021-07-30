/**
 * @since 0.0.1
 */

import { Applicative1 } from 'fp-ts/Applicative'
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'

import { Sighting, sighting } from './Sighting'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.0.1
 */
export type NonEmptyGeneratorFunction<A> = () => Generator<A, Sighting<A>, undefined>

/**
 * @category constructors
 * @since 0.0.1
 */
export const fromArray = <A>(as: RNEA.ReadonlyNonEmptyArray<A>): NonEmptyGeneratorFunction<A> =>
  function* () {
    yield* as
    return sighting(RNEA.head(as))
  }

/**
 * @category Applicative
 * @since 0.0.1
 */
export const of: Applicative1<URI>['of'] = (a) =>
  function* () {
    yield a
    return sighting(a)
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
