"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { userService } from "@/services/user"
import { User } from "@/types"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"

import {
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Car,
  FileText,
  Clock,
  History,
  Star,
  Activity,
  ArrowLeft,
  Edit,
  Save,
  CheckCircle2,
  XCircle
} from "lucide-react"

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Notlar state'i
  const [notes, setNotes] = useState("")
  const [isSavingNotes, setIsSavingNotes] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [userId])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const data = await userService.getUserById(userId)
      setUser(data)
      setNotes(data.notes || "")
    } catch (err) {
      console.error("Kullanıcı detayı getirirken hata:", err)
      setError("Kullanıcı bilgileri yüklenemedi.")
      toast.error("Hata", { description: "Kullanıcı bilgileri bulunamadı." })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!user) return
    try {
      setIsSavingNotes(true)
      await userService.updateUser(user.id, { notes })
      toast.success("Başarılı", { description: "Kullanıcı notları güncellendi." })
      setUser({ ...user, notes })
    } catch (err) {
      toast.error("Hata", { description: "Notlar kaydedilirken bir hata oluştu." })
    } finally {
      setIsSavingNotes(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aktif":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 px-3 py-1 text-sm">Aktif</Badge>
      case "Pasif":
        return <Badge variant="secondary" className="px-3 py-1 text-sm bg-slate-200 text-slate-700">Pasif</Badge>
      case "Kara Liste":
        return <Badge variant="destructive" className="px-3 py-1 text-sm">Kara Liste</Badge>
      default:
        return <Badge variant="outline" className="px-3 py-1 text-sm">{status}</Badge>
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <UserIcon className="w-16 h-16 text-slate-300" />
        <h2 className="text-xl font-medium text-slate-700">{error}</h2>
        <Button variant="outline" onClick={() => router.push("/users")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Kullanıcı Listesine Dön
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2" onClick={() => router.push("/users")}>
          <ArrowLeft className="w-4 h-4" /> Geri Dön
        </Button>
        <div className="flex items-center gap-2">
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <>
              {getStatusBadge(user?.status || "")}
              <Button variant="outline" size="sm" className="gap-2 ml-2">
                <Edit className="w-4 h-4" /> Düzenle
              </Button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      ) : user ? (
        <>
          {/* Profile Header Card */}
          <Card className="overflow-hidden border-0 shadow-sm">
            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            <CardContent className="p-6 pt-0 sm:pt-0 relative">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12 sm:-mt-10 mb-6">
                <div className="h-24 w-24 rounded-xl border-4 border-card bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.firstName} className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-10 w-10 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">{user.firstName} {user.lastName}</h1>
                  <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                    <CreditCard className="w-4 h-4" /> TC: <span className="font-mono">{user.tcNo}</span>
                    <span className="mx-2">•</span>
                    <Calendar className="w-4 h-4" /> Üyelik: {new Date(user.membershipDate).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">İletişim Bilgileri</h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" /> {user.phone}
                    </p>
                    <p className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" /> {user.email}
                    </p>
                    <p className="flex items-start gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" /> 
                      <span className="leading-tight">{user.address}<br/>{user.city}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Kişisel Bilgiler</h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Doğum Tarihi:</span>
                      <span className="font-medium">{new Date(user.birthDate).toLocaleDateString("tr-TR")}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-3 lg:col-span-2">
                  <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Ehliyet Bilgileri</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-slate-400 text-xs uppercase tracking-wider">Ehliyet No</p>
                      <p className="font-mono font-medium text-slate-700">{user.driverLicenseNo}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-400 text-xs uppercase tracking-wider">Sınıf</p>
                      <p className="font-medium text-slate-700">{user.driverLicenseClass}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-400 text-xs uppercase tracking-wider">Geçerlilik Tarihi</p>
                      <p className="font-medium text-slate-700">{new Date(user.driverLicenseExp).toLocaleDateString("tr-TR")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="bg-slate-50 border-none shadow-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{user.totalReservations}</p>
                  <p className="text-xs text-muted-foreground font-medium">Toplam Rezervasyon</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 border-none shadow-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{user.activeReservations}</p>
                  <p className="text-xs text-muted-foreground font-medium">Aktif Rezervasyon</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 border-none shadow-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-full">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{user.completedReservations}</p>
                  <p className="text-xs text-muted-foreground font-medium">Tamamlanan</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 border-none shadow-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-2 bg-red-100 text-red-600 rounded-full">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{user.canceledReservations}</p>
                  <p className="text-xs text-muted-foreground font-medium">İptal Edilen</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 border-none shadow-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-full">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{user.totalSpent?.toLocaleString("tr-TR")} ₺</p>
                  <p className="text-xs text-muted-foreground font-medium">Toplam Harcama</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-50 border-none shadow-sm">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-full">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-bold mt-1 leading-tight">
                    {user.lastRentalDate ? new Date(user.lastRentalDate).toLocaleDateString("tr-TR") : "-"}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium mt-1">Son Kiralama</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="reservations" className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-[600px] bg-slate-100">
              <TabsTrigger value="reservations">Rezervasyonlar</TabsTrigger>
              <TabsTrigger value="favorites">Favori Araçlar</TabsTrigger>
              <TabsTrigger value="history">Son Görüntülenen</TabsTrigger>
              <TabsTrigger value="notes">Notlar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="reservations" className="mt-6">
              <Card className="shadow-sm border-0 border-t border-slate-200 rounded-t-none">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-500" /> Rezervasyon Geçmişi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead>PNR</TableHead>
                          <TableHead>Araç</TableHead>
                          <TableHead>Ofis</TableHead>
                          <TableHead>Başlangıç</TableHead>
                          <TableHead>Bitiş</TableHead>
                          <TableHead>Durum</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                            Kullanıcıya ait rezervasyon datası bulunamadı.
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="favorites" className="mt-6">
              <Card className="shadow-sm border-0 border-t border-slate-200 rounded-t-none">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Favori Araçlar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground bg-slate-50/50 rounded-lg border border-dashed">
                    <Star className="w-8 h-8 text-slate-300 mb-2" />
                    <p>Favoriye eklenmiş araç bulunmuyor.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="mt-6">
              <Card className="shadow-sm border-0 border-t border-slate-200 rounded-t-none">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-500" /> Son Görüntülenen Araçlar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground bg-slate-50/50 rounded-lg border border-dashed">
                    <History className="w-8 h-8 text-slate-300 mb-2" />
                    <p>Görüntüleme geçmişi boş.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notes" className="mt-6">
              <Card className="shadow-sm border-0 border-t border-slate-200 rounded-t-none">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Edit className="w-5 h-5 text-purple-500" /> Müşteri Notları
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea 
                    placeholder="Kullanıcı hakkında personelin görebileceği notlar ekleyin... (Örn: Aracı her zaman zamanında teslim ediyor.)"
                    className="min-h-[150px] resize-y"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSaveNotes} 
                      disabled={isSavingNotes || notes === (user.notes || "")}
                      className="gap-2"
                    >
                      <Save className="w-4 h-4" /> 
                      {isSavingNotes ? "Kaydediliyor..." : "Notları Kaydet"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </div>
  )
}
