import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Maintenance, Car } from "@/types"
import { maintenanceService } from "@/services/maintenance"
import { carService } from "@/services/car"
import { toast } from "sonner"

interface CreateMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateMaintenanceModal({ isOpen, onClose, onSuccess }: CreateMaintenanceModalProps) {
  const [loading, setLoading] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [formData, setFormData] = useState<Partial<Maintenance>>({
    maintenanceType: 'Periyodik bakım',
    status: 'Bekliyor',
    maintenanceDate: new Date().toISOString().slice(0, 16)
  });

  useEffect(() => {
    if (isOpen) {
      carService.getCars().then(setCars).catch(console.error);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const selectedCar = cars.find(c => c.id === formData.carId);
      
      if (!selectedCar) {
        toast.error("Lütfen bir araç seçin.");
        return;
      }

      await maintenanceService.addMaintenance({
        ...formData,
        cost: Number(formData.cost) || 0,
        mileage: Number(formData.mileage) || 0,
        maintenanceDate: new Date(formData.date!).toISOString(),
      });
      
      toast.success("Bakım kaydı başarıyla oluşturuldu.");
      onSuccess();
      onClose();
      setFormData({ maintenanceType: 'Periyodik bakım', status: 'Bekliyor', date: new Date().toISOString().slice(0, 16) });
    } catch (error) {
      toast.error("Bakım kaydı oluşturulurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Yeni Bakım Kaydı</DialogTitle>
          <DialogDescription>Araç için yeni bir bakım kaydı oluşturun.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="carId">Araç</Label>
              <Select value={formData.carId} onValueChange={(val) => setFormData(prev => ({ ...prev, carId: val }))} required>
                <SelectTrigger>
                  <SelectValue placeholder="Araç Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {cars.map(car => (
                    <SelectItem key={car.id} value={car.id}>{car.plate} - {car.brand} {car.model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maintenanceType">Bakım Türü</Label>
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
              <Label htmlFor="date">Tarih</Label>
              <Input 
                id="date" 
                type="datetime-local" 
                value={formData.maintenanceDate?.slice(0, 16)} 
                onChange={(e) => setFormData(prev => ({ ...prev, maintenanceDate: e.target.value }))}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mileage">Kilometre (km)</Label>
              <Input 
                id="mileage" 
                type="number" 
                value={formData.mileage || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, mileage: parseInt(e.target.value) }))}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Maliyet (₺)</Label>
              <Input 
                id="cost" 
                type="number" 
                value={formData.cost || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, cost: parseInt(e.target.value) }))}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Durum</Label>
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
            <Label htmlFor="description">Açıklama</Label>
            <Textarea 
              id="description" 
              value={formData.description || ''} 
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Yapılacak/yapılan işlemler hakkında bilgi girin..."
              rows={3}
              required 
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>İptal</Button>
            <Button type="submit" disabled={loading}>{loading ? "Kaydediliyor..." : "Kaydet"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
