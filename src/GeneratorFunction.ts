/**
 * @since 0.0.1
 */

import { ReadonlyNonEmptyArray } from 'fp-ts/ReadonlyNonEmptyArray'
import { Alt1 } from 'fp-ts/Alt'
import { Alternative1 } from 'fp-ts/Alternative'
import * as RA from 'fp-ts/ReadonlyArray'
import { Applicative as ApplicativeHKT, Applicative1 } from 'fp-ts/Applicative'
import { Compactable1 } from 'fp-ts/Compactable'
import { Separated } from 'fp-ts/Separated'
import { Either } from 'fp-ts/Either'
import { Eq } from 'fp-ts/Eq'
import { Ord } from 'fp-ts/Ord'
import { Filter1, Filterable1, Partition1 } from 'fp-ts/Filterable'
import {
  FilterableWithIndex1,
  PartitionWithIndex1,
  PredicateWithIndex,
  RefinementWithIndex,
} from 'fp-ts/FilterableWithIndex'
import { Foldable1 } from 'fp-ts/Foldable'
import { FoldableWithIndex1 } from 'fp-ts/FoldableWithIndex'
import { identity, Lazy, pipe, flow } from 'fp-ts/function'
import { bind_, bindTo_ } from './internal'
import { Predicate } from 'fp-ts/Predicate'
import { Refinement } from 'fp-ts/Refinement'
import { Functor1 } from 'fp-ts/Functor'
import { FunctorWithIndex1 } from 'fp-ts/FunctorWithIndex'
import { HKT } from 'fp-ts/HKT'
import { Monad1 } from 'fp-ts/Monad'
import { Monoid } from 'fp-ts/Monoid'
import * as O from 'fp-ts/Option'
import { PipeableTraverse1, Traversable1 } from 'fp-ts/Traversable'
import { PipeableTraverseWithIndex1, TraversableWithIndex1 } from 'fp-ts/TraversableWithIndex'
import { Unfoldable1 } from 'fp-ts/Unfoldable'
import { PipeableWilt1, PipeableWither1, Witherable1 } from 'fp-ts/Witherable'

import { InfiniteGeneratorFunction, repeat } from './InfiniteGeneratorFunction'
import { NonEmptyGeneratorFunction, report } from './NonEmptyGeneratorFunction'
import * as NEGF from './NonEmptyGeneratorFunction'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category model
 * @since 0.0.1
 */
export type GeneratorFunction<A> = () => Generator<A, unknown, undefined>

const concat = <A, B>(x: GeneratorFunction<A>, y: GeneratorFunction<B>): GeneratorFunction<A | B> =>
  function* () {
    yield* x()
    yield* y()
  }

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * An empty generator function
 *
 * @category constructors
 * @since 0.0.1
 */
export const empty: GeneratorFunction<never> = function* () {
  return
}

/**
 * @category constructors
 * @since 0.0.1
 */
export const generatorFunction = <A>(as: GeneratorFunction<A>) => as

/**
 * @category constructors
 * @since 0.0.1
 */
export const prepend = <A>(head: A) => (tail: GeneratorFunction<A>): NEGF.NonEmptyGeneratorFunction<A> =>
  function* () {
    yield head
    yield* tail()
    return report(head)
  }

/**
 * @category constructors
 * @since 0.0.1
 */
export const append = <A>(end: A) => (init: GeneratorFunction<A>): NEGF.NonEmptyGeneratorFunction<A> =>
  function* () {
    yield* init()
    yield end
    return report(end)
  }

/**
 * @category constructors
 * @since 0.0.1
 */
export function replicate<A>(n: number, a: A): GeneratorFunction<A> {
  return pipe(repeat(a), takeLeft(n))
}

/**
 * @category constructors
 * @since 0.0.1
 */
export const fromArray = <A>(as: ReadonlyArray<A>): GeneratorFunction<A> => fromIterable(as)

/**
 * @category constructors
 * @since 0.0.1
 */
export const fromIterable = <A>(as: Iterable<A>): GeneratorFunction<A> =>
  function* () {
    for (const a of as) {
      yield a
    }
  }

// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------

/**
 * @category destructors
 * @since 0.0.1
 */
export function toIterable<A>(as: GeneratorFunction<A>): Iterable<A> {
  return {
    [Symbol.iterator]: as,
  }
}

/**
 * @category destructors
 * @since 0.0.1
 */
export function toArray<A>(as: InfiniteGeneratorFunction<A>): never
export function toArray<A>(as: NonEmptyGeneratorFunction<A>): ReadonlyNonEmptyArray<A>
export function toArray<A>(as: GeneratorFunction<A>): ReadonlyArray<A>
export function toArray<A>(as: GeneratorFunction<A>): ReadonlyArray<A> {
  return Array.from(toIterable(as))
}

/**
 * @category Applicative
 * @since 0.0.1
 */
