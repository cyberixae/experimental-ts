import * as _ from '../src/Tombstone'

describe('Tombstone', () => {
  it('tombstone', () => {
    const stone: _.Tombstone<number> = _.tombstone(123)
    expect(stone).toBeInstanceOf(_.Tombstone)
  })
  it('toString', () => {
    expect(String(_.tombstone(123))).toStrictEqual('Tombstone {}')
  })
})
