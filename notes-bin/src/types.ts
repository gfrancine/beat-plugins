export type BinNote = {
  id: string;
  contents: string;
};

// app data
export type Bin = {
  theme: "light" | "dark";
  notes: BinNote[];
};

export type NoteDropResult = (
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
