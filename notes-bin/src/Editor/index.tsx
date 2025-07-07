import React from "react";
import ReactCodeEditor from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { markdown } from "@codemirror/lang-markdown";
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import "./index.css";

const markdownHighlighting = HighlightStyle.define([
  {
    tag: tags.heading1,
    fontSize: "1.6em",
    fontWeight: "bold",
  },
  {
    tag: tags.heading2,
    fontSize: "1.4em",
    fontWeight: "bold",
  },
  {
    tag: tags.heading3,
    fontSize: "1.2em",
    fontWeight: "bold",
  },
  {
    tag: tags.strong,
    fontWeight: "bold",
  },
  {
    tag: tags.emphasis,
    fontStyle: "italic",
  },
  {
    tag: tags.monospace,
    fontFamily: "monospace",
  },
]);

type Theme = Record<string, Record<string, unknown>>;

/* const theme: Theme = EditorView.theme({
  "&": {
    color: "inherit",
    backgroundColor: "transparent",
  },
  ".cm-focused": {
    outline: "none!important",
  },
  ".cm-scroller": {
    fontFamily: "inherit",
  },
}, { dark }); */

const extensions = [
  EditorView.lineWrapping,
  // theme,
  markdown({
    // base: markdownLanguage, // GFM
  }),
  syntaxHighlighting(markdownHighlighting),
];

export default function Editor({
  value,
  onChange,
  theme,
  placeholder,
  textColor = "inherit",
  fontFamily = "inherit",
  selectionBackground = "#3b82f6",
  selectionOpacity = "50%",
  selectionUnfocusedOpacity = "30%",
  selectionUnfocusedBackground = "#000",
  cursorColor = "black",
  cursorWidth = "1.2px",
  dark,
  htmlProps,
}: {
  value?: string;
  onChange?: (value: string) => unknown;
  placeholder?: string;
  textColor?: string;
  fontFamily?: string;
  selectionBackground?: string;
  selectionOpacity?: string;
  selectionUnfocusedOpacity?: string;
  selectionUnfocusedBackground?: string;
  cursorColor?: string;
  cursorWidth?: string;
  theme?: Theme;
  dark?: boolean;
  htmlProps?: Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "placeholder"
  >;
}) {
  // https://uiwjs.github.io/react-codemirror/#/
  return (
    <ReactCodeEditor
      {...htmlProps}
      extensions={[
        ...extensions,
        EditorView.theme(
          {
            "&": {
              color: textColor,
              backgroundColor: "transparent !important",
            },
            ".cm-scroller": {
              fontFamily,
              lineHeight: "inherit",
              overflow: "hidden", // prevent weird scroll bars showing up on update
            },
            "&.cm-focused .cm-selectionBackground": {
              backgroundColor: selectionBackground + " !important",
              opacity: selectionOpacity,
            },
            ".cm-selectionBackground": {
              backgroundColor: selectionUnfocusedBackground + " !important",
              opacity: selectionUnfocusedOpacity || selectionOpacity,
            },
            ".cm-cursor": {
              borderLeft: `${cursorWidth} solid ${cursorColor}`,
            },
            ".cm-line": {
              padding: 0,
            },
            ...theme,
          },
          { dark },
        ),
      ]}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      basicSetup={{
        lineNumbers: false,
        foldGutter: false,
        dropCursor: false,
        allowMultipleSelections: false,
        indentOnInput: false,
        highlightActiveLine: false,
        highlightActiveLineGutter: false,
        bracketMatching: false,
        syntaxHighlighting: false,
        highlightSelectionMatches: false,
        searchKeymap: false,
        highlightSpecialChars: false,
        rectangularSelection: false,
      }}
    />
  );
}
