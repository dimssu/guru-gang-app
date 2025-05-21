import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import '../focus.css';

const EmotionDetector = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [focusedTime, setFocusedTime] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  const expressionsConsideredFocused = ['neutral', 'happy', 'surprised'];

  useEffect(() => {
    startVideo();
    loadModels();
    
    return () => {
      if (intervalId) clearInterval(intervalId);
      // Stop the camera stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startVideo = () => {
    if (!videoRef.current) {
      console.error("Video element not available");
      return;
    }
    
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
              .then(() => {
                console.log("Video started playing");
                detectExpressions();
              })
              .catch(err => console.error("Error playing video:", err));
          };
        }
      })
      .catch((err) => {
        console.error("Camera error:", err);
        alert("Camera access is required for emotion detection. Please allow camera access and refresh the page.");
      });
  };

  const loadModels = async () => {
    const MODEL_URL = '/models';
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);
      console.log('Models loaded successfully');
    } catch (error) {
      console.error('Error loading models:', error);
    }
  };

  const detectExpressions = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      console.error('Video or canvas not available');
      return;
    }

    const displaySize = {
      width: video.videoWidth,
      height: video.videoHeight
    };
    
    if (displaySize.width === 0 || displaySize.height === 0) {
      console.error('Video dimensions not available yet');
      return;
    }
    
    faceapi.matchDimensions(canvas, displaySize);

    const id = setInterval(async () => {
      if (!video || video.paused || video.ended) return;

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      const resized = faceapi.resizeResults(detections, displaySize);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      faceapi.draw.drawDetections(canvas, resized);
      faceapi.draw.drawFaceExpressions(canvas, resized);

      if (resized.length > 0) {
        const expression = resized[0].expressions;
        const maxExpr = Object.keys(expression).reduce((a, b) =>
          expression[a] > expression[b] ? a : b
        );

        if (expressionsConsideredFocused.includes(maxExpr)) {
          setFocusedTime(prev => prev + 0.2); // since we run every 200ms
        }
      }
    }, 200);

    setIntervalId(id);
  };

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  // Format time to minutes and seconds when over 60 seconds
  const formatTime = (timeInSeconds) => {
    if (timeInSeconds < 60) {
      return `${timeInSeconds.toFixed(1)} seconds`;
    }
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes} min ${seconds.toFixed(0)} sec`;
  };

  return (
    <div className="focus-container">
      <div className="focus-header">
        <h1 className="focus-title">Don't Distract Yourself</h1>
        <h2 className="focus-subtitle">Focus Room</h2>
      </div>
      
      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="focus-video"
        />
        <canvas
          ref={canvasRef}
          className="focus-canvas"
        />
      </div>
      
      <div className="focus-stats">
        ⏱️ Time focused on task: 
        <span className="focus-time">{formatTime(focusedTime)}</span>
      </div>
    </div>
  );
};

export default EmotionDetector;