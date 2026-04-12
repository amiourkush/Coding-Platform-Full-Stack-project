import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import axiosClient from "../utils/axiosClient";
import { useParams } from "react-router";

function ProblemPage() {
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState("c++");
  const [code, setCode] = useState("");
  const [tab, setTab] = useState("description");

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedTestcase, setSelectedTestcase] = useState(0);
  const [submitResult, setSubmitResult] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  const { id } = useParams();

  // 🔥 Fetch data
  useEffect(() => {
    async function fetchData() {
      const prob = await axiosClient.get(`/problem/getProblemById/${id}`);
      setProblem(prob.data);

      const defaultCode = prob.data.startcode.find(c => c.language === "c++");
      setCode(defaultCode?.initialcode || "");

      const sub = await axiosClient.get(`/submission/submitHistory/${id}`);
      setSubmissions(sub?.data?.submitHistory);
      
      
    }
    fetchData();
  }, []);

  // 🔥 RUN
  const runCode = async () => {
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

  // 🔥 SUBMIT
  const submitCode = async () => {
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
      setSubmitResult({ status: "Error" });
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

  return (
    <div className="h-screen flex">

      {/* LEFT PANEL */}
      <div className="w-1/2 border-r border-gray-700 flex flex-col">

        {/* Tabs */}
        <div className="tabs tabs-bordered">
          <button className={`tab ${tab === "description" && "tab-active"}`} onClick={() => setTab("description")}>
            Description
          </button>

          {problem.editorial && (
            <button className={`tab ${tab === "editorial" && "tab-active"}`} onClick={() => setTab("editorial")}>
              Editorial
            </button>
          )}

          <button className={`tab ${tab === "submissions" && "tab-active"}`} onClick={() => setTab("submissions")}>
            Submissions
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">

          {tab === "description" && (
            <>
              <h1 className="text-xl font-bold">{problem.title}</h1>
              <div className="badge mt-2">{problem.difficulty}</div>
              <p className="mt-4">{problem.description}</p>

              <h2 className="mt-6 font-semibold">Examples:</h2>

              {problem.visibleTestcase.map((tc, i) => (
                <div key={i} className="mt-4 p-3 bg-base-200 rounded">
                  <p><b>Input:</b></p>
                  <pre>{tc.input}</pre>
                  <p><b>Output:</b></p>
                  <pre>{tc.output}</pre>
                  {tc.explanation && <p><b>Explanation:</b> {tc.explanation}</p>}
                </div>
              ))}
            </>
          )}

          {tab === "editorial" && <div>🚧 Dummy Editorial</div>}

          {tab === "submissions" && (
            <div>
              {submissions?.map((s, i) => (
                <div key={i} className="p-2 border-b">
                  <p>Status: {s.status}</p>
                  <p>{s.testCasesPassed}/{s.testCasesTotal}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-1/2 flex flex-col">

        {/* Top bar */}
        <div className="flex justify-between p-2 bg-base-300">
          <select
            className="select select-bordered"
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
          >
            <option value="c++">C++</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>

          <div className="space-x-2">
            <button className="btn btn-info" onClick={runCode}>Run</button>
            <button className="btn btn-success" onClick={submitCode}>Submit</button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1">
          <Editor
            height="100%"
            theme="vs-dark"
            language={language === "c++" ? "c++" : language}
            value={code}
            onChange={(v) => setCode(v)}
          />
        </div>

        {/* Result panel */}
        <div className="h-40 bg-base-200 p-3 overflow-y-auto">

          {loading && <span className="loading loading-spinner"></span>}

          {/* Tabs */}
          <div className="flex space-x-2 mb-2">
            {problem.visibleTestcase.map((_, i) => (
              <button
                key={i}
                className={`btn btn-sm ${
                  selectedTestcase === i
                    ? "btn-primary"
                    : results[i]?.passed
                    ? "btn-success"
                    : results[i]
                    ? "btn-error"
                    : "btn-outline"
                }`}
                onClick={() => setSelectedTestcase(i)}
              >
                Case {i + 1}
              </button>
            ))}
          </div>

          {/* Run result */}
          {current && (
            <div>
              <p>Status: {current.passed ? "Passed" : "Failed"}</p>
              <pre>Input : {current.input}</pre>
              <pre>Output : {current.output}</pre>
              <pre>Exepected : {current.expected}</pre>
            </div>
          )}

          {/* Submit result */}
          {submitResult && (
            <div className="mt-2">
              <p>Status :{submitResult.status}</p>
              <p>{submitResult.testCasesPassed}/{submitResult.testCasesTotal}</p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default ProblemPage;