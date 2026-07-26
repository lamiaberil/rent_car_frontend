"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Reservation, Office, Car } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { reservationService } from '@/services/reservation';
import { officeService } from '@/services/office';
import { carService } from '@/services/car';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [offices, setOffices] = useState<Record<string, Office>>({});
  const [cars, setCars] = useState<Record<string, Car>>({});
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    carId: '',
    pickupOfficeId: '',
    dropoffOfficeId: '',
    startDate: '',
    endDate: '',
    status: 'Beklemede'
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [resData, officeData, carData] = await Promise.all([
          reservationService.getReservations(),
          officeService.getOffices(),
          carService.getCars(),
        ]);

        const officeMap = officeData.reduce((acc: Record<string, Office>, office: Office) => {
          acc[office.id] = office;
          return acc;
        }, {} as Record<string, Office>);

        const carMap = carData.reduce((acc: Record<string, Car>, car: Car) => {
          acc[car.id] = car;
          return acc;
        }, {} as Record<string, Car>);

        setReservations(resData);
        setOffices(officeMap);
        setCars(carMap);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Aktif Kullanımda': return 'default';
      case 'Onaylandı': return 'default';
      case 'Tamamlandı': return 'secondary';
      case 'İptal Edildi': return 'destructive';
      case 'Beklemede': return 'outline';
      default: return 'outline';
    }
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);
      const newReservation = await reservationService.addReservation({
        ...formData,
        carId: formData.carId,
        pickupOfficeId: formData.pickupOfficeId,
        dropoffOfficeId: formData.dropoffOfficeId,
        status: formData.status as Reservation['status'],
      });
      setReservations(prev => [newReservation, ...prev]);
      setIsModalOpen(false);
      setFormData({
        customerName: '',
        carId: '',
        pickupOfficeId: '',
        dropoffOfficeId: '',
        startDate: '',
        endDate: '',
        status: 'Beklemede'
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
            <h1 className="text-3xl font-bold tracking-tight">Reservasyonlarım</h1>
            <p className="text-muted-foreground mt-2">Tüm rezervasyonlarınızı buradan yönetebilirsiniz.</p>
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
                <TableHead>PNR</TableHead>
                <TableHead>Müşteri Adı</TableHead>
                <TableHead>Araç</TableHead>
                <TableHead>Alış Ofisi</TableHead>
                <TableHead>Teslim Ofisi</TableHead>
                <TableHead>Başlangıç Tarihi</TableHead>
                <TableHead>Bitiş Tarihi</TableHead>
                <TableHead>Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : reservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    Gösterilecek veri bulunamadı.
                  </TableCell>
                </TableRow>
              ) : (
                reservations.map((res) => (
                  <TableRow key={res.id}>
                    <TableCell className="font-medium text-primary">
                      <Link href={`/reservations/${res.pnr}`} className="hover:underline">
                        {res.pnr}
                      </Link>
                    </TableCell>
                    <TableCell>{res.customerName}</TableCell>
                    <TableCell>
                      {cars[res.carId]?.brand} {cars[res.carId]?.model}
                    </TableCell>
                    <TableCell>{offices[res.pickupOfficeId]?.name}</TableCell>
                    <TableCell>{offices[res.dropoffOfficeId]?.name}</TableCell>
                    <TableCell>{new Date(res.startDate).toLocaleDateString('tr-TR')}</TableCell>
                    <TableCell>{new Date(res.endDate).toLocaleDateString('tr-TR')}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(res.status)}>
                        {res.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Dashboard özet kartları alanı */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
          <Link href="/favorites">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Favori Araçlar
                </CardTitle>
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-16" /> : Object.values(cars).filter(c => c.isFavorite).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Toplam favoriye alınan araç
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Yeni Rezervasyon Ekle</DialogTitle>
            <DialogDescription>
              Aşağıdaki formu doldurarak yeni bir rezervasyon ekleyebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="customerName" className="text-sm font-medium">Müşteri Adı</label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Örn: Ahmet Yılmaz"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Araç</label>
              <Select value={formData.carId} onValueChange={(value) => setFormData({ ...formData, carId: value || "" })}>
                <SelectTrigger>
                  <SelectValue placeholder="Araç Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(cars).map(car => (
                    <SelectItem key={car.id} value={car.id}>{car.brand} {car.model} ({car.plate})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Alış Ofisi</label>
                <Select value={formData.pickupOfficeId} onValueChange={(value) => setFormData({ ...formData, pickupOfficeId: value || "" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(offices).map(office => (
                      <SelectItem key={office.id} value={office.id}>{office.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Teslim Ofisi</label>
                <Select value={formData.dropoffOfficeId} onValueChange={(value) => setFormData({ ...formData, dropoffOfficeId: value || "" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(offices).map(office => (
                      <SelectItem key={office.id} value={office.id}>{office.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="startDate" className="text-sm font-medium">Başlangıç Tarihi</label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="endDate" className="text-sm font-medium">Bitiş Tarihi</label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Durum</label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value || "" })}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beklemede">Beklemede</SelectItem>
                  <SelectItem value="Onaylandı">Onaylandı</SelectItem>
                  <SelectItem value="Aktif Kullanımda">Aktif Kullanımda</SelectItem>
                  <SelectItem value="Tamamlandı">Tamamlandı</SelectItem>
                  <SelectItem value="İptal Edildi">İptal Edildi</SelectItem>
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
