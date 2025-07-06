import React from "react";
import ReactDOM from "react-dom/client";
import { App, AppData } from "./App";
import "./styles.scss";

// https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/props/

let appData: AppData | undefined;

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

function renderApp() {
  root.render(
    <App
      initialData={{}}
      onExport={(contents) => console.log(contents)}
      onChange={(data) => {
        appData = data;
        console.log(appData);
      }}
    />,
  );
}

renderApp();
