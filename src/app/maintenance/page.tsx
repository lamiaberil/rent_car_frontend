"use client";

import React, { useState, useEffect } from "react";
import { maintenanceService } from "@/services/maintenance";
import { Maintenance } from "@/types";
import { CreateMaintenanceModal } from "./CreateMaintenanceModal";
import { EditMaintenanceModal } from "./EditMaintenanceModal";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, PenTool, Trash2, Wrench } from "lucide-react";
import { toast } from "sonner";

export default function MaintenancePage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Tümü");

  const fetchMaintenances = async () => {
    try {
      setLoading(true);
      const data = await maintenanceService.getMaintenances();
      setMaintenances(data);
    } catch (error) {
      toast.error("Bakım kayıtları yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenances();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu bakım kaydını silmek istediğinize emin misiniz?")) return;
    try {
      await maintenanceService.deleteMaintenance(id);
      setMaintenances(maintenances.filter(m => m.id !== id));
      toast.success("Bakım kaydı başarıyla silindi.");
    } catch (error) {
      toast.error("Silme işlemi sırasında hata oluştu.");
    }
  };

  const filteredMaintenances = maintenances.filter(m => {
    const matchesSearch = 
      (m.carBrand?.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (m.carModel?.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (m.plate?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "Tümü" || m.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch(status) {
      case "Bekliyor": return "secondary";
      case "Devam Ediyor": return "default";
      case "Tamamlandı": return "outline";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Wrench className="w-8 h-8 text-primary" /> 
            Bakım Yönetimi
          </h2>
          <p className="text-muted-foreground mt-1">Araç filonuzun bakım ve onarım süreçlerini takip edin.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Yeni Bakım Kaydı
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CardTitle className="text-lg">Tüm Kayıtlar</CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Plaka veya araç ara..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tümü">Tümü</SelectItem>
                  <SelectItem value="Bekliyor">Bekliyor</SelectItem>
                  <SelectItem value="Devam Ediyor">Devam Ediyor</SelectItem>
                  <SelectItem value="Tamamlandı">Tamamlandı</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Araç</TableHead>
                <TableHead>Plaka</TableHead>
                <TableHead>Bakım Türü</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Kilometre</TableHead>
                <TableHead>Maliyet</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">Aksiyonlar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">Yükleniyor...</TableCell>
                </TableRow>
              ) : filteredMaintenances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Kayıt bulunamadı.</TableCell>
                </TableRow>
              ) : (
                filteredMaintenances.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium text-primary">
                      {m.carBrand} {m.carModel}
                    </TableCell>
                    <TableCell className="font-mono">{m.plate}</TableCell>
                    <TableCell>{m.maintenanceType}</TableCell>
                    <TableCell>{m.maintenanceDate ? new Date(m.maintenanceDate).toLocaleDateString('tr-TR') : '-'}</TableCell>
                    <TableCell>{m.mileage.toLocaleString()} km</TableCell>
                    <TableCell className="font-medium text-slate-700">{m.cost.toLocaleString()} ₺</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(m.status)} className={m.status === 'Tamamlandı' ? 'border-green-500 text-green-600 bg-green-50' : m.status === 'Bekliyor' ? 'border-orange-500 text-orange-600 bg-orange-50' : 'border-blue-500 text-blue-600 bg-blue-50'}>
                        {m.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => {
                          setSelectedMaintenance(m);
                          setIsEditModalOpen(true);
                        }}>
                          <PenTool className="w-4 h-4 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(m.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateMaintenanceModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={fetchMaintenances} 
      />

      <EditMaintenanceModal 
        maintenance={selectedMaintenance}
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMaintenance(null);
        }} 
        onSuccess={fetchMaintenances} 
      />
    </div>
  );
}
