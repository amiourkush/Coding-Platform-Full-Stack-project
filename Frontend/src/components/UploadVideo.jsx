import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";
import { useNavigate } from "react-router";

export default function UploadVideo() {
  const [problems, setProblems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get("/problem/getAllProblem");
        setProblems(data);
      } catch (error) {
        console.error("Failed to fetch problems:", error);
      }
    };

    fetchProblems();
  }, []);

  const openModal = (problem) => {
    setSelected(problem);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelected(null);
    setShowModal(false);
  };

  const handleDelete = async () => {
    if (!selected) return;

    try {
      setLoading(true);

      await axiosClient.delete(`/video/delete/${selected._id}`);

      setProblems((prev) =>
        prev.filter((p) => p._id !== selected._id)
      );

      closeModal();
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = () => {
    if (!selected) return;
    navigate(`/admin/uploading/${selected._id}`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-semibold mb-8">
          Upload / Delete Problem
        </h1>

        <div className="grid gap-4">
          {problems.map((problem) => (
            <div
              key={problem._id}
              onClick={() => openModal(problem)}
              className="p-5 border border-gray-700 rounded-xl cursor-pointer hover:border-blue-500 transition"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl">{problem.title}</h2>
                <span className="text-sm text-gray-400">
                  {problem.difficulty}
                </span>
              </div>

              <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {showModal && selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70">
          <div className="bg-[#0a0a0a] border border-gray-700 rounded-2xl p-6 w-[420px]">
            <h2 className="text-2xl font-semibold mb-2">
              {selected.title}
            </h2>

            <p className="text-gray-400 mb-6">
              What would you like to do?
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleUpload}
                className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
              >
                Upload Video
              </button>

              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete Video"}
              </button>
            </div>

            <button
              onClick={closeModal}
              className="w-full mt-4 border border-gray-600 py-2 rounded-lg hover:border-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}