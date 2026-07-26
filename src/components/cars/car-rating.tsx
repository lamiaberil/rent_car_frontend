"use client";

import { useState } from "react";
import { StarRating } from "@/components/ui/star-rating";
import { carService } from "@/services/car";
import { toast } from "sonner";

interface CarRatingProps {
  carId: string;
  initialRating?: number;
  ratingCount?: number;
}

export function CarRating({ carId, initialRating = 0, ratingCount = 0 }: CarRatingProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentRating, setCurrentRating] = useState(initialRating);

  const handleRate = async (rating: number) => {
    try {
      setIsSubmitting(true);
      await carService.rateCar(carId, rating);
      setCurrentRating(rating);
      toast.success("Araç başarıyla puanlandı.", {
        description: `Araca ${rating} yıldız verdiniz.`,
      });
    } catch (error) {
      console.error("Puanlama hatası:", error);
      toast.error("Puanlama başarısız oldu.", {
        description: "Lütfen daha sonra tekrar deneyiniz.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <StarRating 
        initialRating={currentRating} 
        onRate={handleRate} 
        readonly={isSubmitting} 
      />
      <span className="text-xs text-muted-foreground font-medium">
        {currentRating > 0 ? Number(currentRating).toFixed(1) : "0.0"} / 5.0 ({ratingCount} Değerlendirme)
      </span>
    </div>
  );
}
