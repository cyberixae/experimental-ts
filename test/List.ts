import * as _ from '../src/List'
import { pipe } from 'fp-ts/lib/function'
import * as RNEA from 'fp-ts/lib/ReadonlyNonEmptyArray'

// @ts-ignore broken _tag
const missingTag: Empty = {}

describe('List', () => {
  describe('internal', () => {
    it('empty', () => {
      expect(_.empty).toStrictEqual({
        _tag: 'Empty',
        items: [],
      })
    })
    it('staticHead', () => {
      const items: RNEA.ReadonlyNonEmptyArray<number> = [0]
      expect(_.staticHead(items, _.empty)).toStrictEqual({
        _tag: 'StaticHead',
        items,
        next: _.empty,
      })
    })
    it('lazyHead', () => {
      const items = function* () {
        yield 0
      }
      expect(_.lazyHead(items, _.empty)).toStrictEqual({
        _tag: 'LazyHead',
        items,
        next: _.empty,
      })
    })
    it('infinite lazyHead', () => {
      const items = function* () {
        while (true) {
          yield 0
        }
      }
      expect(_.lazyHead(items)).toStrictEqual({
        _tag: 'LazyHead',
        items,
        next: _.empty,
      })
    })
  })
  it('fromArray', () => {
    expect(_.fromArray([])).toStrictEqual(_.empty)
    expect(_.fromArray([1, 2, 3])).toStrictEqual(_.staticHead([1, 2, 3]))
  })
  it('toIterable', () => {
    expect(Array.from(_.toIterable(_.linear)(_.empty))).toStrictEqual([])
    expect(Array.from(_.toIterable(_.linear)(_.staticHead([1, 2, 3])))).toStrictEqual([1, 2, 3])
    expect(
      Array.from(
        _.toIterable(_.linear)(
          _.lazyHead(function* () {
            yield 1
            yield 2
            yield 3
          }),
        ),
      ),
    ).toStrictEqual([1, 2, 3])
    for (const i of _.toIterable(_.linear)(
      _.lazyHead(function* () {
        let i = 0
        while (true) {
          i += 1
          yield i
        }
      }),
    )) {
      expect(i).toStrictEqual(1)
      break
    }
    expect(() => Array.from(_.toIterable(_.linear)(missingTag))).toThrow()
  })
  it('toArray', () => {
    expect(_.toArray(_.empty)).toStrictEqual([])
    expect(_.toArray(_.staticHead([1, 2, 3]))).toStrictEqual([1, 2, 3])
  })
  it('heads', () => {
    const head2 = _.staticHead([1])
    const head1 = _.lazyHead(function* () {
      yield 0
    }, head2)
    expect(_.heads(head1)).toStrictEqual([head1, head2])
    expect(_.heads(head2)).toStrictEqual([head2])
    expect(_.heads(_.empty)).toStrictEqual([])
  })
  it('takeLeft', () => {
    expect(pipe(_.empty, _.takeLeft(1), _.toArray)).toEqual([])
    expect(pipe(_.staticHead([2]), _.takeLeft(1), _.toArray)).toEqual([2])
    expect(
      pipe(
        _.lazyHead(function* () {
          yield 1
        }),
        _.takeLeft(1),
        _.toArray,
      ),
    ).toEqual([1])
    expect(pipe(_.staticHead([1, 2, 3]), _.takeLeft(2), _.toArray)).toStrictEqual([1, 2])
  })
  it('mapWithindex', () => {
    expect(() =>
      pipe(
        missingTag,
        _.mapWithIndex((i, x) => [i, x]),
        _.toArray,
      ),
    ).toThrow()
  })
  it('find', () => {
    expect(pipe(_.empty, _.find(0), _.toArray)).toEqual([])
    const head2 = _.staticHead([2])
    expect(pipe(head2, _.find(0), _.toArray)).toEqual([])
    expect(pipe(head2, _.find(2), _.toArray)).toEqual([
      {
        list: head2,
        index: { root: head2, offset: 0 },
        item: 2,
      },
    ])
    const head12 = _.lazyHead(function* () {
      yield 1
    }, head2)
    expect(pipe(head12, _.find(0), _.toArray)).toEqual([])
    expect(pipe(head12, _.find(1), _.toArray)).toEqual([
      {
        list: head12,
        index: { root: head12, offset: 0 },
        item: 1,
      },
    ])
    expect(pipe(head12, _.find(2), _.toArray)).toEqual([
      {
        list: head12,
        index: { root: head2, offset: 0 },
        item: 2,
      },
    ])
    const head22 = _.lazyHead(function* () {
      yield 2
    }, head2)
    expect(pipe(head22, _.find(2), _.toArray)).toEqual([
      {
        list: head22,
        index: { root: head22, offset: 0 },
        item: 2,
      },
      {
        list: head22,
        index: { root: head2, offset: 0 },
        item: 2,
      },
    ])
  })
  describe('pipeables', () => {
    it('prepend', () => {
      expect(pipe(_.staticHead([1, 2, 3]), _.prepend(0), _.toArray)).toStrictEqual([0, 1, 2, 3])
    })

    it('append', () => {
      expect(pipe(_.empty, _.append(4), _.toArray)).toStrictEqual([4])
      const items: () => Generator<number, never, undefined> = function* () {
        while (true) {
          yield 0
        }
      }
      expect(pipe(_.lazyHead(items), _.append(4))).toStrictEqual(_.lazyHead(items, _.staticHead([4], _.empty)))
      expect(pipe(_.staticHead([1, 2, 3]), _.append(4), _.toArray)).toStrictEqual([1, 2, 3, 4])
      expect(
        pipe(
          _.lazyHead(function* () {
            yield 1
            yield 2
            yield 3
          }),
          _.append(4),
          _.toArray,
        ),
      ).toStrictEqual([1, 2, 3, 4])
    })

    expect(() => pipe(missingTag, _.append(4))).toThrow()
  })
})
