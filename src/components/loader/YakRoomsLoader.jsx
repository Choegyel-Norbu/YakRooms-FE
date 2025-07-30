import React from 'react';
import './YakRoomsLoader.css';

const YakRoomsLoader = ({ 
  size = 320, 
  showTagline = true, 
  loadingText = "Loading",
  className = "" 
}) => {
  const sizeStyle = {
    width: `${size}px`,
    height: `${size}px`
  };

  const taglineLetters = "EASE YOUR STAY".split('').map((char, index) => (
    <span key={index} style={{ animationDelay: `${index * 0.1}s` }}>
      {char === ' ' ? '\u00A0' : char}
    </span>
  ));

  return (
    <div className={`yakrooms-loader-container ${className}`}>
      <div className="yakrooms-circular-loader" style={sizeStyle}>
        <div className="yakrooms-glow-ring-outer"></div>
        <div className="yakrooms-glow-ring-inner"></div>
        <div className="yakrooms-shimmer-effect"></div>
        
        <div className="yakrooms-content-wrapper">
          <div className="yakrooms-brand-name">
            <span className="yakrooms-yak">Yak</span>{' '}
            <span className="yakrooms-rooms">Rooms</span>
          </div>
          
          {showTagline && (
            <div className="yakrooms-tagline">
              {taglineLetters}
            </div>
          )}
          
          <div className="yakrooms-loading-indicator">
            <div className="yakrooms-loading-text">{loadingText}</div>
            <div className="yakrooms-loading-dots">
              <div className="yakrooms-dot"></div>
              <div className="yakrooms-dot"></div>
              <div className="yakrooms-dot"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YakRoomsLoader;