export const of: Applicative1<URI>['of'] = (a) =>
  function* () {
    yield a
  }

/**
 * @category Alternative
 * @since 0.0.1
 */
export const zero: Alternative1<URI>['zero'] = () => empty

// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------

/**
 * @category Alt
 * @since 0.0.1
 */
export const altW: <B>(
  that: Lazy<GeneratorFunction<B>>,
) => <A>(fa: GeneratorFunction<A>) => GeneratorFunction<A | B> = (that) => (fa) => concat(fa, that())

/**
 * @category Alt
 * @since 0.0.1
 */
export const alt: <A>(that: Lazy<GeneratorFunction<A>>) => (fa: GeneratorFunction<A>) => GeneratorFunction<A> = altW

/**
 * @category Apply
 * @since 0.0.1
 */
export const ap: <A>(fa: GeneratorFunction<A>) => <B>(fab: GeneratorFunction<(a: A) => B>) => GeneratorFunction<B> = (
  fa,
) => chain((f) => pipe(fa, map(f)))

/**
 * @category combinators
 * @since 0.0.1
 */
export const apFirst: <B>(fb: GeneratorFunction<B>) => <A>(fa: GeneratorFunction<A>) => GeneratorFunction<A> = (fb) =>
  flow(
    map((a) => () => a),
    ap(fb),
  )

/**
 * @category combinators
 * @since 0.0.1
 */
export const apSecond = <B>(fb: GeneratorFunction<B>): (<A>(fa: GeneratorFunction<A>) => GeneratorFunction<B>) =>
  flow(
    map(() => (b: B) => b),
    ap(fb),
  )

/**
 * @category combinators
 * @since 0.0.1
 */
export const sort = <B>(O: Ord<B>) => <A extends B>(as: GeneratorFunction<A>): GeneratorFunction<A> =>
  isNonEmpty(as) ? NEGF.sort(O)(as) : as

/**
 * @category combinators
 * @since 0.0.1
 */
export function zipWith<A, B, C>(
  fb: GeneratorFunction<B>,
  f: (a: A, b: B) => C,
): (fa: GeneratorFunction<A>) => GeneratorFunction<C> {
  return (fa) =>
    function* () {
      const ga = fa()
      const gb = fb()
      while (true) {
        const ra = ga.next()
        const rb = gb.next()
        if (ra.done === true) {
          return
        }
        if (rb.done === true) {
          return
        }
        yield f(ra.value, rb.value)
      }
    }
}

/**
 * @category combinators
 * @since 0.0.1
 */
export function zip<B>(bs: GeneratorFunction<B>): <A>(as: GeneratorFunction<A>) => GeneratorFunction<readonly [A, B]> {
  return zipWith(bs, (a, b) => [a, b])
}

/**
 * @since 0.0.1
 */
export function unzip<A, B>(
  abs: GeneratorFunction<readonly [A, B]>,
): readonly [GeneratorFunction<A>, GeneratorFunction<B>] {
  return [
    function* () {
      for (const [a, _] of abs()) {
        yield a
      }
    },
    function* () {
      for (const [_, b] of abs()) {
        yield b
      }
    },
  ]
}

/**
 * @category combinators
 * @since 0.0.1
 */
export function union<A>(E: Eq<A>): (ys: GeneratorFunction<A>) => (xs: GeneratorFunction<A>) => GeneratorFunction<A> {
  const elemE = elem(E)
  return (ys) => (xs) => {
    return concat(
      xs,
      pipe(
        ys,
        filter((a) => !pipe(xs, elemE(a))),
      ),
    )
  }
}

/**
 * @category combinators
 * @since 0.0.1
 */
export function intersection<A>(
  E: Eq<A>,
): (ys: GeneratorFunction<A>) => (xs: GeneratorFunction<A>) => GeneratorFunction<A> {
  const elemE = elem(E)
  return (ys) => (xs) => {
    return pipe(
      xs,
      filter((a) => pipe(ys, elemE(a))),
    )
  }
}

/**
 * @category combinators
 * @since 0.0.1
 */
export function difference<A>(
  E: Eq<A>,
): (ys: GeneratorFunction<A>) => (xs: GeneratorFunction<A>) => GeneratorFunction<A> {
  const elemE = elem(E)
  return (ys) => (xs) => {
    return pipe(
      xs,
      filter((a) => !pipe(ys, elemE(a))),
    )
  }
}

/**
 * @category Monad
 * @since 0.0.1
 */
export const chain: <A, B>(f: (a: A) => GeneratorFunction<B>) => (ma: GeneratorFunction<A>) => GeneratorFunction<B> = (
  f,
) => (ma) =>
  pipe(
    ma,
    chainWithIndex((_, a) => f(a)),
  )

/**
 * @since 0.0.1
 */
