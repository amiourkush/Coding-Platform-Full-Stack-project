import { useEffect, useState } from "react";
// import Editor from "@monaco-editor/react";
// import axios from "axios";
// import axiosClient from "../utils/axiosClient";
// import {
//   Panel,
//   PanelGroup,
//   PanelResizeHandle
// } from "react-resizable-panels";
// import { useParams } from "react-router";

// function ProblemPage() {
//   const [problem, setProblem] = useState(null);
//   const [language, setLanguage] = useState("cpp");
//   const [code, setCode] = useState("");
//   const [tab, setTab] = useState("description");

//   const [loading, setLoading] = useState(false);

//   // Run results
//   const [results, setResults] = useState([]);
//   const [selectedTestcase, setSelectedTestcase] = useState(0);

//   // Submit result
//   const [submitResult, setSubmitResult] = useState(null);

//   // Submission history
//   const [submissions, setSubmissions] = useState([]);
//   const {id} = useParams();
//   const problemId =id; 

//   // 🔥 Fetch problem + submissions
//   useEffect(() => {
//     async function fetchData() {
//       const prob = await axiosClient.get(`/problem/getProblemById/${problemId}`);
//       setProblem(prob.data);

//       const defaultCode = prob.data.startcode.find(c => c.language === "cpp");
//       setCode(defaultCode?.initialcode || "");

//       // fetch submissions
//       const sub = await axiosClient.get(`/submission/submitHistory/${problemId}`);
//       setSubmissions(sub.data);
//     }
//     fetchData();
//   }, []);

//   // 🔥 RUN (visible)
//   const runCode = async () => {
//     setLoading(true);
//     setResults([]);

//     const promises = problem.visibleTestcase.map(tc =>
//       axios.post("http://localhost:4000/run", {
//         language: language === "cpp" ? "c++" : language,
//         code,
//         input: tc.input
//       })
//     );

//     const responses = await Promise.all(promises);

//     const newResults = responses.map((res, i) => {
//       const tc = problem.visibleTestcase[i];

//       if (res.data.success) {
//         return {
//           output: res.data.output,
//           expected: tc.output,
//           passed: res.data.output.trim() === tc.output.trim()
//         };
//       } else {
//         return { error: res.data.error, passed: false };
//       }
//     });

//     setResults(newResults);
//     setSelectedTestcase(0);
//     setLoading(false);
//   };

//   // 🔥 SUBMIT (hidden)
//   const submitCode = async () => {
//     setLoading(true);
//     setSubmitResult(null);

//     try {
//       const res = await axiosClient.post(`/submission/submit/${problemId}`, {
//         code,
//         language
//       });

//       setSubmitResult(res.data);

//       // refresh submissions
//       const sub = await axiosClient.get(`/submission/submitHistory/${problemId}`);
//       setSubmissions(sub.data);

//     } catch {
//       setSubmitResult({ status: "Error" });
//     }

//     setLoading(false);
//   };

//   // 🔥 Language change
//   const changeLanguage = (lang) => {
//     setLanguage(lang);
//     const defaultCode = problem.startcode.find(c => c.language === lang);
//     setCode(defaultCode?.initialcode || "");
//   };

//   if (!problem) return <div className="p-5">Loading...</div>;

//   const current = results[selectedTestcase];

//   return (
//     <PanelGroup direction="horizontal" className="h-screen">

//       {/* LEFT */}
//       <Panel defaultSize={40}>
//         <div className="h-full flex flex-col bg-base-100">

//           {/* Dynamic Tabs */}
//           <div className="tabs tabs-bordered">
//             <button className={`tab ${tab === "description" && "tab-active"}`} onClick={() => setTab("description")}>
//               Description
//             </button>

//             {problem.editorial && (
//               <button className={`tab ${tab === "editorial" && "tab-active"}`} onClick={() => setTab("editorial")}>
//                 Editorial
//               </button>
//             )}

//             <button className={`tab ${tab === "submissions" && "tab-active"}`} onClick={() => setTab("submissions")}>
//               Submissions
//             </button>
//           </div>

//           <div className="p-4 overflow-y-auto flex-1">

//             {/* DESCRIPTION */}
//             {tab === "description" && (
//   <>
//     <h1 className="text-xl font-bold">{problem.title}</h1>

