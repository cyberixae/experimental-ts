import { pipe } from 'fp-ts/function'
import * as GF from '../src/GeneratorFunction'
import * as NEGF from '../src/NonEmptyGeneratorFunction'
import * as _ from '../src/InfiniteGeneratorFunction'

describe('InfiniteGeneratorFunction', () => {
  it('repeat', () => {
    expect(pipe(_.repeat('a'), GF.takeLeft(3), GF.toArray)).toStrictEqual(['a', 'a', 'a'])
  })

  it('cycle', () => {
    expect(pipe(NEGF.fromArray([1, 2, 3]), _.cycle, GF.takeLeft(7), GF.toArray)).toStrictEqual([1, 2, 3, 1, 2, 3, 1])
  })

  it('prepend', () => {
    expect(pipe(_.repeat(0), _.prepend(1), GF.takeLeft(4), GF.toArray)).toStrictEqual([1, 0, 0, 0])
  })

  it('append', () => {
    expect(pipe(_.repeat(0), _.append(1), GF.takeLeft(4), GF.toArray)).toStrictEqual([0, 0, 0, 0])
  })
})
