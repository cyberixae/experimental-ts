/**
 * @since 0.0.1
 */

import { Sighting } from './Sighting'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.0.1
 */
export type NonEmptyGeneratorFunction<A> = () => Generator<A, Sighting<A>, undefined>
