#!/usr/bin/env node

const process = require("process");
const utils = require("./utils");

const commands = {
  // (args: string[]) => unknown
  install: require("./install"),
};

const HELP =
  "USAGE: <command> [...args]" +
  "\n\nAvailable commands:\n" +
  Object.keys(commands)
    .map((command) => "\t" + command)
    .join("\n");

if (process.argv.length < 3) utils.eprint(HELP);

const command = commands[process.argv[2]];
if (!command) utils.eprint(HELP + `\n\nNo command found "${process.argv[2]}"`);

command(process.argv.slice(3));
