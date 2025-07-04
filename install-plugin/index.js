#!/usr/bin/env node

// MacOS only

const path = require("path");
const fs = require("fs");
const os = require("os");
const process = require("process");

const PLUGINS_DIR = path.join(
  os.homedir(),
  "/Library/Containers/fi.KAPITAN.Beat/Data/Library/Application Support/Beat/Plugins"
);
const HELP = "USAGE: <plugin dir>";

function eprint(message) {
  console.error(message);
  process.exit(1);
}

if (process.argv.length < 3) eprint(HELP);

const sourcePath = process.argv[2];
const pluginName = path.parse(sourcePath).base;
const targetPath = path.join(PLUGINS_DIR, pluginName);

console.log(`Copying: '${sourcePath}'\nTo: '${targetPath}'`);

fs.rmSync(targetPath, { recursive: true, force: true });
fs.cpSync(sourcePath, targetPath, { recursive: true });
