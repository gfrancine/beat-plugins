import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Bin, BinNote } from "./types";
import "./styles.scss";
import { nanoid } from "nanoid";

const APP_VERSION = "0.1.0";

// Bundle-safe namespace, for functions called from the plugin-side with runJS
(window as any).PluginGlobals = {};

function promisifyCallback<T extends any[], U>(
  callback: (...args: T) => U,
): (...args: T) => Promise<U> {
  return (...args: T) =>
    new Promise((resolve, reject) => {
      Beat.callback(callback, args, resolve, reject);
    });
}

// Data loading

function migrateData(data: Partial<Bin> = {}): Bin {
  if (!data.notes) data.notes = [];
  if (!data.theme) data.theme = "dark";
  return data as Bin;
}

async function fetchData() {
  const data = await promisifyCallback(() => {
    const data = Beat.getDocumentSetting("data");
    if (data) return JSON.parse(data);
  })();

  return migrateData(data as Partial<Bin> | undefined);
}

function setData(bin: Bin) {
  Beat.call((bin: Bin) => {
    Beat.setDocumentSetting("data", JSON.stringify(bin));
  }, bin);
}

// Export/Import

const TXT_SEPARATOR = "\n\n------\n\n";

function handleExport(bin: Bin) {
  Beat.call(
    (bin: Bin, separator: string) => {
      Beat.saveFile("txt", (path?: string) => {
        if (path) {
          const contents = bin.notes
            .map((note) => note.contents)
            .join(separator);
          Beat.writeToFile(path, contents);
        }
      });
    },
    bin,
    TXT_SEPARATOR,
  );
}

function handleImport() {
  Beat.call("Beat.custom.promptImportFile()");
}

// called by the plugin-side
PluginGlobals.onPromptImportFileResult = function (contents: string) {
  const notes: BinNote[] = contents
    .split(TXT_SEPARATOR)
    .map((contents) => ({ id: nanoid(), contents }));

  const bin: Bin = migrateData({ notes });
  renderApp(bin);
};

// Render app

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

function renderApp(bin: Bin) {
  root.render(
    <React.StrictMode>
      <App
        version={APP_VERSION}
        bin={bin}
        persistBin={setData}
        handleExport={handleExport}
        handleImport={handleImport}
      />
    </React.StrictMode>,
  );
}

fetchData().then(renderApp);
