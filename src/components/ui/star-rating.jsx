import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, size = 16, showRating = false, className = "" }) => {
  // Ensure rating is a number and clamp between 0 and 5
  const numericRating = Math.max(0, Math.min(5, Number(rating) || 0));
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`transition-colors ${
            star <= numericRating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
      {showRating && (
        <span className="text-xs sm:text-sm font-medium text-gray-700 ml-1">
          {numericRating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating; 