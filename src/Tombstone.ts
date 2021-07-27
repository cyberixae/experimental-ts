/**
 * ```ts
 * class Tombstone<A> { }
 * ```
 *
 * `Tombstone<A>` represents a value of type A without providing a reference to that value.
 * Tombstone does not hold any references to the value and should not prevent garbage collection.
 *
 * @since 0.0.1
 */

/**
 * @category model
 * @since 0.0.1
 */
export class Tombstone<A> {
  private readonly _a!: A

  constructor(_sample: A) {
    // the following prevents some linting errors
    this._a = this._a
  }

  /**
   * @since 0.0.1
   */
  toString() {
    return 'Tombstone {}'
  }
}

/**
 * creates a tombstone to represent input
 *
 * @example
 * import { Tombstone, tombstone } from 'experimental-ts/Tombstone'
 *
 * type Example = { id: number }
 * const stone: Tombstone<Example> = (() => {
 *   const example: Example = { id: 123 };
 *   return tombstone(example)
 * })()
 * assert.strictEqual(stone instanceof Tombstone, true)
 *
 * @category constructors
 * @since 0.0.1
 */
export function tombstone<A>(value: A): Tombstone<A> {
  return new Tombstone(value)
}
