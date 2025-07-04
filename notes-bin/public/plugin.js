/*

Plugin name: Notes Bin
Description: Tidies up all (CONT'D)'s in a screenplay.

Version: 0.1.0
Copyright: 2025 gfrancine

*/

// Beat.openConsole();

const DEFAULT_WINDOW_POS = { x: 60, y: 60, width: 300, height: 800 };

const htmlWindow = Beat.htmlWindow(
  Beat.assetAsString("index.html"),
  DEFAULT_WINDOW_POS.width,
  DEFAULT_WINDOW_POS.height,
  () => {
    // save position
    const windowPosition = htmlWindow.getFrame();
    Beat.setUserDefault("windowPosition", windowPosition);
    Beat.end();
  },
);

// Restore position
const windowPosition =
  Beat.getUserDefault("windowPosition") || DEFAULT_WINDOW_POS;

if (windowPosition) {
  htmlWindow.setFrame(
    windowPosition.x,
    windowPosition.y,
    windowPosition.width,
    windowPosition.height,
  );
}

Beat.custom = {
  // Beat doesn't have an async API so we have to rely on "pub-sub"
  promptImportFile: () => {
    Beat.openFile(["txt"], (path) => {
      if (!path || path.length <= 0) return;
      const contents = Beat.fileToString(path);
      htmlWindow.runJS(
        `PluginGlobals.onPromptImportFileResult(${JSON.stringify(contents)})`,
      );
    });
  },
};
