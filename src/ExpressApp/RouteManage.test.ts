import RouteManager from './RouteManager'
import { ExpressApp } from './index'

jest.mock('./index', () => ({
  ExpressApp: jest.fn().mockImplementation(() => ({
    log: {
      info: jest.fn(),
    },
  })),
}))

jest.mock('fs', () => ({
  readdirSync: jest.fn().mockImplementation(() => (['/routes/test_path1.rt.ts', '/routes/test_path2.rt.js', 'nottest.png', 'notdotfilename'])),
}))
let app: ExpressApp

describe('RouteManager', () => {
  beforeEach(() => {
    app = new ExpressApp({
      onDestroy: jest.fn(),
      onHealthCheck: jest.fn(),
      onLoading: jest.fn(),
      onReady: jest.fn(),
      port: 7777,
    })
  })

  it('should start a new instance of RouteManage', () => {
    const route = new RouteManager(app)
    expect(route).toBeTruthy()
  })

  it('should itterate through the file list and properly generate routes for the service', () => {
    const route = new RouteManager(app)
    route.init()
    expect(route).toBeTruthy()
    // todo: finish this
  })
})
