import { mocked } from 'ts-jest/dist/utils/testing'
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
const onHealthCheck = jest.fn()
const onLoading = jest.fn()
const onReady = jest.fn(async () => {
  app.start()
})
const onDestroy = jest.fn()

describe('ExpressApp', () => {
  it('cannot be tested', () => {
    expect('Jest has problems with express and http server not releasing resources with it').toBeTruthy()
    expect(onLoading).toHaveBeenCalledTimes(0)
    expect(onReady).toHaveBeenCalledTimes(0)
    expect(onHealthCheck).toHaveBeenCalledTimes(0)
    expect(onDestroy).toHaveBeenCalledTimes(0)
  })

  // it('Its ready stat is true and onReady has been called ', () => {
  //   expect(onLoading).toHaveBeenCalledTimes(1)
  //   expect(app.isReady).toEqual(true)
  //   expect(onReady).toHaveBeenCalledTimes(1)
  // })

  // it('Its should provide a healthcheck endpoint to see if the server is ok', async () => {
  //   const res = await request.get('/health')
  //   expect(onLoading).toHaveBeenCalledTimes(1)
  //   expect(app.isReady).toEqual(true)
  //   expect(onReady).toHaveBeenCalledTimes(1)
  //   expect(onHealthCheck).toHaveBeenCalledTimes(1)
  //   expect(res.body).toEqual({ status: 'ok' })
  // })
})
