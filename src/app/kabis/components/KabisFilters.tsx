import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ShieldAlert, ShieldCheck, Clock } from "lucide-react"

interface KabisFiltersProps {
  searchQuery: string
  setSearchQuery: (val: string) => void
  filterMode: string
  setFilterMode: (val: string) => void
}

export function KabisFilters({ searchQuery, setSearchQuery, filterMode, setFilterMode }: KabisFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Müşteri, T.C., Plaka, Rezervasyon No..."
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
          variant={filterMode === "Bekliyor" ? "default" : "outline"}
          size="sm"
          className={filterMode === "Bekliyor" ? "bg-amber-500 hover:bg-amber-600" : ""}
          onClick={() => setFilterMode("Bekliyor")}
        >
          <Clock className="w-4 h-4 mr-1.5" />
          Bekliyor
        </Button>
        <Button
          variant={filterMode === "Gönderildi" ? "default" : "outline"}
          size="sm"
          className={filterMode === "Gönderildi" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
          onClick={() => setFilterMode("Gönderildi")}
        >
          <ShieldCheck className="w-4 h-4 mr-1.5" />
          Başarılı
        </Button>
        <Button
          variant={filterMode === "Başarısız" ? "default" : "outline"}
          size="sm"
          className={filterMode === "Başarısız" ? "bg-red-500 hover:bg-red-600" : ""}
          onClick={() => setFilterMode("Başarısız")}
        >
          <ShieldAlert className="w-4 h-4 mr-1.5" />
          Başarısız
        </Button>
      </div>
    </div>
  )
}
