"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Car } from "@/types";
import { carService } from "@/services/car";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Car as CarIcon, Eye, Calendar, DollarSign } from "lucide-react";

export default function RecentlyViewedPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await carService.getRecentlyViewedCars();
        setCars(data || []);
      } catch (err) {
        console.error("Failed to load recently viewed cars:", err);
        setError("Son görüntülenen araçlar yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (error) {
    return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Eye className="w-8 h-8 text-primary" />
          Son Görüntülenen Araçlar
        </h1>
        <p className="text-muted-foreground mt-2">
          Yakın zamanda incelediğiniz araçların geçmişi.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full rounded-none" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : cars.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-slate-50/50">
          <CarIcon className="w-16 h-16 text-slate-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Henüz araç incelemediniz</h2>
          <p className="text-muted-foreground mb-6">
            Sistemdeki araçları incelediğinizde burada listelenecektir.
          </p>
          <Link href="/cars">
            <Button>Araçlara Göz At</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cars.map((car) => (
            <Card key={car.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-all group">
              <div className="relative h-48 bg-muted overflow-hidden">
                <Image
                  src={car.imageUrl || "/placeholder-car.jpg"}
                  alt={`${car.brand} ${car.model}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm font-mono">
                  {car.plate}
                </div>
              </div>
              <CardContent className="p-4 flex-1 space-y-2">
                <h3 className="font-semibold text-lg line-clamp-1">
                  {car.brand} {car.model}
                </h3>
                <div className="flex items-center text-sm text-muted-foreground gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{car.dailyPrice?.toLocaleString("tr-TR")} ₺ / gün</span>
                </div>
                {car.lastViewedAt && (
                  <div className="flex items-center text-xs text-slate-500 gap-1 mt-2">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Son görülme: {new Date(car.lastViewedAt).toLocaleDateString("tr-TR", { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}
                    </span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Link href={`/cars/${car.id}`} className="w-full">
                  <Button variant="default" className="w-full">
                    Araç Detayına Git
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
