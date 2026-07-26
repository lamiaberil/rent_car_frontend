import { KabisNotification } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, CheckCircle2, Clock } from "lucide-react"


interface KabisDetailModalProps {
  notification: KabisNotification | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KabisDetailModal({ notification, open, onOpenChange }: KabisDetailModalProps) {
  if (!notification) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Bekliyor":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "Gönderildi":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      case "Başarısız":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Bekliyor":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-700">Bekliyor</Badge>
      case "Gönderildi":
        return <Badge className="bg-emerald-500">Başarılı</Badge>
      case "Başarısız":
        return <Badge variant="destructive">Başarısız</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-xl flex items-center gap-2">
              KABİS Bildirim Detayı
              {getStatusBadge(notification.status)}
            </DialogTitle>
          </div>
          <DialogDescription>
            Bildirim No: <span className="font-mono">{notification.notificationNo}</span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-full max-h-[60vh] pr-4">
          <div className="space-y-6">
            
            {/* Müşteri Bilgileri */}
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Müşteri Bilgileri</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Ad Soyad</div>
                  <div className="font-medium">{notification.customerName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">T.C. Kimlik No</div>
                  <div className="font-mono">{notification.customerTc}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Telefon</div>
                  <div>{notification.customerPhone}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">E-posta</div>
                  <div>{notification.customerEmail}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Doğum Tarihi</div>
                  <div>{new Date(notification.customerDob).toLocaleDateString("tr-TR")}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Ehliyet No</div>
                  <div className="font-mono">{notification.customerLicense}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Araç Bilgileri */}
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Araç Bilgileri</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Marka / Model</div>
                  <div className="font-medium">{notification.carBrand} {notification.carModel}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Plaka</div>
                  <div className="font-mono font-medium bg-slate-100 dark:bg-slate-800 inline-block px-2 py-0.5 rounded border">
                    {notification.carPlate}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Segment</div>
                  <div>{notification.carSegment}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Rezervasyon Bilgileri */}
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Rezervasyon Bilgileri</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">PNR</div>
                  <div className="font-mono">{notification.reservationPnr}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Ofis</div>
                  <div>{notification.office}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Teslim Tarihi (Alış)</div>
                  <div>{new Date(notification.pickupDate).toLocaleString("tr-TR")}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">İade Tarihi</div>
                  <div>{new Date(notification.dropoffDate).toLocaleString("tr-TR")}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* KABİS API Detayları */}
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">İşlem Detayları</h4>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(notification.status)}
                  <span className="font-medium">
                    Son Durum: {notification.status}
                  </span>
                </div>

                {notification.sentDate && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Gönderim Tarihi: </span>
                    {new Date(notification.sentDate).toLocaleString("tr-TR")}
                  </div>
                )}

                {notification.errorMessage && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/10 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-red-800 dark:text-red-200">Hata Detayı</h5>
                      <div className="text-sm text-red-700 dark:text-red-300 mt-1">
                        {notification.errorMessage}
                      </div>
                    </div>
                  </div>
                )}

                {notification.apiResponse && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">API Yanıtı:</div>
                    <pre className="bg-slate-950 text-slate-50 p-4 rounded-md text-xs overflow-x-auto">
                      {notification.apiResponse}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
