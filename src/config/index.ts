/**
 * Configuration simply uses dotenv. modify configurations using environment
 * or rc files as defined in https://www.npmjs.com/package/rc
 * defaults will be loaded thru the defaults.json file
 */
import dotenv from 'dotenv'

dotenv.config()
const configDefaults = require('./defaults.json')

export default configDefaults
