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

  // Professional hotel/accommodation icon component
  const HotelIcon = () => (
    <div className="relative group">
      <svg 
        className={`${config.iconSize} text-blue-600 transition-all duration-300 group-hover:text-blue-700 group-hover:scale-110`}
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M12 2L2 7v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7l-10-5zM6 19v-8l6-3 6 3v8H6zm8-6h2v2h-2v-2zm-4 0h2v2h-2v-2zm-4 0h2v2H6v-2z"/>
      </svg>
      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-full bg-blue-600/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );

  if (variant === "icon-only") {
    return (
      <div className={`flex items-center ${className}`}>
        {/* <HotelIcon /> */}
      </div>
    );
  }

  if (variant === "text-only") {
    return (
      <div className={`flex items-center ${className}`}>
        <span className={`${config.fontSize} ${config.fontWeight} ${config.spacing} flex items-center`}>
          <span className="text-yellow-500 hover:text-yellow-600 transition-colors duration-300">Ezee</span>
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
          <span className="text-yellow-500 group-hover:text-yellow-600 transition-colors duration-300">Ezee</span>
          <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:via-blue-800 group-hover:to-indigo-800 transition-all duration-300">Room</span>
        </span>
        <span className={`${config.taglineSize} text-gray-500 dark:text-gray-400 font-medium tracking-wider uppercase group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300`} style={{ fontSize: '0.625rem' }}>
          Accommodation
        </span>
      </div>
    </div>
  );
};

export default EzeeRoomLogo;