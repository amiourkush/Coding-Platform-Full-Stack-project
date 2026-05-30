import { useEffect, useRef, useState } from "react";

export default function Editorial({
  secureUrl,
  duration,
  thumbnailUrl,
}) {
  const videoRef = useRef(null);

  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
    };

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [started]);

  const handleStart = () => {
    setStarted(true);

    setTimeout(() => {
      videoRef.current?.play();
    }, 100);
  };

  const togglePlayPause = () => {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const progress =
    duration > 0
      ? (currentTime / duration) * 100
      : 0;

  return (
    <div className="bg-[#1e1e1e] rounded-xl p-5">
      <h2 className="text-2xl font-semibold mb-4">
        Video Editorial
      </h2>

      {!started ? (
        <div
          className="relative cursor-pointer"
          onClick={handleStart}
        >
          <img
            src={thumbnailUrl}
            alt="thumbnail"
            className="w-full rounded-lg"
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <button className="bg-black/70 px-6 py-3 rounded-full text-white text-lg">
              ▶ Play
            </button>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={secureUrl}
          className="w-full rounded-lg"
        />
      )}

      {started && (
        <>
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={togglePlayPause}
              className="bg-blue-600 px-4 py-2 rounded-lg"
            >
              {playing ? "Pause" : "Play"}
            </button>

            <span>
              {formatTime(currentTime)}
            </span>

            <span>/</span>

            <span>
              {formatTime(duration)}
            </span>
          </div>

          <div className="w-full h-2 bg-gray-700 rounded mt-4">
            <div
              className="h-full bg-green-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}