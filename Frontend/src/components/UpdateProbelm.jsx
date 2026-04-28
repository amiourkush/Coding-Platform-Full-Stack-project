import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../utils/axiosClient";

export default function UpdateProblem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  
  const fetchProblem = async () => {
    try {
      const { data } = await axiosClient.get(`/problem/getProblemById/${id}`);
      setForm(data);
    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchProblem();
  }, []);

  
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      await axiosClient.put(`/problem/update/${id}`, form);

      setShowSuccess(true);
    } catch (err) {
      console.log("Update error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!form) return <div className="text-white p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl mb-6">Update Problem</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full p-3 bg-black border border-gray-700 rounded"
            placeholder="Title"
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-3 bg-black border border-gray-700 rounded"
            placeholder="Description"
          />

          <select
            name="difficulty"
            value={form.difficulty}
            onChange={handleChange}
            className="p-3 bg-black border border-gray-700 rounded"
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-black rounded font-semibold"
          >
            {loading ? "Updating..." : "Update Problem"}
          </button>

        </form>
      </div>

      
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-[#0a0a0a] p-6 rounded-xl border border-gray-700 text-center">

            <h2 className="text-green-400 text-xl mb-4">
              Problem Updated Successfully 
            </h2>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-500 rounded"
              >
                Go Back
              </button>

              <button
                onClick={() => setShowSuccess(false)}
                className="px-4 py-2 bg-white text-black rounded"
              >
                Stay Here
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}