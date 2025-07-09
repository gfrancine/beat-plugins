import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Bin } from "./types";
import "./styles.scss";

const DEFAULT_BIN: Partial<Bin> = {
  theme: "dark",
  fontSizePt: 9,
  notes: [
    { id: "1", contents: "1" },
    { id: "2", contents: "3" },
    { id: "3", contents: "2" },
    { id: "4", contents: "4" },
  ],
};

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

function renderApp(bin: Partial<Bin>) {
  root.render(
    <App
      bin={bin}
      handleBinUpdate={(bin) => {
        console.log("bin update", bin);
      }}
    />,
  );
}

renderApp(DEFAULT_BIN);
