"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  initialRating?: number;
  maxRating?: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
  className?: string;
}

export function StarRating({
  initialRating = 0,
  maxRating = 5,
  onRate,
  readonly = false,
  size = 24,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(initialRating);

  const handleMouseEnter = (index: number) => {
    if (!readonly) setHoverRating(index);
  };

  const handleMouseLeave = () => {
    if (!readonly) setHoverRating(0);
  };

  const handleClick = (index: number) => {
    if (!readonly) {
      setCurrentRating(index);
      if (onRate) onRate(index);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)} onMouseLeave={handleMouseLeave}>
      {Array.from({ length: maxRating }).map((_, i) => {
        const starValue = i + 1;
        const isActive = hoverRating ? starValue <= hoverRating : starValue <= currentRating;

        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            className={cn(
              "transition-all duration-200 ease-in-out",
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110",
              !readonly && "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
            )}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onClick={() => handleClick(starValue)}
            aria-label={`Rate ${starValue} out of ${maxRating} stars`}
          >
            <Star
              size={size}
              className={cn(
                "transition-colors",
                isActive ? "fill-yellow-400 text-yellow-400" : "fill-transparent text-slate-300"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
