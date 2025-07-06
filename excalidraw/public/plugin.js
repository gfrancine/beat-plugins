/*

Plugin name: Excalidraw
Version: 1.0
Copyright: 2025 gfrancine
Image: Excalidraw.png
Description: Use the <a href="https://excalidraw.com/" target="_blank">Excalidraw</a> app within your document.

*/

const APP_VERSION = "1.0";

// Window

// Window positioning

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

htmlWindow.stayInMemory = true;
htmlWindow.title = "Excalidraw " + APP_VERSION;

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

function fetchData() {
  const data = Beat.getDocumentSetting("data");
  if (data) return JSON.parse(data);
}

function persistData(data) {
  Beat.setDocumentSetting("data", JSON.stringify(data));
}

// API

Beat.custom = {
  exportFile: (contents) => {
    Beat.saveFile(["excalidraw"], (path) => {
      if (!path || path.length <= 0) return;
      Beat.writeToFile(path, contents);
    });
  },
  persistData,
  fetchData,
};