export const chainWithIndex: <A, B>(
  f: (i: number, a: A) => GeneratorFunction<B>,
) => (ma: GeneratorFunction<A>) => GeneratorFunction<B> = (f) => (ma) =>
  function* () {
    let i = 0
    for (const a of ma()) {
      const mb = f(i, a)
      yield* mb()
      i += 1
    }
  }

/**
 * @category combinators
 * @since 0.0.1
 */
export const chainFirst: <A, B>(
  f: (a: A) => GeneratorFunction<B>,
) => (ma: GeneratorFunction<A>) => GeneratorFunction<A> = (f) =>
  chain((a) =>
    pipe(
      f(a),
      map(() => a),
    ),
  )

/**
 * @category Functor
 * @since 0.0.1
 */
export const map: <A, B>(f: (a: A) => B) => (fa: GeneratorFunction<A>) => GeneratorFunction<B> = (f) => (fa) =>
  function* () {
    for (const a of fa()) {
      yield f(a)
    }
  }

/**
 * @category FunctorWithIndex
 * @since 0.0.1
 */
export const mapWithIndex: <A, B>(f: (i: number, a: A) => B) => (fa: GeneratorFunction<A>) => GeneratorFunction<B> = (
  f,
) => (fa) =>
  function* () {
    let i = 0
    for (const a of fa()) {
      yield f(i, a)
      i += 1
    }
  }

/**
 * @category Compactable
 * @since 0.0.1
 */
export const separate = <A, B>(
  fa: GeneratorFunction<Either<A, B>>,
): Separated<GeneratorFunction<A>, GeneratorFunction<B>> => ({
  left: function* () {
    for (const e of fa()) {
      if (e._tag === 'Left') {
        yield e.left
      }
    }
  },
  right: function* () {
    for (const e of fa()) {
      if (e._tag === 'Right') {
        yield e.right
      }
    }
  },
})

/**
 * @category Filterable
 * @since 0.0.1
 */
export const filter: {
  <A, B extends A>(refinement: Refinement<A, B>): (fa: GeneratorFunction<A>) => GeneratorFunction<B>
  <A>(predicate: Predicate<A>): (fa: GeneratorFunction<A>) => GeneratorFunction<A>
} = <A>(predicate: Predicate<A>) => (fa: GeneratorFunction<A>) =>
  function* () {
    for (const a of fa()) {
      if (predicate(a)) {
        yield a
      }
    }
  }

/**
 * @category FilterableWithIndex
 * @since 0.0.1
 */
export const filterMapWithIndex = <A, B>(f: (i: number, a: A) => O.Option<B>) => (
  fa: GeneratorFunction<A>,
): GeneratorFunction<B> =>
  function* () {
    let i = 0
    for (const a of fa()) {
      const o = f(i, a)
      if (o._tag === 'Some') {
        yield o.value
      }
      i += 1
    }
  }

/**
 * @category Filterable
 * @since 0.0.1
 */
export const filterMap: <A, B>(f: (a: A) => O.Option<B>) => (fa: GeneratorFunction<A>) => GeneratorFunction<B> = (f) =>
  filterMapWithIndex((_, a) => f(a))

/**
 * @category Compactable
 * @since 0.0.1
 */
export const compact: <A>(fa: GeneratorFunction<O.Option<A>>) => GeneratorFunction<A> =
  /*#__PURE__*/
  filterMap(identity)

/**
 * @category Filterable
 * @since 0.0.1
 */
export const partition: {
  <A, B extends A>(refinement: Refinement<A, B>): (
    fa: GeneratorFunction<A>,
  ) => Separated<GeneratorFunction<A>, GeneratorFunction<B>>
  <A>(predicate: Predicate<A>): (fa: GeneratorFunction<A>) => Separated<GeneratorFunction<A>, GeneratorFunction<A>>
} = <A>(
  predicate: Predicate<A>,
): ((fa: GeneratorFunction<A>) => Separated<GeneratorFunction<A>, GeneratorFunction<A>>) =>
  partitionWithIndex((_, a) => predicate(a))

/**
 * @category FilterableWithIndex
 * @since 0.0.1
 */
export const partitionWithIndex: {
  <A, B extends A>(refinementWithIndex: RefinementWithIndex<number, A, B>): (
    fa: GeneratorFunction<A>,
  ) => Separated<GeneratorFunction<A>, GeneratorFunction<B>>
  <A>(predicateWithIndex: PredicateWithIndex<number, A>): (
    fa: GeneratorFunction<A>,
  ) => Separated<GeneratorFunction<A>, GeneratorFunction<A>>
} = <A>(predicateWithIndex: PredicateWithIndex<number, A>) => (
  fa: GeneratorFunction<A>,
): Separated<GeneratorFunction<A>, GeneratorFunction<A>> => ({
  left: function* () {
    let i = 0
    for (const a of fa()) {
      if (predicateWithIndex(i, a) === false) {
        yield a
      }
      i += 1
    }
  },
  right: function* () {
    let i = 0
    for (const a of fa()) {
      if (predicateWithIndex(i, a)) {
        yield a
      }
      i += 1
    }
  },
})

