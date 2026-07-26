"use client";

import { useEffect } from "react";
import { carService } from "@/services/car";

interface CarTrackerProps {
  carId: string;
}

export function CarTracker({ carId }: CarTrackerProps) {
  useEffect(() => {
    if (!carId) return;

    // We don't need to await this or handle the response in the UI,
    // we just fire and forget the view tracking request.
    carService.viewCar(carId).catch((error) => {
      console.warn("Araç görüntülenme bilgisi kaydedilemedi:", error);
    });
  }, [carId]);

  return null;
}
