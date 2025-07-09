import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  createContext,
} from "react";
import { Bin, BinNote } from "./types";
import { nanoid } from "nanoid";
import {
  DeleteIcon,
  AddIcon,
  LightDarkIcon,
  ExportIcon,
  ImportIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "./Icons";
import { useDebouncedCallback } from "use-debounce";
import Editor from "./Editor";

type NoteDndCtx = {
  listRef: null | React.RefObject<HTMLElement>;
  targetIndex: null | number;
  draggingIndex: null | number;
  setDraggingIndex: (draggingIndex: number | null) => void;
};

const NoteDndContext = createContext<NoteDndCtx>({
  targetIndex: null,
  listRef: null,
  draggingIndex: null,
  setDraggingIndex: () => {},
});

// https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
function NoteDndItem({
  index,
  noteId,
  children,
  allowDrag,
  getNoteContents,
}: {
  index: number;
  noteId: string;
  allowDrag?: boolean;
  getNoteContents: () => string;
} & React.PropsWithChildren) {
  const noteDndCtx = useContext(NoteDndContext);

  const dragoverPositionClass =
    noteDndCtx.targetIndex === index - 1
      ? "above"
      : noteDndCtx.targetIndex === index
        ? "under"
        : "";

  return (
    <li
      className={"note-dnd-item " + dragoverPositionClass}
      draggable={allowDrag === undefined ? true : allowDrag}
      onDragStart={(e) => {
        e.dataTransfer.setData("application/json", JSON.stringify({ noteId }));
        e.dataTransfer.setData("text/plain", getNoteContents());
        noteDndCtx.setDraggingIndex(index);
      }}
      onDragEnd={() => {
        noteDndCtx.setDraggingIndex(null);
      }}
    >
      {children}
    </li>
  );
}

type NoteDropResult = (
  | {
      type: "move";
      id: string;
    }
  | {
      type: "create";
      contents: string;
    }
) & {
  targetIndex: number;
};

function NoteDndList({
  children,
  handleDragEnter,
  handleDragLeave,
  handleNoteDropResult,
}: {
  handleDragEnter?: (event: React.DragEvent<HTMLElement>) => unknown;
  handleDragLeave?: (event: React.DragEvent<HTMLElement>) => unknown;
  handleNoteDropResult?: (result: NoteDropResult) => unknown;
} & React.PropsWithChildren) {
  const listRef = useRef<HTMLElement>(null);
  const [noteDndCtx, setNoteDndCtx] = useState<NoteDndCtx>({
    listRef,
    targetIndex: null,
    draggingIndex: null,
    setDraggingIndex: (draggingIndex) =>
      setNoteDndCtx({ ...noteDndCtx, draggingIndex }),
  });

  function setTargetIndex(targetIndex: null | number) {
    setNoteDndCtx({ ...noteDndCtx, targetIndex });
  }

  return (
    <NoteDndContext.Provider value={noteDndCtx}>
      <ul
        className="note-dnd-list"
        ref={listRef as React.RefObject<HTMLUListElement>}
        onDragEnter={(e) => handleDragEnter?.(e)}
        onDragLeave={(e) => {
          setTargetIndex(null);
          handleDragLeave?.(e);
        }}
        onDragOver={(e) => {
          if (e.dataTransfer.types.indexOf("text/plain") !== -1) {
            e.preventDefault();
            setTargetIndex(-1);

            if (listRef.current) {
              const dndItems =
                listRef.current.querySelectorAll(".note-dnd-item");

              for (let i = 0; i < dndItems.length; i++) {
                const dndItemElement = dndItems[i] as HTMLElement;
                const rect = dndItemElement.getBoundingClientRect();

                if (e.clientY > rect.y && e.clientY < rect.y + rect.height) {
                  if (e.clientY > rect.y + rect.height / 2) {
                    setTargetIndex(i);
                  } else {
                    setTargetIndex(i - 1);
                  }
                  break;
                } else if (
                  i === dndItems.length - 1 && // last item
                  e.clientY > rect.y + rect.height / 2
                ) {
                  setTargetIndex(i);
                }
              }
            }
          }
        }}
        onDrop={(e) => {
          if (noteDndCtx.targetIndex !== null) {
            // existing note: move it up/down
            const jsonData = e.dataTransfer.getData("application/json");

            if (jsonData) {
              try {
                const data = JSON.parse(jsonData);
                if (typeof data === "object" && data.noteId) {
                  e.preventDefault();
                  handleNoteDropResult?.({
                    type: "move",
                    id: data.noteId,
                    targetIndex: Math.max(noteDndCtx.targetIndex, 0),
                  });
                }
              } catch {}
            } else {
              // plaintext: create new note
              const textData = e.dataTransfer.getData("text/plain");
              if (textData) {
                e.preventDefault();
                handleNoteDropResult?.({
                  type: "create",
                  contents: textData,
                  targetIndex: noteDndCtx.targetIndex,
                });
              }
            }
          }

          setTargetIndex(null);
          noteDndCtx.setDraggingIndex(null);
        }}
      >
        {children}
      </ul>
    </NoteDndContext.Provider>
  );
}

function Note({
  note,
  index,
  hidden,
  handleNoteSave,
  handleNoteDelete,
}: {
  note: BinNote;
  index: number;
  hidden?: boolean;
  handleNoteSave: (newNote: BinNote) => unknown;
  handleNoteDelete: () => unknown;
}) {
  const [internalContents, setInternalContent] = useState(note.contents);
  const [isEditing, setIsEditing] = useState(false);

  const saveNote = () => {
    const newNote = { ...note };
    newNote.contents = internalContents;
    handleNoteSave(newNote);
  };

  // https://github.com/xnimorz/use-debounce?tab=readme-ov-file#debounced-callbacks
  // save the note on type
  const debouncedSaveNote = useDebouncedCallback(saveNote, 500, {
    trailing: true,
  });

  return hidden ? (
    <></>
  ) : (
    <NoteDndItem
      index={index}
      noteId={note.id}
      allowDrag={!isEditing}
      getNoteContents={() => internalContents}
    >
      <div
        className="note"
        onDoubleClick={() => {
          if (!isEditing) setIsEditing(true);
        }}
      >
        <div className="note-topbar">
          {isEditing ? (
            <></>
          ) : (
            <button
              className="button-transparent"
              onClick={() => handleNoteDelete()}
            >
              <DeleteIcon />
            </button>
          )}
        </div>
        {isEditing ? (
          <div className="text-editor">
            <Editor
              focusOnMount
              value={internalContents}
              onChange={(value) => {
                setInternalContent(value);
                debouncedSaveNote();
              }}
              placeholder="Note..."
              htmlProps={{
                onBlur: () => {
                  saveNote();
                  setIsEditing(false);
                },
              }}
              theme={{
                cursorColor: "var(--accent)",
                cursorWidth: "2px",
                selectionBackground: "var(--accent)",
                selectionUnfocusedBackground: "var(--elevated-fg)",
              }}
            />
          </div>
        ) : (
          <pre
            className={
              "text-display" + (internalContents.length === 0 ? " empty" : "")
            }
          >
            {internalContents.length === 0 ? "Note..." : internalContents}
          </pre>
        )}
      </div>
    </NoteDndItem>
  );
}

// Default values
function migrateBin(bin: Partial<Bin> = {}): Bin {
  const { notes = [], theme = "dark", fontSizePt = 9 } = bin;
  return { notes: [...notes], theme, fontSizePt }; // todo: deep copy?
}

export default function App({
  bin = {},
  handleBinUpdate,
  handleExport,
  handleImport,
  handleDragEnter,
  handleDragLeave,
  handleTextDropSuccess,
}: {
  bin?: Partial<Bin>;
  handleBinUpdate?: (bin: Bin) => unknown;
  handleExport?: (bin: Bin) => unknown;
  // expect the app to be re-rendered with a new "bin" prop
  handleImport?: () => unknown;
  // Text selection is lost when dropping; it should be tracked externally prior to it
  handleDragEnter?: (event: React.DragEvent<HTMLElement>) => unknown;
  handleDragLeave?: (event: React.DragEvent<HTMLElement>) => unknown;
  // note successfully created by dropping
  handleTextDropSuccess?: (newNote: BinNote) => unknown;
  // note successfully dragged out
  /* 
    a note: since there's no way to tell if a drop is successful outside of the
    app -- could be an accidental drag for example -- I've decided against
    deleting notes when they're dragged out. It's already pretty easy to delete
    them manually anyway.
  */
  // handleDragOutSuccess?: () => unknown;
}) {
  const [internalBin, setInternalBin] = useState<Bin>(migrateBin(bin));
  const [searchQuery, setSearchQuery] = useState("");

  // handle external updates / rerenders
  // todo: is this even needed?
  useEffect(() => {
    setInternalBin(migrateBin(bin));
  }, [bin]);

  useEffect(() => {
    handleBinUpdate?.(internalBin);
  }, [internalBin]);

  const setTheme = (theme: Bin["theme"]) => {
    setInternalBin({ ...internalBin, theme });
  };

  // UI text size

  const FONT_SIZE_INCREMENT = 0.5;

  useEffect(() => {
    (document.querySelector(":root") as HTMLElement).style.setProperty(
      "--size-font",
      internalBin.fontSizePt + "pt",
    );
  }, [internalBin.fontSizePt]);

  const setFontSize = (fontSizePt: number) => {
    setInternalBin({
      ...internalBin,
      fontSizePt: Math.min(Math.max(fontSizePt, 7), 14),
    });
  };

  return (
    <div className="app" data-theme={internalBin.theme}>
      <div className="header">
        <div className="toolbar">
          <input
            className="search"
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {handleImport ? (
            <button className="button-secondary" onClick={() => handleImport()}>
              <ImportIcon />
            </button>
          ) : (
            <></>
          )}
          {handleExport ? (
            <button
              className="button-secondary"
              onClick={() => handleExport(internalBin)}
            >
              <ExportIcon />
            </button>
          ) : (
            <></>
          )}
          <button
            className="button-secondary"
            onClick={() => {
              setTheme(internalBin.theme === "dark" ? "light" : "dark");
            }}
          >
            <LightDarkIcon />
          </button>
          <button
            className="button-primary"
            onClick={() => {
              // Add note
              const newNotes = [...internalBin.notes];
              newNotes.splice(0, 0, {
                id: nanoid(),
                contents: "",
              });
              setInternalBin({
                ...internalBin,
                notes: newNotes,
              });
            }}
          >
            <AddIcon />
          </button>
        </div>
      </div>
      <div className="notes">
        <NoteDndList
          handleDragEnter={handleDragEnter}
          handleDragLeave={handleDragLeave}
          handleNoteDropResult={(result) => {
            const newNotes = [...internalBin.notes];

            if (result.type == "create") {
              const newNote: BinNote = {
                id: nanoid(),
                contents: result.contents,
              };

              newNotes.splice(result.targetIndex, 0, newNote);

              handleTextDropSuccess?.(newNote);
            } else {
              let movingNoteIndex = -1;
              for (let i = 0; i < newNotes.length; i++) {
                if (newNotes[i].id == result.id) {
                  movingNoteIndex = i;
                  break;
                }
              }
              if (movingNoteIndex > -1) {
                const [movingNote] = newNotes.splice(movingNoteIndex, 1);
                newNotes.splice(result.targetIndex, 0, movingNote);
              }
            }

            setInternalBin({
              ...internalBin,
              notes: newNotes,
            });
          }}
        >
          {internalBin.notes.length === 0 ? (
            <div className="placeholder">
              <div>
                <p>
                  To store notes, drag text in and out of the bin or click on
                  the "+" button.
                </p>
                <p>
                  Press ⌘⌥X to cut or ⌘⌥C to copy directly from the selection.
                </p>
              </div>
            </div>
          ) : (
            internalBin.notes.map((note, i) => (
              <Note
                index={i}
                key={note.id}
                note={note}
                hidden={
                  searchQuery.length === 0
                    ? false
                    : note.contents.toLowerCase().search(searchQuery) === -1
                }
                handleNoteSave={(newNote) => {
                  const newNotes = [...internalBin.notes];
                  newNotes[i] =
                    newNote; /* is this an issue if we delete notes? */
                  setInternalBin({
                    ...internalBin,
                    notes: newNotes,
                  });
                }}
                handleNoteDelete={() => {
                  const newNotes = [...internalBin.notes];
                  newNotes.splice(i, 1);
                  setInternalBin({
                    ...internalBin,
                    notes: newNotes,
                  });
                }}
              />
            ))
          )}
        </NoteDndList>
      </div>
      <div className="zoom-toolbar">
        {/* TODO: handle keyboard shortcuts with event emitter? */}
        <button
          className="button-transparent"
          onClick={() =>
            setFontSize(internalBin.fontSizePt - FONT_SIZE_INCREMENT)
          }
        >
          <ZoomOutIcon />
        </button>
        <button
          className="button-transparent"
          onClick={() =>
            setFontSize(internalBin.fontSizePt + FONT_SIZE_INCREMENT)
          }
        >
          <ZoomInIcon />
        </button>
      </div>
    </div>
  );
}
