import React, { useState } from "react";
import { cn } from "@/lib/utils";

const AvatarCircles = ({
  numPeople = 0,
  className,
  avatarUrls = [],
}) => {
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (index) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  if (!avatarUrls || avatarUrls.length === 0) {
    return null;
  }

  return (
    <div className={cn("z-10 flex -space-x-4 rtl:space-x-reverse", className)}>
      {avatarUrls.map((url, index) => (
        <div key={index} className="relative">
          {imageErrors[index] ? (
            <div className="h-10 w-10 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-xs text-gray-500">?</span>
            </div>
          ) : (
            <img
              className="h-10 w-10 rounded-full border-2 border-white dark:border-gray-800 object-cover"
              src={url}
              width={40}
              height={40}
              alt={`Reviewer avatar ${index + 1}`}
              onError={() => handleImageError(index)}
            />
          )}
        </div>
      ))}
      {numPeople > 0 && (
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-black text-center text-xs font-medium text-white hover:bg-gray-600 dark:border-gray-800 dark:bg-white dark:text-black cursor-default"
          title={`${numPeople} more reviewer${numPeople > 1 ? 's' : ''}`}
        >
          +{numPeople}
        </div>
      )}
    </div>
  );
};

export { AvatarCircles };

