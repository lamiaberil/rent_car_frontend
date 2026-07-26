"use client";

import { useEffect, useState, useRef } from "react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExtendReservationModal } from "@/components/reservations/ExtendReservationModal";
import {
  CalendarDays,
  Car as CarIcon,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  MapPin,
  Phone,
  QrCode,
  User,
  Navigation,
  ArrowRight,
  ShieldCheck,
  Mail,
  Map,
  FileText,
  AlertCircle,
  Building,
  Star,
  Info
} from "lucide-react";
import { reservationService } from "@/services/reservation";
import { carService } from "@/services/car";
import { officeService } from "@/services/office";

interface Props {
  params: Promise<{
    pnr: string;
  }>;
}

export default function ReservationDetailPage({ params }: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [pnrValue, setPnrValue] = useState<string | null>(null);

  // Döngüyü kırmak için kilit mekanizması
  const isFetched = useRef(false);

  // 1. Next.js params objesinden PNR değerini güvenli bir string state'e çıkartıyoruz
  useEffect(() => {
    params.then((res) => {
      if (res?.pnr) {
        setPnrValue(res.pnr);
      }
    });
  }, [params]);

  // 2. Veri çekme işlemini string olan pnrValue üzerinden yürütüyoruz
  useEffect(() => {
    // PNR henüz yoksa veya zaten istek atıldıysa burada işlemi durdur
    if (!pnrValue || isFetched.current) return;

    async function fetchData(pnr: string) {
      try {
        isFetched.current = true; // Kilit kapandı, bir daha asla istek atılmayacak
        setLoading(true);

        const reservation = await reservationService.getReservationById(pnr);
        if (!reservation) {
          setLoading(false);
          return;
        }

        const [car, pickupOffice, dropoffOffice] = await Promise.all([
          carService.getCarsById(reservation.carId),
          officeService.getOfficeById(reservation.pickupOfficeId),
          officeService.getOfficeById(reservation.dropoffOfficeId)
        ]);

        let modalData = { reservations: [], cars: [], offices: [] };
        if (reservation.status === 'Aktif Kullanımda') {
          const [allReservations, allCars, allOffices] = await Promise.all([
            reservationService.getReservations(),
            carService.getCars(),
            officeService.getOffices()
          ]);
          modalData = { reservations: allReservations, cars: allCars, offices: allOffices };
        }

        setData({
          reservation,
          car,
          pickupOffice,
          dropoffOffice,
          modalData
        });
      } catch (error) {
        console.error("Veri çekilirken hata oluştu:", error);
        isFetched.current = false; // Hata durumunda kilidi açmak istersen (isteğe bağlı)
      } finally {
        setLoading(false);
      }
    }

    fetchData(pnrValue);
  }, [pnrValue]);

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Yükleniyor...</div>;
  }

  if (!data || !data.reservation || !data.car || !data.pickupOffice || !data.dropoffOffice) {
    notFound();
  }

  const { reservation, car, pickupOffice, dropoffOffice, modalData } = data;

  const statusColors: Record<string, string> = {
    'Onaylandı': 'bg-green-500 hover:bg-green-600',
    'Aktif Kullanımda': 'bg-blue-500 hover:bg-blue-600',
    'Tamamlandı': 'bg-green-500 hover:bg-green-600',
    'İptal Edildi': 'bg-red-500 hover:bg-red-600',
    'Beklemede': 'bg-yellow-500 hover:bg-yellow-600',
  };

  const statusBadgeColor = statusColors[reservation.status] || 'bg-gray-500 hover:bg-gray-600';

  return (
    <div className="space-y-6 pb-20">
      {/* 1. GENEL SAYFA YAPISI: ÜST BİLGİ ALANI */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center border-dashed border-2">
            <QrCode className="w-8 h-8 text-muted-foreground opacity-50" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
              {reservation.pnr}
              <Badge className={`${statusBadgeColor} text-white border-transparent`}>
                {reservation.status}
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm flex items-center gap-4">
              <span className="flex items-center gap-1">
                <CalendarDays className="w-4 h-4" /> Oluşturulma: {new Date(reservation.createdAt).toLocaleDateString('tr-TR')}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" /> ID: {reservation.id}
              </span>
            </p>
          </div>
        </div>

        {/* REZERVASYON YÖNETİMİ AKSİYONLARI */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto mt-4 md:mt-0">
          {reservation.status === 'Beklemede' || reservation.status === 'Onaylandı' ? (
            <>
              <Button variant="outline"><FileText className="w-4 h-4 mr-2" /> Sözleşmeyi İndir</Button>
              <Button variant="secondary">Güncelle</Button>
              <Button variant="destructive">İptal Et</Button>
            </>
          ) : reservation.status === 'Aktif Kullanımda' ? (
            <>
              <Button variant="outline"><Phone className="w-4 h-4 mr-2" /> Ofisi Ara</Button>
              <Button variant="destructive"><AlertCircle className="w-4 h-4 mr-2" /> Yol Yardım</Button>
              <ExtendReservationModal
                reservation={reservation}
                car={car}
                allReservations={modalData.reservations}
                allCars={modalData.cars}
                allOffices={modalData.offices}
              />
            </>
          ) : reservation.status === 'Tamamlandı' ? (
            <>
              <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Fatura İndir</Button>
              <Button variant="secondary"><Star className="w-4 h-4 mr-2" /> Puan Ver</Button>
              <Button variant="default"><CarIcon className="w-4 h-4 mr-2" /> Tekrar Kirala</Button>
            </>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SOL VE ORTA KOLON (İÇERİK) */}
        <div className="lg:col-span-2 space-y-6">
          {/* ARAÇ VE TEDARİKÇİ BİLGİLERİ */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{car.brand} {car.model}</CardTitle>
                  <CardDescription className="text-md mt-1">{car.segment} Segment • {car.year} Model</CardDescription>
                </div>
                {reservation.supplier && (
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground mb-1">Tedarikçi</span>
                    <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
                      <img src={reservation.supplier.logoUrl} alt={reservation.supplier.name} className="h-6 w-6 rounded-full object-cover" />
                      <span className="font-semibold text-sm">{reservation.supplier.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 aspect-[4/3] rounded-lg overflow-hidden border relative bg-muted">
                  <img src={car.imageUrl} alt={`${car.brand} ${car.model}`} className="object-cover w-full h-full" />
                </div>
                <div className="w-full md:w-2/3 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Plaka</p>
                    <p className="font-medium bg-muted w-max px-2 py-0.5 rounded border border-gray-300 font-mono text-sm">{car.plate}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Vites Tipi</p>
                    <p className="font-medium">{car.transmission}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Yakıt Tipi</p>
                    <p className="font-medium">{car.fuelType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Kapı Sayısı</p>
                    <p className="font-medium">{car.doors} Kapı</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Bagaj Kapasitesi</p>
                    <p className="font-medium">{car.trunkCapacity} Bagaj</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Yolcu Kapasitesi</p>
                    <p className="font-medium">{car.passengerCapacity} Kişi</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ALIŞ VE İADE BİLGİLERİ */}
          <Card>
            <CardHeader>
              <CardTitle>Transfer Detayları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6 relative">
                <div className="hidden md:flex absolute left-1/2 top-8 bottom-8 w-px bg-border -translate-x-1/2">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card p-1 rounded-full border">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Pickup Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-3 h-3 text-primary" />
                    </div>
                    Alış Bilgileri
                  </div>
                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    <div className="flex items-start gap-3">
                      <Building className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{pickupOffice.name}</p>
                        <p className="text-sm text-muted-foreground">{pickupOffice.city}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Map className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{pickupOffice.address}</p>
                    </div>
                    {reservation.pickupTerminal && (
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm font-medium">Terminal: {reservation.pickupTerminal}</p>
                      </div>
                    )}
                    <Separator />
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{new Date(reservation.startDate).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{reservation.pickupTime}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="w-full"><MapPin className="w-3 h-3 mr-2" /> Harita</Button>
                      <Button variant="secondary" size="sm" className="w-full"><Navigation className="w-3 h-3 mr-2" /> Navigasyon</Button>
                    </div>
                  </div>
                </div>

                {/* Dropoff Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-3 h-3 text-primary" />
                    </div>
                    İade Bilgileri
                  </div>
                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    <div className="flex items-start gap-3">
                      <Building className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{dropoffOffice.name}</p>
                        <p className="text-sm text-muted-foreground">{dropoffOffice.city}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Map className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{dropoffOffice.address}</p>
                    </div>
                    {reservation.dropoffTerminal && (
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm font-medium">Terminal: {reservation.dropoffTerminal}</p>
                      </div>
                    )}
                    <Separator />
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{new Date(reservation.endDate).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{reservation.dropoffTime}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="w-full"><MapPin className="w-3 h-3 mr-2" /> Harita</Button>
                      <Button variant="secondary" size="sm" className="w-full"><Navigation className="w-3 h-3 mr-2" /> Navigasyon</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MÜŞTERİ BİLGİLERİ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-muted-foreground" />
                Müşteri Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ad Soyad</p>
                  <p className="font-medium">{reservation.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Telefon</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="w-3 h-3" /> {reservation.customerPhone}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">E-posta</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="w-3 h-3" /> {reservation.customerEmail}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Doğum Tarihi</p>
                  <p className="font-medium">{new Date(reservation.customerDob).toLocaleDateString('tr-TR')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ehliyet No</p>
                  <p className="font-medium font-mono">{reservation.customerLicense}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ehliyet Geçerlilik</p>
                  <p className="font-medium">{new Date(reservation.customerLicenseExp).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KİRALAMA KOŞULLARI */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-muted-foreground" />
                Kiralama Koşulları
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Yakıt Politikası</span>
                  <span className="font-medium">{reservation.conditions.fuelPolicy}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Kilometre Limiti</span>
                  <span className="font-medium">{reservation.conditions.mileageLimit}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Depozito</span>
                  <span className="font-medium">{reservation.conditions.deposit}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">İptal Koşulları</span>
                  <span className="font-medium text-right max-w-[200px]">{reservation.conditions.cancellation}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Yaş Sınırı</span>
                  <span className="font-medium">{reservation.conditions.ageLimit}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Ek Sürücü</span>
                  <span className="font-medium">{reservation.conditions.extraDriver}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SAĞ KOLON: FİYAT ÖZETİ VE ÖDEME DETAYLARI */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader className="bg-muted/50 border-b">
              <CardTitle>Ödeme Özeti</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Günlük Kiralama</span>
                <span>{reservation.pricing.dailyRate} ₺ x {reservation.pricing.totalDays} Gün</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span>Araç Kiralama Bedeli</span>
                <span>{reservation.pricing.carTotal} ₺</span>
              </div>

              {reservation.extras.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <div className="flex justify-between items-center text-sm font-medium mb-2">
                      <span>Ek Hizmetler</span>
                      <span>{reservation.pricing.extrasTotal} ₺</span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 pl-2 border-l-2 border-primary/20">
                      {reservation.extras.map((extra: any, idx: number) => (
                        <li key={idx} className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-primary" /> {extra}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Vergiler</span>
                <span>{reservation.pricing.taxes} ₺</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">İndirim Tutarı</span>
                <span className="text-red-500">-{reservation.pricing.discount} ₺</span>
              </div>

              <div className="pt-4 border-t border-dashed">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Toplam Tutar</span>
                  <span className="text-xl font-bold text-primary">{reservation.pricing.totalAmount} ₺</span>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-md space-y-2 text-sm mt-4">
                <div className="flex justify-between items-center text-green-600 font-medium">
                  <span>Ödenen Tutar</span>
                  <span>{reservation.pricing.paidAmount} ₺</span>
                </div>
                <div className="flex justify-between items-center font-bold">
                  <span>Ofiste Ödenecek</span>
                  <span>{reservation.pricing.payAtOffice} ₺</span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="mt-6 space-y-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Ödeme Yöntemi</p>
                <div className="flex items-center gap-3 p-3 border rounded-md">
                  <div className="bg-primary/10 p-2 rounded">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{reservation.payment.method}</p>
                    <p className="text-xs text-muted-foreground">
                      {reservation.payment.cardLast4 !== '****' ? `**** **** **** ${reservation.payment.cardLast4}` : '-'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-right">İşlem Tarihi: {reservation.payment.date !== '-' ? new Date(reservation.payment.date).toLocaleString('tr-TR') : '-'}</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 bg-muted/30 border-t">
              <Button className="w-full" variant="default">
                <Download className="w-4 h-4 mr-2" /> Faturayı İndir
              </Button>
              <Button className="w-full" variant="outline">
                Ödeme Detayları
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}