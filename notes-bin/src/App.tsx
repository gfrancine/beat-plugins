import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  createContext,
} from "react";
import { Bin, BinNote, NoteDropResult } from "./types";
import { nanoid } from "nanoid";
import {
  DeleteIcon,
  AddIcon,
  LightDarkIcon,
  ExportIcon,
  ImportIcon,
} from "./Icons";
import { useDebouncedCallback } from "use-debounce";
import Editor from "./Editor";

const NoteDndContext = createContext<{
  targetIndex: null | number;
  listRef: null | React.RefObject<HTMLElement>;
}>({
  targetIndex: null,
  listRef: null,
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
    noteDndCtx.targetIndex === index
      ? "above"
      : noteDndCtx.targetIndex === index + 1
        ? "under"
        : "";

  return (
    <li
      className={"note-dnd-item " + dragoverPositionClass}
      data-note-index={index}
      draggable={allowDrag === undefined ? true : allowDrag}
      onDragStart={(e) => {
        e.dataTransfer.setData("application/json", JSON.stringify({ noteId }));
        e.dataTransfer.setData("text/plain", getNoteContents());
      }}
      onDragEnd={(_e) => {
        /*
        // remove if drop was successful and outside of the drop zone?
        if (noteDndCtx.listRef && noteDndCtx.listRef.current) {
          const listRect = noteDndCtx.listRef.current.getBoundingClientRect();
          if (
            !(
              e.clientY > listRect.y &&
              e.clientY < listRect.y + listRect.height &&
              e.clientX > listRect.x &&
              e.clientX < listRect.x + listRect.width
            )
          ) {
            // handle successful drop outside
          }
        } */
      }}
    >
      {children}
    </li>
  );
}

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
  const [noteDndCtx, setNoteDndCtx] = useState<{
    targetIndex: null | number;
    listRef: null | React.RefObject<HTMLElement>;
  }>({
    targetIndex: null,
    listRef,
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
          e.preventDefault(); // accept drop
          setTargetIndex(0);

          if (listRef.current) {
            const dndItems = listRef.current.querySelectorAll(".note-dnd-item");

            for (let i = 0; i < dndItems.length; i++) {
              const dndItemElement = dndItems[i] as HTMLElement;
              const rect = dndItemElement.getBoundingClientRect();
              if (e.clientY > rect.y && e.clientY < rect.y + rect.height) {
                const noteIndex = Number(
                  dndItemElement.getAttribute("data-note-index"),
                );
                if (e.clientY > rect.y + rect.height) {
                  setTargetIndex(noteIndex + 1);
                } else {
                  setTargetIndex(noteIndex);
                }
              }
            }

            const lastDndItem = dndItems[dndItems.length - 1] as
              | HTMLElement
              | undefined;

            if (lastDndItem) {
              const rect = lastDndItem.getBoundingClientRect();
              const noteIndex = Number(
                lastDndItem.getAttribute("data-note-index"),
              );
              if (e.clientY > rect.y + rect.height / 2) {
                setTargetIndex(noteIndex + 1);
              }
            }
          }
        }}
        onDrop={(e) => {
          e.preventDefault();

          if (handleNoteDropResult && noteDndCtx.targetIndex !== null) {
            // existing note: move it up/down
            const jsonData = e.dataTransfer.getData("application/json");

            if (jsonData) {
              try {
                const data = JSON.parse(jsonData);
                if (typeof data === "object" && data.noteId) {
                  handleNoteDropResult({
                    type: "move",
                    id: data.noteId,
                    targetIndex: noteDndCtx.targetIndex,
                  });
                }
              } catch {
                // warn ?
              }
            } else {
              // plaintext: create new note
              const textData = e.dataTransfer.getData("text/plain");
              if (textData) {
                handleNoteDropResult({
                  type: "create",
                  contents: textData,
                  targetIndex: noteDndCtx.targetIndex,
                });
              }
            }
          }

          setTargetIndex(null);
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
            /*<button onClick={() => setIsEditing(false)}>
              <CheckIcon />
            </button>*/
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
              // textColor="var(--elevated-fg)"
              //selectionBackground=""
              cursorColor="var(--accent)"
              cursorWidth="2px"
              selectionBackground="var(--accent)"
              selectionUnfocusedBackground="var(--elevated-fg)"
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

export default function App({
  bin,
  handleBinUpdate,
  handleExport,
  handleImport,
  handleDragEnter,
  handleDragLeave,
  handleTextDropSuccess,
}: {
  bin: Bin;
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
  const [internalBin, setInternalBin] = useState<Bin>(bin);
  const [searchQuery, setSearchQuery] = useState("");

  // handle external updates / rerenders
  useEffect(() => {
    setInternalBin(bin);
  }, [bin]);

  useEffect(() => {
    handleBinUpdate?.(internalBin);
  }, [internalBin]);

  const setTheme = (theme: Bin["theme"]) => {
    setInternalBin({ ...internalBin, theme });
  };

  return (
    <div className="app" data-theme={internalBin.theme}>
      <div className="header">
        {/* Remove for now
        <h2 className="title">Notes Bin v{version}</h2> */}
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
    </div>
  );
}
