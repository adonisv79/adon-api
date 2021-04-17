// lets mock an environment being set
// Note that these might fail if you have modified environment in your machine
process.env = { ...{ ADON_API__TEST__FOO: 'bar', ADON_API__PORT: '80' }, ...process.env }
// eslint-disable-next-line import/first
import config from './index'

describe('Test configurations', () => {
  it('should be able retrieve default values', () => {
    expect(config.API).toBeTruthy()
    expect(config.API.STATS).toBeTruthy()
    expect(config.API.STATS.HEALTH.ENDPOINT).toEqual('/health')
  })

  it('should be able to parse the env config based on RC lib\'s rule', () => {
    expect(config.API).toBeTruthy()
    expect(config.API.TEST).toBeTruthy()
    expect(config.API.TEST.FOO).toEqual('bar')
  })

  it('should be able override default values', () => {
    expect(config.API).toBeTruthy()
    expect(config.API.PORT).toEqual('80')
  })
})
