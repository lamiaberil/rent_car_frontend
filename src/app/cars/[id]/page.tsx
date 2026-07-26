import React from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import {
  Car as CarIcon,
  Settings,
  Fuel,
  Gauge,
  Calendar,
  Users,
  Briefcase,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  Heart,
  Star,
  FileText,
  Download,
  Eye,
  PenTool,
  Wrench,
  ChevronRight,

} from "lucide-react"
import { Car, Office, Reservation } from "@/types"
import { carService } from "@/services/car"
import { reservationService } from "@/services/reservation"
import { officeService } from "@/services/office"
import { documentService } from "@/services/document"
import { damageService } from "@/services/damage"
import { maintenanceService } from "@/services/maintenance"
import { CarTracker } from "@/components/cars/car-tracker"
import { CarRating } from "@/components/cars/car-rating"

export default async function CarDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {

  const resolvedParams = await params;
  const carId = resolvedParams.id;

  const car = await carService.getCarsById(carId);

  if (!car) {
    return notFound();
  }



  const results = await Promise.allSettled([
    reservationService.getReservations(),
    officeService.getOffices()
  ]);

  const resData = results[0].status === 'fulfilled' ? results[0].value : [];
  const officeData = results[1].status === 'fulfilled' ? results[1].value : [];

  const reservations = Array.isArray(resData)
    ? resData.filter((r: any) => r.carId === car.id)
    : [];

  const office = Array.isArray(officeData)
    ? officeData.find((o: any) => o.id === car.officeId)
    : null;


  let damages = [];
  let documents = [];

  try {
    damages = await damageService.getDamageById(car.id);
  } catch (error) {
    console.warn("Bu araç için hasar kaydı bulunamadı (404).");
  }

  try {
    documents = await documentService.getDocumentsById(car.id);
  } catch (error) {
    console.warn("Bu araç için döküman bulunamadı (404).");
  }

  let maintenances: any[] = [];
  try {
    const allMaintenances = await maintenanceService.getMaintenances();
    maintenances = allMaintenances.filter(m => m.carId === car.id);
  } catch (error) {
    console.warn("Bu araç için bakım kaydı bulunamadı.");
  }

  const statusColors: any = {
    'Müsait': 'bg-green-500',
    'Kirada': 'bg-blue-500',
    'Bakımda': 'bg-orange-500'
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <CarTracker carId={car.id} />
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          {/* TR Plate Design */}
          <div className="flex items-center w-fit border-2 border-slate-300 rounded-md shadow-sm overflow-hidden bg-white">
            <div className="bg-blue-600 text-white flex flex-col items-center justify-center px-2 py-1">
              <span className="text-[10px] font-bold">TR</span>
            </div>
            <div className="px-4 py-1 text-2xl font-black text-slate-800 tracking-wider">
              {car.plate}
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            {car.year} {car.brand} {car.model}
          </h1>
          <div className="flex items-center text-muted-foreground text-sm gap-2">
            <span>{car.fuelType}</span>
            <span>&bull;</span>
            <span>{car.transmission}</span>
            <span>&bull;</span>
            <span>{car.segment} Segmenti</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className={`${statusColors[car.status] || 'bg-slate-500'} text-white`}>
            {car.status}
          </Badge>
          {car.isFavorite && (
            <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-50">
              <Heart className="w-3 h-3 mr-1 fill-yellow-500" /> Favori Araç
            </Badge>
          )}
          {car.isFrequentlyRented && (
            <Badge variant="outline" className="border-purple-500 text-purple-600 bg-purple-50">
              <Star className="w-3 h-3 mr-1 fill-purple-500" /> Sık Kiralanan
            </Badge>
          )}
          {car.status === 'Kirada' && (
            <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">
              Sizde / Aktif Kiralama
            </Badge>
          )}
        </div>

        {/* Rating Component */}
        <div className="flex justify-start md:justify-end">
          <CarRating carId={car.id} initialRating={car.rating} ratingCount={car.ratingCount} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN - MAIN INFO */}
        <div className="lg:col-span-2 space-y-8">

          {/* SECTION 2: IMAGES */}
          <Card>
            <CardContent className="p-4">
              {/* Desktop Gallery */}
              <div className="hidden md:grid grid-cols-4 gap-2 h-96">
                {/* Ana Büyük Resim (3 sütun kaplıyor) */}
                <div className="col-span-3 row-span-2 relative rounded-xl overflow-hidden">
                  <Image src={car.imageUrl} alt={car.brand} fill className="object-cover" />
                </div>

                {/* Diğer Galeri Resimleri (1'den 3'e kadar olanları döner) */}
                {car.images?.slice(1, 3).map((img: any, i: any) => (
                  <div key={i} className="relative rounded-xl overflow-hidden h-full">
                    <Image
                      src={img} // car.imageUrl yerine döngüden gelen 'img' olmalı
                      alt={`${car.brand} gallery ${i}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}

                {/* Eğer yeterli resim yoksa boş gri kutu göster (Güvenli Kontrol) */}
                {(!car.images || car.images.length < 3) && (
                  <div className="relative rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                    <CarIcon className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                )}
              </div>
            </CardContent>

          </Card>

          {/* SECTION 3: CAR INFO (KÜNYE) */}
          <Card>
            <CardHeader>
              <CardTitle>Araç Künyesi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><CarIcon className="w-4 h-4" /> Marka/Model</p>
                  <p className="font-medium">{car.brand} {car.model}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="w-4 h-4" /> Model Yılı</p>
                  <p className="font-medium">{car.year}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><Settings className="w-4 h-4" /> Vites</p>
                  <p className="font-medium">{car.transmission}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><Fuel className="w-4 h-4" /> Yakıt Tipi</p>
                  <p className="font-medium">{car.fuelType}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><Gauge className="w-4 h-4" /> Motor/Güç</p>
                  <p className="font-medium">{car.engineCapacity || '-'} / {car.horsepower ? `${car.horsepower} HP` : '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><Users className="w-4 h-4" /> Kapasite</p>
                  <p className="font-medium">{car.passengerCapacity} Yolcu</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><Briefcase className="w-4 h-4" /> Bagaj</p>
                  <p className="font-medium">{car.trunkCapacity} Bavul</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-4 h-4" /> Bağlı Ofis</p>
                  {office ? (
                    <Link href={`/offices/${office.id}`} className="font-medium text-blue-600 hover:underline">
                      {office.name}
                    </Link>
                  ) : (
                    <p className="font-medium">-</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION: TABS FOR HISTORY, DAMAGES, DOCUMENTS */}
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent flex flex-wrap">
              <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">Yolculuk Geçmişi</TabsTrigger>
              <TabsTrigger value="damages" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">Hasar & Ekspertiz</TabsTrigger>
              <TabsTrigger value="documents" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">Araç Belgeleri</TabsTrigger>
              <TabsTrigger value="maintenances" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">Bakım Geçmişi</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="pt-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 flex flex-col items-center text-center space-y-1">
                    <History className="w-6 h-6 text-blue-500 mb-1" />
                    <p className="text-2xl font-bold">{reservations.length}</p>
                    <p className="text-xs text-muted-foreground">Toplam Kiralama</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center text-center space-y-1">
                    <Gauge className="w-6 h-6 text-green-500 mb-1" />
                    <p className="text-2xl font-bold">{car.mileage.toLocaleString()} km</p>
                    <p className="text-xs text-muted-foreground">Toplam Yapılan Yol</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center text-center space-y-1">
                    <Clock className="w-6 h-6 text-orange-500 mb-1" />
                    <p className="text-2xl font-bold">5 Gün</p>
                    <p className="text-xs text-muted-foreground">Ortalama Süre</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center text-center space-y-1">
                    <MapPin className="w-6 h-6 text-purple-500 mb-1" />
                    <p className="text-2xl font-bold">12 Gün</p>
                    <p className="text-xs text-muted-foreground">En Uzun Yolculuk</p>
                  </CardContent>
                </Card>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PNR</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Süre</TableHead>
                      <TableHead>Alış/Teslim Ofisi</TableHead>
                      <TableHead className="text-right">Aksiyon</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservations.length > 0 ? (
                      reservations.map((res: any) => (
                        <TableRow key={res.id}>
                          <TableCell className="font-medium">{res.pnr}</TableCell>
                          <TableCell>
                            {new Date(res.startDate).toLocaleDateString()} - {new Date(res.endDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{res.pricing.totalDays} Gün</TableCell>
                          <TableCell>
                            <span className="truncate block w-[150px]">{officeData.find((o: Office) => o.id === res.pickupOfficeId)?.name || res.pickupOfficeId}</span>
                            <span className="text-xs text-muted-foreground truncate block w-[150px]">{officeData.find((o: Office) => o.id === res.dropoffOfficeId)?.name || res.dropoffOfficeId}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/reservations/${res.pnr}`}>
                              <Button variant="ghost" size="icon">
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          Bu araç için geçmiş rezervasyon bulunamadı.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="damages" className="pt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-8">

                    <div className="flex-1 border rounded-lg p-4 flex items-center justify-center bg-slate-50 relative min-h-[300px]">
                      <div className="absolute inset-4 border-2 border-dashed border-slate-300 rounded-[4rem] flex items-center justify-center">
                        <span className="text-slate-400 font-medium rotate-90 md:rotate-0">Araç Şeması (Kuşbakışı)</span>
                      </div>
                      {/* Fake Damage Markers */}
                      {damages.map((d: { id: React.Key | null | undefined; area: string | undefined }, i: number) => (
                        <div key={d.id} className="absolute w-4 h-4 bg-red-500 rounded-full animate-pulse" style={{ top: `${20 + i * 20}%`, left: `${30 + i * 15}%` }} title={d.area} />
                      ))}
                    </div>

                    <div className="flex-1 space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-orange-500" /> Hasar Listesi</h3>
                      <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-4">
                          {damages.length > 0 ? (
                            damages.map((damage: { id: React.Key | null | undefined; status: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; date: string | number | Date; area: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; description: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined }) => (
                              <div key={damage.id} className="border rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <Badge variant={damage.status === 'Onarıldı' ? 'default' : 'destructive'}>
                                    {damage.status}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{new Date(damage.date).toLocaleDateString()}</span>
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{damage.area}</p>
                                  <p className="text-sm text-muted-foreground">{damage.description}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">Araçta kayıtlı hasar bulunmamaktadır.</p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.length > 0 ? (
                  documents.map((doc: { id: React.Key | null | undefined; type: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; status: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; documentNumber: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; expiryDate: string | number | Date }) => (
                    <Card key={doc.id}>
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" /> {doc.type}</CardTitle>
                          <Badge variant={doc.status === 'Geçerli' ? 'default' : doc.status === 'Yakında Bitiyor' ? 'secondary' : 'destructive'}>
                            {doc.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <p className="text-sm text-muted-foreground mb-1">Belge No: {doc.documentNumber}</p>
                        <p className="text-sm text-muted-foreground mb-4">Bitiş: {new Date(doc.expiryDate).toLocaleDateString()}</p>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="w-full"><Eye className="w-4 h-4 mr-2" /> Görüntüle</Button>
                          <Button variant="outline" size="sm" className="w-full"><Download className="w-4 h-4 mr-2" /> İndir</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Kayıtlı belge bulunamadı.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="maintenances" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-orange-500" />
                    Bakım Geçmişi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tarih</TableHead>
                          <TableHead>Bakım Türü</TableHead>
                          <TableHead>Kilometre</TableHead>
                          <TableHead>Maliyet</TableHead>
                          <TableHead>Durum</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {maintenances.length > 0 ? (
                          maintenances.map((m: any) => (
                            <TableRow key={m.id}>
                              <TableCell>{new Date(m.date).toLocaleDateString()}</TableCell>
                              <TableCell>{m.maintenanceType}</TableCell>
                              <TableCell>{m.mileage.toLocaleString()} km</TableCell>
                              <TableCell>{m.cost.toLocaleString()} ₺</TableCell>
                              <TableCell>
                                <Badge variant={m.status === 'Bekliyor' ? 'secondary' : m.status === 'Devam Ediyor' ? 'default' : 'outline'}
                                  className={m.status === 'Tamamlandı' ? 'border-green-500 text-green-600 bg-green-50' : ''}>
                                  {m.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                              Bu araç için bakım kaydı bulunamadı.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>

        {/* RIGHT COLUMN - SIDEBAR */}
        <div className="space-y-6">

          {/* SECTION 4: CURRENT STATUS */}
          <Card>
            <CardHeader className="bg-slate-50/50 pb-4 border-b">
              <CardTitle className="text-lg">Güncel Durum</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Son Teslim KM</span>
                <span className="font-semibold">{car.mileage.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Yakıt Seviyesi</span>
                <span className="font-semibold text-green-600">%100 (Tam Dolu)</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Araç Durumu</span>
                <span className="font-semibold">{car.status}</span>
              </div>
              <Separator />
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground block">Son Kiralayan</span>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Ahmet Yılmaz</span>
                  <Button variant="link" size="sm" className="h-auto p-0">Profile Git</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 8: QUICK ACTIONS */}
          <Card>
            <CardHeader className="bg-slate-50/50 pb-4 border-b">
              <CardTitle className="text-lg">Hızlı Aksiyonlar</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Button className="w-full justify-start"><Calendar className="w-4 h-4 mr-2" /> Bu Aracı Tekrar Kirala</Button>
              {car.isFavorite ? (
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"><Heart className="w-4 h-4 mr-2 fill-red-600" /> Favorilerden Çıkar</Button>
              ) : (
                <Button variant="outline" className="w-full justify-start"><Heart className="w-4 h-4 mr-2" /> Favorilere Ekle</Button>
              )}

              {car.status === 'Kirada' && (
                <>
                  <Separator className="my-2" />
                  <Button variant="secondary" className="w-full justify-start text-blue-600"><Clock className="w-4 h-4 mr-2" /> Süreyi Uzat</Button>
                  <Button variant="secondary" className="w-full justify-start text-orange-600"><Wrench className="w-4 h-4 mr-2" /> Yol Yardımı Çağır</Button>
                </>
              )}

              <Separator className="my-2" />
              <Button variant="ghost" className="w-full justify-start text-slate-600"><AlertTriangle className="w-4 h-4 mr-2" /> Sorun Bildir</Button>
              <Button variant="ghost" className="w-full justify-start text-slate-600"><PenTool className="w-4 h-4 mr-2" /> Hasar Kaydı Oluştur</Button>
              <Button variant="ghost" className="w-full justify-start text-slate-600"><Users className="w-4 h-4 mr-2" /> Destek Talebi Aç</Button>
            </CardContent>
          </Card>

          {/* SECTION 7: DRIVER STATS SUMMARY */}
          <Card>
            <CardHeader className="bg-slate-50/50 pb-4 border-b">
              <CardTitle className="text-lg">Sürücü İstatistikleri</CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm space-y-4">
              <p>Bu araçla toplam <strong className="text-primary">1.240 km</strong> yol yaptınız.</p>
              <p>En uzun yolculuğunuz <strong className="text-primary">İzmir seyahatiydi</strong>.</p>
              <p>Bu aracı ilk kez <strong className="text-primary">12.03.2025</strong> tarihinde kiraladınız.</p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
