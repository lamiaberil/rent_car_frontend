"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { Car, Office } from "@/types";
import { carService } from "@/services/car";
import { officeService } from "@/services/office";

export default function FavoritesPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [offices, setOffices] = useState<Record<string, Office>>({});
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [favCars, officeData] = await Promise.all([
          carService.getFavoriteCars(),
          officeService.getOffices(),
        ]);

        const officeMap: Record<string, Office> = {};
        officeData.forEach((office: any) => {
          officeMap[office.id] = office;
        });

        setCars(favCars);
        setOffices(officeMap);
      } catch (error) {
        console.error("Veriler yüklenemedi", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleFavorite = async (carId: string) => {
    setCars(prev => prev.filter(c => c.id !== carId));
    try {
      await carService.toggleFavorite(carId);
    } catch (error) {
      console.error("Favori güncellenemedi:", error);
    }
  };

  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      const matchesSearch =
        car.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBrand = brandFilter === "all" || car.brand === brandFilter;
      const matchesStatus = statusFilter === "all" || car.status === statusFilter;

      return matchesSearch && matchesBrand && matchesStatus;
    });
  }, [cars, searchTerm, brandFilter, statusFilter]);

  const uniqueBrands = useMemo(() => {
    const brands = new Set(cars.map(c => c.brand));
    return Array.from(brands);
  }, [cars]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Müsait": return "default";
      case "Kirada": return "secondary";
      case "Bakımda": return "destructive";
      default: return "outline";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Favorilerim</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Favorilerim</h1>
        <p className="text-muted-foreground mt-2">
          Favoriye eklediğiniz araçları buradan takip edebilirsiniz.
        </p>
      </div>

      {cars.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card shadow-sm h-[400px]">
          <Star className="h-16 w-16 text-yellow-400 mb-4 fill-yellow-400 opacity-50" />
          <h2 className="text-2xl font-semibold mb-2">⭐ Henüz favori araç eklemediniz.</h2>
          <p className="text-muted-foreground">
            Araçlar sayfasından yıldız ikonuna tıklayarak favori oluşturabilirsiniz.
          </p>
          <Link href="/cars" className={buttonVariants({ className: "mt-6" })}>
            Araçlara Git
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-md shadow-sm border">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Plaka, marka veya model ara..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={brandFilter} onValueChange={(val) => setBrandFilter(val || "all")}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Marka Filtresi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Markalar</SelectItem>
                {uniqueBrands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Durum Filtresi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="Müsait">Müsait</SelectItem>
                <SelectItem value="Kirada">Kirada</SelectItem>
                <SelectItem value="Bakımda">Bakımda</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCars.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg bg-card">
                Filtrelerinize uygun favori araç bulunamadı.
              </div>
            ) : (
              filteredCars.map((car) => (
                <Card key={car.id} className="overflow-hidden flex flex-col group transition-all hover:shadow-md">
                  <div className="relative h-48 w-full bg-muted">
                    {car.imageUrl ? (
                      <Image
                        src={car.imageUrl}
                        alt={`${car.brand} ${car.model}`}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">Fotoğraf Yok</div>
                    )}
                    <Badge className="absolute top-2 left-2" variant={getStatusBadgeVariant(car.status)}>
                      {car.status}
                    </Badge>
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{car.brand} {car.model}</h3>
                        <p className="text-sm text-muted-foreground font-mono">{car.plate}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-lg text-primary">{car.dailyPrice ? `${car.dailyPrice.toLocaleString("tr-TR")} ₺` : "-"}</span>
                        <span className="text-xs text-muted-foreground block">/ gün</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-4 flex-1">
                    <div className="text-sm text-muted-foreground bg-accent/50 p-2 rounded-md">
                      <span className="font-medium text-foreground">Ofis:</span> {offices[car.officeId]?.name || "Merkez Ofis"}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      onClick={() => toggleFavorite(car.id)}
                    >
                      Favoriden Çıkar
                    </Button>
                    <Button render={<Link href={`/cars/${car.id}`} />} className="flex-1">
                      Detaya Git
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
