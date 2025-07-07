// Install local plugins directly in Beat
// MacOS only

const path = require("path");
const fs = require("fs");
const os = require("os");
const utils = require("./utils");

module.exports = (args) => {
  const PLUGINS_DIR = path.join(
    os.homedir(),
    "/Library/Containers/fi.KAPITAN.Beat/Data/Library/Application Support/Beat/Plugins",
  );

  const HELP = "USAGE: install <plugin dir>";
  if (args.length < 1) utils.eprint(HELP);

  const sourcePath = args[0];
  const pluginName = path.parse(sourcePath).base;
  const targetPath = path.join(PLUGINS_DIR, pluginName);

  console.log(`Copying: '${sourcePath}'\nTo: '${targetPath}'`);

  fs.rmSync(targetPath, { recursive: true, force: true });
  fs.cpSync(sourcePath, targetPath, { recursive: true });
};
