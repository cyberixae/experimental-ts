/**
 * @since 0.0.1
 */

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