/**
 * @category Filterable
 * @since 0.0.1
 */
export const partitionMap: <A, B, C>(
  f: (a: A) => Either<B, C>,
) => (fa: GeneratorFunction<A>) => Separated<GeneratorFunction<B>, GeneratorFunction<C>> = (f) =>
  partitionMapWithIndex((_, a) => f(a))

/**
 * @category FilterableWithIndex
 * @since 0.0.1
 */
export const partitionMapWithIndex = <A, B, C>(f: (i: number, a: A) => Either<B, C>) => (
  fa: GeneratorFunction<A>,
): Separated<GeneratorFunction<B>, GeneratorFunction<C>> => ({
  left: function* () {
    let i = 0
    for (const a of fa()) {
      const e = f(i, a)
      if (e._tag === 'Left') {
        yield e.left
      }
      i += 1
    }
  },
  right: function* () {
    let i = 0
    for (const a of fa()) {
      const e = f(i, a)
      if (e._tag === 'Right') {
        yield e.right
      }
      i += 1
    }
  },
})

/**
 * @category FilterableWithIndex
 * @since 0.0.1
 */
export const filterWithIndex: {
  <A, B extends A>(refinementWithIndex: RefinementWithIndex<number, A, B>): (
    fa: GeneratorFunction<A>,
  ) => GeneratorFunction<B>
  <A>(predicateWithIndex: PredicateWithIndex<number, A>): (fa: GeneratorFunction<A>) => GeneratorFunction<A>
} = <A>(predicateWithIndex: PredicateWithIndex<number, A>) => (fa: GeneratorFunction<A>): GeneratorFunction<A> =>
  function* () {
    let i = 0
    for (const a of fa()) {
      if (predicateWithIndex(i, a)) {
        yield a
      }
      i += 1
    }
  }

/**
 * @category FoldableWithIndex
 * @since 0.0.1
 */
export const foldMapWithIndex: <M>(
  M: Monoid<M>,
) => <A>(f: (i: number, a: A) => M) => (fa: GeneratorFunction<A>) => M = (M) => {
  const foldMapWithIndexM = foldMapWithIndex_(M)
  return (f) => (fa) => foldMapWithIndexM(fa, f)
}

/**
 * @category Foldable
 * @since 0.0.1
 */
export const reduce: <A, B>(b: B, f: (b: B, a: A) => B) => (fa: GeneratorFunction<A>) => B = (b, f) =>
  reduceWithIndex(b, (_, b, a) => f(b, a))

/**
 * @category Foldable
 * @since 0.0.1
 */
export const foldMap: <M>(M: Monoid<M>) => <A>(f: (a: A) => M) => (fa: GeneratorFunction<A>) => M = (M) => {
  const foldMapWithIndexM = foldMapWithIndex(M)
  return (f) => foldMapWithIndexM((_, a) => f(a))
}

/**
 * @category FoldableWithIndex
 * @since 0.0.1
 */
export const reduceWithIndex: <A, B>(b: B, f: (i: number, b: B, a: A) => B) => (fa: GeneratorFunction<A>) => B = (
  b,
  f,
) => (fa) => reduceWithIndex_(fa, b, f)

/**
 * @category Foldable
 * @since 0.0.1
 */
export const reduceRight: <A, B>(b: B, f: (a: A, b: B) => B) => (fa: GeneratorFunction<A>) => B = (b, f) =>
  reduceRightWithIndex(b, (_, a, b) => f(a, b))

/**
 * @category FoldableWithIndex
 * @since 0.0.1
 */
export const reduceRightWithIndex: <A, B>(b: B, f: (i: number, a: A, b: B) => B) => (fa: GeneratorFunction<A>) => B = (
  b,
  f,
) => (fa) => pipe(toArray(fa), RA.reduceRightWithIndex(b, f))

/**
 * @category Traversable
 * @since 0.0.1
 */
export const traverse: PipeableTraverse1<URI> = <F>(
  F: ApplicativeHKT<F>,
): (<A, B>(f: (a: A) => HKT<F, B>) => (ta: GeneratorFunction<A>) => HKT<F, GeneratorFunction<B>>) => {
  const traverseWithIndexF = traverseWithIndex(F)
  return (f) => traverseWithIndexF((_, a) => f(a))
}

/**
 * @category Traversable
 * @since 0.0.1
 */
export const sequence: Traversable1<URI>['sequence'] = <F>(F: ApplicativeHKT<F>) => <A>(
  ta: GeneratorFunction<HKT<F, A>>,
): HKT<F, GeneratorFunction<A>> => {
  return reduce_(ta, F.of(zero()), (fas, fa) =>
    F.ap(
      F.map(fas, (as) => (a: A) => append(a)(as)),
      fa,
    ),
  )
}

