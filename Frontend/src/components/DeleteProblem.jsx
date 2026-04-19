import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";

export default function DeleteProblem() {
  const [problems, setProblems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  
  const fetchProblems = async () => {
    try {
      const { data } = await axiosClient.get("/problem/getAllProblem");
      setProblems(data);
    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  
  const handleDelete = async () => {
    if (!selected) return;

    try {
      setLoading(true);

      await axiosClient.delete(`/problem/delete/${selected._id}`);

      
      setProblems((prev) =>
        prev.filter((p) => p._id !== selected._id)
      );

      setShowConfirm(false);
      setSelected(null);
    } catch (err) {
      console.log("Delete error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-semibold mb-8">
          Delete Problem
        </h1>

      
        <div className="grid gap-4">
          {problems.map((p) => (
            <div
              key={p._id}
              onClick={() => {
                setSelected(p);
                setShowConfirm(true);
              }}
              className="p-5 border border-gray-700 rounded-xl cursor-pointer hover:border-red-500 transition"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl">{p.title}</h2>
                <span className="text-sm text-gray-400">
                  {p.difficulty}
                </span>
              </div>

              <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                {p.description}
              </p>
            </div>
          ))}
        </div>

      </div>

     
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-gray-700 w-[400px] text-center">

            <h2 className="text-xl text-red-400 mb-4">
              Delete "{selected?.title}"?
            </h2>

            <p className="text-gray-400 text-sm">
              This action cannot be undone.
            </p>

            <div className="flex justify-center gap-4 mt-6">

              
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setSelected(null);
                }}
                className="px-4 py-2 border border-gray-500 rounded-lg hover:border-white"
              >
                Cancel
              </button>

              
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}