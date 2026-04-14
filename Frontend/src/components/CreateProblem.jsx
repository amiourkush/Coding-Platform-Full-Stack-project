import { useState } from "react";
import { motion } from "framer-motion";

export default function CreateProblem() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    difficulty: "Easy",
    tags: "Array",
    visibleTestcase: [{ input: "", output: "", explanation: "" }],
    hiddenTestcase: [{ input: "", output: "" }],
    startcode: [{ language: "cpp", initialcode: "" }],
    referenceCode: [{ language: "cpp", completecode: "" }],
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (index, field, type, value) => {
    const updated = [...form[type]];
    updated[index][field] = value;
    setForm({ ...form, [type]: updated });
  };

  const addField = (type, template) => {
    setForm({ ...form, [type]: [...form[type], template] });
  };

  const removeField = (type, index) => {
    const updated = form[type].filter((_, i) => i !== index);
    setForm({ ...form, [type]: updated.length ? updated : form[type] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-semibold mb-8">Create Problem</h1>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Basic Info */}
          <div className="bg-[#050505] p-6 rounded-2xl border border-gray-800">
            <input
              name="title"
              placeholder="Title"
              className="input input-bordered w-full bg-black mb-4"
              onChange={handleChange}
            />

            <textarea
              name="description"
              placeholder="Description"
              className="textarea textarea-bordered w-full bg-black mb-4"
              onChange={handleChange}
            />

            <div className="flex gap-4">
              <select name="difficulty" className="select bg-black" onChange={handleChange}>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>

              <select name="tags" className="select bg-black" onChange={handleChange}>
                <option>Array</option>
                <option>LinkedList</option>
                <option>Dp</option>
                <option>Graph</option>
              </select>
            </div>
          </div>

          {/* Visible Testcases */}
          <Section title="Visible Testcases">
            {form.visibleTestcase.map((tc, i) => (
              <TestcaseCard key={i}>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Testcase {i + 1}</span>
                  {form.visibleTestcase.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField("visibleTestcase", i)}
                      className="text-red-400 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input placeholder="Input" onChange={(e) => handleArrayChange(i, "input", "visibleTestcase", e.target.value)} />
                <input placeholder="Output" onChange={(e) => handleArrayChange(i, "output", "visibleTestcase", e.target.value)} />
                <input placeholder="Explanation" onChange={(e) => handleArrayChange(i, "explanation", "visibleTestcase", e.target.value)} />
              </TestcaseCard>
            ))}
            <AddButton onClick={() => addField("visibleTestcase", { input: "", output: "", explanation: "" })} />
          </Section>

          {/* Hidden Testcases */}
          <Section title="Hidden Testcases">
            {form.hiddenTestcase.map((tc, i) => (
              <TestcaseCard key={i}>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Testcase {i + 1}</span>
                  {form.hiddenTestcase.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField("hiddenTestcase", i)}
                      className="text-red-400 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input placeholder="Input" onChange={(e) => handleArrayChange(i, "input", "hiddenTestcase", e.target.value)} />
                <input placeholder="Output" onChange={(e) => handleArrayChange(i, "output", "hiddenTestcase", e.target.value)} />
              </TestcaseCard>
            ))}
            <AddButton onClick={() => addField("hiddenTestcase", { input: "", output: "" })} />
          </Section>

          {/* Start Code */}
          <Section title="Start Code (Multiple Languages)">
            {form.startcode.map((sc, i) => (
              <TestcaseCard key={i}>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Language {i + 1}</span>
                  {form.startcode.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField("startcode", i)}
                      className="text-red-400 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input placeholder="Language (cpp/java/python)" onChange={(e) => handleArrayChange(i, "language", "startcode", e.target.value)} />
                <textarea placeholder="Initial Code" onChange={(e) => handleArrayChange(i, "initialcode", "startcode", e.target.value)} />
              </TestcaseCard>
            ))}
            <AddButton onClick={() => addField("startcode", { language: "", initialcode: "" })} />
          </Section>

          {/* Reference Code */}
          <Section title="Reference Code (Multiple Languages)">
            {form.referenceCode.map((rc, i) => (
              <TestcaseCard key={i}>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Language {i + 1}</span>
                  {form.referenceCode.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField("referenceCode", i)}
                      className="text-red-400 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input placeholder="Language (cpp/java/python)" onChange={(e) => handleArrayChange(i, "language", "referenceCode", e.target.value)} />
                <textarea placeholder="Complete Code" onChange={(e) => handleArrayChange(i, "completecode", "referenceCode", e.target.value)} />
              </TestcaseCard>
            ))}
            <AddButton onClick={() => addField("referenceCode", { language: "", completecode: "" })} />
          </Section>

          <button
  type="submit"
  className="w-full text-lg font-semibold py-4 rounded-2xl border-2 border-gray-600 hover:border-white transition-colors duration-200 bg-black"
>
  Create Problem
</button>

        </form>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-[#050505] p-6 rounded-2xl border border-gray-800">
      <h2 className="text-xl mb-4">{title}</h2>
      {children}
    </div>
  );
}

function TestcaseCard({ children }) {
  return (
    <motion.div className="border border-gray-700 p-4 rounded-xl mb-4 flex flex-col gap-2 bg-black">
      {children}
    </motion.div>
  );
}

function AddButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="btn btn-outline btn-sm mt-2">
      + Add
    </button>
  );
}
