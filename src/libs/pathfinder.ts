import path from 'path'

export function getAppRoot():string {
  return path.parse(require.main!.filename).dir
}
