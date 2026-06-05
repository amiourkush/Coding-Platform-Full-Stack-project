import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import axiosClient from "../utils/axiosClient";
import { useParams } from "react-router";
import ChatPage from "./ChatPage";
import Editorial from "../components/Editorial";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";

function ProblemPage() {
  const [bottomTab, setBottomTab] = useState("testcase");
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState("c++");
  const [code, setCode] = useState("");
  const [tab, setTab] = useState("description");

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedTestcase, setSelectedTestcase] = useState(0);
  const [submitResult, setSubmitResult] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [actionType, setActionType] = useState("");

  const { id } = useParams();

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      const prob = await axiosClient.get(`/problem/getProblemById/${id}`);
      setProblem(prob.data);

      const savingCode = await axiosClient.get(`/code/getsavedcode/${id}`);
      const filledCode = savingCode.data.code;

      const defaultCode = prob.data.startcode.find(c => c.language === "c++");
      setCode(filledCode|| defaultCode?.initialcode || "");

      const sub = await axiosClient.get(`/submission/submitHistory/${id}`);
      setSubmissions(sub?.data?.submitHistory);
      
      
    }
    fetchData();
  }, []);

  const saveCode = async()=>{
      await axiosClient.post(`/code/autosave/${id}`,{
        code,
        language
      });
  }

  useEffect(()=>{
    if(code){
    const timer = setTimeout(()=>{
      saveCode()
    },5000);
     
    return ()=>clearTimeout(timer);

    }
  },[code])

  // 
  const runCode = async () => {
    setActionType("run");

    setLoading(true);
    setResults([]);

    const promises = problem.visibleTestcase.map(tc =>
      axios.post("http://localhost:4000/run", {
        language: language === "c++" ? "c++" : language,
        code,
        input: tc.input
      })
    );

    const responses = await Promise.all(promises);

    const newResults = responses.map((res, i) => {
      const tc = problem.visibleTestcase[i];

      if (res.data.success) {
        return {
          input:res.data.input,
          output: res.data.output,
          expected: tc.output,
          passed: res.data.output.trim() === tc.output.trim()
        };
      } else {
        return { error: res.data.error, passed: false };
      }
    });

    setResults(newResults);
    setSelectedTestcase(0);
    setLoading(false);
  };

  // SUBMIT
  const submitCode = async () => {
    setActionType("submit");
    setLoading(true);
    setSubmitResult(null);

    try {
      const res = await axiosClient.post(`/submission/submit/${id}`, {
        code,
        language
      });

      setSubmitResult(res.data);
      //console.log(res.data);

      const sub = await axiosClient.get(`/submission/submitHistory/${id}`);
      setSubmissions(sub?.data?.submitHistory);
      

    } catch {
      setSubmitResult({ status: "Error" })
    }

    setLoading(false);
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    const defaultCode = problem.startcode.find(c => c.language === lang);
    setCode(defaultCode?.initialcode || "");
  };

  if (!problem) return <div className="p-5">Loading...</div>;

  const current = results[selectedTestcase];
  const sortedSubmissions = [...(submissions || [])].sort(
  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
);

