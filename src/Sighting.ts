/**
 * ```ts
 * class Sighting<A> { }
 * ```
 *
 * `Sighting<A>` represents a value of type A without providing a reference to that value.
 * Sighting does not hold any references to the value and should not prevent garbage collection.
 *
 * @since 0.0.1
 */

/**
 * @category model
 * @since 0.0.1
 */
export class Sighting<A> {
  private readonly _a!: A

  constructor(_sample: A) {
    // the following prevents some linting errors
    this._a = this._a
  }

  /**
   * @since 0.0.1
   */
  toString() {
    return 'Sighting {}'
  }
}

/**
 * creates a sighting to represent input
 *
 * @example
 * import { Sighting, sighting } from 'experimental-ts/Sighting'
 *
 * type Example = { id: number }
 * const stone: Sighting<Example> = (() => {
 *   const example: Example = { id: 123 };
 *   return sighting(example)
 * })()
 * assert.strictEqual(stone instanceof Sighting, true)
 *
 * @category constructors
 * @since 0.0.1
 */
export function sighting<A>(value: A): Sighting<A> {
  return new Sighting(value)
}
