import { useState } from "react"
import { KabisNotification } from "@/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Send, RefreshCw, AlertCircle, ShieldAlert } from "lucide-react"

interface KabisTableProps {
  notifications: KabisNotification[]
  loading: boolean
  error: string | null
  selectedIds: string[]
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>
  onViewDetail: (id: string) => void
  onSend: (id: string) => void
  onRetry: (id: string) => void
}

export function KabisTable({
  notifications,
  loading,
  error,
  selectedIds,
  setSelectedIds,
  onViewDetail,
  onSend,
  onRetry
}: KabisTableProps) {
  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(notifications.filter(n => n.status !== "Gönderildi").map(n => n.id))
    } else {
      setSelectedIds([])
    }
  }

  const toggleOne = (checked: boolean, id: string) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Bekliyor":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200">Bekliyor</Badge>
      case "Gönderildi":
        return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Başarılı</Badge>
      case "Başarısız":
        return <Badge variant="destructive">Başarısız</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const allPendingIds = notifications.filter(n => n.status !== "Gönderildi").map(n => n.id)
  const isAllSelected = allPendingIds.length > 0 && selectedIds.length === allPendingIds.length

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
            <TableHead className="w-12 text-center">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={toggleAll}
                aria-label="Tümünü seç"
              />
            </TableHead>
            <TableHead>Bildirim No</TableHead>
            <TableHead>Rez. No</TableHead>
            <TableHead>Müşteri</TableHead>
            <TableHead>T.C. No</TableHead>
            <TableHead>Araç / Plaka</TableHead>
            <TableHead>Teslim / İade</TableHead>
            <TableHead className="text-center">Durum</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx}>
                <TableCell><Skeleton className="h-4 w-4 rounded" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </TableCell>
                <TableCell className="text-center"><Skeleton className="h-5 w-20 mx-auto rounded-full" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : error ? (
            <TableRow>
              <TableCell colSpan={9} className="h-32 text-center text-red-500">
                <div className="flex flex-col items-center justify-center">
                  <AlertCircle className="h-8 w-8 mb-2" />
                  {error}
                </div>
              </TableCell>
            </TableRow>
          ) : notifications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-48 text-center">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <ShieldAlert className="h-12 w-12 text-slate-300 mb-3" />
                  <p className="text-lg font-medium text-slate-600">Bildirim bulunamadı</p>
                  <p className="text-sm">Arama veya filtreleme kriterlerinizi değiştirerek tekrar deneyin.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            notifications.map((notification) => (
              <TableRow key={notification.id} className="group hover:bg-slate-50">
                <TableCell className="text-center">
                  <Checkbox
                    checked={selectedIds.includes(notification.id)}
                    onCheckedChange={(checked) => toggleOne(!!checked, notification.id)}
                    disabled={notification.status === "Gönderildi"}
                    aria-label={`${notification.notificationNo} seç`}
                  />
                </TableCell>
                <TableCell className="font-medium font-mono text-xs">
                  {notification.notificationNo}
                </TableCell>
                <TableCell className="text-sm font-mono text-muted-foreground">
                  {notification.reservationPnr}
                </TableCell>
                <TableCell>
                  <span className="font-medium">{notification.customerName}</span>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {notification.customerTc}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span className="font-medium">{notification.carBrand} {notification.carModel}</span>
                    <span className="text-muted-foreground font-mono">{notification.carPlate}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Alış:</span>
                      <span>{new Date(notification.pickupDate).toLocaleDateString("tr-TR")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">İade:</span>
                      <span>{new Date(notification.dropoffDate).toLocaleDateString("tr-TR")}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(notification.status)}
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
                      <DropdownMenuItem onClick={() => onViewDetail(notification.id)} className="cursor-pointer">
                        <Eye className="mr-2 h-4 w-4" />
                        Detay
                      </DropdownMenuItem>
                      {notification.status === "Bekliyor" && (
                        <DropdownMenuItem onClick={() => onSend(notification.id)} className="cursor-pointer text-blue-600 focus:text-blue-600">
                          <Send className="mr-2 h-4 w-4" />
                          Gönder
                        </DropdownMenuItem>
                      )}
                      {notification.status === "Başarısız" && (
                        <DropdownMenuItem onClick={() => onRetry(notification.id)} className="cursor-pointer text-amber-600 focus:text-amber-600">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Tekrar Gönder
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
