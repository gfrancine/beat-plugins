export type BinNote = {
  id: string;
  contents: string;
};

// app data
export type Bin = {
  theme: "light" | "dark";
  fontSizePt: number;
  notes: BinNote[];
};
