import { Express } from 'express'
import { Server } from 'http'
import { Logger } from 'winston'

export default interface ExpressAppinterface {
  readonly isReady: boolean,
  readonly log: Logger,
  readonly rootDir: string,
  readonly express: Express,
  readonly server: Server,
}
