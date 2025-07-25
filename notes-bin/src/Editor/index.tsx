import React, { useEffect, useMemo, useRef } from "react";
import ReactCodeEditor, {
  Extension,
  ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
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

const extensions = [
  EditorView.lineWrapping,
  markdown(),
  syntaxHighlighting(markdownHighlighting),
];

export default function Editor({
  value,
  onChange,
  focusOnMount,
  placeholder,
  htmlProps,
  theme = {},
  themeOverrides,
  themeDark,
}: {
  value?: string;
  onChange?: (value: string) => unknown;
  focusOnMount?: boolean;
  placeholder?: string;
  htmlProps?: Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "placeholder"
  >;
  theme?: Partial<{
    textColor: string;
    fontFamily: string;
    selectionBackground: string;
    selectionOpacity: string;
    selectionUnfocusedOpacity: string;
    selectionUnfocusedBackground: string;
    cursorColor: string;
    cursorWidth: string;
  }>;
  themeOverrides?: Record<string, Record<string, unknown>>;
  themeDark?: boolean;
}) {
  // https://uiwjs.github.io/react-codemirror/#/

  const editorRef = useRef<ReactCodeMirrorRef>(null);

  const {
    textColor = "inherit",
    fontFamily = "inherit",
    selectionBackground = "#3b82f6",
    selectionOpacity = "30%",
    selectionUnfocusedOpacity = "20%",
    selectionUnfocusedBackground = "#000",
    cursorColor = "black",
    cursorWidth = "1.2px",
  } = theme;

  const editorTheme = useMemo(
    () =>
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
          ...themeOverrides,
        },
        { dark: themeDark },
      ) as Extension,
    [theme, themeOverrides, themeDark],
  );

  useEffect(() => {
    if (focusOnMount) {
      setTimeout(() => {
        if (editorRef.current) editorRef.current.view?.focus();
      }, 50); // small delay before the EditorView is present in the ref
    }
  }, []);

  return (
    <ReactCodeEditor
      {...htmlProps}
      ref={editorRef}
      extensions={[...extensions, editorTheme]}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      basicSetup={{
        allowMultipleSelections: false,
        autocompletion: false,
        bracketMatching: false,
        completionKeymap: false,
        crosshairCursor: false,
        // TODO: why does the default caret color not follow the font color?
        // drawSelection: false,
        foldGutter: false,
        foldKeymap: false,
        highlightActiveLine: false,
        highlightActiveLineGutter: false,
        highlightSelectionMatches: false,
        highlightSpecialChars: false,
        indentOnInput: false,
        lineNumbers: false,
        lintKeymap: false,
        rectangularSelection: false,
        searchKeymap: false,
        syntaxHighlighting: false,
      }}
    />
  );
}
