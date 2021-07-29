import * as _ from '../src/Sighting'

describe('Sighting', () => {
  it('sighting', () => {
    const stone: _.Sighting<number> = _.sighting(123)
    expect(stone).toBeInstanceOf(_.Sighting)
  })
  it('toString', () => {
    expect(String(_.sighting(123))).toStrictEqual('Sighting {}')
  })
})
