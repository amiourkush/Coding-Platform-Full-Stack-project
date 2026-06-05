import { useState } from "react";
import axios from "axios";
import axiosClient from "../utils/axiosClient";

export default function Uploading({ problemId }) {
  const [video, setVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedMB, setUploadedMB] = useState(0);

  const totalSizeMB = video
    ? (video.size / (1024 * 1024)).toFixed(2)
    : 0;

  const handleUpload = async () => {
    if (!video) {
      alert("Select a video first");
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      const { data: signData } = await axiosClient.get(
        `/video/create/${problemId}`
      );

      const formData = new FormData();

      formData.append("file", video);
      formData.append("api_key", signData.api_key);
      formData.append("timestamp", signData.timestamp);
      formData.append("signature", signData.signature);
      formData.append("public_id", signData.public_id);

      const { data: uploadedVideo } = await axios.post(
        `https://api.cloudinary.com/v1_1/${signData.cloud_name}/video/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const loaded = progressEvent.loaded;
            const total = progressEvent.total;

            const percentage = Math.round(
              (loaded * 100) / total
            );

            setProgress(percentage);
            setUploadedMB(
              (loaded / (1024 * 1024)).toFixed(2)
            );
          },
        }
      );

      await axiosClient.post("/video/saveMetaData", {
        problemId,
        cloudinaryPublicId: uploadedVideo.public_id,
        secureUrl: uploadedVideo.secure_url,
        duration: uploadedVideo.duration,
      });

      alert("Video Uploaded Successfully");
      setVideo(null);
      setProgress(0);
    } catch (error) {
      console.error(error);
      alert("Upload Failed");
    } finally {
      setUploading(false);
    }
  };

  return (
     <div className="min-h-screen flex items-center justify-center px-4">
    <div className="w-full max-w-lg">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm p-6 shadow-xl">

        <h2 className="text-xl font-semibold text-white">
          Upload Solution Video
        </h2>

        <p className="text-sm text-zinc-400 mt-1">
          Share your approach and explanation for this problem.
        </p>

        {/* Upload Area */}
        <label className="mt-6 flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 rounded-xl p-8 cursor-pointer hover:border-zinc-500 transition">
          <svg
            className="w-10 h-10 text-zinc-500 mb-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
            />
          </svg>

          <p className="text-white font-medium">
            Click to select video
          </p>

          <p className="text-xs text-zinc-500 mt-1">
            MP4, MOV, AVI
          </p>

          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              setVideo(e.target.files[0]);
              setProgress(0);
            }}
          />
        </label>

        {/* File Info */}
        {video && (
          <div className="mt-5 rounded-xl bg-zinc-800/60 border border-zinc-700 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white text-sm font-medium truncate max-w-[250px]">
                  {video.name}
                </p>

                <p className="text-zinc-400 text-xs mt-1">
                  {totalSizeMB} MB
                </p>
              </div>

              <span className="text-green-400 text-xs font-medium">
                Ready
              </span>
            </div>
          </div>
        )}

        {/* Progress */}
        {uploading && (
          <div className="mt-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-300">
                Uploading...
              </span>

              <span className="text-zinc-300">
                {progress}%
              </span>
            </div>

            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-2 text-right text-xs text-zinc-500">
              {uploadedMB} MB / {totalSizeMB} MB
            </div>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={uploading || !video}
          className="w-full mt-6 bg-white text-black font-medium py-3 rounded-xl hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : "Upload Video"}
        </button>
      </div>
    </div>
    </div>
  );
}