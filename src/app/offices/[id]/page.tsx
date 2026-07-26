"use client"
import { officeService } from "@/services/office";
import { carService } from "@/services/car";
import { reservationService } from "@/services/reservation";
import { Car, Reservation } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building, MapPin, Phone, Mail, Clock, CalendarDays, Car as CarIcon, CalendarCheck, Settings, Wrench, FileText, UserCircle, Briefcase, Map } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function OfficeDetailPage({ params }: Props) {
  const resolvedParams = await params;

  let office;
  try {
    office = await officeService.getOfficeById(resolvedParams.id);
  } catch (error) {
    office = null;
  }

  if (!office) {
    notFound();
  }

  let allCars: Car[] = [];
  try {
    allCars = await carService.getCars();
  } catch (error) { }

  const officeCars = allCars.filter((car) => String(car.officeId) === String(office.id));

  let allReservations: Reservation[] = [];
  try {
    allReservations = await reservationService.getReservations();
  } catch (error) { }

  const recentReservations = allReservations.filter(
    (res) => String(res.pickupOfficeId) === String(office.id) || String(res.dropoffOfficeId) === String(office.id)
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const stats = [
    { title: "Toplam Araç", value: officeCars.length, icon: CarIcon, color: "text-blue-500" },
    { title: "Müsait Araç", value: 0, icon: CalendarCheck, color: "text-green-500" },
    { title: "Kirada", value: 0, icon: CalendarDays, color: "text-orange-500" },
    { title: "Bakımda", value: 0, icon: Wrench, color: "text-red-500" },
    { title: "Aktif Rezervasyon", value: recentReservations.length, icon: FileText, color: "text-purple-500" },
    { title: "Bugünkü Rez.", value: 0, icon: CalendarCheck, color: "text-indigo-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{office.name}</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Building className="w-4 h-4" />
            {office.city}
          </p>
        </div>
        <Badge variant="default">
          Aktif
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Info Cards */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="w-5 h-5 text-muted-foreground" />
                İletişim & Çalışma
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                <div className="text-sm">
                  <p className="font-medium">Adres</p>
                  <p className="text-muted-foreground">{office.address}, {office.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">Telefon</p>
                  <p className="text-muted-foreground">{office.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">E-posta</p>
                  <p className="text-muted-foreground">{office.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div className="text-sm">
                  <p className="font-medium">Çalışma Saatleri</p>
                  <p className="text-muted-foreground">09:00 - 18:00</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Map className="w-5 h-5 text-muted-foreground" />
                Konum
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-md overflow-hidden border mb-4">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${office?.location?.lat ?? 0},${office?.location?.lng ?? 0}&z=15&output=embed`}
                ></iframe>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Koordinatlar: {office?.location?.lat ?? "—"}, {office?.location?.lng ?? "—"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Operasyon Notları</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-4 space-y-2 text-sm text-muted-foreground">
                <li>Henüz operasyon notu bulunmuyor.</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cars Table */}
          <Card>
            <CardHeader>
              <CardTitle>Ofise Ait Araçlar</CardTitle>
              <CardDescription>Bu ofisin envanterinde bulunan araçlar</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plaka</TableHead>
                    <TableHead>Marka/Model</TableHead>
                    <TableHead>Yıl</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">Günlük Ücret</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {officeCars.map((car) => (
                    <TableRow key={car.id}>
                      <TableCell className="font-medium">
                        <Link href={`/cars/${car.id}`} className="text-primary hover:underline">
                          {car.plate}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/cars/${car.id}`} className="hover:underline">
                          {car.brand} {car.model}
                        </Link>
                      </TableCell>
                      <TableCell>{car.year}</TableCell>
                      <TableCell>
                        <Badge variant={
                          String(car.status) === "Müsait" ? "default" :
                            String(car.status) === "Kirada" ? "secondary" : "destructive"
                        }>
                          {String(car.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{car.dailyPrice} ₺</TableCell>
                    </TableRow>
                  ))}
                  {officeCars.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                        Bu ofise ait araç bulunamadı.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Reservations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Son Rezervasyonlar</CardTitle>
              <CardDescription>Bu ofisle ilişkili son işlemler</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PNR</TableHead>
                    <TableHead>Müşteri</TableHead>
                    <TableHead>Alış Tarihi</TableHead>
                    <TableHead>Teslim Tarihi</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentReservations.map((res) => (
                    <TableRow key={res.id}>
                      <TableCell className="font-medium">
                        <Link href={`/reservations/${res.id}`} className="text-primary hover:underline">
                          {res.pnr}
                        </Link>
                      </TableCell>
                      <TableCell>{res.customerName}</TableCell>
                      <TableCell>{new Date(res.startDate).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell>{new Date(res.endDate).toLocaleDateString('tr-TR')}</TableCell>
                      <TableCell>
                        <Badge variant={
                          String(res.status) === "Aktif Kullanımda" ? "default" :
                            String(res.status) === "Tamamlandı" ? "secondary" : "destructive"
                        }>
                          {String(res.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentReservations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                        Son rezervasyon bulunamadı.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}