const esbuild = require("esbuild");
const { sassPlugin } = require("esbuild-sass-plugin");
const alias = require("esbuild-plugin-alias");

const path = require("path");
const process = require("process");
const shell = require("shelljs");

// args: <dist path> <mode "dev" | "prod">
const DIST_PATH = process.argv[2];
const MODE = process.argv[3];

const splitPath = DIST_PATH.split(path.sep);
shell.rm("-rf", splitPath[0]);
if (splitPath.length > 0)
  shell.mkdir("-p", splitPath.slice(0, splitPath.length - 1).join(path.sep));
shell.cp("-r", "plugin", DIST_PATH);

console.log(`
Output folder: ${DIST_PATH}
Mode: ${MODE}
`);

esbuild.build({
  entryPoints: ["ui/index.tsx"],
  bundle: true,
  minify: true,
  sourcemap: MODE === "dev",
  outfile: path.join(DIST_PATH, "bundle.js"),
  plugins: [
    sassPlugin(),
    alias({
      react: require.resolve("preact/compat"),
      "react-dom": require.resolve("preact/compat"),
      "react-dom/client": require.resolve("preact/compat/client"),
    }),
  ],
});