const getStatusColor = (status) => {
  switch (status) {
    case "Accepted":
      return "bg-green-500/20 text-green-400";

    case "Wrong Answer":
      return "bg-red-500/20 text-red-400";

    case "Time Limit Exceeded":
      return "bg-yellow-500/20 text-yellow-400";

    case "Runtime Error":
      return "bg-orange-500/20 text-orange-400";

    case "Compilation Error":
      return "bg-purple-500/20 text-purple-400";

    default:
      return "bg-zinc-700 text-zinc-300";
  }
};

 const testcase =
  problem?.visibleTestcase?.[selectedTestcase];
  
  return (
    <div className="h-screen flex bg-zinc-950">

      {/* LEFT PANEL */}
      <div className="w-1/2 border-r border-gray-700 flex flex-col">

        {/* Tabs */}
        <div className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800 px-4">
  <div className="flex gap-2 py-3">

    {[
      "description",
      "editorial",
      "submissions",
      "chatAI"
    ].map((item) => (
      <button
        key={item}
        onClick={() => setTab(item)}
        className={`
          px-4 py-2 rounded-xl text-sm font-medium transition-all
          ${
            tab === item
              ? "bg-white text-black"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900"
          }
        `}
      >
        {item === "chatAI"
          ? "AI Assistant"
          : item.charAt(0).toUpperCase() + item.slice(1)}
      </button>
    ))}

  </div>
</div>

         
        

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-4xl mx-auto p-6">

          {tab === "description" && (
  <>
    <div className="border-b border-zinc-800 pb-6">

      <h1 className="text-3xl font-bold text-white">
        {problem.title}
      </h1>

      <div
        className={`
          inline-flex mt-4 px-3 py-1 rounded-full text-sm font-medium
          ${
            problem.difficulty === "Easy"
              ? "bg-green-500/20 text-green-400"
              : problem.difficulty === "Medium"
              ? "bg-yellow-500/20 text-yellow-400"
              : "bg-red-500/20 text-red-400"
          }
        `}
      >
        {problem.difficulty}
      </div>

    </div>

    <div className="mt-8">

      <h2 className="text-lg font-semibold text-white mb-4">
        Problem Description
      </h2>

      <p className="leading-8 text-zinc-300 whitespace-pre-wrap">
        {problem.description}
      </p>

    </div>

    <div className="mt-10">

      <h2 className="text-lg font-semibold text-white mb-4">
        Examples
      </h2>

      {problem.visibleTestcase.map((tc, i) => (
  <div
    key={i}
    className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden"
  >

    <div className="px-5 py-4 border-b border-zinc-800">
      <h3 className="font-semibold text-white">
        Example {i + 1}
      </h3>
    </div>

    <div className="p-5 space-y-5">

      <div>
        <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
          Input
        </p>

        <pre className="text-zinc-200 whitespace-pre-wrap font-mono text-sm">
          {tc.input}
        </pre>
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
          Output
        </p>

        <pre className="text-zinc-200 whitespace-pre-wrap font-mono text-sm">
          {tc.output}
        </pre>
      </div>

      {tc.explanation && (
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
            Explanation
          </p>

          <p className="text-zinc-300 text-sm leading-6">
            {tc.explanation}
          </p>
        </div>
      )}

    </div>

  </div>
))}

    </div>
  </>
)}

          {tab === "editorial" && (
  <div className="h-full flex items-center mx-auto justify-center">
    {problem.secureUrl ? (
      <Editorial
        secureUrl={problem.secureUrl}
        thumbnailUrl={problem.thumbnailUrl}
        duration={problem.duration}
      />
    ) : (
      <div className="max-w-md w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-lg">
        
        <div className="w-16 h-16 mx-auto rounded-full bg-zinc-800 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5L8.25 6v12l7.5-4.5v-3z"
            />
          </svg>
        </div>

        <h3 className="mt-5 text-xl font-semibold text-white">
          No Video Solution Yet
        </h3>

        <p className="mt-2 text-sm text-zinc-400">
          The editorial video for this problem has not been uploaded yet.
          Check back later.
        </p>

      </div>
    )}
  </div>
)}

        {tab === "submissions" && (
  <div className="space-y-4">
    {sortedSubmissions.length > 0 ? (
      sortedSubmissions.map((s, i) => (
        <div
          key={s._id || i}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 hover:border-zinc-700 transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-white">
                Submission #{sortedSubmissions.length - i}
              </h3>

              <p className="text-xs text-zinc-500 mt-1">
                {new Date(s.createdAt).toLocaleString()}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                s.status
              )}`}
            >
              {s.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">

            <div className="rounded-xl bg-zinc-800/60 p-3">
              <p className="text-xs text-zinc-500">
                Language
              </p>

              <p className="text-white font-medium mt-1">
                {s.language}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-800/60 p-3">
              <p className="text-xs text-zinc-500">
                Test Cases
              </p>

              <p className="text-white font-medium mt-1">
                {s.testCasesPassed}/{s.testCasesTotal}
              </p>
            </div>

            <div className="rounded-xl bg-zinc-800/60 p-3">
              <p className="text-xs text-zinc-500">
                Runtime
              </p>

              <p className="text-white font-medium mt-1">
                {s.runtime ?? "--"} ms
              </p>
            </div>

            <div className="rounded-xl bg-zinc-800/60 p-3">
              <p className="text-xs text-zinc-500">
                Memory
              </p>

              <p className="text-white font-medium mt-1">
                {s.memory ?? "--"} MB
              </p>
            </div>

          </div>
        </div>
      ))
    ) : (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">

          <div className="w-16 h-16 mx-auto rounded-full bg-zinc-800 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6M8 4h8a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z"
              />
            </svg>
          </div>

          <h2 className="mt-5 text-xl font-semibold text-white">
            No Submissions Yet
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            Submit a solution to start tracking your attempts.
          </p>

        </div>
      </div>
    )}
  </div>
)}
            {tab === "chatAI" && (
            <div>
             <ChatPage problem={problem}/>
            </div>
          )}

        </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-1/2 flex flex-col">

        {/* Top bar */}
<div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900 rounded">

  {/* Language Selector */}
  <div>
    <select
      value={language}
      onChange={(e) => changeLanguage(e.target.value)}
      className="
        bg-zinc-900
        border border-zinc-800
        text-zinc-200
        rounded-xl
        px-4
        py-2
        text-sm
        outline-none
        hover:border-zinc-700
        focus:border-zinc-600
        transition
      "
    >
      <option value="c++">C++</option>
      <option value="python">Python</option>
      <option value="java">Java</option>
    </select>
  </div>

  {/* Action Buttons */}
  <div className="flex items-center gap-3">

    <button
      onClick={runCode}
      disabled={loading}
      className="
        px-5 py-2
        rounded-xl
        border border-zinc-700
        bg-zinc-900
        text-zinc-200
        text-sm font-medium
        hover:bg-zinc-800
        transition
        disabled:opacity-50
      "
    >
      Run
    </button>

    <button
      onClick={submitCode}
      disabled={loading}
      className="
        px-5 py-2
        rounded-xl
        bg-green-500
        text-black
        text-sm font-semibold
        hover:bg-green-400
        transition
        disabled:opacity-50
      "
    >
      Submit
    </button>

  </div>

</div>
        
<PanelGroup direction="vertical">

  <Panel defaultSize={70} minSize={30}>
  <div className="h-full">
    <Editor
      height="100%"
      theme="vs-dark"
      language={language}
      value={code}
      onChange={(v) => setCode(v || "")}
    />
  </div>
</Panel>

  <PanelResizeHandle className="h-1 bg-zinc-800 hover:bg-zinc-600 transition cursor-row-resize" />

  <Panel defaultSize={30} minSize={15}>
    {/* Result Panel */}
   <div className="h-full border-t border-zinc-800 bg-zinc-950 flex flex-col">

  {/* Top Tabs */}
  <div className="flex border-b border-zinc-800">

    <button
      onClick={() => setBottomTab("testcase")}
      className={`px-4 py-3 text-sm font-medium transition ${
        bottomTab === "testcase"
          ? "text-white border-b-2 border-white"
          : "text-zinc-500"
      }`}
    >
      Testcase
    </button>

    <button
      onClick={() => setBottomTab("result")}
      className={`px-4 py-3 text-sm font-medium transition ${
        bottomTab === "result"
          ? "text-white border-b-2 border-white"
          : "text-zinc-500"
      }`}
    >
      Result
    </button>

  </div>

  {/* Content */}
  <div className="flex-1 overflow-y-auto scrollbar-hide">

    {/* TESTCASE TAB */}
    {bottomTab === "testcase" && (
      <div>

        {/* Example Tabs */}
        <div className="flex gap-2 p-4 border-b border-zinc-800">

          {problem.visibleTestcase.map((_, i) => (
            <button
              key={i}
              onClick={() => setSelectedTestcase(i)}
              className={`px-4 py-2 rounded-xl text-sm transition ${
                selectedTestcase === i
                  ? "bg-white text-black"
                  : "bg-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              Example {i + 1}
            </button>
          ))}

        </div>

        {/* Example Content */}
        <div className="p-4 space-y-4">

          <div>
            <p className="text-xs text-zinc-500 mb-2">
              Input
            </p>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
              <pre className="text-sm whitespace-pre-wrap">
                {testcase?.input}
              </pre>
            </div>
          </div>

          <div>
            <p className="text-xs text-zinc-500 mb-2">
              Expected Output
            </p>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
              <pre className="text-sm whitespace-pre-wrap">
                {testcase?.output}
              </pre>
            </div>
          </div>

          {testcase?.explanation && (
            <div>
              <p className="text-xs text-zinc-500 mb-2">
                Explanation
              </p>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
                <p className="text-sm">
                  {testcase.explanation}
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    )}

    {/* RESULT TAB */}
    {bottomTab === "result" && (

      <div className="p-4">

        {loading ? (

          <div className="flex items-center justify-center h-full min-h-[200px]">

            <div className="rounded-xl border border-zinc-800 bg-black px-8 py-6 font-mono">

              <p className="text-green-400">
                {actionType === "run"
                  ? "$ Running Test Cases..."
                  : "$ Evaluating Hidden Cases..."}

                <span className="animate-pulse">
                  ▋
                </span>
              </p>

            </div>

          </div>

        ) : submitResult ? (

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">

            <div className="flex justify-between items-center">

              <h2
                className={`font-semibold text-lg ${
                  submitResult.status === "Accepted"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {submitResult.status}
              </h2>

              <span className="text-zinc-400">
                {submitResult.testCasesPassed}/
                {submitResult.testCasesTotal}
              </span>

            </div>

          </div>

        ) : current ? (

          <div className="space-y-4">

            <div
              className={`rounded-xl border p-4 ${
                current.passed
                  ? "border-green-500/20 bg-green-500/5"
                  : "border-red-500/20 bg-red-500/5"
              }`}
            >
              <p
                className={`font-medium ${
                  current.passed
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {current.passed
                  ? "✓ Passed"
                  : "✗ Failed"}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
              <p className="text-xs text-zinc-500 mb-2">
                Your Output
              </p>

              <pre>{current.output}</pre>
            </div>

            {!current.passed && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                <p className="text-xs text-red-400 mb-2">
                  Expected Output
                </p>

                <pre>{current.expected}</pre>
              </div>
            )}

          </div>

        ) : (

          <div className="flex items-center justify-center h-full min-h-[200px] text-zinc-500">
            Run your code to see results
          </div>

        )}

      </div>

    )}

  </div>

</div>
  </Panel>

</PanelGroup>
      </div>

    </div>
  );
}

export default ProblemPage;