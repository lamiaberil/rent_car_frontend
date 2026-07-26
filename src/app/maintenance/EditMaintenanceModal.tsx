import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Maintenance } from "@/types"
import { maintenanceService } from "@/services/maintenance"
import { toast } from "sonner"

interface EditMaintenanceModalProps {
  maintenance: Maintenance | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditMaintenanceModal({ maintenance, isOpen, onClose, onSuccess }: EditMaintenanceModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Maintenance>>({});

  useEffect(() => {
    if (maintenance && isOpen) {
      setFormData({
        ...maintenance,
        maintenanceDate: new Date(maintenance.maintenanceDate).toISOString().slice(0, 16)
      });
    }
  }, [maintenance, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenance) return;

    try {
      setLoading(true);
      await maintenanceService.updateMaintenance(maintenance.id, {
        ...formData,
        cost: Number(formData.cost),
        mileage: Number(formData.mileage),
        maintenanceDate: new Date(formData.maintenanceDate!).toISOString()
      });
      
      toast.success("Bakım kaydı başarıyla güncellendi.");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Bakım kaydı güncellenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (!maintenance) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bakım Kaydını Düzenle</DialogTitle>
          <DialogDescription>{maintenance.plate} - {maintenance.carName}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-maintenanceType">Bakım Türü</Label>
              <Select value={formData.maintenanceType} onValueChange={(val: any) => setFormData(prev => ({ ...prev, maintenanceType: val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Tür Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Periyodik bakım">Periyodik bakım</SelectItem>
                  <SelectItem value="Yağ değişimi">Yağ değişimi</SelectItem>
                  <SelectItem value="Lastik değişimi">Lastik değişimi</SelectItem>
                  <SelectItem value="Fren bakımı">Fren bakımı</SelectItem>
                  <SelectItem value="Motor bakımı">Motor bakımı</SelectItem>
                  <SelectItem value="Diğer">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-date">Tarih</Label>
              <Input 
                id="edit-date" 
                type="datetime-local" 
                value={formData.maintenanceDate?.slice(0, 16) || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, maintenanceDate: e.target.value }))}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-mileage">Kilometre (km)</Label>
              <Input 
                id="edit-mileage" 
                type="number" 
                value={formData.mileage || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, mileage: parseInt(e.target.value) }))}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-cost">Maliyet (₺)</Label>
              <Input 
                id="edit-cost" 
                type="number" 
                value={formData.cost || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, cost: parseInt(e.target.value) }))}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Durum</Label>
              <Select value={formData.status} onValueChange={(val: any) => setFormData(prev => ({ ...prev, status: val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Durum Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bekliyor">Bekliyor</SelectItem>
                  <SelectItem value="Devam Ediyor">Devam Ediyor</SelectItem>
                  <SelectItem value="Tamamlandı">Tamamlandı</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Açıklama</Label>
            <Textarea 
              id="edit-description" 
              value={formData.description || ''} 
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Yapılacak/yapılan işlemler hakkında bilgi girin..."
              rows={3}
              required 
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>İptal</Button>
            <Button type="submit" disabled={loading}>{loading ? "Güncelleniyor..." : "Güncelle"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
