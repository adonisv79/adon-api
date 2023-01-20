/**
 * Configuration simply uses dotenv and configstore.
 */
import dotenv from 'dotenv'

dotenv.config()

export default {
    "API": {
        "LOGGING": {
            "LEVEL": "debug"
        },
        "PORT": "3000",
        "SECURITY": {
            "CORS_ORIGINS": "*"
        }
    },
    "ENV": process.env
}
