import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { duotoneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import './CodeEditor.css'

const CodeEditor = ({ fileName, data, setData }) => {
  // const [data, setData] = useState(`\n`);
  const codes = {
    html: "xml",
    jsx: "jsx",
    php: "php",
    js: "javascript",
    json: "javascript",
    txt: "textfile",
    xml: "xml",
    md: "markup",
    css: "css",
    cpp: "clike",
    c: "clike",
    cs: "clike",
    java: "java",
    py: "python",
  };
  const handleDownKey = (evt) => {
    let value = content,
      selStartPos = evt.currentTarget.selectionStart;
    console.log(evt.currentTarget);
    if (evt.key === "Tab") {
      value =
        value.substring(0, selStartPos) +
        "   " +
        value.substr(selStartPos, value.length);
      evt.currentTarget.selectionStart = selStartPos + 3;
      evt.currentTarget.selectionEnd = selStartPos + 3;
      evt.preventDefault();

      setData(value);
    }
  };
  return (
    <div className="row px-5 mt-3">
      <div className="col-md-12 mx-auto code-edit-container p-3">
        <textarea
          className="code-input w-100"
          value={data}
          onKeyDown={handleDownKey}
          onChange={(e) => setData(e.target.value)}
        />
        <pre className="code-output">
            <SyntaxHighlighter
                language={codes[fileName.split(".")[1]]}
                showLineNumbers
                style={duotoneLight}
                wrapLines
                startingLineNumber={1}
            >
                {data}
            </SyntaxHighlighter>
        </pre>
      </div>
    </div>
  );
};

export default CodeEditor;