/**
 * @category TraversableWithIndex
 * @since 0.0.1
 */
export const traverseWithIndex: PipeableTraverseWithIndex1<URI, number> = <F>(F: ApplicativeHKT<F>) => <A, B>(
  f: (i: number, a: A) => HKT<F, B>,
): ((ta: GeneratorFunction<A>) => HKT<F, GeneratorFunction<B>>) =>
  reduceWithIndex(F.of(zero()), (i, fbs, a) =>
    F.ap(
      F.map(fbs, (bs) => (b: B) => append(b)(bs)),
      f(i, a),
    ),
  )

/**
 * @category Witherable
 * @since 0.0.1
 */
export const wither: PipeableWither1<URI> = <F>(
  F: ApplicativeHKT<F>,
): (<A, B>(f: (a: A) => HKT<F, O.Option<B>>) => (fa: GeneratorFunction<A>) => HKT<F, GeneratorFunction<B>>) => {
  const traverseF = traverse(F)
  return (f) => (fa) => F.map(pipe(fa, traverseF(f)), compact)
}

/**
 * @category Witherable
 * @since 0.0.1
 */
export const wilt: PipeableWilt1<URI> = <F>(
  F: ApplicativeHKT<F>,
): (<A, B, C>(
  f: (a: A) => HKT<F, Either<B, C>>,
) => (fa: GeneratorFunction<A>) => HKT<F, Separated<GeneratorFunction<B>, GeneratorFunction<C>>>) => {
  const traverseF = traverse(F)
  return (f) => (fa) => F.map(pipe(fa, traverseF(f)), separate)
}

/**
 * @category Unfoldable
 * @since 0.0.1
 */
export const unfold = <A, B>(b: B, f: (b: B) => O.Option<readonly [A, B]>): GeneratorFunction<A> =>
  function* () {
    let bb: B = b
    while (true) {
      const mt = f(bb)
      if (O.isNone(mt)) {
        return
      }
      const [a, b] = mt.value
      yield a
      bb = b
    }
  }

// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------

const map_: Monad1<URI>['map'] = (fa, f) => pipe(fa, map(f))
const mapWithIndex_: FunctorWithIndex1<URI, number>['mapWithIndex'] = (fa, f) => pipe(fa, mapWithIndex(f))
const ap_: Monad1<URI>['ap'] = (fab, fa) => pipe(fab, ap(fa))
const chain_: <A, B>(fa: GeneratorFunction<A>, f: (a: A) => GeneratorFunction<B>) => GeneratorFunction<B> = (ma, f) =>
  pipe(ma, chain(f))
const filter_: Filter1<URI> = <A>(fa: GeneratorFunction<A>, predicate: Predicate<A>) => pipe(fa, filter(predicate))
const filterMap_: Filterable1<URI>['filterMap'] = (fa, f) => pipe(fa, filterMap(f))
const partitionWithIndex_: PartitionWithIndex1<URI, number> = <A>(
  fa: GeneratorFunction<A>,
  predicateWithIndex: (i: number, a: A) => boolean,
): Separated<GeneratorFunction<A>, GeneratorFunction<A>> => pipe(fa, partitionWithIndex(predicateWithIndex))
const partition_: Partition1<URI> = <A>(
  fa: GeneratorFunction<A>,
  predicate: Predicate<A>,
): Separated<GeneratorFunction<A>, GeneratorFunction<A>> => pipe(fa, partition(predicate))
const partitionMap_: Filterable1<URI>['partitionMap'] = (fa, f) => pipe(fa, partitionMap(f))
const partitionMapWithIndex_ = <A, B, C>(
  fa: GeneratorFunction<A>,
  f: (i: number, a: A) => Either<B, C>,
): Separated<GeneratorFunction<B>, GeneratorFunction<C>> => pipe(fa, partitionMapWithIndex(f))
const alt_: Alt1<URI>['alt'] = (fa, that) => pipe(fa, alt(that))
const reduce_: Foldable1<URI>['reduce'] = (fa, b, f) => pipe(fa, reduce(b, f))
const foldMap_: Foldable1<URI>['foldMap'] = (M) => {
  const foldMapM = foldMap(M)
  return (fa, f) => pipe(fa, foldMapM(f))
}
const reduceRight_: Foldable1<URI>['reduceRight'] = (fa, b, f) => pipe(fa, reduceRight(b, f))
const reduceWithIndex_: FoldableWithIndex1<URI, number>['reduceWithIndex'] = (fa, b, f) => {
  let acc = b
  let i = 0
  for (const a of fa()) {
    acc = f(i, acc, a)
    i += 1
  }
  return acc
}
const foldMapWithIndex_: FoldableWithIndex1<URI, number>['foldMapWithIndex'] = (M) => (fa, f) =>
  reduceWithIndex_(fa, M.empty, (i, b, a) => M.concat(b, f(i, a)))
