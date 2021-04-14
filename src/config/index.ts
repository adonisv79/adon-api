/**
 * Configuration simply uses dotenv with RC library. modify configurations using environment
 * or rc files as defined in https://www.npmjs.com/package/rc
 * defaults will be loaded thru the defaults.json file
 */
import rc from 'rc'
import dotenv from 'dotenv'

dotenv.config()
const configDefaults = require('./defaults.json')

const config = rc('ADON', configDefaults)

export default config
