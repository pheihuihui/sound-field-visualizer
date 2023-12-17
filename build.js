import es from "esbuild"
import fs from "fs"

const dir_client = "./dist"

if (fs.existsSync(dir_client)) {
    fs.rmSync(dir_client, { recursive: true })
}

fs.mkdirSync(dir_client, { recursive: true })
fs.copyFileSync("./resources/favicon.ico", `${dir_client}/favicon.ico`)
fs.copyFileSync("./resources/main.css", `${dir_client}/main.css`)
fs.copyFileSync("./resources/index.html", `${dir_client}/index.html`)
fs.copyFileSync("./resources/ball.png", `${dir_client}/ball.png`)

es.buildSync({
    entryPoints: ["./src/index.ts"],
    outfile: `${dir_client}/client.js`,
    minify: false,
    bundle: true,
    format: "esm",
    tsconfig: "./tsconfig.json",
    platform: "browser",
    treeShaking: false,
    sourcemap: true
})
