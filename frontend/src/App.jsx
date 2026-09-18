import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import {Check,ChevronRight,Clipboard,Code2,Cpu,FileCode2,Info,LoaderCircle,Moon,Sun,RotateCcw,Sparkles,Terminal,WandSparkles,X,} 
from "lucide-react";

// --------------------------------------------------
// Task Configuration
// --------------------------------------------------

const tasks = [
  {
    id: "review",
    label: "Review",
    description: "Find bugs, quality issues & improvements",
    icon: FileCode2,
  },
  {
    id: "debug",
    label: "Debug",
    description: "Find the cause and fix errors",
    icon: Terminal,
  },
  {
    id: "explain",
    label: "Explain",
    description: "Understand how the code works",
    icon: Info,
  },
  {
    id: "optimize",
    label: "Optimize",
    description: "Improve performance & complexity",
    icon: WandSparkles,
  },
];

// --------------------------------------------------
// Sample Code
// --------------------------------------------------

const sampleCode = `def calculate_total(items):
    total = 0
    for item in items:
        total += item["price"]
    return total`;

// --------------------------------------------------
// Copy Button
// --------------------------------------------------

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);

    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  return (
    <button
      className="copy-button"
      onClick={copy}
      type="button"
    >
      {copied ? (
        <Check size={14} />
      ) : (
        <Clipboard size={14} />
      )}

      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// --------------------------------------------------
// Result Panel
// --------------------------------------------------

function ResultPanel({ result }) {
  // Empty state
  if (!result) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <Sparkles size={22} />
        </div>

        <h3>Ready to analyze</h3>

        <p>
          Your AI-powered code analysis will appear here.
        </p>

        <span className="empty-hint">
          <Cpu size={13} />
          Select a task and submit your code to begin
        </span>
      </div>
    );
  }

  return (
    <div className="result-content">

      {/* Result Header */}
      <div className="result-heading">
        <div>
          <p className="eyebrow">Analysis Result</p>

          <h2>
            <span className="language-badge">
              {result.language}
            </span>
          </h2>
        </div>

        <CopyButton value={result.summary} />
      </div>

      {/* Summary */}
      <section className="summary-card">
        <div className="section-label">
          <Sparkles size={14} />
          Summary
        </div>

        <div className="explanation-content">
  <ReactMarkdown>
    {result.summary}
  </ReactMarkdown>
</div>
      </section>

      {/* Issues */}
      <section className="result-section">

        <div className="section-title">
          <h3>Detected Issues</h3>

          <span>
            {result.issues.length} found
          </span>
        </div>

        {result.issues.length ? (
          <div className="issues-list">

            {result.issues.map((issue, index) => (
              <article
                className={`issue-card severity-${issue.severity}`}
                key={index}
              >

                <div className="issue-top">
                  <h4>{issue.title}</h4>

                  <span className="severity-badge">
                    {issue.severity}
                  </span>
                </div>

                <p>{issue.explanation}</p>

                <div className="suggestion">
                  <ChevronRight size={14} />

                  <span>
                    {issue.suggestion}
                  </span>
                </div>

              </article>
            ))}

          </div>
        ) : (
          <div className="positive-state">

            <Check size={16} />

            <div>
              <strong>
                No genuine issues found
              </strong>

              <p>
                Your code looks good based on the selected analysis.
              </p>
            </div>

          </div>
        )}

      </section>

      {/* Suggestions */}
      {result.suggestions.length > 0 && (
        <section className="result-section">

          <div className="section-title">
            <h3>Suggestions</h3>
          </div>

          <div className="suggestion-list">

            {result.suggestions.map(
              (suggestion, index) => (
                <div key={index}>
                  <ChevronRight size={14} />
                  {suggestion}
                </div>
              )
            )}

          </div>

        </section>
      )}

      {/* Complexity */}
      <section className="complexity-grid">

        <div className="metric-card">
          <span>Time complexity</span>

          <strong>
            {result.complexity.time}
          </strong>
        </div>

        <div className="metric-card">
          <span>Space complexity</span>

          <strong>
            {result.complexity.space}
          </strong>
        </div>

      </section>

      {/* Improved Code */}
      <section className="code-output">

        <div className="code-output-header">

          <div>
            <span className="section-label">
              <Code2 size={14} />
              Improved Code
            </span>

            <p>
              AI-generated refinement of your source
            </p>
          </div>

          <CopyButton
            value={result.improved_code}
          />

        </div>

        <pre>
          <code>
            {result.improved_code}
          </code>
        </pre>

      </section>

    </div>
  );
}

