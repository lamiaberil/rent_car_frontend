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

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

import { Office, Car } from "@/types";
import { officeService } from "@/services/office";
import { carService } from "@/services/car";

export default function OfficesPage() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    phone: ""
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [officeData, carData] = await Promise.all([
          officeService.getOffices(),
          carService.getCars(),
        ]);

        setOffices(officeData);
        setCars(carData);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const getCarCount = (officeId: string) => {
    return cars.filter((car) => car.officeId === officeId).length;
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);
      const newOffice = await officeService.createOffice(formData);
      setOffices(prev => [newOffice, ...prev]);
      setIsModalOpen(false);
      setFormData({
        name: "",
        city: "",
        address: "",
        phone: ""
      });
    } catch (error) {
      console.error("Ekleme hatası:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ofislerim</h1>
            <p className="text-muted-foreground mt-2">
              Tüm ofislerinizi buradan yönetebilirsiniz.
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
                <TableHead>Ofis Adı</TableHead>
                <TableHead>Şehir</TableHead>
                <TableHead>Adres</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Araç Sayısı</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>

                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>

                    <TableCell>
                      <Skeleton className="h-4 w-56" />
                    </TableCell>

                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>

                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                  </TableRow>
                ))
              ) : offices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Gösterilecek ofis bulunamadı.
                  </TableCell>
                </TableRow>
              ) : (
                offices.map((office) => (
                  <TableRow key={office.id}>
                    <TableCell className="font-medium text-primary">
                      <Link
                        href={`/offices/${office.id}`}
                        className="hover:underline"
                      >
                        {office.name}
                      </Link>
                    </TableCell>

                    <TableCell>{office.city}</TableCell>

                    <TableCell>{office.address}</TableCell>

                    <TableCell>{office.phone}</TableCell>

                    <TableCell>
                      {getCarCount(office.id)} araç
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
            <DialogTitle>Yeni Ofis Ekle</DialogTitle>
            <DialogDescription>
              Aşağıdaki formu doldurarak yeni bir ofis ekleyebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">Ofis Adı</label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: Kadıköy Ofisi"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="city" className="text-sm font-medium">Şehir</label>
              <Input
                id="city"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                placeholder="Örn: İstanbul"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="address" className="text-sm font-medium">Adres</label>
              <Input
                id="address"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="Açık adres giriniz"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="phone" className="text-sm font-medium">Telefon</label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Örn: 0216 555 44 33"
              />
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