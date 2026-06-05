import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axiosClient from "../utils/axiosClient";
import { useDispatch, useSelector} from "react-redux";
import { fetchProblems } from "../problemSlice";

export default function AdminUpdate() {
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { problem} = useSelector((state)=>state.problem);
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

   const dispatch = useDispatch();

  
  useEffect(() => {
    dispatch(fetchProblems());
  }, []);

  const handleSelectProblem = (problem) => {
    console.log(problem);
    setSelectedProblem(problem);

    setForm({
      title: problem.title || "",
      description: problem.description || "",
      difficulty: problem.difficulty || "Easy",
      tags: problem.tags || "Array",
      visibleTestcase:
        problem.visibleTestcase?.length
          ? problem.visibleTestcase
          : [{ input: "", output: "", explanation: "" }],

      hiddenTestcase:
        problem.hiddenTestcase?.length
          ? problem.hiddenTestcase
          : [{ input: "", output: "" }],

      startcode:
        problem.startcode?.length
          ? problem.startcode
          : [{ language: "cpp", initialcode: "" }],

      referenceCode:
        problem.referenceCode?.length
          ? problem.referenceCode
          : [{ language: "cpp", completecode: "" }],
    });
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleArrayChange = (
    index,
    field,
    type,
    value
  ) => {
    const updated = [...form[type]];
    updated[index][field] = value;

    setForm({
      ...form,
      [type]: updated,
    });
  };

  const addField = (type, template) => {
    setForm({
      ...form,
      [type]: [...form[type], template],
    });
  };

  const removeField = (type, index) => {
    const updated = form[type].filter(
      (_, i) => i !== index
    );

    if (updated.length) {
      setForm({
        ...form,
        [type]: updated,
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await axiosClient.put(
        `/problem/update/${selectedProblem._id}`,
        form
      );

      setShowSuccess(true);
      fetchProblems();
    } catch (err) {
      console.log(err);
    }
  };

  if (!selectedProblem) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-5xl mx-auto">

          <h1 className="text-4xl font-semibold mb-8">
            Select Problem To Update
          </h1>

          <div className="grid gap-4">
            {problem.map((problem) => (
              <div
                key={problem._id}
                onClick={() =>
                  handleSelectProblem(problem)
                }
                className="p-5 border border-gray-700 rounded-xl cursor-pointer hover:border-white transition"
              >
                <div className="flex justify-between">
                  <h2 className="text-xl">
                    {problem.title}
                  </h2>

                  <span className="text-gray-400">
                    {problem.difficulty}
                  </span>
                </div>

                <p className="text-gray-500 mt-2">
                  {problem.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">

        <div className="flex justify-between mb-8">

          <h1 className="text-4xl font-semibold">
            Update Problem
          </h1>

          <button
            onClick={() => setSelectedProblem(null)}
            className="btn btn-outline"
          >
            Back
          </button>

        </div>

        <form
          onSubmit={handleUpdate}
          className="space-y-8"
        >
          {/* BASIC INFO */}

          <Section title="Basic Info">

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="input input-bordered w-full bg-black mb-4"
            />

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="textarea textarea-bordered w-full bg-black mb-4"
            />

            <div className="flex gap-4">

              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className="select bg-black"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>

              <select
                name="tags"
                value={form.tags}
                onChange={handleChange}
                className="select bg-black"
              >
                <option>Array</option>
                <option>LinkedList</option>
                <option>Dp</option>
                <option>Graph</option>
              </select>

            </div>

          </Section>

          {/* VISIBLE TESTCASES */}

          <RenderSection
            title="Visible Testcases"
            data={form.visibleTestcase}
            type="visibleTestcase"
            addTemplate={{
              input: "",
              output: "",
              explanation: "",
            }}
            fields={[
              "input",
              "output",
              "explanation",
            ]}
            form={form}
            addField={addField}
            removeField={removeField}
            handleArrayChange={handleArrayChange}
          />

          {/* HIDDEN TESTCASES */}

          <RenderSection
            title="Hidden Testcases"
            data={form.hiddenTestcase}
            type="hiddenTestcase"
            addTemplate={{
              input: "",
              output: "",
            }}
            fields={["input", "output"]}
            form={form}
            addField={addField}
            removeField={removeField}
            handleArrayChange={handleArrayChange}
          />

          {/* START CODE */}

          <RenderSection
            title="Start Code"
            data={form.startcode}
            type="startcode"
            addTemplate={{
              language: "",
              initialcode: "",
            }}
            fields={[
              "language",
              "initialcode",
            ]}
            textareaFields={[
              "initialcode",
            ]}
            form={form}
            addField={addField}
            removeField={removeField}
            handleArrayChange={handleArrayChange}
          />

          {/* REFERENCE CODE */}

          <RenderSection
            title="Reference Code"
            data={form.referenceCode}
            type="referenceCode"
            addTemplate={{
              language: "",
              completecode: "",
            }}
            fields={[
              "language",
              "completecode",
            ]}
            textareaFields={[
              "completecode",
            ]}
            form={form}
            addField={addField}
            removeField={removeField}
            handleArrayChange={handleArrayChange}
          />

          <button
            type="submit"
            className="w-full text-lg font-semibold py-4 rounded-2xl border-2 border-gray-600 hover:border-white"
          >
            Update Problem
          </button>

        </form>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/70">

          <div className="bg-[#0a0a0a] border border-gray-700 rounded-2xl p-8 text-center">

            <h2 className="text-green-400 text-2xl mb-5">
              Problem Updated Successfully
            </h2>

            <button
              onClick={() =>
                setShowSuccess(false)
              }
              className="btn btn-outline"
            >
              Close
            </button>

          </div>

        </div>
      )}
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

function RenderSection({
  title,
  data,
  type,
  fields,
  textareaFields = [],
  addTemplate,
  addField,
  removeField,
  handleArrayChange,
}) {
  return (
    <Section title={title}>
      {data.map((item, i) => (
        <TestcaseCard key={i}>

          {fields.map((field) =>
            textareaFields.includes(field) ? (
              <textarea
                key={field}
                value={item[field]}
                placeholder={field}
                onChange={(e) =>
                  handleArrayChange(
                    i,
                    field,
                    type,
                    e.target.value
                  )
                }
              />
            ) : (
              <input
                key={field}
                value={item[field]}
                placeholder={field}
                onChange={(e) =>
                  handleArrayChange(
                    i,
                    field,
                    type,
                    e.target.value
                  )
                }
              />
            )
          )}

          {data.length > 1 && (
            <button
              type="button"
              onClick={() =>
                removeField(type, i)
              }
              className="text-red-400"
            >
              Remove
            </button>
          )}

        </TestcaseCard>
      ))}

      <button
        type="button"
        onClick={() =>
          addField(type, addTemplate)
        }
        className="btn btn-outline btn-sm"
      >
        + Add
      </button>
    </Section>
  );
}