// --------------------------------------------------
// Main Application
// --------------------------------------------------

export default function App() {
// ------------------------------------------------
// State
// ------------------------------------------------

const [task, setTask] = useState("review");
const [code, setCode] = useState("");
const [result, setResult] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [darkMode, setDarkMode] = useState(true);

// Chat state
const [question, setQuestion] = useState("");
const [chatAnswer, setChatAnswer] = useState("");
const [chatLoading, setChatLoading] = useState(false);


// ------------------------------------------------
// Submit Code
// ------------------------------------------------

async function handleSubmit() {

  if (!code.trim()) {
    setError(
      "Add some code before starting the analysis."
    );

    return;
  }

  setLoading(true);
  setError("");

  // Clear previous chat when new analysis starts
  setQuestion("");
  setChatAnswer("");

  try {

    const response = await axios.post(
      "http://127.0.0.1:8000/ask",
      {
        task: task,
        code: code,
      }
    );

    setResult(response.data);

  } catch {

    setError(
      "Please check your connection and try again."
    );

  } finally {

    setLoading(false);

  }
}


// ------------------------------------------------
// Follow-up Chat
// ------------------------------------------------

async function handleChat() {

  if (!question.trim() || !code.trim()) {
    return;
  }

  setChatLoading(true);
  setError("");

  try {

    const response = await axios.post(
      "http://127.0.0.1:8000/chat",
      {
        code: code,
        question: question,
        context: result?.summary || "",
      }
    );

    setChatAnswer(response.data.answer);
    setQuestion("");

  } catch {

    setError(
      "Unable to get an answer. Please try again."
    );

  } finally {

    setChatLoading(false);

  }
}


// ------------------------------------------------
// UI
// ------------------------------------------------

return (
  <main
    className={`app-shell ${
      darkMode ? "dark-mode" : "light-mode"
    }`}
  >

    {/* ==========================================
        NAVBAR
    =========================================== */}

    <nav className="topbar">

      <div className="brand">

        <div className="brand-mark">
          <Code2 size={17} />
        </div>

        <div>

          <strong>
            CodeLens <span>AI</span>
          </strong>

          <small>
            AI Code Intelligence
          </small>

        </div>

      </div>

      <button
        className="theme-dot"
        onClick={() =>
          setDarkMode((prev) => !prev)
        }
        aria-label={
          darkMode
            ? "Switch to light mode"
            : "Switch to dark mode"
        }
        title={
          darkMode
            ? "Switch to light mode"
            : "Switch to dark mode"
        }
      >

        {darkMode ? (
          <Sun size={16} />
        ) : (
          <Moon size={16} />
        )}

      </button>

    </nav>


    {/* ==========================================
        PAGE
    =========================================== */}

    <div className="page-container">


      {/* ========================================
          HERO
      ========================================= */}

      <header className="hero">

        <div>

          <h1>
            AI Code Reviewer
          </h1>

          <p>
            Review, debug, explain, and optimize
            your code with AI.
          </p>

        </div>

        <div className="hero-stat">

          <span>
            04
          </span>

          <small>
            analysis modes
          </small>

        </div>

      </header>


      {/* ========================================
          WORKSPACE
      ========================================= */}

      <div className="workspace">


        {/* ======================================
            INPUT PANEL
        ======================================= */}

        <section className="panel input-panel">


          {/* Panel Header */}

          <div className="panel-header">

            <div>

              <p className="eyebrow">
                Workspace
              </p>

              <h2>
                Source Code
              </h2>

            </div>

            <button
              className="icon-button"
              onClick={() => {
                setCode("");
                setResult(null);
                setError("");
                setQuestion("");
                setChatAnswer("");
              }}
              aria-label="Clear code"
              type="button"
            >

              <RotateCcw size={15} />

            </button>

          </div>


          {/* Task Selector */}

          <div className="task-grid">

            {tasks.map(
              ({
                id,
                label,
                description,
                icon: Icon,
              }) => (

                <button
                  key={id}
                  className={`task-card ${
                    task === id
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setTask(id)
                  }
                  type="button"
                >

                  <span className="task-icon">

                    <Icon size={16} />

                  </span>

                  <span>

                    <strong>
                      {label}
                    </strong>

                    <small>
                      {description}
                    </small>

                  </span>

                  {task === id && (

                    <span className="task-check">

                      <Check size={12} />

                    </span>

                  )}

                </button>

              )
            )}

          </div>


          {/* Code Editor */}

          <div className="editor-wrap">

            <div className="editor-bar">

              <span className="editor-dots">

                <i />
                <i />
                <i />

              </span>

              <span>
                Auto Detect
              </span>

            </div>


            <div className="editor-body">

              <div className="line-numbers">

                {Array.from(
                  {
                    length: Math.max(
                      code.split("\n").length,
                      8
                    ),
                  },
                  (_, i) => (

                    <span key={i}>
                      {i + 1}
                    </span>

                  )
                )}

              </div>


              <textarea
                value={code}
                onChange={(event) =>
                  setCode(event.target.value)
                }
                placeholder="Paste your code here..."
                spellCheck={false}
                aria-label="Source code"
              />

            </div>


            <div className="editor-footer">

              <span>

                <Info size={13} />

                Tip: Paste a function, class, or
                complete code snippet for analysis.

              </span>

              <span>
                {code.length} chars
              </span>

            </div>

          </div>


          {/* Error */}

          {error && (

            <div className="error-card">

              <X size={17} />

              <div>

                <strong>
                  Something went wrong
                </strong>

                <p>
                  {error}
                </p>

              </div>

            </div>

          )}


 {/* Analyze Button */}

<button
  className="analyze-button"
  onClick={handleSubmit}
  disabled={loading}
  type="button"
>
  {loading ? (
    <LoaderCircle
      className="spin"
      size={17}
    />
  ) : (
    <Sparkles size={17} />
  )}

  {loading
    ? "Analyzing..."
    : "Analyze Code"}
</button>


{/* ======================================
    FOLLOW-UP CHAT
======================================= */}

{result && (
  <div className="chat-section">

    <div className="chat-header">

      <div>

        <div className="section-kicker">
          <Sparkles size={15} />
          FOLLOW-UP
        </div>

        <h2>
          Have a question?
        </h2>

        <p>
          Ask about your code or analysis.
        </p>

      </div>

    </div>


    {/* Chat Input */}

    <div className="chat-input-wrap">

      <textarea
        value={question}
        onChange={(event) =>
          setQuestion(event.target.value)
        }
        placeholder="Ask something about your code..."
        rows={3}
        disabled={chatLoading}
        onKeyDown={(event) => {

          if (
            event.key === "Enter" &&
            (event.ctrlKey || event.metaKey)
          ) {
            handleChat();
          }

        }}
      />


      <button
        className="chat-send-button"
        onClick={handleChat}
        disabled={
          chatLoading ||
          !question.trim()
        }
        type="button"
      >

        {chatLoading ? (
          <>
            <LoaderCircle
              size={16}
              className="spin"
            />

            Thinking...
          </>
        ) : (
          <>
            Ask AI
            <ChevronRight size={16} />
          </>
        )}

      </button>

    </div>


    {/* AI Answer */}

    {chatAnswer && (
      <div className="chat-answer">

        <div className="chat-answer-label">

          <Sparkles size={15} />

          AI

        </div>

        <div className="chat-answer-content">

          <ReactMarkdown>
            {chatAnswer}
          </ReactMarkdown>

        </div>

      </div>
    )}

  </div>
)}


</section>



        {/* ======================================
            RESULT PANEL
        ======================================= */}

        <section className="panel result-panel">

          <div className="panel-header result-panel-header">

            <div>

              <p className="eyebrow">
                Intelligence
              </p>

              <h2>
                Analysis
              </h2>

            </div>

          </div>

          <ResultPanel result={result} />

        </section>

      </div>

      {/* ========================================
          FOOTER
      ========================================= */}

      <footer className="footer">

        <span>

          <span className="status-dot" />

          All systems operational

        </span>

        <span>

          CodeLens AI

          <span className="muted">
            {" "}
            · Private by design
          </span>

        </span>

      </footer>

    </div>

  </main>
);

}

export { sampleCode };