const reduceRightWithIndex_: FoldableWithIndex1<URI, number>['reduceRightWithIndex'] = (fa, b, f) =>
  pipe(fa, reduceRightWithIndex(b, f))
const filterMapWithIndex_ = <A, B>(
  fa: GeneratorFunction<A>,
  f: (i: number, a: A) => O.Option<B>,
): GeneratorFunction<B> => pipe(fa, filterMapWithIndex(f))
const filterWithIndex_ = <A>(
  fa: GeneratorFunction<A>,
  predicateWithIndex: (i: number, a: A) => boolean,
): GeneratorFunction<A> => pipe(fa, filterWithIndex(predicateWithIndex))
const traverse_ = <F>(
  F: ApplicativeHKT<F>,
): (<A, B>(ta: GeneratorFunction<A>, f: (a: A) => HKT<F, B>) => HKT<F, GeneratorFunction<B>>) => {
  const traverseF = traverse(F)
  return (ta, f) => pipe(ta, traverseF(f))
}
/* istanbul ignore next */
const traverseWithIndex_ = <F>(
  F: ApplicativeHKT<F>,
): (<A, B>(ta: GeneratorFunction<A>, f: (i: number, a: A) => HKT<F, B>) => HKT<F, GeneratorFunction<B>>) => {
  const traverseWithIndexF = traverseWithIndex(F)
  return (ta, f) => pipe(ta, traverseWithIndexF(f))
}
/* istanbul ignore next */
const wither_ = <F>(
  F: ApplicativeHKT<F>,
): (<A, B>(ta: GeneratorFunction<A>, f: (a: A) => HKT<F, O.Option<B>>) => HKT<F, GeneratorFunction<B>>) => {
  const witherF = wither(F)
  return (fa, f) => pipe(fa, witherF(f))
}
/* istanbul ignore next */
const wilt_ = <F>(
  F: ApplicativeHKT<F>,
): (<A, B, C>(
  fa: GeneratorFunction<A>,
  f: (a: A) => HKT<F, Either<B, C>>,
) => HKT<F, Separated<GeneratorFunction<B>, GeneratorFunction<C>>>) => {
  const wiltF = wilt(F)
  return (fa, f) => pipe(fa, wiltF(f))
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @category instances
 * @since 0.0.1
 */
export const URI = 'GeneratorFunction'

/**
 * @category instances
 * @since 0.0.1
 */
export type URI = typeof URI

declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    readonly [URI]: GeneratorFunction<A>
  }
}

/**
 * @category instances
 * @since 0.0.1
 */
export const Functor: Functor1<URI> = {
  URI,
  map: map_,
}

/**
 * @category instances
 * @since 0.0.1
 */
export const FunctorWithIndex: FunctorWithIndex1<URI, number> = {
  URI,
  map: map_,
  mapWithIndex: mapWithIndex_,
}

/**
 * @category instances
 * @since 0.0.1
 */
export const Applicative: Applicative1<URI> = {
  URI,
  map: map_,
  ap: ap_,
  of,
}

/**
 * @category instances
 * @since 0.0.1
 */
export const Monad: Monad1<URI> = {
  URI,
  map: map_,
  ap: ap_,
  of,
  chain: chain_,
}

/**
 * @category instances
 * @since 0.0.1
 */
export const Unfoldable: Unfoldable1<URI> = {
  URI,
  unfold,
}

/**
 * @category instances
 * @since 0.0.1
 */
export const Alt: Alt1<URI> = {
  URI,
  map: map_,
  alt: alt_,
}

/**
 * @category instances
 * @since 0.0.1
 */
export const Alternative: Alternative1<URI> = {
  URI,
  map: map_,
  ap: ap_,
  of,
  alt: alt_,
  zero,
}

/**
 * @category instances
 * @since 0.0.1
 */
export const Compactable: Compactable1<URI> = {
  URI,
  compact,
  separate,
}

/**
 * @category instances
 * @since 0.0.1
 */
export const Filterable: Filterable1<URI> = {
  URI,
  map: map_,
  compact,
  separate,
  filter: filter_,
  filterMap: filterMap_,
  partition: partition_,
  partitionMap: partitionMap_,
}

/**
 * @category instances
 * @since 0.0.1
 */
export const FilterableWithIndex: FilterableWithIndex1<URI, number> = {
  URI,
  map: map_,
  mapWithIndex: mapWithIndex_,
  compact,
  separate,
  filter: filter_,
  filterMap: filterMap_,
  partition: partition_,
  partitionMap: partitionMap_,
  partitionMapWithIndex: partitionMapWithIndex_,
  partitionWithIndex: partitionWithIndex_,
  filterMapWithIndex: filterMapWithIndex_,
  filterWithIndex: filterWithIndex_,
}

