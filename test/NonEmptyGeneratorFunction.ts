// import * as fc from 'fast-check'
// import * as E from 'fp-ts/Either'
import { Ord as ordNumber } from 'fp-ts/number'
// import { identity, pipe, Predicate, tuple } from 'fp-ts/function'
// import { Predicate } from 'fp-ts/Predicate'
import { pipe } from 'fp-ts/function'
// import * as M from 'fp-ts/Monoid'
// import * as O from 'fp-ts/Option'
// import * as Record_ from 'fp-ts/Record'
import * as Ord from 'fp-ts/Ord'
// import * as T from 'fp-ts/Task'
// import * as string_ from 'fp-ts/string'

import * as GF from '../src/GeneratorFunction'
import * as _ from '../src/NonEmptyGeneratorFunction'

describe('NonEmptyGeneratorFunction', () => {
  it('fromArray', () => {
    expect(pipe(_.fromArray([1, 2, 3]), GF.toArray)).toStrictEqual([1, 2, 3])
  })

  it('of', () => {
    expect(pipe(_.of(1), GF.toArray)).toStrictEqual([1])
  })

  it('sort', () => {
    const order = pipe(
      ordNumber,
      Ord.contramap((x: { readonly a: number }) => x.a),
    )
    expect(
      pipe(
        _.fromArray([
          { a: 3, b: 'b1' },
          { a: 2, b: 'b2' },
          { a: 1, b: 'b3' },
        ]),
        _.sort(order),
        GF.toArray,
      ),
    ).toStrictEqual([
      { a: 1, b: 'b3' },
      { a: 2, b: 'b2' },
      { a: 3, b: 'b1' },
    ])
  })
})
