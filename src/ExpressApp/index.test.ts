import { mocked } from 'ts-jest/dist/utils/testing'
import supertest, { SuperTest, Test } from 'supertest'
import { Logger } from 'winston'
import { ExpressApp } from './index'
import RouteManager from './RouteManager'
import { logger } from '../logger'

jest.mock('./RouteManager')
jest.mock('../logger')
RouteManager.prototype.init = jest.fn()
mocked(logger).debug.mockImplementation(() => ({} as Logger))
// const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never)
let app: ExpressApp
let request: SuperTest<Test>
const onHealthCheck = jest.fn()
const onLoading = jest.fn()
const onReady = jest.fn(async () => {
  app.start()
})
const onDestroy = jest.fn()

describe('ExpressApp', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    app = new ExpressApp({
      onDestroy,
      onHealthCheck,
      onLoading,
      onReady,
      port: 7777,
    })
    request = supertest(app.server)
  })

  afterEach(async () => {
    await app.destroy()
  })

  it('Its ready stat is true and onReady has been called ', () => {
    expect(onLoading).toHaveBeenCalledTimes(1)
    expect(app.isReady).toEqual(true)
    expect(onReady).toHaveBeenCalledTimes(1)
  })

  it('Its should provide a healthcheck endpoint to see if the server is ok', async () => {
    const res = await request.get('/health')
    expect(onLoading).toHaveBeenCalledTimes(1)
    expect(app.isReady).toEqual(true)
    expect(onReady).toHaveBeenCalledTimes(1)
    expect(onHealthCheck).toHaveBeenCalledTimes(1)
    expect(res.body).toEqual({ status: 'ok' })
  })
})
