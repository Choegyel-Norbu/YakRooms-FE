import React from 'react';

const EzeeRoomLogo = ({ size = "default", className = "", variant = "full" }) => {
  const sizeConfig = {
    small: {
      fontSize: "text-lg sm:text-xl",
      fontWeight: "font-bold",
      spacing: "tracking-wide",
      iconSize: "h-4 w-4",
      taglineSize: "text-xs"
    },
    default: {
      fontSize: "text-xl sm:text-2xl",
      fontWeight: "font-bold", 
      spacing: "tracking-wide",
      iconSize: "h-5 w-5",
      taglineSize: "text-xs"
    },
    large: {
      fontSize: "text-2xl sm:text-3xl",
      fontWeight: "font-bold",
      spacing: "tracking-wide", 
      iconSize: "h-6 w-6",
      taglineSize: "text-xs"
    }
  };

  const config = sizeConfig[size];

  // Three horizontal lines icon component (replacing the E)
  const ThreeLinesIcon = () => (
    <svg 
      className={`${config.iconSize} transition-all duration-300 group-hover:scale-110`}
      viewBox="0 0 24 24"
    >
      {/* Three horizontal lines with different colors */}
      <rect x="5" y="4" width="18" height="4" rx="1" fill="#93c5fd" className="group-hover:fill-blue-200 transition-colors duration-300"/>
      <rect x="5" y="11" width="15" height="4" rx="1" fill="#93c5fd" className="group-hover:fill-blue-200 transition-colors duration-300"/>
      <rect x="5" y="18" width="18" height="4" rx="1" fill="#1d4ed8" className="group-hover:fill-blue-800 transition-colors duration-300"/>
    </svg>
  );

  if (variant === "icon-only") {
    return (
      <div className={`flex items-center ${className}`}>
        <ThreeLinesIcon />
      </div>
    );
  }

  if (variant === "text-only") {
    return (
      <div className={`flex items-center ${className}`}>
        <span className={`${config.fontSize} ${config.fontWeight} ${config.spacing} flex items-center`}>
          <ThreeLinesIcon />
          <span className="text-yellow-500 hover:text-yellow-600 transition-colors duration-300">zee</span>
          <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 transition-all duration-300">Room</span>
        </span>
      </div>
    );
  }

  // Full logo with icon and text - Professional hotel branding style
  return (
    <div className={`flex items-center gap-3 ${className} group cursor-pointer`}>
      {/* <HotelIcon /> */}
      <div className="flex flex-col">
        <span className={`${config.fontSize} ${config.fontWeight} ${config.spacing} flex items-center`}>
          <ThreeLinesIcon />
          <span className="text-yellow-500 group-hover:text-yellow-600 transition-colors duration-300">zee</span>
          <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:via-blue-800 group-hover:to-indigo-800 transition-all duration-300">Room</span>
        </span>
        <span className={`${config.taglineSize} text-gray-500 dark:text-gray-400 font-medium tracking-wider uppercase group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300 text-right`} style={{ fontSize: '0.625rem' }}>
          Accommodation
        </span>
      </div>
    </div>
  );
};

export default EzeeRoomLogo;