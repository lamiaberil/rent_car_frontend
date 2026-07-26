import { Maintenance } from '../types';
import { api, extractData } from './api';

class MaintenanceService {
  async getMaintenances(): Promise<Maintenance[]> {
    try {
      return await api.get('/maintenance').then(extractData);
    } catch (error) {
      console.error('Bakım kayıtları getirilirken hata oluştu:', error);
      throw error;
    }
  }

  async getMaintenanceById(id: string): Promise<Maintenance | undefined> {
    try {
      return await api.get(`/maintenance/${id}`).then(extractData);
    } catch (error) {
      console.error(`Bakım kaydı (${id}) getirilirken hata oluştu:`, error);
      throw error;
    }
  }

  async addMaintenance(maintenanceData: Partial<Maintenance>): Promise<Maintenance> {
    try {
      return await api.post('/maintenance', maintenanceData).then(extractData);
    } catch (error) {
      console.error('Bakım kaydı eklenirken hata oluştu:', error);
      throw error;
    }
  }

  async updateMaintenance(id: string, maintenanceData: Partial<Maintenance>): Promise<Maintenance | undefined> {
    try {
      return await api.patch(`/maintenance/${id}`, maintenanceData).then(extractData);
    } catch (error) {
      console.error(`Bakım kaydı (${id}) güncellenirken hata oluştu:`, error);
      throw error;
    }
  }

  async deleteMaintenance(id: string): Promise<boolean> {
    try {
      return await api.delete(`/maintenance/${id}`).then(extractData);
    } catch (error) {
      console.error(`Bakım kaydı (${id}) silinirken hata oluştu:`, error);
      throw error;
    }
  }
}

export const maintenanceService = new MaintenanceService();
