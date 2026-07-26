"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { userService } from "@/services/user"
import { User } from "@/types"
import { CreateUserModal } from "./CreateUserModal"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

import {
  Users,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Filter,
  ArrowUpDown,
  UserCheck,
  UserX,
  Star,
  Clock
} from "lucide-react"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Arama ve Filtreleme state'leri
  const [searchQuery, setSearchQuery] = useState("")
  const [filterMode, setFilterMode] = useState<"Tümü" | "Aktif" | "Pasif" | "Çok Kiralayanlar" | "Yeni Üyeler">("Tümü")
  useEffect(() => {
    fetchUsers();
  }, []);


  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await userService.getUsers();
      setUsers(response || []);
    } catch (err) {
      console.error("Kullanıcıları getirirken hata:", err)
      setError("Kullanıcı listesi yüklenemedi. Lütfen daha sonra tekrar deneyin.")
      toast.error("Hata", { description: "Kullanıcı listesi yüklenemedi." })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) return;

    try {
      await userService.deleteUser(id)
      setUsers(users.filter(u => u.id !== id))
      toast.success("Başarılı", { description: "Kullanıcı başarıyla silindi." })
    } catch (err) {
      toast.error("Hata", { description: "Kullanıcı silinirken bir sorun oluştu." })
    }
  }

  // Filtreleme mantığı
  const filteredUsers = users.filter((user) => {
    // Arama kutusu eşleşmesi
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.phone.includes(searchLower) ||
      user.tcNo.includes(searchLower)

    if (!matchesSearch) return false

    // Buton filtreleri
    if (filterMode === "Aktif") return user.status === "Aktif"
    if (filterMode === "Pasif") return user.status === "Pasif"
    if (filterMode === "Çok Kiralayanlar") return user.totalReservations >= 5 // Örn: 5 ve üzeri rezervasyon
    if (filterMode === "Yeni Üyeler") {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return new Date(user.membershipDate) >= thirtyDaysAgo
    }

    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aktif":
        return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Aktif</Badge>
      case "Pasif":
        return <Badge variant="secondary" className="bg-slate-200 text-slate-700 hover:bg-slate-300">Pasif</Badge>
      case "Kara Liste":
        return <Badge variant="destructive">Kara Liste</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            Kullanıcı Yönetimi
          </h2>
          <p className="text-muted-foreground mt-1">
            Sistemdeki tüm müşterileri ve üyeleri yönetin.
          </p>
        </div>
        <CreateUserModal onSuccess={fetchUsers} />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ad, Soyad, TC No, Telefon veya E-posta..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap justify-center md:justify-end">
          <Button
            variant={filterMode === "Tümü" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterMode("Tümü")}
          >
            Tümü
          </Button>
          <Button
            variant={filterMode === "Aktif" ? "default" : "outline"}
            size="sm"
            className={filterMode === "Aktif" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
            onClick={() => setFilterMode("Aktif")}
          >
            <UserCheck className="w-4 h-4 mr-1.5" />
            Aktif
          </Button>
          <Button
            variant={filterMode === "Pasif" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterMode("Pasif")}
          >
            <UserX className="w-4 h-4 mr-1.5" />
            Pasif
          </Button>
          <Button
            variant={filterMode === "Çok Kiralayanlar" ? "default" : "outline"}
            size="sm"
            className={filterMode === "Çok Kiralayanlar" ? "bg-amber-500 hover:bg-amber-600" : ""}
            onClick={() => setFilterMode("Çok Kiralayanlar")}
          >
            <Star className="w-4 h-4 mr-1.5" />
            VIP / Çok Kiralayanlar
          </Button>
          <Button
            variant={filterMode === "Yeni Üyeler" ? "default" : "outline"}
            size="sm"
            className={filterMode === "Yeni Üyeler" ? "bg-blue-500 hover:bg-blue-600" : ""}
            onClick={() => setFilterMode("Yeni Üyeler")}
          >
            <Clock className="w-4 h-4 mr-1.5" />
            Yeni Üyeler
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Ad Soyad</TableHead>
              <TableHead>İletişim</TableHead>
              <TableHead>TC / Ehliyet</TableHead>
              <TableHead>Kayıt Tarihi</TableHead>
              <TableHead className="text-right">Rez.</TableHead>
              <TableHead className="text-right">Harcama</TableHead>
              <TableHead className="text-center">Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-[150px]" />
                      <Skeleton className="h-3 w-[100px]" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-[100px]" />
                      <Skeleton className="h-3 w-[80px]" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-[90px]" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-[80px] ml-auto" /></TableCell>
                  <TableCell className="text-center"><Skeleton className="h-5 w-[60px] mx-auto rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-red-500">
                  {error}
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Users className="h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-lg font-medium text-slate-600">Kullanıcı bulunamadı</p>
                    <p className="text-sm">Arama veya filtreleme kriterlerinizi değiştirerek tekrar deneyin.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="group hover:bg-slate-50">
                  <TableCell>
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.firstName} className="h-full w-full object-cover" />
                      ) : (
                        `${user.firstName[0]}${user.lastName[0]}`
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/users/${user.id}`} className="hover:underline hover:text-primary transition-colors">
                      {user.firstName} {user.lastName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span>{user.email}</span>
                      <span className="text-muted-foreground">{user.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span className="font-mono">{user.tcNo}</span>
                      <span className="text-muted-foreground">Sınıf {user.driverLicenseClass}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.membershipDate).toLocaleDateString("tr-TR")}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {user.totalReservations}
                  </TableCell>
                  <TableCell className="text-right font-medium text-slate-700">
                    {user.totalSpent?.toLocaleString("tr-TR")} ₺
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(user.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
                        <span className="sr-only">Menüyü aç</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem render={<Link href={`/users/${user.id}`} className="cursor-pointer" />}>
                          <Eye className="mr-2 h-4 w-4" />
                          Görüntüle
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 cursor-pointer"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination mock */}
        {!loading && filteredUsers.length > 0 && (
          <div className="flex items-center justify-between px-4 py-4 border-t bg-slate-50/50">
            <div className="text-sm text-muted-foreground">
              Toplam <strong>{filteredUsers.length}</strong> kullanıcı listeleniyor.
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>Önceki</Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
              <Button variant="outline" size="sm" disabled>Sonraki</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

