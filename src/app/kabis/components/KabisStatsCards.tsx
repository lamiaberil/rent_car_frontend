import { KabisStats } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, ShieldCheck, Clock, Send } from "lucide-react"

interface KabisStatsCardsProps {
  stats: KabisStats | null
  loading: boolean
}

export function KabisStatsCards({ stats, loading }: KabisStatsCardsProps) {
  const items = [
    {
      title: "Bekleyen Bildirimler",
      value: stats?.pending ?? 0,
      icon: Clock,
      description: "Gönderilmeyi bekleyen kayıtlar",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10"
    },
    {
      title: "Başarılı Bildirimler",
      value: stats?.successful ?? 0,
      icon: ShieldCheck,
      description: "KABİS'e başarıyla iletilenler",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    },
    {
      title: "Başarısız Bildirimler",
      value: stats?.failed ?? 0,
      icon: ShieldAlert,
      description: "Hata alınan gönderimler",
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    },
    {
      title: "Bugün Gönderilen",
      value: stats?.sentToday ?? 0,
      icon: Send,
      description: "Bugün içinde iletilen toplam kayıt",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <Card key={index} className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {item.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${item.bgColor}`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="h-8 w-16 bg-slate-200 animate-pulse rounded"></div>
              ) : (
                item.value
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
