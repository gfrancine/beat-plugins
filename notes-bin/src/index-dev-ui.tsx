import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Bin } from "./types";
import "./styles.scss";

const APP_VERSION = "0.1.0";
const DEFAULT_BIN: Bin = { theme: "dark", notes: [] };

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

function renderApp(bin: Bin) {
  root.render(
    <React.StrictMode>
      <App
        bin={bin}
        handleBinUpdate={(bin) => {
          console.log("bin update", bin);
        }}
      />
    </React.StrictMode>,
  );
}

renderApp(DEFAULT_BIN);
