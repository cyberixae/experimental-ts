// import * as fc from 'fast-check'
import * as E from 'fp-ts/Either'
import { Eq as eqNumber, Ord as ordNumber } from 'fp-ts/number'
import { Monoid as monoidString } from 'fp-ts/string'
// import { Eq as eqString, Ord as ordString, Monoid as monoidString } from 'fp-ts/string'
// import { identity, pipe, Predicate, tuple } from 'fp-ts/function'
import { Predicate } from 'fp-ts/Predicate'
import { identity, pipe } from 'fp-ts/function'
// import * as M from 'fp-ts/Monoid'
import * as O from 'fp-ts/Option'
import * as Record_ from 'fp-ts/Record'
import * as Ord from 'fp-ts/Ord'
import * as T from 'fp-ts/Task'

import * as _ from '../src/GeneratorFunction'

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
    expect(pipe(_.fromArray([]), _.toArray)).toStrictEqual([])
    expect(pipe(_.fromArray([1, 2, 3]), _.toArray)).toStrictEqual([1, 2, 3])
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
  it('of', () => {
    expect(pipe(_.of(1), _.toArray)).toStrictEqual([1])
  })

  describe('pipeables', () => {
    it('traverse', () => {
      const traverse = _.traverse(O.Applicative)((n: number): O.Option<number> => (n % 2 === 0 ? O.none : O.some(n)))
      expect(pipe(_.fromArray([1, 2]), traverse)).toStrictEqual(O.none)
      expect(pipe(_.fromArray([1, 3]), traverse, O.map(_.toArray))).toStrictEqual(O.some([1, 3]))
    })

    it('sequence', () => {
      const sequence = _.sequence(O.Applicative)
      expect(pipe(_.fromArray([O.some(1), O.some(3)]), sequence, O.map(_.toArray))).toStrictEqual(O.some([1, 3]))
      expect(pipe(_.fromArray([O.some(1), O.none]), sequence)).toStrictEqual(O.none)
    })

    it('traverseWithIndex', () => {
      expect(
        pipe(
          _.fromArray(['a', 'bb']),
          _.traverseWithIndex(O.Applicative)((i, s) => (s.length >= 1 ? O.some(s + i) : O.none)),
          O.map(_.toArray),
        ),
      ).toStrictEqual(O.some(['a0', 'bb1']))
      expect(
        pipe(
          _.fromArray(['a', 'bb']),

          _.traverseWithIndex(O.Applicative)((i, s) => (s.length > 1 ? O.some(s + i) : O.none)),
        ),
      ).toStrictEqual(O.none)
    })

    it('lookup', () => {
      expect(pipe(_.fromArray([1, 2, 3]), _.lookup(0))).toStrictEqual(O.some(1))
      expect(pipe(_.fromArray([1, 2, 3]), _.lookup(3))).toStrictEqual(O.none)
    })

    it('elem', () => {
      expect(pipe(_.fromArray([1, 2, 3]), _.elem(eqNumber)(2))).toStrictEqual(true)
      expect(pipe(_.fromArray([1, 2, 3]), _.elem(eqNumber)(0))).toStrictEqual(false)
    })

    it('unfold', () => {
      const as = _.unfold(5, (n) => (n > 0 ? O.some([n, n - 1]) : O.none))
      expect(_.toArray(as)).toStrictEqual([5, 4, 3, 2, 1])
      expect(
        pipe(
          _.unfold(0, (_n) => O.none),
          _.toArray,
        ),
      ).toStrictEqual([])
    })

    it('wither', async () => {
      const wither = _.wither(T.ApplicativePar)((n: number) => T.of(n > 2 ? O.some(n + 1) : O.none))
      expect(await pipe(_.fromArray([]), wither, T.map(_.toArray))()).toStrictEqual([])
      expect(await pipe(_.fromArray([1, 3]), wither, T.map(_.toArray))()).toStrictEqual([4])
    })

    it('wilt', async () => {
      const wilt = _.wilt(T.ApplicativePar)((n: number) => T.of(n > 2 ? E.right(n + 1) : E.left(n - 1)))
      expect(await pipe(_.fromArray([]), wilt, T.map(Record_.map(_.toArray)))()).toStrictEqual({ left: [], right: [] })
      expect(await pipe(_.fromArray([1, 3]), wilt, T.map(Record_.map(_.toArray)))()).toStrictEqual({
        left: [0],
        right: [4],
      })
    })

    it('map', () => {
      expect(
        pipe(
          _.fromArray([1, 2, 3]),
          _.map((n) => n * 2),
          _.toArray,
        ),
      ).toStrictEqual([2, 4, 6])
    })

    it('mapWithIndex', () => {
      expect(
        pipe(
          _.fromArray([1, 2, 3]),
          _.mapWithIndex((i, n) => n + i),
          _.toArray,
        ),
      ).toStrictEqual([1, 3, 5])
    })

    it('alt', () => {
      expect(
        pipe(
          _.fromArray([1, 2]),
          _.alt(() => _.fromArray([3, 4])),
          _.toArray,
        ),
      ).toStrictEqual([1, 2, 3, 4])
    })

    it('ap', () => {
      expect(
        pipe(_.fromArray([(x: number) => x * 2, (x: number) => x * 3]), _.ap(_.fromArray([1, 2, 3])), _.toArray),
      ).toStrictEqual([2, 4, 6, 3, 6, 9])
    })

    it('apFirst', () => {
      expect(pipe(_.fromArray([1, 2]), _.apFirst(_.fromArray(['a', 'b', 'c'])), _.toArray)).toStrictEqual([
        1,
        1,
        1,
        2,
        2,
        2,
      ])
    })

    it('apSecond', () => {
      expect(pipe(_.fromArray([1, 2]), _.apSecond(_.fromArray(['a', 'b', 'c'])), _.toArray)).toStrictEqual([
        'a',
        'b',
        'c',
        'a',
        'b',
        'c',
      ])
    })

    it('chain', () => {
      expect(
        pipe(
          _.fromArray([1, 2, 3]),
          _.chain((n) => _.fromArray([n, n + 1])),
          _.toArray,
        ),
      ).toStrictEqual([1, 2, 2, 3, 3, 4])
    })

    it('chainWithIndex', () => {
      expect(
        pipe(
          _.fromArray([1, 2, 3]),
          _.chainWithIndex((i, n) => _.fromArray([n + i])),
          _.toArray,
        ),
      ).toStrictEqual([1, 3, 5])
    })

    it('chainFirst', () => {
      expect(
        pipe(
          _.fromArray([1, 2, 3]),
          _.chainFirst((n) => _.fromArray([n, n + 1])),
          _.toArray,
        ),
      ).toStrictEqual([1, 1, 2, 2, 3, 3])
    })

    it('foldMap', () => {
      expect(pipe(_.fromArray(['a', 'b', 'c']), _.foldMap(monoidString)(identity))).toStrictEqual('abc')
      expect(pipe(_.fromArray([]), _.foldMap(monoidString)(identity))).toStrictEqual('')
    })

    it('compact', () => {
      expect(pipe(_.fromArray([]), _.compact, _.toArray)).toStrictEqual([])
      expect(pipe(_.fromArray([O.some(1), O.some(2), O.some(3)]), _.compact, _.toArray)).toStrictEqual([1, 2, 3])
      expect(pipe(_.fromArray([O.some(1), O.none, O.some(3)]), _.compact, _.toArray)).toStrictEqual([1, 3])
    })

    it('separate', () => {
      expect(pipe(_.fromArray([]), _.separate, Record_.map(_.toArray))).toStrictEqual({ left: [], right: [] })
      expect(pipe(_.fromArray([E.left(123), E.right('123')]), _.separate, Record_.map(_.toArray))).toStrictEqual({
        left: [123],
        right: ['123'],
      })
    })

    it('filter', () => {
      const g = (n: number) => n % 2 === 1
      expect(pipe(_.fromArray([1, 2, 3]), _.filter(g), _.toArray)).toStrictEqual([1, 3])
      const x = pipe(_.fromArray([O.some(3), O.some(2), O.some(1)]), _.filter(O.isSome), _.toArray)
      expect(x).toStrictEqual([O.some(3), O.some(2), O.some(1)])
      const y = pipe(_.fromArray([O.some(3), O.none, O.some(1)]), _.filter(O.isSome), _.toArray)
      expect(y).toStrictEqual([O.some(3), O.some(1)])
    })

    it('filterWithIndex', () => {
      const f = (n: number) => n % 2 === 0
      expect(pipe(_.fromArray(['a', 'b', 'c']), _.filterWithIndex(f), _.toArray)).toStrictEqual(['a', 'c'])
    })

    it('filterMap', () => {
      const f = (n: number) => (n % 2 === 0 ? O.none : O.some(n))
      expect(pipe(_.fromArray([1, 2, 3]), _.filterMap(f), _.toArray)).toStrictEqual([1, 3])
      expect(pipe(_.fromArray([]), _.filterMap(f), _.toArray)).toStrictEqual([])
    })

    it('foldMapWithIndex', () => {
      expect(
        pipe(
          _.fromArray(['a', 'b']),
          _.foldMapWithIndex(monoidString)((i, a) => i + a),
        ),
      ).toStrictEqual('0a1b')
    })

    it('filterMapWithIndex', () => {
      const f = (i: number, n: number) => ((i + n) % 2 === 0 ? O.none : O.some(n))
      expect(pipe(_.fromArray([1, 2, 4]), _.filterMapWithIndex(f), _.toArray)).toStrictEqual([1, 2])
      expect(pipe(_.fromArray([]), _.filterMapWithIndex(f), _.toArray)).toStrictEqual([])
    })

    it('partitionMap', () => {
      expect(pipe(_.fromArray([]), _.partitionMap(identity), Record_.map(_.toArray))).toStrictEqual({
        left: [],
        right: [],
      })
      expect(
        pipe(_.fromArray([E.right(1), E.left('foo'), E.right(2)]), _.partitionMap(identity), Record_.map(_.toArray)),
      ).toStrictEqual({
        left: ['foo'],
        right: [1, 2],
      })
    })

    it('partition', () => {
      expect(
        pipe(
          _.fromArray([]),
          _.partition((n) => n > 2),
          Record_.map(_.toArray),
        ),
      ).toStrictEqual({ left: [], right: [] })
      expect(
        pipe(
          _.fromArray([1, 3]),
          _.partition((n) => n > 2),
          Record_.map(_.toArray),
        ),
      ).toStrictEqual({ left: [1], right: [3] })
    })

    it('partitionMapWithIndex', () => {
      expect(
        pipe(
          _.fromArray([]),
          _.partitionMapWithIndex((_, a) => a),
          Record_.map(_.toArray),
        ),
      ).toStrictEqual({ left: [], right: [] })
      expect(
        pipe(
          _.fromArray([E.right(1), E.left('foo'), E.right(2)]),
          _.partitionMapWithIndex((i, a) =>
            pipe(
              a,
              E.filterOrElse(
                (n) => n > i,
                () => 'err',
              ),
            ),
          ),
          Record_.map(_.toArray),
        ),
      ).toStrictEqual({
        left: ['foo', 'err'],
        right: [1],
      })
    })

    it('partitionWithIndex', () => {
      expect(
        pipe(
          _.fromArray([]),
          _.partitionWithIndex((i, n) => i + n > 2),
          Record_.map(_.toArray),
        ),
      ).toStrictEqual({ left: [], right: [] })
      expect(
        pipe(
          _.fromArray([1, 2]),
          _.partitionWithIndex((i, n) => i + n > 2),
          Record_.map(_.toArray),
        ),
      ).toStrictEqual({ left: [1], right: [2] })
    })

    it('reduce', () => {
      expect(
        pipe(
          _.fromArray(['a', 'b', 'c']),
          _.reduce('', (acc, a) => acc + a),
        ),
      ).toStrictEqual('abc')
    })

    it('reduceWithIndex', () => {
      expect(
        pipe(
          _.fromArray(['a', 'b']),
          _.reduceWithIndex('', (i, b, a) => b + i + a),
        ),
      ).toStrictEqual('0a1b')
    })

    it('reduceRight', () => {
      const as: _.GeneratorFunction<string> = _.fromArray(['a', 'b', 'c'])
      const b = ''
      const f = (a: string, acc: string) => acc + a
      expect(pipe(as, _.reduceRight(b, f))).toStrictEqual('cba')
      const x2: _.GeneratorFunction<string> = _.empty
      expect(pipe(x2, _.reduceRight(b, f))).toStrictEqual('')
    })

    it('reduceRightWithIndex', () => {
      expect(
        pipe(
          _.fromArray(['a', 'b']),
          _.reduceRightWithIndex('', (i, a, b) => b + i + a),
        ),
      ).toStrictEqual('1b0a')
    })
  })

  /*
  it('getMonoid', () => {
    const M = _.getMonoid<number>()
    expect(M.concat([1, 2], [3, 4])).toStrictEqual([1, 2, 3, 4])
    expect(M.concat([1, 2], M.empty)).toStrictEqual([1, 2])
    expect(M.concat(M.empty, [1, 2])).toStrictEqual([1, 2])
  })

  it('getEq', () => {
    const O = _.getEq(Ord.ordString)
    expect(O.equals([], [])).toStrictEqual(true, '[] ]')
    expect(O.equals(['a'], ['a'])).toStrictEqual(true, '[a], [a]')
    expect(O.equals(['a', 'b'], ['a', 'b'])).toStrictEqual(true, '[a, b], [a, b]')
    expect(O.equals(['a'], [])).toStrictEqual(false, '[a] []')
    expect(O.equals([], ['a'])).toStrictEqual(false, '[], [a]')
    expect(O.equals(['a'], ['b'])).toStrictEqual(false, '[a], [b]')
    expect(O.equals(['a', 'b'], ['b', 'a'])).toStrictEqual(false, '[a, b], [b, a]')
    expect(O.equals(['a', 'a'], ['a'])).toStrictEqual(false, '[a, a], [a]')
  })

  it('getOrd', () => {
    const O = _.getOrd(Ord.ordString)
    expect(O.compare([], [])).toStrictEqual(0, '[] ]')
    expect(O.compare(['a'], ['a'])).toStrictEqual(0, '[a], [a]')

    expect(O.compare(['b'], ['a'])).toStrictEqual(1, '[b], [a]')
    expect(O.compare(['a'], ['b'])).toStrictEqual(-1, '[a], [b]')

    expect(O.compare(['a'], [])).toStrictEqual(1, '[a] []')
    expect(O.compare([], ['a'])).toStrictEqual(-1, '[], [a]')
    expect(O.compare(['a', 'a'], ['a'])).toStrictEqual(1, '[a, a], [a]')
    expect(O.compare(['a', 'a'], ['b'])).toStrictEqual(-1, '[a, a], [a]')

    expect(O.compare(['a', 'a'], ['a', 'a'])).toStrictEqual(0, '[a, a], [a, a]')
    expect(O.compare(['a', 'b'], ['a', 'b'])).toStrictEqual(0, '[a, b], [a, b]')

    expect(O.compare(['a', 'a'], ['a', 'b'])).toStrictEqual(-1, '[a, a], [a, b]')
    expect(O.compare(['a', 'b'], ['a', 'a'])).toStrictEqual(1, '[a, b], [a, a]')

    expect(O.compare(['a', 'b'], ['b', 'a'])).toStrictEqual(-1, '[a, b], [b, a]')
    expect(O.compare(['b', 'a'], ['a', 'a'])).toStrictEqual(1, '[b, a], [a, a]')
    expect(O.compare(['b', 'a'], ['a', 'b'])).toStrictEqual(1, '[b, b], [a, a]')
    expect(O.compare(['b', 'b'], ['b', 'a'])).toStrictEqual(1, '[b, b], [b, a]')
    expect(O.compare(['b', 'a'], ['b', 'b'])).toStrictEqual(-1, '[b, a], [b, b]')
  })
*/

  it('isEmpty', () => {
    const as: _.GeneratorFunction<number> = _.fromArray([1, 2, 3])
    expect(_.isEmpty(as)).toStrictEqual(false)
    expect(_.isEmpty(_.empty)).toStrictEqual(true)
  })

  it('isNotEmpty', () => {
    const as: _.GeneratorFunction<number> = _.fromArray([1, 2, 3])
    expect(_.isNonEmpty(as)).toStrictEqual(true)
    expect(_.isNonEmpty(_.empty)).toStrictEqual(false)
  })

  it('prepend', () => {
    expect(pipe(_.fromArray([1, 2, 3]), _.prepend(0), _.toArray)).toStrictEqual([0, 1, 2, 3])
    expect(pipe(_.fromArray([1, 2, 3]), _.prepend(0), _.toArray)).toStrictEqual([0, 1, 2, 3])
    expect(pipe(_.fromArray([[2]]), _.prepend([1]), _.toArray)).toStrictEqual([[1], [2]])
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

  it('head', () => {
    const as: _.GeneratorFunction<number> = _.fromArray([1, 2, 3])
    expect(_.head(as)).toStrictEqual(O.some(1))
    expect(_.head(_.empty)).toStrictEqual(O.none)
  })

  it('last', () => {
    const as: _.GeneratorFunction<number> = _.fromArray([1, 2, 3])
    expect(_.last(as)).toStrictEqual(O.some(3))
    expect(_.last(_.empty)).toStrictEqual(O.none)
  })

  it('tail', () => {
    const as: _.GeneratorFunction<number> = _.fromArray([1, 2, 3])
    expect(pipe(_.tail(as), O.map(_.toArray))).toStrictEqual(O.some([2, 3]))
    expect(_.tail(_.empty)).toStrictEqual(O.none)
  })

  it('takeLeft', () => {
    expect(pipe(_.empty, _.takeLeft(2), _.toArray)).toStrictEqual([])
    expect(pipe(_.fromArray([1, 2, 3]), _.takeLeft(2), _.toArray)).toStrictEqual([1, 2])
    expect(pipe(_.fromArray([1, 2, 3]), _.takeLeft(0), _.toArray)).toStrictEqual([])
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

  /*
  it('takeRight', () => {
    expect(pipe(_.fromArray([1, 2, 3, 4, 5]), _.takeRight(2) , _.toArray).toStrictEqual([4, 5])
    expect(pipe(_.fromArray([1, 2, 3, 4, 5]), _.takeRight(0) , _.toArray).toStrictEqual([])
    expect(pipe(_.fromArray([]             ), _.takeRight(2) , _.toArray).toStrictEqual([])
    expect(pipe(_.fromArray([1, 2, 3, 4, 5]), _.takeRight(5) , _.toArray).toStrictEqual([1, 2, 3, 4, 5])
    expect(pipe(_.fromArray([1, 2, 3, 4, 5]), _.takeRight(10), _.toArray).toStrictEqual([1, 2, 3, 4, 5])
  })

  it('spanLeft', () => {
    expect(pipe(_.fromArray([1, 3, 2, 4, 5]), _.spanLeft((n: number) => n % 2 === 1))).toStrictEqual({ init: [1, 3], rest: [2, 4, 5] })
  })

  it('takeLeftWhile', () => {
    const f = (n: number) => n % 2 === 0
    expect(pipe(_.fromArray([2, 4, 3, 6]), _.takeLeftWhile(f), _.toArray)).toStrictEqual([2, 4])
    expect(pipe(_.fromArray([]          ), _.takeLeftWhile(f), _.toArray)).toStrictEqual([])
    expect(pipe(_.fromArray([1, 2, 4]   ), _.takeLeftWhile(f), _.toArray)).toStrictEqual([])
    expect(pipe(_.fromArray([2, 4]      ), _.takeLeftWhile(f), _.toArray)).toStrictEqual([2, 4])
  })

  it('dropLeft', () => {
    expect(pipe(_.fromArray([1, 2, 3]), _.dropLeft(2) , _.toArray)).toStrictEqual([3])
    expect(pipe(_.fromArray([1, 2, 3]), _.dropLeft(10), _.toArray)).toStrictEqual([])
    expect(pipe(_.fromArray([1, 2, 3]), _.dropLeft(0) , _.toArray)).toStrictEqual([1, 2, 3])
  })

  it('dropRight', () => {
    expect(pipe(_.fromArray([1, 2, 3, 4, 5]), _.dropRight(2) , _.toArray)).toStrictEqual([1, 2, 3])
    expect(pipe(_.fromArray([1, 2, 3, 4, 5]), _.dropRight(10), _.toArray)).toStrictEqual([])
    expect(pipe(_.fromArray([1, 2, 3, 4, 5]), _.dropRight(0) , _.toArray)).toStrictEqual([1, 2, 3, 4, 5])
  })

  it('dropLeftWhile', () => {
    const f = (n: number) => n % 2 === 0
    const g = (n: number) => n % 2 === 1
    expect(pipe(_.fromArray([1, 3, 2, 4, 5]), _.dropLeftWhile(f), _.toArray)).toStrictEqual([1, 3, 2, 4, 5])
    expect(pipe(_.fromArray([1, 3, 2, 4, 5]), _.dropLeftWhile(g), _.toArray)).toStrictEqual([2, 4, 5])
    expect(pipe(_.fromArray([]             ), _.dropLeftWhile(f), _.toArray)).toStrictEqual([])
    expect(pipe(_.fromArray([2, 4, 1]      ), _.dropLeftWhile(f), _.toArray)).toStrictEqual([1])
    expect(pipe(_.fromArray([2, 4]         ), _.dropLeftWhile(f), _.toArray)).toStrictEqual([])
  })
*/
  it('init', () => {
    const as: _.GeneratorFunction<number> = _.fromArray([1, 2, 3])
    expect(pipe(_.init(as), O.map(_.toArray))).toStrictEqual(O.some([1, 2]))
    expect(pipe(_.init(_.empty))).toStrictEqual(O.none)
  })
  /*

  it('findIndex', () => {
    expect(pipe(_.fromArray([1, 2, 3]), _.findIndex((x) => x === 2), _.toArray)).toStrictEqual(O.some(1))
    expect(pipe(_.fromArray([]       ), _.findIndex((x) => x === 2), _.toArray)).toStrictEqual(O.none)
  })

  it('findFirst', () => {
    expect(
      pipe(_.fromArray([]),
        _.findFirst((x: { readonly a: number }) => x.a > 1)
      )).toStrictEqual(
      O.none
    )
    expect(
      pipe(_.fromArray([{ a: 1 }, { a: 2 }, { a: 3 }]),
        _.findFirst((x) => x.a > 1)
      )).toStrictEqual(
      O.some({ a: 2 })
    )
    expect(
      pipe(_.fromArray([{ a: 1 }, { a: 2 }, { a: 3 }]),
        _.findFirst((x) => x.a > 3)
      )).toStrictEqual(
      O.none
    )
  })

  it('findFirstMap', () => {
    expect(
      pipe(_.fromArray([1, 2, 3]),
        _.findFirstMap((n) => (n > 1 ? O.some(n * 2) : O.none))
      )).toStrictEqual(
      O.some(4)
    )
    expect(
      pipe(_.fromArray([1]),
        _.findFirstMap((n) => (n < 1 ? O.some(n * 2) : O.none))
      )).toStrictEqual(
      O.none
    )
  })

  it('findLast', () => {
    expect(
      pipe(_.fromArray([]),
        _.findLast((x: { readonly a: number }) => x.a > 1)
      )).toStrictEqual(
      O.none
    )
    expect(
      pipe(_.fromArray([{ a: 1 }, { a: 2 }, { a: 3 }]),
        _.findLast((x) => x.a > 1)
      )).toStrictEqual(
      O.some({ a: 3 })
    )
    expect(
      pipe(_.fromArray([{ a: 1 }, { a: 2 }, { a: 3 }]),
        _.findLast((x) => x.a > 3)
      )).toStrictEqual(
      O.none
    )
  })

  it('findLastMap', () => {
    expect(
      pipe(_.fromArray([1, 2, 3]),
        _.findLastMap((n) => (n > 1 ? O.some(n * 2) : O.none))
      )).toStrictEqual(
      O.some(6)
    )
    expect(
      pipe(_.fromArray([1]),
        _.findLastMap((n) => (n > 1 ? O.some(n * 2) : O.none))
      )).toStrictEqual(
      O.none
    )
  })

  it('findLastIndex', () => {
    interface X {
      readonly a: number
      readonly b: number
    }
    const xs: _.GeneratorFunction<X> = _.fromArray([
      { a: 1, b: 0 },
      { a: 1, b: 1 }
    ])
    expect(pipe(xs, _.findLastIndex((x: X) => x.a === 1), _.toArray)).toStrictEqual(O.some(1))
    expect(pipe(xs, _.findLastIndex((x: X) => x.a === 4), _.toArray)).toStrictEqual(O.none)
    expect(pipe(_.empty, _.findLastIndex((x: X) => x.a === 1), _.toArray)).toStrictEqual(O.none)
  })

  it('insertAt', () => {
    expect(pipe(_.fromArray([]          ), _.insertAt(1, 1)).toStrictEqual(O.none)
    expect(pipe(_.fromArray([]          ), _.insertAt(0, 1), O.map(_.toArray)).toStrictEqual(O.some([1]))
    expect(pipe(_.fromArray([1, 2, 3, 4]), _.insertAt(2, 5), O.map(_.toArray)).toStrictEqual(O.some([1, 2, 5, 3, 4]))
  })

  it('updateAt', () => {
    const as: _.GeneratorFunction<number> = _.fromArray([1, 2, 3])
    expect(pipe(as, _.updateAt(1, 1), O.map(_.toArray))).toStrictEqual(O.some([1, 1, 3]))
    expect(pipe(_.empty, _.updateAt(1, 1))).toStrictEqual(O.none)
  })

  it('deleteAt', () => {
    const as: _.GeneratorFunction<number> = _.fromArray([1, 2, 3])
    expect(pipe(as, _.deleteAt(0), O.map(_.toArray))).toStrictEqual(O.some([2, 3]))
    expect(pipe(_.empty, _.deleteAt(1))).toStrictEqual(O.none)
  })

  it('modifyAt', () => {
    const as: _.GeneratorFunction<number> = _.fromArray([1, 2, 3])
    const double = (x: number): number => x * 2
    expect(pipe(as, _.modifyAt(1, double), O.map(_.toArray))).toStrictEqual(O.some([1, 4, 3]))
    expect(pipe(_.empty, _.modifyAt(1, double))).toStrictEqual(O.none)
  })

*/
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
        _.toArray,
      ),
    ).toStrictEqual([
      { a: 1, b: 'b3' },
      { a: 2, b: 'b2' },
      { a: 3, b: 'b1' },
    ])
    expect(pipe(_.empty, _.sort(ordNumber))).toStrictEqual(_.empty)
  })

  it('zipWith', () => {
    expect(
      pipe(
        _.fromArray([1, 2, 3]),
        _.zipWith(_.fromArray(['a', 'b', 'c', 'd']), (n, s) => s + n),
        _.toArray,
      ),
    ).toStrictEqual(['a1', 'b2', 'c3'])
  })

  it('zip', () => {
    expect(pipe(_.fromArray([1, 2, 3]), _.zip(_.fromArray(['a', 'b', 'c', 'd'])), _.toArray)).toStrictEqual([
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ])
  })

  it('unzip', () => {
    expect(
      pipe(
        _.fromArray([
          [1, 'a'],
          [2, 'b'],
          [3, 'c'],
        ] as Array<[number, string]>),
        _.unzip,
        ([xs, ys]) => [_.toArray(xs), _.toArray(ys)],
      ),
    ).toStrictEqual([
      [1, 2, 3],
      ['a', 'b', 'c'],
    ])
  })
  /*
  it('rights', () => {
    expect(pipe(_.fromArray([E.right(1), E.left('foo'), E.right(2)]), _.rights, _.toArray)).toStrictEqual([1, 2])
    expect(pipe(_.empty, _.rights)).toStrictEqual([])
  })

  it('lefts', () => {
    expect(pipe(_.fromArray([E.right(1), E.left('foo'), E.right(2)]), _.lefts, _.toArray)).toStrictEqual(['foo'])
    expect(pipe(_.empty, _.lefts, _.toArray)).toStrictEqual([])
  })

  it('flatten', () => {
    expect(pipe(_.fromArray([ _.of(1), _.of(2), _.of(3)]), _.flatten, _.toArray)).toStrictEqual([1, 2, 3])
  })

  it('prependToAll', () => {
    expect(pipe(_.fromArray([1, 2, 3]   ), _.prependToAll(0), _.toArray)).toStrictEqual([0, 1, 0, 2, 0, 3])
    expect(pipe(_.fromArray([]          ), _.prependToAll(0), _.toArray)).toStrictEqual([])
    expect(pipe(_.fromArray([1]         ), _.prependToAll(0), _.toArray)).toStrictEqual([0, 1])
    expect(pipe(_.fromArray([1, 2, 3, 4]), _.prependToAll(0), _.toArray)).toStrictEqual([0, 1, 0, 2, 0, 3, 0, 4])
  })

  it('intersperse', () => {
    expect(pipe(_.fromArray([1, 2, 3]   ), _.intersperse(0), _.toArray)).toStrictEqual([1, 0, 2, 0, 3])
    expect(pipe(_.fromArray([]          ), _.intersperse(0), _.toArray)).toStrictEqual([])
    expect(pipe(_.fromArray([1]         ), _.intersperse(0), _.toArray)).toStrictEqual([1])
    expect(pipe(_.fromArray([1, 2]      ), _.intersperse(0), _.toArray)).toStrictEqual([1, 0, 2])
    expect(pipe(_.fromArray([1, 2, 3, 4]), _.intersperse(0), _.toArray)).toStrictEqual([1, 0, 2, 0, 3, 0, 4])
  })

  it('rotate', () => {
    expect(pipe(_.fromArray([]             ), _.rotate(1) , _.toArray)).toStrictEqual([])
    expect(pipe(_.fromArray([1]            ), _.rotate(1) , _.toArray)).toStrictEqual([1])
    expect(pipe(_.fromArray([1, 2]         ), _.rotate(1) , _.toArray)).toStrictEqual([2, 1])
    expect(pipe(_.fromArray([1, 2]         ), _.rotate(2) , _.toArray)).toStrictEqual([1, 2])
    expect(pipe(_.fromArray([1, 2, 3, 4, 5]), _.rotate(0) , _.toArray)).toStrictEqual([1, 2, 3, 4, 5])
    expect(pipe(_.fromArray([1, 2, 3, 4, 5]), _.rotate(1) , _.toArray)).toStrictEqual([5, 1, 2, 3, 4])
    expect(pipe(_.fromArray([1, 2, 3, 4, 5]), _.rotate(2) , _.toArray)).toStrictEqual([4, 5, 1, 2, 3])
    expect(pipe(_.fromArray([1, 2, 3, 4, 5]), _.rotate(-1), _.toArray)).toStrictEqual([2, 3, 4, 5, 1])
    expect(pipe(_.fromArray([1, 2, 3, 4, 5]), _.rotate(-2), _.toArray)).toStrictEqual([3, 4, 5, 1, 2])
  })

  it('reverse', () => {
    expect(pipe(_.fromArray([1, 2, 3]), _.reverse, _.toArray).toStrictEqual([3, 2, 1])
    expect(strictEqual(_.reverse(_.empty)).toStrictEqual(_.empty)
  })

  it('foldLeft', () => {
    const len: <A>(as: _.GeneratorFunction<A>) => number = _.foldLeft(
      () => 0,
      (_, tail) => 1 + len(tail)
    )
    expect(len([1, 2, 3])).toStrictEqual(3)
  })

  it('foldRight', () => {
    const len: <A>(as: _.GeneratorFunction<A>) => number = _.foldRight(
      () => 0,
      (init, _) => 1 + len(init)
    )
    expect(len([1, 2, 3])).toStrictEqual(3)
  })

  it('scanLeft', () => {
    const f = (b: number, a: number) => b - a
    expect(pipe(_.fromArray([1, 2, 3]), _.scanLeft(10, f), _.toArray)).toStrictEqual([10, 9, 7, 4])
    expect(pipe(_.fromArray([0]      ), _.scanLeft(10, f), _.toArray)).toStrictEqual([10, 10])
    expect(pipe(_.fromArray([]       ), _.scanLeft(10, f), _.toArray)).toStrictEqual([10])
  })

  it('scanRight', () => {
    const f = (b: number, a: number) => b - a
    expect(pipe(_.fromArray([1, 2, 3]), _.scanRight(10, f), _.toArray)).toStrictEqual([-8, 9, -7, 10])
    expect(pipe(_.fromArray([0]      ), _.scanRight(10, f), _.toArray)).toStrictEqual([-10, 10])
    expect(pipe(_.fromArray([]       ), _.scanRight(10, f), _.toArray)).toStrictEqual([10])
  })

  it('uniq', () => {
    interface A {
      readonly a: string
      readonly b: number
    }

    const eqA = pipe(
      ordNumber,
      Eq.contramap((f: A) => f.b)
    )
    const arrA: A = { a: 'a', b: 1 }
    const arrB: A = { a: 'b', b: 1 }
    const arrC: A = { a: 'c', b: 2 }
    const arrD: A = { a: 'd', b: 2 }
    const arrUniq: _.GeneratorFunction<A> = _.fromArray([arrA, arrC])

    expect(pipe(arrUniq, _.uniq(eqA))).toStrictEqual(arrUniq, 'Preserve original array')
    expect(pipe(_.fromArray([arrA, arrB, arrC, arrD]      ), _.uniq(eqA), _.toArray)).toStrictEqual([arrA, arrC])
    expect(pipe(_.fromArray([arrB, arrA, arrC, arrD]      ), _.uniq(eqA), _.toArray)).toStrictEqual([arrB, arrC])
    expect(pipe(_.fromArray([arrA, arrA, arrC, arrD, arrA]), _.uniq(eqA), _.toArray)).toStrictEqual([arrA, arrC])
    expect(pipe(_.fromArray([arrA, arrC]                  ), _.uniq(eqA), _.toArray)).toStrictEqual([arrA, arrC])
    expect(pipe(_.fromArray([arrC, arrA]                  ), _.uniq(eqA), _.toArray)).toStrictEqual([arrC, arrA])
    expect(pipe(_.fromArray(([true, false, true, false]), _.uniq(Eq.eqBoolean), _.toArray)).toStrictEqual([true, false])
    expect(pipe(_.fromArray([]                            ), _.uniq(eqNumber), _.toArray)).toStrictEqual([])
    expect(pipe(_.fromArray([-0, -0]                      ), _.uniq(eqNumber), _.toArray)).toStrictEqual([-0])
    expect(pipe(_.fromArray([0, -0]                       ), _.uniq(eqNumber), _.toArray)).toStrictEqual([0])
    expect(pipe(_.fromArray([1]                           ), _.uniq(eqNumber), _.toArray)).toStrictEqual([1])
    expect(pipe(_.fromArray([2, 1, 2]                     ), _.uniq(eqNumber), _.toArray)).toStrictEqual([2, 1])
    expect(pipe(_.fromArray([1, 2, 1]                     ), _.uniq(eqNumber), _.toArray)).toStrictEqual([1, 2])
    expect(pipe(_.fromArray([1, 2, 3, 4, 5]               ), _.uniq(eqNumber), _.toArray)).toStrictEqual([1, 2, 3, 4, 5])
    expect(pipe(_.fromArray([1, 1, 2, 2, 3, 3, 4, 4, 5, 5]), _.uniq(eqNumber), _.toArray)).toStrictEqual([1, 2, 3, 4, 5])
    expect(pipe(_.fromArray([1, 2, 3, 4, 5, 1, 2, 3, 4, 5]), _.uniq(eqNumber), _.toArray)).toStrictEqual([1, 2, 3, 4, 5])
    expect(pipe(_.fromArray(['a', 'b', 'a']               ), _.uniq(Eq.eqString), _.toArray)).toStrictEqual(['a', 'b'])
    expect(pipe(_.fromArray(['a', 'b', 'A']               ), _.uniq(Eq.eqString), _.toArray)).toStrictEqual(['a', 'b', 'A'])
  })

  it('sortBy', () => {
    interface X {
      readonly a: string
      readonly b: number
      readonly c: boolean
    }
    const byName = pipe(
      Ord.ordString,
      Ord.contramap((p: { readonly a: string; readonly b: number }) => p.a)
    )
    const byAge = pipe(
      ordNumber,
      Ord.contramap((p: { readonly a: string; readonly b: number }) => p.b)
    )
    const f = _.sortBy([byName, byAge])
    const xs: _.GeneratorFunction<X> = _.fromArray([
      { a: 'a', b: 1, c: true },
      { a: 'b', b: 3, c: true },
      { a: 'c', b: 2, c: true },
      { a: 'b', b: 2, c: true }
    ])
    expect(f(xs)).toStrictEqual([
      { a: 'a', b: 1, c: true },
      { a: 'b', b: 2, c: true },
      { a: 'b', b: 3, c: true },
      { a: 'c', b: 2, c: true }
    ])
    const sortByAgeByName = _.sortBy([byAge, byName])
    expect(sortByAgeByName(xs)).toStrictEqual([
      { a: 'a', b: 1, c: true },
      { a: 'b', b: 2, c: true },
      { a: 'c', b: 2, c: true },
      { a: 'b', b: 3, c: true }
    ])

    expect(pipe(xs, _.sortBy([])).toStrictEqual(xs)
  })

  it('chop', () => {
    const group = <A>(E: Eq.Eq<A>): ((as: _.GeneratorFunction<A>) => GeneratorFunction<GeneratorFunction<A>>) => {
      return _.chop((as) => {
        const { init, rest } = _.spanLeft((a: A) => E.equals(a, as[0]))(as)
        return [init, rest]
      })
    }
    expect(group(eqNumber)([1, 1, 2, 3, 3, 4])).toStrictEqual([[1, 1], [2], [3, 3], [4]])
  })

  it('splitAt', () => {
    expect(pipe(_.fromArray([1, 2, 3, 4, 5]), _.splitAt(2))).toStrictEqual([
      [1, 2],
      [3, 4, 5]
    ])
    expect(pipe(_.fromArray([]    ), _.splitAt(2) )).toStrictEqual([[], []])
    expect(pipe(_.fromArray([1]   ), _.splitAt(2) )).toStrictEqual([[1], []])
    expect(pipe(_.fromArray([1, 2]), _.splitAt(2) )).toStrictEqual([[1, 2], []])
    expect(pipe(_.fromArray([1, 2]), _.splitAt(-1))).toStrictEqual([[1], [2]])
    expect(pipe(_.fromArray([1, 2]), _.splitAt(0) )).toStrictEqual([[], [1, 2]])
    expect(pipe(_.fromArray([1, 2]), _.splitAt(3) )).toStrictEqual([[1, 2], []])
  })

  describe('chunksOf', () => {
    it('should split an array into length-n pieces', () => {
      expect(pipe(_.fromArray([1, 2, 3, 4, 5]), _.chunksOf(2))).toStrictEqual([[1, 2], [3, 4], [5]])
      expect(pipe(_.fromArray([1, 2, 3, 4, 5, 6]), _.chunksOf(2))).toStrictEqual([
        [1, 2],
        [3, 4],
        [5, 6]
      ])
      expect(pipe(_.fromArray([1, 2, 3, 4, 5]), _.chunksOf(5))).toStrictEqual([[1, 2, 3, 4, 5]])
      expect(pipe(_.fromArray([1, 2, 3, 4, 5]), _.chunksOf(6))).toStrictEqual([[1, 2, 3, 4, 5]])
      expect(pipe(_.fromArray([1, 2, 3, 4, 5]), _.chunksOf(1))).toStrictEqual([[1], [2], [3], [4], [5]])
      expect(pipe(_.fromArray([1, 2]), _.chunksOf(0))).toStrictEqual([[1, 2]])
      expect(pipe(_.fromArray([1, 2]), _.chunksOf(10))).toStrictEqual([[1, 2]])
      expect(pipe(_.fromArray([1, 2]), _.chunksOf(-1))).toStrictEqual([[1, 2]])
    })

    // #897
    it('returns an empty array if provided an empty array', () => {
      expect(_.chunksOf(1)(_.empty)).toStrictEqual([])
      expect(_.chunksOf(2)(_.empty)).toStrictEqual([])
      expect(_.chunksOf(0)(_.empty)).toStrictEqual([])
    })

    // #897
    it('should respect the law: RA.chunksOf(n)(xs).concat(RA.chunksOf(n)(ys)) == RA.chunksOf(n)(xs.concat(ys)))', () => {
      const xs: _.GeneratorFunction<number> = _.fromArray([])
      const ys: _.GeneratorFunction<number> = _.fromArray([1, 2])
      expect(_.chunksOf(2)(xs).concat(_.chunksOf(2)(ys))).toStrictEqual(_.chunksOf(2)(xs.concat(ys)))
      fc.expect(
        fc.property(
          fc.array(fc.integer()).filter((xs) => xs.length % 2 === 0), // Ensures `xs.length` is even
          fc.array(fc.integer()),
          fc.integer(1, 1).map((x) => x * 2), // Generates `n` to be even so that it evenly divides `xs`
          (xs, ys, n) => {
            const as = _.chunksOf(n)(xs).concat(_.chunksOf(n)(ys))
            const bs = _.chunksOf(n)(xs.concat(ys))
            isDeepStrictEqual(as, bs)
          }
        )
      )
    })
  })

  it('makeBy', () => {
    const double = (n: number): number => n * 2
    expect(pipe(_.makeBy(5, double), _.toArray)).toStrictEqual([0, 2, 4, 6, 8])
  })

  it('range', () => {
    expect(pipe(_.range(0, 0), _.toArray)).toStrictEqual([0])
    expect(pipe(_.range(1, 5), _.toArray)).toStrictEqual([1, 2, 3, 4, 5])
    expect(pipe(_.range(10, 15), _.toArray)).toStrictEqual([10, 11, 12, 13, 14, 15])
  })
*/

  it('replicate', () => {
    expect(pipe(_.replicate(0, 'a'), _.toArray)).toStrictEqual([])
    expect(pipe(_.replicate(3, 'a'), _.toArray)).toStrictEqual(['a', 'a', 'a'])
  })

  it('should be safe when calling map with a binary function', () => {
    interface Foo {
      readonly bar: () => number
    }
    const f = (a: number, x?: Foo) => (x !== undefined ? `${a}${x.bar()}` : `${a}`)
    expect(pipe(_.Functor.map(_.fromArray([1, 2]), f), _.toArray)).toStrictEqual(['1', '2'])
    expect(pipe(_.fromArray([1, 2]), _.map(f), _.toArray)).toStrictEqual(['1', '2'])
  })

  it('empty', () => {
    expect(pipe(_.empty, _.toArray)).toStrictEqual([])
  })

  it('do notation', () => {
    expect(
      pipe(
        _.of(1),
        _.bindTo('a'),
        _.bind('b', () => _.of('b')),
        _.toArray,
      ),
    ).toStrictEqual([{ a: 1, b: 'b' }])
  })

  it('apS', () => {
    expect(pipe(_.of(1), _.bindTo('a'), _.apS('b', _.of('b')), _.toArray)).toStrictEqual([{ a: 1, b: 'b' }])
  })

  it('every', () => {
    const isPositive: Predicate<number> = (n) => n > 0
    expect(pipe(_.fromArray([1, 2, 3]), _.every(isPositive))).toStrictEqual(true)
    expect(pipe(_.fromArray([1, 2, -3]), _.every(isPositive))).toStrictEqual(false)
  })

  it('some', () => {
    const isPositive: Predicate<number> = (n) => n > 0
    expect(pipe(_.fromArray([-1, -2, 3]), _.some(isPositive))).toStrictEqual(true)
    expect(pipe(_.fromArray([-1, -2, -3]), _.some(isPositive))).toStrictEqual(false)
  })
})
