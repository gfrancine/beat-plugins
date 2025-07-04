import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Bin } from "./types";
import "./styles.scss";

const APP_VERSION = "0.1.0";

const DEFAULT_BIN = { notes: [] };
const TEST_BIN: Bin = {
  notes: [
    {
      id: "1",
      contents: "1",
    },
    {
      id: "2",
      contents: "2",
    },
    {
      id: "3",
      contents: "3",
    },
    {
      id: "4",
      contents: "4",
    },
  ],
};

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

function renderApp(bin: Bin) {
  root.render(
    <React.StrictMode>
      <App
        version={APP_VERSION}
        bin={bin}
        persistBin={(bin) => {
          console.log("persist bin", bin);
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

renderApp(DEFAULT_BIN);
