import * as Benchmark from 'benchmark'
import * as _ from '../../src/List'

/*
heads x 16,286 ops/sec ±0.32% (95 runs sampled)
heads2 x 20.80 ops/sec ±1.09% (35 runs sampled)
*/

const suite = new Benchmark.Suite()

function heads2<A>(list: _.List<A>): Array<_.Head<A>> {
  if (list._tag === 'Empty') {
    return []
  }
  return [list].concat(heads2(list.next))
}

let example: _.List<number> = _.empty
let i = 0
while (i < 10000) {
  example = _.staticHead([i], example)
  i += 1
}

suite
  .add('heads', function () {
    _.heads(example)
  })
  .add('heads2', function () {
    heads2(example)
  })
  .on('cycle', function (event: any) {
    // tslint:disable-next-line: no-console
    console.log(String(event.target))
  })
  .on('complete', function (this: any) {
    // tslint:disable-next-line: no-console
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
