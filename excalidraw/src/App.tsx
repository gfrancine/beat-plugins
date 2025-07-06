import React from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import type {
  AppProps,
  AppState,
} from "@excalidraw/excalidraw/dist/types/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/dist/types/excalidraw/element/types";

export type AppData = {
  elements?: readonly ExcalidrawElement[];
  appState?: AppState;
};

export function App({
  initialData,
  onChange,
  onExport,
}: {
  initialData: AppData;
  onChange: (data: AppData) => unknown;
  onExport: (contents: string) => unknown;
}) {
  return (
    <div className="app">
      <Excalidraw
        initialData={initialData}
        UIOptions={{
          canvasActions: {
            loadScene: false,
            saveToActiveFile: false,
            saveAsImage: false,
            export: {
              saveFileToDisk: false,
              renderCustomUI: (elements, appState, files, _canvas) => {
                const data = { type: "excalidraw", elements, appState, files };

                return (
                  <div className="export-dialog">
                    <div>
                      <h1>Export to disk</h1>
                      <p>
                        Export the scene data to an .excalidraw file from which
                        you can import later. To import, simply drag the
                        .excalidraw file back into the editor.
                      </p>
                    </div>
                    <button
                      className="export-button ToolIcon"
                      onClick={() => onExport(JSON.stringify(data))}
                    >
                      <div className="label">Export to disk...</div>
                    </button>
                  </div>
                );
              },
            },
          },
        }}
        onChange={(elements, appState) => onChange({ elements, appState })}
      />
    </div>
  );
}
