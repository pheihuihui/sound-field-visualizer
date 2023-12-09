import es from "esbuild"
import fs from "fs"

const dir_client = "./dist"

if (fs.existsSync(dir_client)) {
    fs.rmSync(dir_client, { recursive: true })
}

fs.mkdirSync(dir_client, { recursive: true })
fs.copyFileSync("./resources/favicon.ico", `${dir_client}/favicon.ico`)
fs.copyFileSync("./resources/index.html", `${dir_client}/index.html`)

es.buildSync({
    entryPoints: ["./src/index.ts"],
    outfile: `${dir_client}/client.js`,
    minify: true,
    bundle: false,
    tsconfig: "./tsconfig.json",
    platform: "browser",
    treeShaking: true,
})
