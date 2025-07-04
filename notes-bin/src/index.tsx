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

function persistData(bin: Bin) {
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

// External drop callbacks

/*
Removing text from the editor on drop: text selection disappears right before 
a drop event is fired, so the plugin handles it by keeping track of the current
selection during a dragging event. 

When it detects a drop, it checks if the dropped text matches the selection.
Which means if you drag text from outside the app that perfectly matches the
selection somehow it will delete the selection, but it's highly unlikely
*/

type BeatSelectionRange = { location: number; length: number };
let currentSelection: BeatSelectionRange | null = null;

const getSelectedRange = promisifyCallback(
  () => Beat.selectedRange() as BeatSelectionRange,
);
const getDocumentText = promisifyCallback(() => Beat.getText() as string);
const replaceRange = promisifyCallback(
  (index: number, length: number, string: string) =>
    Beat.replaceRange(index, length, string),
);

async function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
  if (e.dataTransfer.getData("application/json").length === 0) {
    currentSelection = await getSelectedRange();
  }
}

function handleDragLeave() {
  currentSelection = null;
}

async function handleTextDropSuccess(newNote: BinNote) {
  // Bug: Why does this add an "undefined" after the range?
  // TODO: is this a Beat issue? reproduce
  // replaceRange(0, 1, "");

  if (currentSelection && currentSelection.length > 0) {
    const text = await getDocumentText();
    const selectedText = text.slice(
      currentSelection.location,
      currentSelection.location + currentSelection.length,
    );

    if (selectedText === newNote.contents) {
      replaceRange(currentSelection.location, currentSelection.length, "");
    }
  }

  currentSelection = null;
}

// Render app

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

function renderApp(bin: Bin) {
  root.render(
    <React.StrictMode>
      <App
        version={APP_VERSION}
        bin={bin}
        persistBin={persistData}
        handleExport={handleExport}
        handleImport={handleImport}
        handleDragEnter={handleDragEnter}
        handleDragLeave={handleDragLeave}
        handleTextDropSuccess={handleTextDropSuccess}
      />
    </React.StrictMode>,
  );
}

fetchData().then(renderApp);
