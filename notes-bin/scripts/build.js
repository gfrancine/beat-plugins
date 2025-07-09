const esbuild = require("esbuild");
const { sassPlugin } = require("esbuild-sass-plugin");
// const alias = require("esbuild-plugin-alias");

const path = require("path");
const fs = require("fs");
const process = require("process");

// args: <dist path> <mode "dev" | "dev-ui" | "prod">
const DIST_PATH = process.argv[2];
const MODE = process.argv[3];

(async () => {
  fs.rmSync(DIST_PATH, { recursive: true, force: true });
  fs.cpSync("public", DIST_PATH, { recursive: true });

  console.log(`
  Output folder: ${DIST_PATH}
  Mode: ${MODE}
  `);

  const emptyTsconfigPath = path.join(DIST_PATH, "empty-tsconfig.json");
  fs.writeFileSync(emptyTsconfigPath, "{}");

  await esbuild.build({
    entryPoints: [MODE === "dev-ui" ? "src/index-dev-ui.tsx" : "src/index.tsx"],
    conditions: [MODE === "dev-ui" ? "development" : "production"],
    define: {
      "process.env.NODE_ENV":
        MODE == "dev-ui" ? '"development"' : '"production"',
    },
    bundle: true,
    minify: MODE !== "dev-ui",
    sourcemap: MODE === "dev-ui",
    outfile: path.join(DIST_PATH, "bundle.js"),
    tsconfig: emptyTsconfigPath,
    external: ["./images/*"],

    plugins: [
      sassPlugin(),
      /*
      alias({
        react: require.resolve("preact/compat"),
        "react/react-jsx-runtime": require.resolve("preact/compat"),
        "react-dom": require.resolve("preact/compat"),
        "react-dom/client": require.resolve("preact/compat/client"),
      }),
      */
    ],
  });

  fs.rmSync(emptyTsconfigPath);
})();
