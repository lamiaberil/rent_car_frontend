"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Star } from "lucide-react";
import { Car, Office } from "@/types";
import { carService } from "@/services/car";
import { officeService } from "@/services/office";

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [offices, setOffices] = useState<Record<string, Office>>({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    plate: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    status: "Müsait",
    officeId: "",

    segment: "Ekonomik",       // string
    transmission: "Manuel",    // string
    fuelType: "Benzin",        // string
    engineCapacity: "1.4",     // string
    doors: 4,                  // number
    trunkCapacity: 350,        // number
    passengerCapacity: 5,      // number
    horsepower: 90,            // number
    mileage: 0,                // number
    dailyPrice: 500,           // number
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const [carData, officeData] = await Promise.all([
          carService.getCars(),
          officeService.getOffices(),
        ]);

        const officeMap: Record<string, Office> = {};

        officeData.forEach((office: any) => {
          officeMap[office.id] = office;
        });

        setCars(carData);
        setOffices(officeMap);
      } catch (error) {
        console.warn(
          "API verisi yüklenemedi, yerel mock verilerine dönülüyor...",
          error
        );

        setCars([]);
        setOffices({});
        setErrorMessage(
          "Veri tabanından araç listesi çekilemedi."
        );

      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSave = async () => {
    try {
      setSubmitting(true);
      const newCar = await carService.createCar({
        ...formData,
        status: formData.status as Car['status'],
        transmission: formData.transmission as Car['transmission'],
        fuelType: formData.fuelType as Car['fuelType'],

      });
      setCars(prev => [newCar, ...prev]);
      setIsModalOpen(false);

      setFormData({
        plate: "",
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        status: "Müsait",
        officeId: "",
        segment: "Ekonomik",
        transmission: "Manuel",
        fuelType: "Benzin",
        engineCapacity: "1.4",
        doors: 4,
        trunkCapacity: 350,
        passengerCapacity: 5,
        horsepower: 90,
        mileage: 0,
        dailyPrice: 500,
      });
    } catch (error) {
      console.error("Ekleme hatası:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFavorite = async (carId: string, currentFavorite: boolean) => {
    // Optimistic update
    setCars(prevCars => prevCars.map(c => c.id === carId ? { ...c, isFavorite: !currentFavorite } : c));
    try {
      await carService.toggleFavorite(carId);
    } catch (error) {
      console.error("Favori güncellenemedi:", error);
      // Revert
      setCars(prevCars => prevCars.map(c => c.id === carId ? { ...c, isFavorite: currentFavorite } : c));
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Müsait":
        return "default";
      case "Kirada":
        return "secondary";
      case "Bakımda":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Hata durumunda boş beyaz ekran yerine uyarı basar
  if (errorMessage) {
    return <div className="p-8 text-center text-red-500 font-medium">{errorMessage}</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Araçlarım</h1>
            <p className="text-muted-foreground mt-2">
              Filonuzdaki tüm araçları buradan yönetebilirsiniz.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ekle
          </Button>
        </div>

        <div className="rounded-md border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plaka</TableHead>
                <TableHead>Marka / Model</TableHead>
                <TableHead>Yıl</TableHead>
                <TableHead>Vites</TableHead>
                <TableHead>Yakıt</TableHead>
                <TableHead>Kilometre</TableHead>
                <TableHead>Günlük Ücret</TableHead>
                <TableHead>Ofis</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-5 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : cars.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Gösterilecek araç bulunamadı.
                  </TableCell>
                </TableRow>
              ) : (
                cars.map((car) => (
                  <TableRow key={car.id}>
                    <TableCell className="font-medium text-primary">
                      <Link
                        href={`/cars/${car.id}`}
                        className="hover:underline font-mono"
                      >
                        {car.plate}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {car.brand} {car.model}
                    </TableCell>
                    <TableCell>{car.year}</TableCell>
                    <TableCell>{car.transmission}</TableCell>
                    <TableCell>{car.fuelType}</TableCell>
                    <TableCell>
                      {car.mileage?.toLocaleString("tr-TR")} km
                    </TableCell>
                    <TableCell>
                      {car.dailyPrice ? `${car.dailyPrice.toLocaleString("tr-TR")} ₺` : "-"}
                    </TableCell>
                    <TableCell>
                      {offices[car.officeId]?.name || "Merkez Ofis"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(car.status)}>
                        {car.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleFavorite(car.id, !!car.isFavorite)}
                        className="p-1 rounded-full hover:bg-muted transition-colors"
                      >
                        <Star
                          className={`h-5 w-5 transition-transform active:scale-125 ${
                            car.isFavorite
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-400"
                          }`}
                        />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Yeni Araç Ekle</DialogTitle>
            <DialogDescription>
              Aşağıdaki formu doldurarak yeni bir araç ekleyebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="plate" className="text-sm font-medium">Plaka</label>
              <Input
                id="plate"
                value={formData.plate}
                onChange={e => setFormData({ ...formData, plate: e.target.value })}
                placeholder="Örn: 34 ABC 123"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="brand" className="text-sm font-medium">Marka</label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={e => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Örn: Renault"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="model" className="text-sm font-medium">Model</label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={e => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Örn: Clio"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="year" className="text-sm font-medium">Yıl</label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Durum</label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value || "" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Durum Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Müsait">Müsait</SelectItem>
                    <SelectItem value="Kirada">Kirada</SelectItem>
                    <SelectItem value="Bakımda">Bakımda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Ofis</label>
              <Select value={formData.officeId} onValueChange={(value) => setFormData({ ...formData, officeId: value || "" })}>
                <SelectTrigger>
                  <SelectValue placeholder="Ofis Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(offices).map(office => (
                    <SelectItem key={office.id} value={office.id}>{office.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>İptal Et</Button>
            <Button onClick={handleSave} disabled={submitting}>
              {submitting ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}