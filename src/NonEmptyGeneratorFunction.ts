/**
 * @since 0.0.1
 */

import { Tombstone } from './Tombstone'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.0.1
 */
export type NonEmptyGeneratorFunction<A> = () => Generator<A, Tombstone<A>, undefined>
