import dotenv from 'dotenv'
interface ConfigurationList { 
    [key: string] : string
 }  

export class ConfigHelper {
    private config: ConfigurationList

    constructor() {
        dotenv.config()
        this.config = {}
        Object.keys(process.env).forEach(k => {
            this.set(k, process.env[k])
        })
    }

    set(key: string, value = ''): void {
        this.config[key] = value
    }

    get(key: string, required = false): string {
        if (required && (this.config[key] === undefined || this.config[key] === null)) {
            throw new Error(`ExpressApp: Configuration '${key}' does not exist`)
        }
        return this.config[key]
    }
}

const instance = new ConfigHelper()
export default instance
