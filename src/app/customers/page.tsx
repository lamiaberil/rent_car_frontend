"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { customerService } from '@/services/customer';
import { Customer } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    licenseNumber: '',
    licenseExp: '',
    address: ''
  });

  useEffect(() => {
    async function loadData() {
      try {
        const data = await customerService.getCustomers();
        setCustomers(data || []);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSave = async () => {
    try {
      setSubmitting(true);
      const newCustomer = await customerService.addCustomer(formData);
      setCustomers(prev => [newCustomer, ...prev]);
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        dob: '',
        licenseNumber: '',
        licenseExp: '',
        address: ''
      });
    } catch (error) {
      console.error("Ekleme hatası:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Müşterilerim</h1>
            <p className="text-muted-foreground mt-2">Müşterilerinizi buradan görüntüleyebilir ve yönetebilirsiniz.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Ekle
          </Button>
        </div>

        <div className="rounded-md border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad Soyad</TableHead>
                <TableHead>E-Posta</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Doğum Tarihi</TableHead>
                <TableHead>Ehliyet No</TableHead>
                <TableHead>Ehliyet Geçerlilik</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Gösterilecek müşteri bulunamadı.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((cus) => (
                  <TableRow key={cus.id}>
                    <TableCell className="font-medium text-primary">
                      {cus.name}
                    </TableCell>
                    <TableCell>{cus.email}</TableCell>
                    <TableCell>{cus.phone}</TableCell>
                    <TableCell>{new Date(cus.dob).toLocaleDateString('tr-TR')}</TableCell>
                    <TableCell>{cus.licenseNumber}</TableCell>
                    <TableCell>{new Date(cus.licenseExp).toLocaleDateString('tr-TR')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
            <DialogDescription>
              Aşağıdaki formu doldurarak yeni müşteri ekleyebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Ad Soyad</label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                placeholder="Örn: Veli Yılmaz"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">E-Posta</label>
                <Input 
                  value={formData.email} 
                  type="email"
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  placeholder="veli@example.com"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Telefon</label>
                <Input 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  placeholder="0532..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Doğum Tarihi</label>
                <Input 
                  type="date"
                  value={formData.dob} 
                  onChange={e => setFormData({...formData, dob: e.target.value})} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Ehliyet No</label>
                <Input 
                  value={formData.licenseNumber} 
                  onChange={e => setFormData({...formData, licenseNumber: e.target.value})} 
                  placeholder="TR-..."
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Ehliyet Bitiş</label>
                <Input 
                  type="date"
                  value={formData.licenseExp} 
                  onChange={e => setFormData({...formData, licenseExp: e.target.value})} 
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Adres</label>
              <Input 
                value={formData.address} 
                onChange={e => setFormData({...formData, address: e.target.value})} 
                placeholder="Açık adres"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>İptal Et</Button>
            <Button onClick={handleSave} disabled={submitting}>
              {submitting ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