/**
 * @category instances
 * @since 0.0.1
 */
export const Foldable: Foldable1<URI> = {
  URI,
  reduce: reduce_,
  foldMap: foldMap_,
  reduceRight: reduceRight_,
}

/**
 * @category instances
 * @since 0.0.1
 */
export const FoldableWithIndex: FoldableWithIndex1<URI, number> = {
  URI,
  reduce: reduce_,
  foldMap: foldMap_,
  reduceRight: reduceRight_,
  reduceWithIndex: reduceWithIndex_,
  foldMapWithIndex: foldMapWithIndex_,
  reduceRightWithIndex: reduceRightWithIndex_,
}

/**
 * @category instances
 * @since 0.0.1
 */
export const Traversable: Traversable1<URI> = {
  URI,
  map: map_,
  reduce: reduce_,
  foldMap: foldMap_,
  reduceRight: reduceRight_,
  traverse: traverse_,
  sequence,
}

/**
 * @category instances
 * @since 0.0.1
 */
export const TraversableWithIndex: TraversableWithIndex1<URI, number> = {
  URI,
  map: map_,
  mapWithIndex: mapWithIndex_,
  reduce: reduce_,
  foldMap: foldMap_,
  reduceRight: reduceRight_,
  reduceWithIndex: reduceWithIndex_,
  foldMapWithIndex: foldMapWithIndex_,
  reduceRightWithIndex: reduceRightWithIndex_,
  traverse: traverse_,
  sequence,
  traverseWithIndex: traverseWithIndex_,
}

/**
 * @category instances
 * @since 0.0.1
 */
export const Witherable: Witherable1<URI> = {
  URI,
  map: map_,
  compact,
  separate,
  filter: filter_,
  filterMap: filterMap_,
  partition: partition_,
  partitionMap: partitionMap_,
  reduce: reduce_,
  foldMap: foldMap_,
  reduceRight: reduceRight_,
  traverse: traverse_,
  sequence,
  wither: wither_,
  wilt: wilt_,
}

// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------

/**
 * @since 0.0.1
 */
export const Do: GeneratorFunction<{}> = of({})

/**
 * @since 0.0.1
 */
export const bindTo = <N extends string>(
  name: N,
): (<A>(fa: GeneratorFunction<A>) => GeneratorFunction<{ [K in N]: A }>) => map(bindTo_(name))

/**
 * @since 0.0.1
 */
export const bind = <N extends string, A, B>(
  name: Exclude<N, keyof A>,
  f: (a: A) => GeneratorFunction<B>,
): ((fa: GeneratorFunction<A>) => GeneratorFunction<{ [K in keyof A | N]: K extends keyof A ? A[K] : B }>) =>
  chain((a) =>
    pipe(
      f(a),
      map((b) => bind_(a, name, b)),
    ),
  )

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

/**
 * @since 0.0.1
 */
export function isEmpty<A>(as: GeneratorFunction<A>): boolean {
  return as().next().done === true
}

/**
 * @since 0.0.1
 */
export function isNonEmpty<A>(as: GeneratorFunction<A>): as is NEGF.NonEmptyGeneratorFunction<A> {
  return as().next().done !== true
}

/**
 * @since 0.0.1
 */
export function head<A>(as: GeneratorFunction<A>): O.Option<A> {
  const r = as().next()
  return r.done === true ? O.none : O.some(r.value)
}

/**
 * @since 0.0.1
 */
export function last<A>(as: GeneratorFunction<A>): O.Option<A> {
  let tmp: O.Option<A> = O.none
  for (const a of as()) {
    tmp = O.some(a)
  }
  return tmp
}

/**
 * @since 0.0.1
 */
export function tail<A>(as: GeneratorFunction<A>): O.Option<GeneratorFunction<A>> {
  return isEmpty(as)
    ? O.none
    : O.some(function* () {
        const g = as()
        g.next() // discard head
        yield* g
      })
}

/**
 * @since 0.0.1
 */
export function init<A>(as: GeneratorFunction<A>): O.Option<GeneratorFunction<A>> {
  return isEmpty(as)
    ? O.none
    : O.some(function* () {
        const g = as()
        const r = g.next()
        if (r.done === true) {
          return
        }
        let prev: A = r.value
        for (const a of g) {
          yield prev
          prev = a
        }
      })
}

/**
 * @category combinators
 * @since 0.0.1
 */
export const takeLeft = <A>(count: number) => (as: GeneratorFunction<A>): GeneratorFunction<A> =>
  function* () {
    let i = 0
    for (const a of as()) {
      if (i >= count) {
        return
      }
      yield a
      i += 1
    }
  }

/**
 * @since 0.0.1
 */
