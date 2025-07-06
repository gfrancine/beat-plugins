import React from "react";
import ReactDOM from "react-dom/client";
import { App, AppData } from "./App";
import "./styles.scss";

// (window as any).PluginGlobals = {};

// https://tech.reverse.hr/articles/debounce-function-in-typescript

function debounce<T extends unknown[]>(
  callback: (...args: T) => void,
  delay: number,
) {
  let timeoutTimer: ReturnType<typeof setTimeout>;

  return (...args: T) => {
    clearTimeout(timeoutTimer);

    timeoutTimer = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

// https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/props/

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

function persistData(data: AppData) {
  Beat.call((data: AppData) => Beat.custom.persistData(data), data);
}

const debouncedPersistData = debounce(persistData, 500);

function renderApp(data: AppData) {
  root.render(
    <App
      initialData={data}
      onExport={(contents) => {
        Beat.call(
          (contents: string) => Beat.custom.exportFile(contents),
          contents,
        );
      }}
      onChange={(data) => {
        debouncedPersistData(data);
      }}
    />,
  );
}

Beat.callback(
  () => {
    return Beat.custom.fetchData();
  },
  [],
  (fetchedData?: AppData) => {
    // silence type warning
    let data: any = fetchedData || {};

    data = {
      ...data,
      appState: {
        ...data?.appState,
        collaborators: [], // https://github.com/excalidraw/excalidraw/issues/7148
      },
    };

    renderApp(data as AppData);
  },
);