//     <div className="badge mt-2">{problem.difficulty}</div>

//     <p className="mt-4">{problem.description}</p>

//     {/* 🔥 Examples */}
//     <h2 className="mt-6 font-semibold text-lg">Examples:</h2>

//     {problem.visibleTestcase.map((tc, i) => (
//       <div
//         key={i}
//         className="mt-4 p-4 bg-base-200 rounded-lg border border-base-300"
//       >
//         <p className="font-semibold">Example {i + 1}:</p>

//         <div className="mt-2">
//           <p><b>Input:</b></p>
//           <pre className="bg-base-300 p-2 rounded">{tc.input}</pre>
//         </div>

//         <div className="mt-2">
//           <p><b>Output:</b></p>
//           <pre className="bg-base-300 p-2 rounded">{tc.output}</pre>
//         </div>

//         {tc.explanation && (
//           <div className="mt-2">
//             <p><b>Explanation:</b></p>
//             <p>{tc.explanation}</p>
//           </div>
//         )}
//       </div>
//     ))}
//   </>
// )}

//             {/* EDITORIAL */}
//             {tab === "editorial" && (
//               <div>🚧 Dummy Editorial Content</div>
//             )}

//             {/* SUBMISSIONS */}
//             {tab === "submissions" && (
//               <div>
//                 {submissions.map((s, i) => (
//                   <div key={i} className="p-2 border-b">
//                     <p>Status: {s.status}</p>
//                     <p>Passed: {s.testCasesPassed}/{s.testCasesTotal}</p>
//                   </div>
//                 ))}
//               </div>
//             )}

//           </div>
//         </div>
//       </Panel>

//       <PanelResizeHandle className="w-2 bg-gray-500" />

//       {/* RIGHT */}
//       <Panel defaultSize={60}>
//         <PanelGroup direction="vertical">

//           {/* EDITOR */}
//           <Panel defaultSize={70}>
//             <div className="flex flex-col h-full">

//               <div className="flex justify-between p-2 bg-base-300">

//                 <select
//                   className="select select-bordered"
//                   value={language}
//                   onChange={(e) => changeLanguage(e.target.value)}
//                 >
//                   <option value="cpp">C++</option>
//                   <option value="python">Python</option>
//                   <option value="java">Java</option>
//                 </select>

//                 <div className="space-x-2">
//                   <button className="btn btn-info" onClick={runCode}>Run</button>
//                   <button className="btn btn-success" onClick={submitCode}>Submit</button>
//                 </div>
//               </div>

//               <Editor
//                 height="100%"
//                 theme="vs-dark"
//                 language={language === "cpp" ? "cpp" : language}
//                 value={code}
//                 onChange={(v) => setCode(v)}
//               />
//             </div>
//           </Panel>

//           <PanelResizeHandle className="h-2 bg-gray-500" />

//           {/* RESULT PANEL */}
//           <Panel defaultSize={30}>
//             <div className="p-3 bg-base-200 h-full">

//               {loading && (
//                 <div className="flex justify-center">
//                   <span className="loading loading-spinner"></span>
//                 </div>
//               )}

//               {/* RUN RESULT */}
//               <div className="flex space-x-2 mb-2">
//   {problem.visibleTestcase.map((_, i) => (
//     <button
//       key={i}
//       className={`btn btn-sm ${
//         selectedTestcase === i
//           ? "btn-primary"
//           : results[i]?.passed
//           ? "btn-success"
//           : results[i]
//           ? "btn-error"
//           : "btn-outline"
//       }`}
//       onClick={() => setSelectedTestcase(i)}
//     >
//       Case {i + 1}
//     </button>
//   ))}
// </div>

//               {/* SUBMIT RESULT */}
//               {submitResult && (
//                 <div className="mt-4">
//                   <p className="font-bold">
//                     {submitResult.status}
//                   </p>
//                   <p>
//                     {submitResult.testCasesPassed} / {submitResult.testCasesTotal}
//                   </p>
//                 </div>
//               )}

//             </div>
//           </Panel>

//         </PanelGroup>
//       </Panel>

//     </PanelGroup>
//   );
// }

// export default ProblemPage;