"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { dashboardService } from "@/services/dashboard";
import { carService } from "@/services/car";
import { maintenanceService } from "@/services/maintenance";
import { DashboardStatistics, Car, Maintenance } from "@/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import {
  Car as CarIcon,
  CheckCircle2,
  Key,
  Heart,
  CalendarDays,
  Building,
  Star,
  Eye,
  Clock,
  ArrowRight,
  Users,
  Wrench,
  AlertTriangle
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<Car[]>([]);
  const [favorites, setFavorites] = useState<Car[]>([]);
  const [mostViewed, setMostViewed] = useState<Car[]>([]);
  const [topRated, setTopRated] = useState<Car[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [statsData, recentlyViewedData, favoritesData, mostViewedData, topRatedData, maintenancesData] = await Promise.all([
          dashboardService.getStatistics(),
          carService.getRecentlyViewedCars(),
          carService.getFavoriteCars(),
          carService.getMostViewedCars(),
          carService.getTopRatedCars(),
          maintenanceService.getMaintenances()
        ]);
        
        setStats(statsData);
        setRecentlyViewed(recentlyViewedData?.slice(0, 5) || []);
        setFavorites(favoritesData?.slice(0, 5) || []);
        setMostViewed(mostViewedData?.slice(0, 5) || []);
        setTopRated(topRatedData?.slice(0, 5) || []);
        setMaintenances(maintenancesData || []);
      } catch (err) {
        console.error("Dashboard veri yükleme hatası:", err);
        setError("Dashboard verileri yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);

  const statCards = [
    { title: "Toplam Araç", value: stats?.totalCars, description: "Filo durumu", icon: CarIcon, color: "text-blue-500", bg: "bg-blue-50", link: "/cars" },
    { title: "Toplam Kullanıcı", value: stats?.totalUsers || 0, description: "Müşteri sayısı", icon: Users, color: "text-teal-500", bg: "bg-teal-50", link: "/users" },
    { title: "Müsait Araç", value: stats?.availableCars, description: "Kiralanabilir", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50", link: "/cars" },
    { title: "Kirada Olan Araç", value: stats?.rentedCars, description: "Aktif kullanımda", icon: Key, color: "text-purple-500", bg: "bg-purple-50", link: "/cars" },
    { title: "Favori Araç Sayısı", value: stats?.favoriteCars, description: "İlgi çekenler", icon: Heart, color: "text-red-500", bg: "bg-red-50", link: "/favorites" },
    { title: "Aktif Rezervasyon", value: stats?.activeReservations, description: "Süren işlemler", icon: CalendarDays, color: "text-indigo-500", bg: "bg-indigo-50", link: "/reservations" },
    { title: "Toplam Ofis", value: stats?.totalOffices || 0, description: "Hizmet noktaları", icon: Building, color: "text-orange-500", bg: "bg-orange-50", link: "/offices" },
    { title: "Toplam Bakım", value: maintenances.length, description: "Kayıtlı bakımlar", icon: Wrench, color: "text-slate-500", bg: "bg-slate-50", link: "/maintenance" },
    { title: "Bekleyen Bakımlar", value: maintenances.filter(m => m.status === 'Bekliyor').length, description: "İşlem bekliyor", icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-50", link: "/maintenance" },
    { title: "Devam Eden Bakımlar", value: maintenances.filter(m => m.status === 'Devam Ediyor').length, description: "Şu an serviste", icon: Wrench, color: "text-blue-500", bg: "bg-blue-50", link: "/maintenance" },
  ];

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

  if (error) {
    return <div className="p-8 text-center text-red-500 font-medium bg-red-50 rounded-lg m-4">{error}</div>;
  }

  return (
    <div className="space-y-8 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* 1. Statistics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {loading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/3 mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat, i) => (
            <Link href={stat.link} key={i} className="block group">
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-l-4 hover:-translate-y-1" style={{ borderLeftColor: 'currentColor' }}>
                <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 ${stat.color}`}>
                  <CardTitle className="text-sm font-medium text-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stat.value !== undefined ? stat.value.toLocaleString('tr-TR') : '-'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>

      {/* Lists Section */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Yaklaşan Bakımlar */}
        <Card className="col-span-1 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-orange-50/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wrench className="w-5 h-5 text-orange-500" />
              Yaklaşan & Bekleyen Bakımlar
            </CardTitle>
            <Link href="/maintenance" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
              Tümünü Gör <ArrowRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-5">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-[150px]" />
                    </div>
                  </div>
                ))
              ) : maintenances.filter(m => m.status === 'Bekliyor' || m.status === 'Devam Ediyor').length === 0 ? (
                <div className="text-center text-muted-foreground py-8 bg-slate-50 rounded-lg">
                  <Wrench className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  Yaklaşan veya bekleyen bakım bulunmuyor.
                </div>
              ) : (
                maintenances.filter(m => m.status === 'Bekliyor' || m.status === 'Devam Ediyor').slice(0, 5).map((m) => (
                  <Link href={`/maintenance`} key={m.id} className="flex items-center justify-between space-x-4 group hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="relative h-10 w-10 flex items-center justify-center rounded-md overflow-hidden bg-orange-100 text-orange-600">
                        <Wrench className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">
                          {m.carName}
                        </p>
                        <p className="text-sm text-muted-foreground">{m.plate} - {m.maintenanceType}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <Badge variant={m.status === 'Bekliyor' ? 'secondary' : 'default'} className="mb-1 text-[10px] px-1.5 py-0">
                        {m.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(m.date).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* 2. Recently Viewed Cars */}
        <Card className="col-span-1 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-indigo-500" />
              Son Görüntülenen Araçlar
            </CardTitle>
            <Link href="/cars/recently-viewed" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
              Tümünü Gör <ArrowRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-14 w-14 rounded-md" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-[150px]" />
                    </div>
                  </div>
                ))
              ) : recentlyViewed.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 bg-slate-50 rounded-lg">
                  <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  Henüz araç incelemediniz.
                </div>
              ) : (
                recentlyViewed.map((car) => (
                  <Link href={`/cars/${car.id}`} key={car.id} className="flex items-center justify-between space-x-4 group hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="relative h-14 w-14 rounded-md overflow-hidden bg-muted">
                        <Image src={car.imageUrl || "/placeholder-car.jpg"} alt={car.model} fill className="object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">
                          {car.brand} {car.model}
                        </p>
                        <p className="text-sm text-muted-foreground font-mono">{car.plate}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-semibold text-slate-700">
                        {car.dailyPrice?.toLocaleString('tr-TR')} ₺<span className="text-xs font-normal text-muted-foreground">/gün</span>
                      </span>
                      {car.lastViewedAt && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(car.lastViewedAt).toLocaleDateString('tr-TR')} {new Date(car.lastViewedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* 3. Favorites */}
        <Card className="col-span-1 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-red-50/30 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              Favorilerim
            </CardTitle>
            <Link href="/favorites" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
              Tümünü Gör <ArrowRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-14 w-14 rounded-md" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-[150px]" />
                    </div>
                  </div>
                ))
              ) : favorites.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 bg-slate-50 rounded-lg">
                  <Heart className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  Favori aracınız bulunmuyor.
                </div>
              ) : (
                favorites.map((car) => (
                  <Link href={`/cars/${car.id}`} key={car.id} className="flex items-center justify-between space-x-4 group hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="relative h-14 w-14 rounded-md overflow-hidden bg-muted">
                        <Image src={car.imageUrl || "/placeholder-car.jpg"} alt={car.model} fill className="object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">
                          {car.brand} {car.model}
                        </p>
                        <Badge variant={getStatusBadgeVariant(car.status)} className="mt-1 text-[10px] px-1.5 py-0">
                          {car.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-semibold text-slate-700">
                        {car.dailyPrice?.toLocaleString('tr-TR')} ₺<span className="text-xs font-normal text-muted-foreground">/gün</span>
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* 4. Most Viewed Cars */}
        <Card className="col-span-1 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="border-b bg-blue-50/30 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="w-5 h-5 text-blue-500" />
              En Çok Görüntülenen Araçlar
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-14 w-14 rounded-md" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-[150px]" />
                    </div>
                  </div>
                ))
              ) : mostViewed.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 bg-slate-50 rounded-lg">
                  <Eye className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  Gösterilecek araç bulunamadı.
                </div>
              ) : (
                mostViewed.map((car) => (
                  <Link href={`/cars/${car.id}`} key={car.id} className="flex items-center justify-between space-x-4 group hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="relative h-14 w-14 rounded-md overflow-hidden bg-muted">
                        <Image src={car.imageUrl || "/placeholder-car.jpg"} alt={car.model} fill className="object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">
                          {car.brand} {car.model}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-semibold flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                        <Eye className="w-3 h-3" /> {car.viewCount || 0}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* 5. Top Rated Cars */}
        <Card className="col-span-1 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="border-b bg-yellow-50/30 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              En Yüksek Puanlı Araçlar
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-14 w-14 rounded-md" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-[150px]" />
                    </div>
                  </div>
                ))
              ) : topRated.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 bg-slate-50 rounded-lg">
                  <Star className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  Değerlendirilmiş araç bulunamadı.
                </div>
              ) : (
                topRated.map((car) => (
                  <Link href={`/cars/${car.id}`} key={car.id} className="flex items-center justify-between space-x-4 group hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="relative h-14 w-14 rounded-md overflow-hidden bg-muted">
                        <Image src={car.imageUrl || "/placeholder-car.jpg"} alt={car.model} fill className="object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">
                          {car.brand} {car.model}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-semibold flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> 
                        {Number(car.rating || 0).toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        {car.ratingCount || 0} değerlendirme
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
