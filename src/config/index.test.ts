import config from './index'

describe('Test configurations', () => {
  it('should be able retrieve default values', () => {
    expect(config.API.PORT).toBeTruthy()
  })
})