export function takeRight(n: number): <A>(as: GeneratorFunction<A>) => GeneratorFunction<A> {
  return (as) =>
    function* () {
      if (n === 0) {
        return
      }
      const tmp = []
      let i = 0
      for (const a of as()) {
        if (i >= n) {
          i = 0
        }
        tmp[i] = a
        i += 1
      }
      yield* RA.rotate(0 - i)(tmp)
    }
}

/**
 * @category combinators
 * @since 0.0.1
 */
/*
export function takeLeftWhile<A, B extends A>(refinement: Refinement<A, B>): (as: GeneratorFunction<A>) => GeneratorFunction<B>
export function takeLeftWhile<A>(predicate: Predicate<A>): (as: GeneratorFunction<A>) => GeneratorFunction<A>
export function takeLeftWhile<A>(predicate: Predicate<A>): (as: GeneratorFunction<A>) => GeneratorFunction<A> {
  return (as) => {
    const i = spanIndexUncurry(as, predicate)
    const init = Array(i)
    for (let j = 0; j < i; j++) {
      init[j] = as[j]
    }
    return init
  }
}

const spanIndexUncurry = <A>(as: GeneratorFunction<A>, predicate: Predicate<A>): number => {
  const l = as.length
  let i = 0
  for (; i < l; i++) {
    if (!predicate(as[i])) {
      break
    }
  }
  return i
}

/**
 * @since 0.0.1
 */
/*
export interface Spanned<I, R> {
  readonly init: GeneratorFunction<I>
  readonly rest: GeneratorFunction<R>
}

/**
 * @since 0.0.1
 */
/*
export function spanLeft<A, B extends A>(refinement: Refinement<A, B>): (as: GeneratorFunction<A>) => Spanned<B, A>
export function spanLeft<A>(predicate: Predicate<A>): (as: GeneratorFunction<A>) => Spanned<A, A>
export function spanLeft<A>(predicate: Predicate<A>): (as: GeneratorFunction<A>) => Spanned<A, A> {
  return (as) => {
    const i = spanIndexUncurry(as, predicate)
    const init = Array(i)
    for (let j = 0; j < i; j++) {
      init[j] = as[j]
    }
    const l = as.length
    const rest = Array(l - i)
    for (let j = i; j < l; j++) {
      rest[j - i] = as[j]
    }
    return { init, rest }
  }
}

/**
 * @category combinators
 * @since 0.0.1
 */
/*
export function dropLeft(n: number): <A>(as: GeneratorFunction<A>) => GeneratorFunction<A> {
  return (as) => as.slice(n, as.length)
}

/**
 * @category combinators
 * @since 0.0.1
 */
/*
export function dropRight(n: number): <A>(as: GeneratorFunction<A>) => GeneratorFunction<A> {
  return (as) => as.slice(0, as.length - n)
}

/**
 * @category combinators
 * @since 0.0.1
 */
/*
export function dropLeftWhile<A>(predicate: Predicate<A>): (as: GeneratorFunction<A>) => GeneratorFunction<A> {
  return (as) => {
    const i = spanIndexUncurry(as, predicate)
    const l = as.length
    const rest = Array(l - i)
    for (let j = i; j < l; j++) {
      rest[j - i] = as[j]
    }
    return rest
  }
}

/**
 * @since 0.0.1
 */
export const every = <A>(predicate: Predicate<A>) => (as: GeneratorFunction<A>): boolean => {
  for (const a of as()) {
    if (predicate(a) === false) {
      return false
    }
  }
  return true
}

/**
 * @since 0.0.1
 */
export const some = <A>(predicate: Predicate<A>) => (as: GeneratorFunction<A>): boolean => {
  for (const a of as()) {
    if (predicate(a) === true) {
      return true
    }
  }
  return false
}

/**
 * @since 0.0.1
 */
export const lookup = (i: number) => <A>(as: GeneratorFunction<A>): O.Option<A> => {
  let ii = 0
  for (const a of as()) {
    if (ii === i) {
      return O.some(a)
    }
    ii += 1
  }
  return O.none
}

/**
 * @since 0.0.1
 */
export const elem = <A>(E: Eq<A>) => (a: A) => (as: GeneratorFunction<A>): boolean => {
  const predicate = (element: A) => E.equals(element, a)
  for (const a of as()) {
    if (predicate(a)) {
      return true
    }
  }
  return false
}

// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------

/**
 * @since 0.0.1
 */
export const apS = <A, N extends string, B>(
  name: Exclude<N, keyof A>,
  fb: GeneratorFunction<B>,
): ((fa: GeneratorFunction<A>) => GeneratorFunction<{ [K in keyof A | N]: K extends keyof A ? A[K] : B }>) =>
  flow(
    map((a) => (b: B) => bind_(a, name, b)),
    ap(fb),
  )
