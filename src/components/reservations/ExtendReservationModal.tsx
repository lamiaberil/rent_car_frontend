"use client";

import React, { useState, useMemo } from "react";
import { format, differenceInDays, addDays, isBefore, startOfDay, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, AlertCircle, Car as CarIcon, MapPin } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Reservation, Car, Office } from "@/types";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ExtendReservationModalProps {
  reservation: Reservation;
  car: Car;
  allReservations: Reservation[];
  allCars: Car[];
  allOffices: Partial<Office>[];
}

export function ExtendReservationModal({
  reservation,
  car,
  allReservations,
  allCars,
  allOffices,
}: ExtendReservationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [extraDriver, setExtraDriver] = useState(false);
  const [extraInsurance, setExtraInsurance] = useState(false);
  const [selectedDropoff, setSelectedDropoff] = useState<string>(reservation.dropoffOfficeId);
  const [isLoading, setIsLoading] = useState(false);

  // Parsing current end date
  const currentEndDate = useMemo(() => new Date(reservation.endDate), [reservation.endDate]);
  const minSelectableDate = addDays(startOfDay(currentEndDate), 1);

  // Son dakika uzatması badge (if current time is within 24h of end date)
  const isLastMinute = useMemo(() => {
    // Since mock data is in 2026, we just assume it's true for demonstration if difference is <= 1 day relative to currentEndDate vs "now", but let's mock it using reservation dates
    // For a real app: differenceInDays(currentEndDate, new Date()) <= 1
    const diff = differenceInDays(currentEndDate, new Date());
    return diff >= 0 && diff <= 1;
  }, [currentEndDate]);

  // Derived calculations
  const { addedDays, carCost, extrasCost, taxes, totalCost } = useMemo(() => {
    if (!selectedDate || isBefore(selectedDate, currentEndDate)) {
      return { addedDays: 0, carCost: 0, extrasCost: 0, taxes: 0, totalCost: 0 };
    }
    const days = differenceInDays(selectedDate, currentEndDate);
    const cCost = days * car.dailyPrice;
    const driverCost = extraDriver ? days * 200 : 0;
    const insuranceCost = extraInsurance ? days * 400 : 0;
    const eCost = driverCost + insuranceCost;

    // Calculate taxes (e.g., 20%)
    const taxAmount = (cCost + eCost) * 0.20;

    return {
      addedDays: days,
      carCost: cCost,
      extrasCost: eCost,
      taxes: taxAmount,
      totalCost: cCost + eCost + taxAmount,
    };
  }, [selectedDate, currentEndDate, car.dailyPrice, extraDriver, extraInsurance]);

  // Conflict validation
  const conflict = useMemo(() => {
    if (!selectedDate) return false;

    // Find any reservation for this car that starts before our new selected end date
    // and ends after our current end date, excluding this reservation itself.
    return allReservations.some((r) => {
      if (r.carId !== car.id || r.id === reservation.id) return false;
      // Skip cancelled or completed ones
      if (r.status === 'İptal Edildi' || r.status === 'Tamamlandı') return false;

      const rStart = new Date(r.startDate);

      // If the other reservation starts BEFORE our new end date, it's a conflict
      return rStart < selectedDate && rStart > currentEndDate;
    });
  }, [selectedDate, currentEndDate, allReservations, car.id, reservation.id]);

  const alternativeCars = useMemo(() => {
    if (!conflict) return [];
    return allCars.filter(
      (c) => c.segment === car.segment && c.id !== car.id && c.status === 'Müsait'
    ).slice(0, 3);
  }, [conflict, allCars, car.segment, car.id]);

  const handleExtend = async () => {
    if (!selectedDate || conflict) return;
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsOpen(false);
      toast.success("Rezervasyon süresi başarıyla uzatıldı", {
        description: `Yeni teslim tarihi: ${format(selectedDate, "PPP", { locale: tr })}`,
      });
      // Here we would typically refresh the page or update context

      // Reset state
      setSelectedDate(undefined);
      setExtraDriver(false);
      setExtraInsurance(false);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button onClick={() => setIsOpen(true)}>
        Süreyi Uzat
      </Button>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Süreyi Uzat
            {isLastMinute && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Son Dakika</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Mevcut rezervasyonunuzun teslim tarihini ileri bir tarihe erteleyebilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-3 bg-muted rounded-md border">
            <div>
              <p className="text-xs text-muted-foreground">Mevcut Teslim Tarihi</p>
              <p className="font-semibold">{format(currentEndDate, "PPP", { locale: tr })}</p>
            </div>
            <Clock className="hidden sm:block text-muted-foreground w-5 h-5 opacity-50" />
            <div className="w-full sm:w-auto">
              <p className="text-xs text-muted-foreground mb-1">Yeni Teslim Tarihi</p>
              <Popover>
                <PopoverTrigger render={
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full sm:w-[160px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  />
                }>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: tr }) : "Tarih Seçin"}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => isBefore(date, minSelectableDate)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {conflict ? (
            <div className="space-y-4">
              <div className="bg-destructive/15 text-destructive p-3 rounded-md flex items-start gap-3 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>
                  Bu araç belirtilen tarihler arasında başka bir rezervasyona sahip olduğu için süre uzatılamamaktadır.
                </p>
              </div>

              {alternativeCars.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Benzer Segmentteki Alternatif Araçlar:</p>
                  <div className="grid gap-2">
                    {alternativeCars.map((altCar) => (
                      <div key={altCar.id} className="flex items-center justify-between p-2 border rounded-md bg-card">
                        <div className="flex items-center gap-3">
                          <img src={altCar.imageUrl} alt={altCar.model} className="w-12 h-8 object-cover rounded" />
                          <div>
                            <p className="text-sm font-medium">{altCar.brand} {altCar.model}</p>
                            <p className="text-xs text-muted-foreground">{altCar.dailyPrice} ₺ / Gün</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" render={<Link href={`/cars/${altCar.id}`} />}>
                          İncele
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <p className="text-sm font-semibold">Ekstra Seçenekler</p>
                <div className="grid gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="extraDriver"
                      checked={extraDriver}
                      onCheckedChange={(checked) => setExtraDriver(!!checked)}
                      disabled={!selectedDate}
                    />
                    <label
                      htmlFor="extraDriver"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Ek Sürücü İstiyorum <span className="text-muted-foreground font-normal">(Günlük 200 ₺)</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="extraInsurance"
                      checked={extraInsurance}
                      onCheckedChange={(checked) => setExtraInsurance(!!checked)}
                      disabled={!selectedDate}
                    />
                    <label
                      htmlFor="extraInsurance"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Ek Sigorta İstiyorum <span className="text-muted-foreground font-normal">(Günlük 400 ₺)</span>
                    </label>
                  </div>

                  <div className="pt-2">
                    <label className="text-sm font-medium mb-1.5 block">Teslim Ofisini Değiştir</label>
                    <Select value={selectedDropoff} onValueChange={(value) => value && setSelectedDropoff(value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Ofis Seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {allOffices.map((office) => (
                          <SelectItem key={office.id} value={office.id}>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              {office.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {selectedDate && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="font-semibold text-sm mb-3">Hesap Özeti ({addedDays} Gün)</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Araç Bedeli</span>
                    <span>{carCost.toLocaleString("tr-TR")} ₺</span>
                  </div>
                  {extrasCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ek Hizmetler</span>
                      <span>{extrasCost.toLocaleString("tr-TR")} ₺</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">KDV (%20)</span>
                    <span>{taxes.toLocaleString("tr-TR")} ₺</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Toplam Ek Tutar</span>
                    <span className="text-primary">{totalCost.toLocaleString("tr-TR")} ₺</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            İptal
          </Button>
          {!conflict && (
            <Button onClick={handleExtend} disabled={!selectedDate || isLoading}>
              {isLoading ? "İşleniyor..." : "Onayla ve Uzat"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
