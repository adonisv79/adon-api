import path from 'path'

/**
 * Retrieves the App Root path of the consuming service
 * @returns The app root path
 */
export function getAppRoot():string {
  if (require.main) {
    return path.parse(require.main.filename).dir
  }
  return __dirname
}
