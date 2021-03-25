import path from 'path'
export function getAppRoot():string {
    // const d1 = __dirname;
    // const d2 = process.cwd();
    // const d3 = path.parse(require.main!.filename).dir
    // const d4 = process.env.PWD;
    // console.dir({ d1, d2, d3, d4 })
    return path.parse(require.main!.filename).dir
}
