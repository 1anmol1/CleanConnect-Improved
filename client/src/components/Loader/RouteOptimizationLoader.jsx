import React, { useState, useEffect } from 'react';
import optimizationVideo from '../../assets/optimization-animation.mp4'; 
import './RouteOptimizationLoader.css';

const RouteOptimizationLoader = ({ onStart, isOptimizing }) => {
  const loadingTexts = [
    "Analyzing real-time traffic data...",
    "Processing smart bin fill levels...",
    "Evaluating multiple route permutations...",
    "Applying predictive algorithms...",
    "Finalizing the most efficient path..."
  ];

  const [currentText, setCurrentText] = useState(loadingTexts[0]);

  useEffect(() => {
    let interval;
    if (isOptimizing) {
      let index = 0;
      interval = setInterval(() => {
        index = (index + 1) % loadingTexts.length;
        setCurrentText(loadingTexts[index]);
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isOptimizing]);

  return (
    <div className={`optimization-loader-container ${isOptimizing ? 'optimizing' : ''}`}>
      <div className="animation-content">
        <div className="animation-header">
          {/* This text only shows before starting */}
          {!isOptimizing && (
            <p>Find the best way to collect bins today.</p>
          )}
        </div>

        {/* This entire block only appears AFTER the button is clicked */}
        {isOptimizing && (
          <>
            <video 
              className="loading-video-spinner"
              src={optimizationVideo} 
              autoPlay 
              loop 
              muted 
              playsInline 
            />
            <div className="status-text">
              <span className="ai-text-gradient">{currentText}</span>
            </div>
          </>
        )}
      </div>

      {/* The button is only visible BEFORE optimization starts */}
      {!isOptimizing && (
        <button className="btn btn-start-optimization" onClick={onStart}>
          Find today's Optimal Route
        </button>
      )}
    </div>
  );
};

export default RouteOptimizationLoader;