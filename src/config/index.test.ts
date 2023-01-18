import config from './index'

describe('Test configurations', () => {
  it('should be able retrieve default values', () => {
    expect(config.API).toBeTruthy()
    expect(config.API.STATS).toBeTruthy()
    expect(config.API.STATS.HEALTH.ENDPOINT).toEqual('/health')
  })

  it('should be able override default values', () => {
    expect(config.API).toBeTruthy()
    expect(config.API.PORT).toEqual('80')
  })
})
