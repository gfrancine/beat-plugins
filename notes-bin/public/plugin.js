/*

Plugin name: Notes Bin
Version: 0.1.0
Copyright: 2025 gfrancine
Image: images/Notes Bin.jpg

<Description>
  <p>A Highland 2-like container for storing and organizing your notes in snippets.</p>
  <h2>Features</h2>
  <ul>
    <li>Drag and drop text from anywhere to create notes or drag notes out of the bin</li>
    <li>Import and export to text (.txt) files</li>
    <li>Text search</li>
  </ul>
  <h2>Shortcuts</h2>
  <ul>
    <li>⌘⌥2 — Toggle window</li>
  </ul>
</Description>

*/

// Beat.openConsole();

const DEFAULT_WINDOW_POS = { x: 60, y: 60, width: 300, height: 800 };

let windowOpen = true;

const initiallyOpen = Beat.getDocumentSetting("windowOpen");
if (initiallyOpen === undefined) {
  Beat.setDocumentSetting("windowOpen", windowOpen);
} else {
  windowOpen = initiallyOpen === "true";
}

const htmlWindow = Beat.htmlWindow(
  Beat.assetAsString("index.html"),
  DEFAULT_WINDOW_POS.width,
  DEFAULT_WINDOW_POS.height,
  () => {
    // save position
    const windowPosition = htmlWindow.getFrame();
    Beat.setUserDefault("windowPosition", windowPosition);
    // Beat.end();
  },
);

htmlWindow.stayInMemory = true;

function setWindowOpen(value /* boolean */) {
  windowOpen = value;
  Beat.setDocumentSetting("windowOpen", windowOpen);

  if (windowOpen) {
    htmlWindow.show();
  } else {
    htmlWindow.hide();
  }
}

setWindowOpen(initiallyOpen);

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

// https://highland-kb.quoteunquoteapps.com/kb/sidebar/bin
const menu = Beat.menu("Notes Bin", [
  Beat.menuItem("Show Window", ["cmd", "alt", "3"], () =>
    setWindowOpen(!windowOpen),
  ),
  /*
  Beat.menuItem("Cut to Bin", ["cmd", "alt", "x"], () => {
    Beat.log("cut to bin");
  }),
  Beat.menuItem("Copy to Bin", ["cmd", "alt", "c"], () => {
    Beat.log("copy to bin");
  }),
  */
]);

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
