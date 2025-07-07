# Beat Plugins

Various plugins for the [Beat](https://github.com/lmparppei/Beat) screenwriting program.

- [Notes Bin](notes-bin)
- [Clean (CONT'D's)](clean-contds)
- [Excalidraw](excalidraw)

## Downloading

The built-in Plugin Manager within Beat is the preferred way to install the plugins.

However, some plugins aren't available or haven't been updated yet in the Plugin Manager. You can find the latest builds in the [Releases](https://github.com/gfrancine/beat-plugins/releases) page as .zip files and install them manually in the app data folder (`/Users/[username]/Library/Containers/fi.KAPITAN.Beat/Data/Library/Application Support/Beat/Plugins/`).

## Developing

As the workspace is set up with the `npm` package manager, NodeJS is required to maintain and build most of the plugins.

Most of the plugins use the `plugin-commands` command line utility (also found in this repository), which has useful commands such as installing local plugins directly into Beat.

Make sure to install all the root-level packages when developing.

`prettier` is used for code formatting. Make sure to run `npm run fmt-all` at the root directory before committing.

## Copyright

(c) 2025 gfrancine
