/** Prints an error message and exits the process with code 1. */
function eprint(message) {
  console.error(message);
  process.exit(1);
}

module.exports = {
  eprint,
};
