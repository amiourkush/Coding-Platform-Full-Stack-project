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

      // Get Signature
      const { data: signData } = await axiosClient.get(
        `/video/create/${problemId}`
      );

      const formData = new FormData();

      formData.append("file", video);
      formData.append("api_key", signData.api_key);
      formData.append("timestamp", signData.timestamp);
      formData.append("signature", signData.signature);
      formData.append("public_id", signData.public_id);

      // Upload to Cloudinary
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

      // Save Metadata
      await axiosClient.post("/video/saveMetaData", {
        problemId,
        cloudinaryPublicId: uploadedVideo.public_id,
        secureUrl: uploadedVideo.secure_url,
        duration: uploadedVideo.duration,
      });

      alert("Video Uploaded Successfully");
    } catch (error) {
      console.error(error);
      alert("Upload Failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-4">
      <input
        type="file"
        accept="video/*"
        onChange={(e) => {
          setVideo(e.target.files[0]);
          setProgress(0);
        }}
      />

      {video && (
        <div className="text-sm text-gray-400">
          <p>
            File: <span className="text-white">{video.name}</span>
          </p>

          <p>
            Size: <span className="text-white">{totalSizeMB} MB</span>
          </p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload Video"}
      </button>

      {uploading && (
        <div className="space-y-2">
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className="bg-green-500 h-4 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Upload Stats */}
          <div className="flex justify-between text-sm">
            <span>{progress}%</span>

            <span>
              {uploadedMB} MB / {totalSizeMB} MB
            </span>
          </div>
        </div>
      )}
    </div>
  );
}