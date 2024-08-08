"use client";

import React, { useState, useRef, useEffect } from "react";

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState(null);

  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;

    if (audio) {
      const onLoadedMetadata = () => {
        console.log("Metadata loaded");
        setDuration(audio.duration);
        console.log("Duration set:", audio.duration);
      };

      const onTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const onError = (e) => {
        console.error("Audio error:", e);
        setError("Error loading audio");
      };

      audio.addEventListener("loadedmetadata", onLoadedMetadata);
      audio.addEventListener("timeupdate", onTimeUpdate);
      audio.addEventListener("error", onError);

      return () => {
        audio.removeEventListener("loadedmetadata", onLoadedMetadata);
        audio.removeEventListener("timeupdate", onTimeUpdate);
        audio.removeEventListener("error", onError);
      };
    }
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
        console.log("Audio paused");
      } else {
        audio.play().catch((e) => {
          console.error("Play error:", e);
          setError("Error playing audio");
        });
        console.log("Audio play called");
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (audio) {
      const time = parseFloat(e.target.value);
      audio.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "20px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <audio
        ref={audioRef}
        src={`http://localhost:3001/stream`}
        preload="metadata"
      />
      <div
        style={{
          marginBottom: "10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button onClick={togglePlayPause} style={{ padding: "5px 10px" }}>
          {isPlaying ? "Pause" : "Play"}
        </button>
        <span>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
      <input
        type="range"
        min="0"
        max={duration || 0}
        value={currentTime}
        onChange={handleSeek}
        style={{ width: "100%", marginBottom: "10px" }}
      />
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div>
        Debug: isPlaying={isPlaying.toString()}, duration={duration},
        currentTime={currentTime}
      </div>
    </div>
  );
}
