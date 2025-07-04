import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Bin } from "./types";
import "./styles.scss";

const APP_VERSION = "0.1.0";

function migrateData(data: Partial<Bin> = {}): Bin {
  if (!data.notes) data.notes = [];
  if (!data.theme) data.theme = "dark";
  return data as Bin;
}

function fetchData(): Promise<Bin> {
  return new Promise((resolve, reject) => {
    Beat.callback(
      () => {
        const data = Beat.getDocumentSetting("data");
        if (data) return JSON.parse(data);
      },
      [],
      (data?: Partial<Bin>) => resolve(migrateData(data)),
      reject,
    );
  });
}

function setData(bin: Bin) {
  Beat.call((bin: Bin) => {
    Beat.setDocumentSetting("data", JSON.stringify(bin));
  }, bin);
}

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

function renderApp(bin: Bin) {
  root.render(
    <React.StrictMode>
      <App
        version={APP_VERSION}
        bin={bin}
        persistBin={(bin) => {
          // console.log("persist data", bin);
          setData(bin);
        }}
      />
      {/*
        TODO
        handleExport={(bin) => {
          console.log("export bin", bin);
        }}
        handleImport={() => {
          return { success: true, bin: DEFAULT_BIN };
        }}
      */}
    </React.StrictMode>,
  );
}

fetchData().then(renderApp);
