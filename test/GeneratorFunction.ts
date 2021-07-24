import * as _ from '../src/GeneratorFunction'
import { pipe } from 'fp-ts/lib/function'

describe('GeneratorFunction', () => {
  it('toIterable', () => {
    expect(Array.from(_.toIterable(_.empty))).toStrictEqual([])
    expect(
      Array.from(
        _.toIterable(function* () {
          yield 1
          yield 2
          yield 3
        }),
      ),
    ).toStrictEqual([1, 2, 3])
  })
  it('toArray', () => {
    expect(
      _.toArray(function* () {
        return
      }),
    ).toStrictEqual([])
    expect(
      _.toArray(function* () {
        yield 1
      }),
    ).toStrictEqual([1])
    expect(
      _.toArray(function* () {
        yield 1
        yield 2
      }),
    ).toStrictEqual([1, 2])
    expect(
      _.toArray(function* () {
        yield 1
        yield 2
        yield 3
      }),
    ).toStrictEqual([1, 2, 3])
  })
  it('fromArray', () => {
    expect(_.toArray(_.fromArray([]))).toStrictEqual([])
    expect(_.toArray(_.fromArray([1, 2, 3]))).toStrictEqual([1, 2, 3])
  })
  it('mapWithIndex', () => {
    expect(
      pipe(
        _.fromArray([1, 2, 3]),
        _.mapWithIndex((a, b) => a + b),
        _.toArray,
      ),
    ).toStrictEqual([1, 3, 5])
  })
  it('takeLeft', () => {
    expect(pipe(_.empty, _.takeLeft(1), _.toArray)).toEqual([])
    expect(pipe(_.fromArray([2]), _.takeLeft(1), _.toArray)).toEqual([2])
    expect(
      pipe(
        _.generatorFunction(function* () {
          yield 1
        }),
        _.takeLeft(1),
        _.toArray,
      ),
    ).toEqual([1])
    expect(pipe(_.fromArray([1, 2, 3]), _.takeLeft(2), _.toArray)).toStrictEqual([1, 2])
  })
  describe('pipeables', () => {
    it('prepend', () => {
      expect(pipe(_.fromArray([1, 2, 3]), _.prepend(0), _.toArray)).toStrictEqual([0, 1, 2, 3])
    })

    it('append', () => {
      expect(pipe(_.empty, _.append(4), _.toArray)).toStrictEqual([4])
      expect(pipe(_.fromArray([1, 2, 3]), _.append(4), _.toArray)).toStrictEqual([1, 2, 3, 4])
      expect(
        pipe(
          _.generatorFunction(function* () {
            yield 1
            yield 2
            yield 3
          }),
          _.append(4),
          _.toArray,
        ),
      ).toStrictEqual([1, 2, 3, 4])
    })
  })
})
