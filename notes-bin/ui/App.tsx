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

const NoteDndContext = createContext<{
  targetIndex: null | number;
  listRef: null | React.RefObject<HTMLDivElement>;
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
    <div
      className={"note-dnd-item " + dragoverPositionClass}
      data-note-index={index}
      draggable={allowDrag === undefined ? true : allowDrag}
      onDragStart={(e) => {
        e.dataTransfer.setData("application/json", JSON.stringify({ noteId }));
        e.dataTransfer.setData("text/plain", getNoteContents());
      }}
      onDragEnd={(e) => {
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
            //
          }
        } */
      }}
    >
      {children}
    </div>
  );
}

function NoteDndList({
  children,
  handleNoteDropResult,
}: {
  handleNoteDropResult?: (result: NoteDropResult) => unknown;
} & React.PropsWithChildren) {
  const listRef = useRef<HTMLDivElement>(null);
  const [noteDndCtx, setNoteDndCtx] = useState<{
    targetIndex: null | number;
    listRef: null | React.RefObject<HTMLDivElement>;
  }>({
    targetIndex: null,
    listRef,
  });

  function setTargetIndex(targetIndex: null | number) {
    setNoteDndCtx({ ...noteDndCtx, targetIndex });
  }

  return (
    <NoteDndContext.Provider value={noteDndCtx}>
      <div
        className="note-dnd-list"
        ref={listRef}
        onDragLeave={() => {
          setTargetIndex(null);
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
      </div>
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current && !isEditing) {
      const textarea = textareaRef.current;
      textarea.scrollTop = 0;
      textarea.setAttribute("style", "");
    }
  }, [isEditing]);

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
        <textarea
          ref={textareaRef}
          className={isEditing ? "editing" : ""}
          value={internalContents}
          readOnly={!isEditing}
          onChange={(e) => setInternalContent(e.target.value)}
          placeholder="Note..."
          onBlur={() => {
            const newNote = { ...note };
            newNote.contents = internalContents;
            handleNoteSave(newNote);
            setIsEditing(false);
          }}
        />
      </div>
    </NoteDndItem>
  );
}

export default function App({
  version,
  bin,
  persistBin,
  handleExport,
  handleImport,
}: {
  version: string;
  bin: Bin;
  persistBin: (bin: Bin) => unknown;
  handleExport?: (bin: Bin) => unknown;
  handleImport?: () => { success: true } | { success: false; message: string };
}) {
  const [internalBin, setInternalBin] = useState<Bin>(bin);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    // handle external updates
    setInternalBin(bin);
  }, [bin]);

  function setAndPersistBin(bin: Bin) {
    setInternalBin(bin);
    persistBin(internalBin);
  }

  return (
    <div className="app" data-theme={theme}>
      <div className="header">
        <h2 className="title">Notes Bin v{version}</h2>
        <div className="toolbar">
          <input
            className="search"
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {handleImport ? (
            <button
              className="button-secondary"
              onClick={() => {
                const result = handleImport();
                // TODO
              }}
            >
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
              setTheme(theme === "dark" ? "light" : "dark");
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
              setAndPersistBin({
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
          handleNoteDropResult={(result) => {
            const newNotes = [...internalBin.notes];

            if (result.type == "create") {
              const newNote: BinNote = {
                id: nanoid(),
                contents: result.contents,
              };
              newNotes.splice(result.targetIndex, 0, newNote);
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

            setAndPersistBin({
              ...internalBin,
              notes: newNotes,
            });
          }}
        >
          {internalBin.notes.length == 0 ? (
            <div className="placeholder">
              To store notes, drag text in and out of the bin or click on the
              "+" button.
            </div>
          ) : (
            <></>
          )}
          {internalBin.notes.map((note, i) => (
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
                setAndPersistBin({
                  ...internalBin,
                  notes: newNotes,
                });
              }}
              handleNoteDelete={() => {
                const newNotes = [...internalBin.notes];
                newNotes.splice(i, 1);
                setAndPersistBin({
                  ...internalBin,
                  notes: newNotes,
                });
              }}
            />
          ))}
        </NoteDndList>
      </div>
    </div>
  );
}
